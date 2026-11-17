import Link from "next/link";
import type { ChordRun } from "@/components/ChordStrip";
import { HeroDemo } from "@/components/HeroDemo";
import { Library, type SongSummary } from "@/components/Library";
import { Shell } from "@/components/Shell";
import { compileSong } from "@/lib/music/compile";
import type { Song } from "@/lib/music/types";
import { REPO_URL } from "@/lib/site";
import { SONGS } from "@/songs";
import { twinkle } from "@/songs/twinkle";

function summarize(): SongSummary[] {
  return SONGS.map((song) => {
    const timeline = compileSong(song);
    const strip: ChordRun[] = [];
    for (const span of timeline.chords) {
      const last = strip[strip.length - 1];
      if (last && last[0] === span.name) last[1] += span.dur;
      else strip.push([span.name, span.dur]);
    }
    return {
      slug: song.slug,
      title: song.title,
      subtitle: song.subtitle,
      lang: song.lang,
      scene: song.scene,
      difficulty: song.difficulty,
      seconds: Math.round((timeline.totalBeats / song.bpm) * 60),
      chords: timeline.chordNames,
      strip,
    };
  });
}

// The demo on the front page is the first two lines of a real song.
const demo: Song = {
  ...twinkle,
  slug: "demo",
  sections: [{ name: "Try it", lines: twinkle.sections[1].lines.slice(0, 2) }],
};

export default function Home() {
  return (
    <Shell>
      <main className="flex-1">
        {/* A flat band of the C-chord yellow. The title runs in from both sides: English from the left, Arabic from the right. */}
        <section className="bg-sun text-blot">
          <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10">
            <h1 className="font-display text-[3.1rem] leading-[1.02] sm:text-7xl">Play ukulele for your baby.</h1>
            <p dir="rtl" lang="ar" className="mt-1 font-display text-[2.7rem] leading-[1.3] sm:text-[4.2rem]">
              أغاني يوكليلي لحبيب بابا
            </p>
            <p className="mt-4 max-w-[58ch] text-xl leading-relaxed">
              Kids&apos; songs in Arabic and English. Press play and the chords and the words light up in time, so you
              can strum and sing along. New to the ukulele?{" "}
              <Link href="/chords" className="font-extrabold underline decoration-2">
                Learn the chords
              </Link>{" "}
              and{" "}
              <Link href="/tuner" className="font-extrabold underline decoration-2">
                tune up
              </Link>{" "}
              first.
            </p>
          </div>
        </section>

        {/* The working demo sits across the edge of the band. */}
        <div className="mx-auto -mt-16 w-full max-w-6xl px-4 sm:px-6">
          <HeroDemo song={demo} />
        </div>

        <Library songs={summarize()} />
      </main>

      <footer data-scene="night" className="bg-paper text-ink">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-rule px-4 py-6 sm:px-6">
          <p>
            Made for Zain <bdi lang="ar">(لزين، من بابا)</bdi>
          </p>
          <p>
            BabaUke is free and open source.{" "}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-bold underline decoration-2">
              Add a song on GitHub
            </a>
          </p>
        </div>
      </footer>
    </Shell>
  );
}
