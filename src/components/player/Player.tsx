"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChordDiagram } from "@/components/ChordDiagram";
import { ChordChip, type ChordRun, ChordStrip } from "@/components/ChordStrip";
import { Icon } from "@/components/Icon";
import { StrumPattern, strumLegend } from "@/components/StrumPattern";
import type { SongPlayer } from "@/lib/audio/player";
import { chordColor } from "@/lib/music/chords";
import { compileSong } from "@/lib/music/compile";
import type { Song } from "@/lib/music/types";
import { Lyrics } from "./Lyrics";
import { type BeatListener, usePlayer } from "./usePlayer";

function clock(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

type Run = { name: string; start: number; end: number; first: number; last: number };

const HOW_TO_READ =
  "Hold the chord in the box. Each word is marked in its chord's colour as you sing it, so change when the colour changes. Tap any line to jump to it.";

export function Player({ song }: { song: Song }) {
  const timeline = useMemo(() => compileSong(song), [song]);
  const { player, snap, frame, onBeat } = usePlayer(timeline);
  const { chords, sections, lines, totalBeats } = timeline;
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [hint, setHint] = useState(false);
  /** Play was pressed before the sounds finished downloading. */
  const [waiting, setWaiting] = useState(false);
  /** Which paper the page is on. Starts from the song, and can be switched by hand. */
  const [paper, setPaper] = useState(song.scene);

  // Neighbouring spans of the same chord count as one "now playing" chord.
  const runs = useMemo(() => {
    const out: Run[] = [];
    for (const span of chords) {
      const prev = out[out.length - 1];
      if (prev && prev.name === span.name) {
        prev.end = span.start + span.dur;
        prev.last = span.index;
      } else {
        out.push({ name: span.name, start: span.start, end: span.start + span.dur, first: span.index, last: span.index });
      }
    }
    return out;
  }, [chords]);
  const strip = useMemo<ChordRun[]>(() => runs.map((r) => [r.name, r.end - r.start]), [runs]);

  const runIndex = Math.max(0, runs.findIndex((r) => frame.chord >= r.first && frame.chord <= r.last));
  const now = runs[runIndex];
  const next = runs[runIndex + 1];
  const color = chordColor(now.name);
  const line = lines[frame.line];
  const section = sections[line.section];
  const bps = (song.bpm * snap.rate) / 60;
  const speed = Math.round(snap.rate * 100);
  const total = clock(totalBeats / bps);
  const patternName = /[1-4]/.test(song.strum) ? "Picking" : "Strumming";
  const activeSlot = frame.moving ? frame.slot : -1;

  const main = useRef<HTMLElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const optionsButton = useRef<HTMLButtonElement>(null);
  const timeEls = useRef<(HTMLSpanElement | null)[]>([]);
  const changeEls = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(
    () =>
      onBeat((beat) => {
        for (const el of timeEls.current) if (el) el.textContent = clock(beat / bps);
        const run = runs.find((r) => beat >= r.start && beat < r.end) ?? runs[runs.length - 1];
        const left = 1 - Math.min(1, Math.max(0, (beat - run.start) / (run.end - run.start)));
        for (const el of changeEls.current) if (el) el.style.transform = `scaleX(${left})`;
      }),
    [onBeat, bps, runs],
  );

  // The page frame decides the paper colour; switching it by hand updates that frame.
  useEffect(() => {
    main.current?.closest<HTMLElement>("[data-scene]")?.setAttribute("data-scene", paper);
  }, [paper]);

  // A short "how to read this screen" note, shown until it is dismissed once.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser storage, which does not exist on the server
      if (!localStorage.getItem("babauke:hint-seen")) setHint(true);
    } catch {
      /* private mode: just skip the hint */
    }
  }, []);
  const dismissHint = () => {
    setHint(false);
    try {
      localStorage.setItem("babauke:hint-seen", "1");
    } catch {
      /* ignore */
    }
  };

  const closeOptions = () => {
    setOptionsOpen(false);
    optionsButton.current?.focus();
  };
  useEffect(() => {
    if (optionsOpen) sheet.current?.focus();
  }, [optionsOpen]);

  const toggleLoop = (index: number) => {
    const s = sections[index];
    const same = snap.loop?.start === s.start && snap.loop?.end === s.end;
    player.setLoop(same ? null : { start: s.start, end: s.end });
  };

  // Keyboard: Space plays and pauses, ↑ ↓ move between lines, L repeats the part, Esc closes Options.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") {
        setOptionsOpen((open) => {
          if (open) optionsButton.current?.focus();
          return false;
        });
        return;
      }
      const el = e.target as HTMLElement;
      const typing = el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT";
      const onControl = typing || el.tagName === "BUTTON" || el.tagName === "A" || el.getAttribute("role") === "button";
      const here = Math.max(0, timeline.lines.findLastIndex((l) => l.start <= player.beat() + 1e-6));
      if (e.code === "Space" && !onControl) {
        e.preventDefault();
        player.toggle();
      } else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !typing) {
        e.preventDefault();
        const target = timeline.lines[here + (e.key === "ArrowDown" ? 1 : -1)];
        if (target) player.seek(target.start);
      } else if (e.key.toLowerCase() === "l" && !typing) {
        const s = timeline.sections[timeline.lines[here].section];
        const same = player.snapshot.loop?.start === s.start && player.snapshot.loop?.end === s.end;
        player.setLoop(same ? null : { start: s.start, end: s.end });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player, timeline]);

  const sound = (
    <div>
      <p className="mb-2 text-base font-bold text-soft">You hear</p>
      <div className="grid grid-cols-2 gap-2">
        <Toggle on={snap.options.uke} onClick={() => player.setOption("uke", !snap.options.uke)} label="Ukulele" />
        <Toggle on={snap.options.melody} onClick={() => player.setOption("melody", !snap.options.melody)} label="Melody" />
        <Toggle on={snap.options.click} onClick={() => player.setOption("click", !snap.options.click)} label="Click" />
        <Toggle on={snap.options.countIn} onClick={() => player.setOption("countIn", !snap.options.countIn)} label="Count-in" />
      </div>
      <p className="mb-2 mt-4 text-base font-bold text-soft">This screen</p>
      <div className="grid grid-cols-2 gap-2">
        <Toggle on={!!snap.loop} onClick={() => (snap.loop ? player.setLoop(null) : toggleLoop(section.index))} label="Repeat part" />
        <Toggle on={paper === "night"} onClick={() => setPaper(paper === "night" ? "day" : "night")} label="Dark paper" />
      </div>
    </div>
  );

  const speedControl = (
    <label className="flex items-center gap-3 text-base font-bold">
      <span className="w-24 shrink-0 whitespace-nowrap tabular-nums leading-tight">
        {Math.round(song.bpm * snap.rate)} bpm
        <span className="block text-base font-normal text-soft">Speed {speed}%</span>
      </span>
      <input
        type="range"
        className="slider w-full min-w-28"
        min={50}
        max={125}
        step={5}
        value={speed}
        onChange={(e) => player.setRate(Number(e.target.value) / 100)}
        aria-label="Speed"
        aria-valuetext={`${speed} percent, ${Math.round(song.bpm * snap.rate)} beats per minute`}
      />
    </label>
  );

  const about = (
    <div className="space-y-2 text-base leading-snug text-soft">
      <p className="text-ink">{song.about}</p>
      <p>{HOW_TO_READ}</p>
      <p>{strumLegend(song.strum)}</p>
      <p>{song.credit}</p>
    </div>
  );

  return (
    <>
      {/* The transport comes first in the page so Tab reaches Play before the lyric lines; it is drawn at the bottom. */}
      <div className="relative z-20 order-last border-t-2 border-ink bg-paper">
        <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center gap-2 bg-paper px-3 py-2 sm:gap-3 sm:px-6 short:py-1">
          <button
            type="button"
            onClick={() => {
              setWaiting(!snap.playing && snap.status !== "ready");
              player.toggle();
            }}
            aria-label={snap.playing ? "Pause" : "Play"}
            className="grid h-13 w-13 shrink-0 place-items-center rounded-lg border-2 border-ink bg-ink text-paper hover:border-sun hover:bg-sun hover:text-blot night:bg-transparent night:text-ink short:h-11 short:w-11"
          >
            {snap.playing ? (
              <Icon name="pause" size={26} />
            ) : waiting && snap.status !== "ready" ? (
              <Icon name="loading" size={26} weight={3} className="animate-spin" />
            ) : (
              <Icon name="play" size={26} />
            )}
          </button>
          <button
            type="button"
            onClick={() => player.seek(snap.loop?.start ?? 0)}
            aria-label={snap.loop ? "Back to the start of this part" : "Back to the start"}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md hover:bg-wash"
          >
            <Icon name="restart" size={20} />
          </button>
          <p className="hidden w-24 shrink-0 text-base font-bold tabular-nums sm:block">
            <span
              ref={(el) => {
                timeEls.current[0] = el;
              }}
            >
              0:00
            </span>
            <span className="font-normal text-soft"> of {total}</span>
          </p>

          <SeekBar
            player={player}
            strip={strip}
            total={totalBeats}
            barBeats={song.beatsPerBar}
            loop={snap.loop}
            onBeat={onBeat}
            valueText={`${section.name}, line ${frame.line + 1} of ${lines.length}`}
            valueNow={Math.round(line.start)}
          />

          <div className="hidden w-64 shrink-0 md:block">{speedControl}</div>
          <button
            ref={optionsButton}
            type="button"
            onClick={() => (optionsOpen ? closeOptions() : setOptionsOpen(true))}
            aria-expanded={optionsOpen}
            aria-controls="player-options"
            className={`h-11 shrink-0 rounded-md border-2 border-ink px-3 text-base font-bold lg:hidden ${
              optionsOpen ? "bg-wash" : "hover:bg-wash"
            }`}
          >
            {optionsOpen ? "Close" : "Options"}
          </button>
        </div>

        {/* Options float over the words instead of pushing them away. Tapping outside closes them. */}
        {optionsOpen && (
          <>
            <button
              type="button"
              aria-label="Close options"
              tabIndex={-1}
              onClick={closeOptions}
              className="fixed inset-0 h-dvh cursor-default bg-paper/80 lg:hidden"
            />
            <div
              ref={sheet}
              id="player-options"
              role="region"
              aria-label="Options"
              tabIndex={-1}
              className="absolute inset-x-0 bottom-full max-h-[72dvh] space-y-4 overflow-y-auto border-t-2 border-ink bg-paper px-4 pb-8 pt-4 outline-none sm:px-6 lg:hidden"
            >
              <div className="md:hidden">{speedControl}</div>
              {sound}
              {about}
            </div>
          </>
        )}

        {snap.usingFallback && (
          <p className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-2 text-base font-bold sm:px-6">
            The instrument sounds could not be downloaded, so you are hearing a simple built-in synth.
            <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-md border-2 border-ink px-3 hover:bg-wash">
              Try again
            </button>
          </p>
        )}
      </div>

      <main ref={main} className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_21rem]">
        <section className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-rule px-2 py-1.5 sm:px-4 short:py-0">
            <Link href="/" aria-label="All songs" className="grid h-11 w-11 shrink-0 place-items-center rounded-md hover:bg-wash">
              <Icon name="back" size={22} />
            </Link>
            <div className="min-w-0 short:flex short:items-baseline short:gap-3">
              <h1
                className={`truncate font-display leading-tight short:text-2xl ${
                  song.lang === "ar" ? "text-[2.1rem] sm:text-[2.4rem]" : "text-[1.7rem] sm:text-3xl"
                }`}
              >
                <bdi lang={song.lang}>{song.title}</bdi>
              </h1>
              <p className="truncate text-base leading-tight text-soft">{song.subtitle}</p>
            </div>
            <p className="ms-auto shrink-0 ps-2 text-end text-base font-bold tabular-nums leading-tight sm:hidden">
              <span
                ref={(el) => {
                  timeEls.current[1] = el;
                }}
              >
                0:00
              </span>
              <span className="block font-normal text-soft">of {total}</span>
            </p>
          </div>

          {/* Below the desktop layout the chord and the pattern sit above the words, all on one screen. */}
          <div className="border-b border-rule px-4 py-2 lg:hidden short:py-1">
            <div className="flex items-center gap-3">
              {/* A fixed slot, so the diagram stays put when the chord name changes width. */}
              <div className="w-[5.25rem] shrink-0 short:w-16">
                <span key={now.first} className="inline-block animate-count">
                  <ChordChip name={now.name} className="text-[2.6rem] leading-[1.15] short:text-3xl" />
                </span>
              </div>
              <ChordDiagram name={now.name} showStrings={false} className="h-28 w-auto shrink-0 short:hidden" />
              {/* Sideways phones: a smaller box, and the pattern moves up beside it. */}
              <ChordDiagram name={now.name} showStrings={false} showFingers={false} className="hidden h-16 w-auto shrink-0 short:block" />
              <div className="hidden min-w-0 max-w-sm flex-1 short:block">
                <StrumPattern pattern={song.strum} active={activeSlot} color={color} />
              </div>
              <div className="ms-auto flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <p className="text-base font-bold leading-tight text-soft">Next</p>
                  {next ? <ChordChip name={next.name} className="text-2xl" /> : <p className="text-xl font-black">End</p>}
                </div>
                {next && (
                  <ChordDiagram name={next.name} showFingers={false} showStrings={false} className="h-16 w-auto shrink-0 text-soft short:h-14" />
                )}
              </div>
            </div>
            <div className="my-1.5 h-1 bg-rule short:my-1" role="presentation">
              <div
                ref={(el) => {
                  changeEls.current[0] = el;
                }}
                className="h-full origin-left bg-ink"
              />
            </div>
            <div className="flex items-center gap-3 short:hidden">
              <p className="w-[4.5rem] shrink-0 text-base font-bold leading-tight text-soft">{patternName}</p>
              <div className="min-w-0 flex-1">
                <StrumPattern pattern={song.strum} active={activeSlot} color={color} />
              </div>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <Lyrics
              timeline={timeline}
              frame={frame}
              loop={snap.loop}
              onBeat={onBeat}
              onSeek={(beat) => player.seek(beat)}
              onLoopSection={toggleLoop}
            />
            {/* First-visit note. It lies over the bottom of the words, so nothing jumps when it appears. */}
            {hint && (
              <div className="absolute inset-x-0 bottom-0 flex items-start gap-3 border-t-2 border-ink bg-paper px-4 py-2 text-base leading-snug short:hidden">
                <p className="min-w-0 flex-1">{HOW_TO_READ}</p>
                <button type="button" onClick={dismissHint} className="min-h-11 shrink-0 rounded-md border-2 border-ink px-3 font-bold hover:bg-wash">
                  Got it
                </button>
              </div>
            )}
            {frame.countIn !== null && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-paper/85" aria-live="assertive">
                <span key={frame.countIn} className="animate-count font-display text-[9rem] leading-none short:text-[6rem]">
                  {frame.countIn}
                </span>
              </div>
            )}
          </div>
        </section>

        <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto border-s-2 border-ink p-5 lg:flex">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-bold text-soft">Now</p>
                <span key={now.first} className="mt-1 inline-block animate-count">
                  <ChordChip name={now.name} className="text-6xl leading-[1.15]" />
                </span>
              </div>
              <ChordDiagram name={now.name} className="h-40 w-auto shrink-0" />
            </div>
            <div className="mt-2 h-1.5 bg-rule" role="presentation">
              <div
                ref={(el) => {
                  changeEls.current[1] = el;
                }}
                className="h-full origin-left bg-ink"
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-bold text-soft">{next ? "Next, when the bar runs out" : "Last chord"}</p>
                {next ? <ChordChip name={next.name} className="mt-1 text-3xl" /> : <p className="text-2xl font-black">End</p>}
              </div>
              {next && <ChordDiagram name={next.name} showFingers={false} showStrings={false} className="h-16 w-auto text-soft" />}
            </div>
          </div>

          <div className="border-t border-rule pt-3">
            <p className="mb-2 text-base font-bold text-soft">{patternName}, one bar</p>
            <StrumPattern pattern={song.strum} active={activeSlot} color={color} />
          </div>

          <div className="border-t border-rule pt-3">{sound}</div>

          <details className="border-t border-rule pt-3">
            <summary className="flex min-h-11 cursor-pointer items-center text-base font-bold">About this song, and how to read this screen</summary>
            <div className="space-y-2 pt-1">
              {about}
              <p className="text-base leading-snug text-soft">
                <Key>Space</Key> plays and pauses. <Key>↑</Key> <Key>↓</Key> move between lines. <Key>L</Key> repeats the part.
              </p>
            </div>
          </details>
        </aside>
      </main>
    </>
  );
}

