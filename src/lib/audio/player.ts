import type { Note, Strum, Timeline } from "@/lib/music/types";
import { audioKit, UKE_VOICE, type Voice } from "./kit";

export type PlayerOptions = {
  /** Play the ukulele part. Turn it off to be the only ukulele in the room. */
  uke: boolean;
  /** Play the tune on the melody instrument. */
  melody: boolean;
  /** Metronome tick on every beat. */
  click: boolean;
  /** Count one bar in before the music starts. */
  countIn: boolean;
};

export type PlayerSnapshot = {
  status: "idle" | "loading" | "ready";
  playing: boolean;
  /** Tempo multiplier, 1 = the song's own tempo. */
  rate: number;
  loop: { start: number; end: number } | null;
  options: PlayerOptions;
  usingFallback: boolean;
};

type Event = { beat: number; note?: Note; strum?: Strum };
type Anchor = { time: number; beat: number };

const LOOKAHEAD = 0.16; // seconds scheduled ahead of the clock
const TICK_MS = 30;
const START_DELAY = 0.08;
const EPS = 1e-6;

/**
 * Plays a compiled song. Audio is scheduled a little ahead on the
 * AudioContext clock, so timing stays tight even if the page is busy.
 * The UI asks `beat()` on every animation frame to know where we are.
 */
export class SongPlayer {
  private events: Event[];
  private cursor = 0;
  private anchors: Anchor[] = [];
  private position = 0;
  /** Beat the music starts from on the current run (after any count-in). */
  private playFrom = 0;
  private nextClick = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private pendingClicks = new Set<OscillatorNode>();
  private uke: Voice | null = null;
  private lead: Voice | null = null;
  private listeners = new Set<() => void>();
  private disposed = false;

  snapshot: PlayerSnapshot = {
    status: "idle",
    playing: false,
    rate: 1,
    loop: null,
    options: { uke: true, melody: true, click: false, countIn: true },
    usingFallback: false,
  };

  constructor(readonly timeline: Timeline) {
    this.events = [
      ...timeline.notes.map((note) => ({ beat: note.start, note })),
      ...timeline.strums.map((strum) => ({ beat: strum.beat, strum })),
    ].sort((a, b) => a.beat - b.beat);
  }

  // ───────── store plumbing ─────────

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  private update(patch: Partial<PlayerSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((l) => l());
  }

  // ───────── clock ─────────

  private get bps() {
    return (this.timeline.song.bpm * this.snapshot.rate) / 60;
  }

  private timeOf(beat: number): number {
    const a = this.anchors[this.anchors.length - 1];
    return a.time + (beat - a.beat) / this.bps;
  }

  /** Where the music is right now, in beats. Never earlier than the start of this run. */
  beat(): number {
    const ctx = audioKit.ctx;
    if (!this.snapshot.playing || !ctx || this.anchors.length === 0) return this.position;
    const now = ctx.currentTime;
    let a = this.anchors[0];
    for (const candidate of this.anchors) if (candidate.time <= now) a = candidate;
    const raw = a.beat + (now - a.time) * this.bps;
    const inCountIn = this.anchors.length === 1 && raw < this.playFrom;
    return Math.min(inCountIn ? this.playFrom : raw, this.timeline.totalBeats);
  }

  /** 1, 2, 3, 4 while counting in — otherwise null. */
  countIn(): number | null {
    const ctx = audioKit.ctx;
    if (!this.snapshot.playing || !ctx || this.anchors.length !== 1) return null;
    const a = this.anchors[0];
    const raw = a.beat + (ctx.currentTime - a.time) * this.bps;
    if (raw >= this.playFrom) return null;
    const bar = this.timeline.song.beatsPerBar;
    return Math.min(bar, Math.max(1, Math.floor(raw - (this.playFrom - bar)) + 1));
  }

  // ───────── transport ─────────

  /** Download the instruments. Safe to call many times. */
  async load() {
    if (this.uke && this.lead) return;
    if (this.snapshot.status === "idle") this.update({ status: "loading" });
    const [uke, lead] = await Promise.all([
      audioKit.voice(UKE_VOICE),
      audioKit.voice(this.timeline.song.melody),
    ]);
    this.uke = uke;
    this.lead = lead;
    if (!this.disposed) this.update({ status: "ready", usingFallback: audioKit.usingFallback });
  }

  async play() {
    if (this.snapshot.playing || this.disposed) return;
    const ctx = await audioKit.resume();
    await this.load();
    if (this.disposed || this.snapshot.playing) return;

    const { totalBeats, song } = this.timeline;
    if (this.position >= totalBeats - EPS) this.position = this.snapshot.loop?.start ?? 0;

    const startTime = ctx.currentTime + START_DELAY;
    const lead = this.snapshot.options.countIn ? song.beatsPerBar : 0;
    this.playFrom = this.position;
    this.anchors = [{ time: startTime, beat: this.position - lead }];
    this.cursor = this.lowerBound(this.position);
    this.nextClick = Math.ceil(this.position - EPS);

    for (let i = 0; i < lead; i++) {
      this.track(audioKit.click(startTime + i / this.bps, i === 0));
    }

    this.update({ playing: true });
    this.timer = setInterval(() => this.tick(), TICK_MS);
    this.tick();
  }

