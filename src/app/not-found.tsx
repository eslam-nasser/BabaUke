import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { SONGS } from "@/songs";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Shell>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-display text-5xl sm:text-6xl">That page is not in the songbook.</h1>
        <p className="mt-3 max-w-[54ch] text-xl text-soft">
          The link may be old, or the song may have been renamed. Here is everything that is in the songbook.
        </p>
        <ul className="mt-8 grid border-t-2 border-ink sm:grid-cols-2 sm:gap-x-10">
          {SONGS.map((song) => (
            <li key={song.slug} className="border-b border-rule">
              <Link href={`/song/${song.slug}`} className="flex min-h-14 items-baseline justify-between gap-4 px-2 py-2 hover:bg-wash">
                <span className={`font-display leading-tight ${song.lang === "ar" ? "text-3xl" : "text-2xl"}`}>
                  <bdi lang={song.lang}>{song.title}</bdi>
                </span>
                <span className="shrink-0 text-soft">{song.mood}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-lg">
          Or go to the{" "}
          <Link href="/" className="font-bold underline decoration-2">
            front page
          </Link>
          , the{" "}
          <Link href="/chords" className="font-bold underline decoration-2">
            chords
          </Link>{" "}
          or the{" "}
          <Link href="/tuner" className="font-bold underline decoration-2">
            tuner
          </Link>
          .
        </p>
      </main>
    </Shell>
  );
}