/** The whole song as a strip of chord colours. Click, drag or use the arrow keys to move through it. */
function SeekBar({
  player,
  strip,
  total,
  barBeats,
  loop,
  onBeat,
  valueText,
  valueNow,
}: {
  player: SongPlayer;
  strip: ChordRun[];
  total: number;
  barBeats: number;
  loop: { start: number; end: number } | null;
  onBeat: (listener: BeatListener) => () => void;
  valueText: string;
  valueNow: number;
}) {
  const head = useRef<HTMLDivElement>(null);
  const ahead = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      onBeat((beat) => {
        const pct = `${(beat / total) * 100}%`;
        if (head.current) head.current.style.left = pct;
        if (ahead.current) ahead.current.style.left = pct;
      }),
    [onBeat, total],
  );

  const seekTo = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    player.seek((Math.min(Math.max(e.clientX - box.left, 0), box.width) / box.width) * total);
  };

  return (
    <div
      dir="ltr"
      role="slider"
      tabIndex={0}
      aria-label="Position in the song"
      aria-valuemin={0}
      aria-valuemax={Math.round(total)}
      aria-valuenow={valueNow}
      aria-valuetext={valueText}
      className="relative flex h-11 min-w-0 flex-1 cursor-pointer touch-none items-center"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        seekTo(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) seekTo(e);
      }}
      onKeyDown={(e) => {
        const step = e.key === "ArrowRight" ? barBeats : e.key === "ArrowLeft" ? -barBeats : 0;
        if (step) {
          e.preventDefault();
          player.seek(player.beat() + step);
        } else if (e.key === "Home") {
          e.preventDefault();
          player.seek(0);
        } else if (e.key === "End") {
          e.preventDefault();
          player.seek(total);
        }
      }}
    >
      <ChordStrip runs={strip} className="h-4 w-full rounded-[3px]" />
      {/* the part still to come is a thinner strip */}
      <div ref={ahead} className="absolute right-0 top-1/2 flex h-4 -translate-y-1/2 flex-col justify-between" style={{ left: 0 }}>
        <span className="h-1 bg-paper" />
        <span className="h-1 bg-paper" />
      </div>
      {loop && (
        <div
          className="absolute top-1/2 h-7 -translate-y-1/2 rounded-[3px] border-x-4 border-y border-ink"
          style={{ left: `${(loop.start / total) * 100}%`, width: `${((loop.end - loop.start) / total) * 100}%` }}
        />
      )}
      <div ref={head} className="absolute top-1/2 h-8 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-ink" style={{ left: 0 }} />
    </div>
  );
}

/** A labelled checkbox. On is a filled box with a tick, so the control stays quiet on dark paper. */
function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`flex min-h-11 items-center gap-2 rounded-md border-2 px-2.5 text-start text-base font-bold ${
        on ? "border-ink" : "border-rule hover:border-ink"
      }`}
    >
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border-2 border-ink ${on ? "bg-ink text-paper" : ""}`}>
        {on && <Icon name="check" size={12} weight={4.5} />}
      </span>
      {label}
    </button>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded border border-rule px-1.5 font-sans font-bold text-ink">{children}</kbd>;
}
