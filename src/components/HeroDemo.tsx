"use client";

import { useMemo, useState } from "react";
import { compileSong } from "@/lib/music/compile";
import type { Song } from "@/lib/music/types";
import { ChordDiagram } from "./ChordDiagram";
import { ChordChip } from "./ChordStrip";
import { Icon } from "./Icon";
import { Lyrics } from "./player/Lyrics";
import { usePlayer } from "./player/usePlayer";

/**
 * The front page shows the product working instead of describing it:
 * two real lines of a song that you can play right there.
 */
export function HeroDemo({ song }: { song: Song }) {
  const timeline = useMemo(() => compileSong(song), [song]);
  const { player, snap, frame, onBeat } = usePlayer(timeline);
  const chord = timeline.chords[frame.chord].name;
  /** Pressed before the sounds finished downloading. */
  const [waiting, setWaiting] = useState(false);

  return (
    <div className="grid rounded-lg border-2 border-ink bg-paper text-ink sm:grid-cols-[auto_minmax(0,1fr)]">
      <div className="flex items-center gap-4 border-b-2 border-ink p-3 sm:flex-col sm:items-start sm:border-b-0 sm:border-e-2 sm:p-4">
        <button
          type="button"
          onClick={() => {
            setWaiting(!snap.playing && snap.status !== "ready");
            player.toggle();
          }}
          className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-lg bg-ink px-4 text-xl font-extrabold text-paper hover:bg-sun hover:text-blot"
        >
          {snap.playing ? (
            <Icon name="pause" size={22} />
          ) : waiting && snap.status !== "ready" ? (
            <Icon name="loading" size={22} weight={3} className="animate-spin" />
          ) : (
            <Icon name="play" size={22} />
          )}
          {snap.playing ? "Pause" : "Try it"}
        </button>
        <div className="flex items-center gap-3 sm:mt-auto">
          {/* A fixed slot, so the diagram stays put when the chord name changes width. */}
          <span className="w-16 shrink-0">
            <span key={chord} className="inline-block animate-count">
              <ChordChip name={chord} className="text-4xl leading-[1.15]" />
            </span>
          </span>
          <ChordDiagram name={chord} showStrings={false} className="h-28 w-auto shrink-0" />
        </div>
      </div>

      <div className="min-w-0 px-2 py-3 sm:px-3">
        <p className="px-2 pb-1 text-lg font-bold" role="status">
          {frame.countIn !== null
            ? `Get ready: ${frame.countIn}`
            : snap.playing
              ? "Hold the chord in the box. Change when the colour changes."
              : "Two lines of a real song. Press Try it and watch the words."}
        </p>
        <Lyrics timeline={timeline} frame={frame} loop={null} onBeat={onBeat} onSeek={(beat) => player.seek(beat)} plain />
      </div>
    </div>
  );
}
