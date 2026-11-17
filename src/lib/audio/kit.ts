import { chordMidi } from "@/lib/music/chords";
import type { StrumKind } from "@/lib/music/types";

/** The small part of a sampled instrument that BabaUke needs. */
export type Voice = {
  start(note: { note: number; velocity?: number; time?: number; duration?: number }): unknown;
  stop(): void;
};

export type VoiceName =
  | "acoustic_guitar_nylon"
  | "music_box"
  | "marimba"
  | "kalimba"
  | "glockenspiel";

/** The ukulele is played with nylon-string samples in ukulele tuning (G4 C4 E4 A4). */
export const UKE_VOICE: VoiceName = "acoustic_guitar_nylon";

const LOAD_TIMEOUT_MS = 15_000;

/**
 * A tiny built-in plucked-string synth. Only used when the sampled
 * instruments cannot be downloaded (offline, blocked CDN…), so the app
 * always makes a sound.
 */
function createSynthVoice(ctx: AudioContext, destination: AudioNode, bright: boolean): Voice {
  const live = new Set<OscillatorNode>();
  return {
    start({ note, velocity = 90, time, duration = 1.2 }) {
      const t = Math.max(time ?? ctx.currentTime, ctx.currentTime);
      const freq = 440 * 2 ** ((note - 69) / 12);
      const peak = (velocity / 127) * (bright ? 0.22 : 0.28);
      const ring = Math.min(Math.max(duration, 0.25), 2.5);

      const osc = ctx.createOscillator();
      osc.type = bright ? "sine" : "triangle";
      osc.frequency.value = freq;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * (bright ? 8 : 5), t);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.5, t + ring);

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(peak, t + 0.006);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + ring);

      osc.connect(filter).connect(amp).connect(destination);
      osc.start(t);
      osc.stop(t + ring + 0.05);
      live.add(osc);
      osc.onended = () => live.delete(osc);
    },
    stop() {
      for (const osc of live) {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
      }
      live.clear();
    },
  };
}

/** One shared audio context and instrument cache for the whole app. */
class AudioKit {
  ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Map<VoiceName, Promise<Voice>>();
  /** True when at least one voice fell back to the built-in synth. */
  usingFallback = false;

  /** Must be called from a click/tap the first time (browser autoplay rules). */
  ensure(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext({ latencyHint: "interactive" });
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = -10;
      limiter.ratio.value = 6;
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(limiter).connect(this.ctx.destination);
    }
    return this.ctx;
  }

  async resume(): Promise<AudioContext> {
    const ctx = this.ensure();
    if (ctx.state !== "running") await ctx.resume();
    return ctx;
  }

  voice(name: VoiceName): Promise<Voice> {
    let pending = this.voices.get(name);
    if (!pending) {
      pending = this.load(name);
      this.voices.set(name, pending);
    }
    return pending;
  }

  private async load(name: VoiceName): Promise<Voice> {
    const ctx = this.ensure();
    const destination = this.master!;
    try {
      const { Soundfont } = await import("smplr");
      const instrument = Soundfont(ctx, {
        instrument: name,
        destination,
        volume: name === UKE_VOICE ? 110 : 96,
      });
      await Promise.race([
        instrument.ready,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("sample download timed out")), LOAD_TIMEOUT_MS),
        ),
      ]);
      return instrument;
    } catch (err) {
      console.warn(`BabaUke: using the built-in synth for "${name}"`, err);
      this.usingFallback = true;
      return createSynthVoice(ctx, destination, name !== UKE_VOICE);
    }
  }

  /** Strum or pluck a chord. `time` is an AudioContext time; omit for "now". */
  strum(uke: Voice, chord: string, kind: StrumKind, time?: number, ringSeconds = 2) {
    const ctx = this.ensure();
    const t = Math.max(time ?? ctx.currentTime, ctx.currentTime);
    const strings = chordMidi(chord); // string 4 (G) → string 1 (A)
    const jitter = () => (Math.random() - 0.5) * 0.006;
    const human = (v: number) => Math.round(v + (Math.random() - 0.5) * 10);

    if (kind >= "1" && kind <= "4") {
      uke.start({ note: strings[4 - Number(kind)], velocity: human(86), time: t, duration: ringSeconds });
      return;
    }
    const down = kind === "D" || kind === "d";
    const loud = kind === "D" || kind === "U";
    // Up-strokes brush the three highest strings, as a real player's finger does.
    const order = down ? [0, 1, 2, 3] : [3, 2, 1];
    const gap = down ? 0.02 : 0.014;
    const velocity = down ? (loud ? 92 : 62) : loud ? 66 : 48;
    order.forEach((s, i) => {
      uke.start({
        note: strings[s],
        velocity: human(velocity - i * 2),
        time: t + i * gap + Math.abs(jitter()),
        duration: ringSeconds,
      });
    });
  }

  /** A short metronome tick. Returns the oscillator so it can be cancelled. */
  click(time: number, accent: boolean): OscillatorNode {
    const ctx = this.ensure();
    const t = Math.max(time, ctx.currentTime);
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = accent ? 1568 : 1046;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(accent ? 0.16 : 0.1, t + 0.002);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(amp).connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.08);
    return osc;
  }
}

export const audioKit = new AudioKit();
