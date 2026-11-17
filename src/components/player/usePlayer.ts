"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { type PlayerOptions, SongPlayer } from "@/lib/audio/player";
import { findAt } from "@/lib/music/compile";
import type { Timeline } from "@/lib/music/types";

/** The coarse "where are we" state. It only changes a few times per second. */
export type Frame = {
  line: number;
  /** Index into `timeline.chords`. */
  chord: number;
  /** Eighth-note slot inside the current bar. */
  slot: number;
  countIn: number | null;
  /** True while the music is sounding: playing, and past the count-in. */
  moving: boolean;
};

export type BeatListener = (beat: number) => void;

const SETTINGS_KEY = "babauke:settings";
type Settings = { rate: number; options: PlayerOptions };

function readSettings(): Partial<Settings> {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") as Partial<Settings>;
  } catch {
    return {};
  }
}

function frameAt(timeline: Timeline, beat: number, countIn: number | null, playing = false): Frame {
  const slots = timeline.song.beatsPerBar * 2;
  return {
    line: Math.max(0, findAt(timeline.lines, beat)),
    chord: Math.max(0, findAt(timeline.chords, beat)),
    slot: Math.floor(beat * 2 + 1e-6) % slots,
    countIn,
    moving: playing && countIn === null,
  };
}

export function usePlayer(timeline: Timeline) {
  const [player] = useState(() => new SongPlayer(timeline));
  const snap = useSyncExternalStore(player.subscribe, player.getSnapshot, player.getSnapshot);
  const [frame, setFrame] = useState<Frame>(() => frameAt(timeline, 0, null));
  const listeners = useRef(new Set<BeatListener>());

  useEffect(() => {
    player.attach();

    // Speed and sound choices carry over from the last song you played.
    const saved = readSettings();
    if (typeof saved.rate === "number") player.setRate(saved.rate);
    if (saved.options) {
      for (const key of Object.keys(player.snapshot.options) as (keyof PlayerOptions)[]) {
        if (typeof saved.options[key] === "boolean") player.setOption(key, saved.options[key]);
      }
    }
    const stopSaving = player.subscribe(() => {
      const { rate, options } = player.snapshot;
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ rate, options } satisfies Settings));
      } catch {
        /* private mode: settings just do not persist */
      }
    });

    void player.load();
    let raf = 0;
    const loop = () => {
      const beat = player.beat();
      listeners.current.forEach((l) => l(beat));
      const next = frameAt(timeline, beat, player.countIn(), player.snapshot.playing);
      setFrame((prev) =>
        prev.line === next.line &&
        prev.chord === next.chord &&
        prev.slot === next.slot &&
        prev.countIn === next.countIn &&
        prev.moving === next.moving
          ? prev
          : next,
      );
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      stopSaving();
      player.detach();
    };
  }, [player, timeline]);

  // Hands are on the ukulele, so stop the screen from dimming while a song plays.
  const playing = snap.playing;
  useEffect(() => {
    if (!playing || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    navigator.wakeLock
      .request("screen")
      .then((sentinel) => {
        if (cancelled) void sentinel.release();
        else lock = sentinel;
      })
      .catch(() => {
        /* not allowed right now (for example on low battery): carry on without it */
      });
    return () => {
      cancelled = true;
      void lock?.release();
    };
  }, [playing]);

  /** Subscribe to the exact beat on every animation frame (for smooth, render-free animation). */
  const onBeat = useCallback((listener: BeatListener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  return { player, snap, frame, onBeat };
}