  pause() {
    if (!this.snapshot.playing) return;
    this.position = this.beat();
    this.halt();
    this.update({ playing: false });
  }

  toggle() {
    if (this.snapshot.playing) this.pause();
    else void this.play();
  }

  /** Jump to a beat. Keeps playing if it was playing (without a new count-in). */
  seek(beat: number) {
    const target = Math.min(Math.max(beat, 0), this.timeline.totalBeats);
    this.position = target;
    if (!this.snapshot.playing) {
      this.update({});
      return;
    }
    this.silence();
    const ctx = audioKit.ensure();
    this.playFrom = target;
    this.anchors = [{ time: ctx.currentTime + START_DELAY, beat: target }];
    this.cursor = this.lowerBound(target);
    this.nextClick = Math.ceil(target - EPS);
    this.tick();
  }

  setRate(rate: number) {
    const next = Math.min(Math.max(rate, 0.4), 1.5);
    if (this.snapshot.playing && audioKit.ctx) {
      // Re-anchor at "now" so the change is smooth and nothing jumps.
      const beat = this.rawBeat();
      this.update({ rate: next });
      this.anchors = [{ time: audioKit.ctx.currentTime, beat }];
    } else {
      this.update({ rate: next });
    }
  }

  setLoop(loop: { start: number; end: number } | null) {
    if (loop && loop.end - loop.start < 1) return;
    this.update({ loop });
    if (loop) {
      const here = this.beat();
      if (here < loop.start - EPS || here >= loop.end - EPS) this.seek(loop.start);
    }
  }

  setOption<K extends keyof PlayerOptions>(key: K, value: PlayerOptions[K]) {
    this.update({ options: { ...this.snapshot.options, [key]: value } });
    if (key === "uke" && !value) this.uke?.stop();
    if (key === "melody" && !value) this.lead?.stop();
  }

  /** Called when the player screen mounts. */
  attach() {
    this.disposed = false;
  }

  /** Called when the player screen goes away: stop everything, ignore late async work. */
  detach() {
    this.disposed = true;
    if (this.snapshot.playing) this.position = this.beat();
    this.halt();
    if (this.snapshot.playing) this.update({ playing: false });
  }

  // ───────── scheduling ─────────

  private rawBeat(): number {
    const ctx = audioKit.ctx!;
    const now = ctx.currentTime;
    let a = this.anchors[0];
    for (const candidate of this.anchors) if (candidate.time <= now) a = candidate;
    return a.beat + (now - a.time) * this.bps;
  }

  private lowerBound(beat: number): number {
    let lo = 0;
    let hi = this.events.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.events[mid].beat < beat - EPS) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  private track(osc: OscillatorNode) {
    this.pendingClicks.add(osc);
    osc.onended = () => this.pendingClicks.delete(osc);
  }

  private silence() {
    this.uke?.stop();
    this.lead?.stop();
    for (const osc of this.pendingClicks) {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    }
    this.pendingClicks.clear();
  }

  private halt() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.silence();
    this.anchors = [];
  }

  private tick() {
    const ctx = audioKit.ctx;
    if (!ctx || !this.snapshot.playing) return;
    const now = ctx.currentTime;
    const horizon = now + LOOKAHEAD;

    // Drop anchors we have moved past, keeping the one in force.
    while (this.anchors.length > 1 && this.anchors[1].time <= now) this.anchors.shift();

    for (let guard = 0; guard < 8; guard++) {
      const { loop } = this.snapshot;
      const limit = loop ? loop.end : this.timeline.totalBeats;

      while (this.cursor < this.events.length) {
        const event = this.events[this.cursor];
        if (event.beat >= limit - EPS) break;
        const t = this.timeOf(event.beat);
        if (t > horizon) break;
        this.fire(event, t);
        this.cursor++;
      }

      while (this.nextClick < limit - EPS) {
        const t = this.timeOf(this.nextClick);
        if (t > horizon) break;
        if (this.snapshot.options.click && t >= now - 0.01) {
          this.track(audioKit.click(t, this.nextClick % this.timeline.song.beatsPerBar === 0));
        }
        this.nextClick++;
      }

      const limitTime = this.timeOf(limit);
      if (limitTime > horizon) return;

      if (loop) {
        // Wrap around: from `limitTime` on, the clock reads `loop.start`.
        this.anchors.push({ time: limitTime, beat: loop.start });
        this.playFrom = Math.min(this.playFrom, loop.start);
        this.cursor = this.lowerBound(loop.start);
        this.nextClick = Math.ceil(loop.start - EPS);
        continue;
      }

      if (now >= limitTime) {
        this.position = this.timeline.totalBeats;
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.anchors = [];
        this.update({ playing: false });
      }
      return;
    }
  }

  private fire(event: Event, time: number) {
    const { options } = this.snapshot;
    const seconds = 1 / this.bps;
    if (event.note && options.melody && this.lead) {
      this.lead.start({
        note: event.note.midi,
        velocity: 92,
        time,
        duration: Math.max(0.12, event.note.dur * seconds * 0.95),
      });
    }
    if (event.strum && options.uke && this.uke) {
      audioKit.strum(this.uke, event.strum.chord, event.strum.kind, time, Math.min(2.4, 3 * seconds));
    }
  }
}
