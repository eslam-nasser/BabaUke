"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lang } from "@/lib/music/types";
import { ChordChip, type ChordRun, ChordStrip } from "./ChordStrip";
import { Icon } from "./Icon";

export type SongSummary = {
  slug: string;
  title: string;
  subtitle: string;
  lang: Lang;
  scene: "day" | "night";
  difficulty: 1 | 2 | 3;
  seconds: number;
  chords: string[];
  strip: ChordRun[];
};

const LEVEL = { 1: "Easy", 2: "Medium", 3: "Harder" } as const;

const LANGS: { id: "all" | Lang; label: string; lang?: string }[] = [
  { id: "all", label: "All" },
  { id: "ar", label: "عربي", lang: "ar" },
  { id: "en", label: "English" },
];

/** The songbook: day songs on bright paper, night songs on dark paper, easiest first. */
export function Library({ songs }: { songs: SongSummary[] }) {
  const [lang, setLang] = useState<"all" | Lang>("all");
  const shown = songs
    .filter((s) => lang === "all" || s.lang === lang)
    .sort((a, b) => a.difficulty - b.difficulty || a.chords.length - b.chords.length);
  const day = shown.filter((s) => s.scene === "day");
  const night = shown.filter((s) => s.scene === "night");

  return (
    <div id="songs">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pt-8 sm:px-6">
        <p className="max-w-[60ch] text-soft">
          {shown.length} {shown.length === 1 ? "song" : "songs"}, easiest first. The coloured strip under each one is the whole
          song, one colour per chord, so you can see how often you will change.
        </p>
        <div className="flex items-center gap-1" role="group" aria-label="Show songs in">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              lang={l.lang}
              aria-pressed={lang === l.id}
              onClick={() => setLang(l.id)}
              className={`min-h-11 rounded-md px-4 text-lg font-bold ${lang === l.id ? "bg-ink text-paper" : "hover:bg-wash"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <SongList title="Day songs" note="For playing and dancing around the living room." songs={day} first />

      <div data-scene="night" className="mt-12 bg-paper pb-14 pt-4 text-ink">
        <SongList
          title="Night songs"
          note="Lullabies. These open on dark paper, so the screen stays gentle in a dim room."
          songs={night}
        />
      </div>
    </div>
  );
}

export function SongList({
  title,
  note,
  songs,
  first = false,
}: {
  title: string;
  note: string;
  songs: SongSummary[];
  /** Mark the easiest song in this list as the place to begin. */
  first?: boolean;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
      <h2 className="font-display text-4xl">{title}</h2>
      <p className="mb-4 text-soft">{note}</p>
      {songs.length === 0 ? (
        <p className="border-t-2 border-ink py-6 font-bold">No songs in this language here yet.</p>
      ) : (
        <ul className="border-t-2 border-ink">
          {songs.map((song, i) => (
            <li key={song.slug} className="border-b border-rule">
              <SongRow song={song} startHere={first && i === 0} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SongRow({ song, startHere }: { song: SongSummary; startHere: boolean }) {
  const minutes = `${Math.floor(song.seconds / 60)}:${String(song.seconds % 60).padStart(2, "0")}`;
  return (
    <Link
      href={`/song/${song.slug}`}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-2 py-4 hover:bg-wash"
    >
      <div className="min-w-0 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          {/* Rakkas draws Arabic smaller than Latin at the same size, so Arabic titles are set larger. */}
          <h3 className={`font-display leading-tight ${song.lang === "ar" ? "text-[2.4rem]" : "text-[1.9rem]"}`}>
            <bdi lang={song.lang}>{song.title}</bdi>
          </h3>
          <p className="text-soft">{song.subtitle}</p>
        </div>
        <div className="mt-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 font-bold sm:mt-0 sm:flex-nowrap">
          <span className="flex gap-1">
            {song.chords.map((name) => (
              <ChordChip key={name} name={name} className="text-lg" />
            ))}
          </span>
          <span className="sm:w-36">{startHere ? `${LEVEL[song.difficulty]}, start here` : LEVEL[song.difficulty]}</span>
          <span className="tabular-nums text-soft sm:w-10">{minutes}</span>
        </div>
      </div>

      <span
        className="grid h-11 w-11 place-items-center rounded-lg border-2 border-ink group-hover:bg-ink group-hover:text-paper"
        aria-hidden
      >
        <Icon name="play" size={18} />
      </span>

      <ChordStrip runs={song.strip} className="col-span-2 h-2.5 rounded-[2px]" />
    </Link>
  );
}
