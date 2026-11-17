import type { Metadata } from "next";
import { ChordCard } from "@/components/ChordCard";
import { ChordDiagram } from "@/components/ChordDiagram";
import { Shell } from "@/components/Shell";
import { CHORDS, chordColor } from "@/lib/music/chords";
import { compileSong } from "@/lib/music/compile";
import { SONGS } from "@/songs";

export const metadata: Metadata = {
  title: "Ukulele chords",
  description: "Every ukulele chord used in BabaUke, with fingering. Tap a chord to hear it.",
  openGraph: { title: "Ukulele chords", url: "/chords" },
};

/** The four marks in a chord box, drawn the same way as in the boxes themselves. */
const KEY = [
  {
    text: "A ring above a string means you play that string open, with no finger on it.",
    glyph: <circle cx="16" cy="16" r="7" strokeWidth="2.6" />,
  },
  {
    text: "A dot means press there. The number is the finger: 1 index, 2 middle, 3 ring, 4 pinky.",
    glyph: (
      <>
        <circle cx="16" cy="16" r="12" fill={chordColor("G")} stroke="#062a31" strokeWidth="2" />
        <text x="16" y="22" textAnchor="middle" fontSize="18" fontWeight="900" fill="#062a31" stroke="none" fontFamily="var(--font-zain), sans-serif">
          2
        </text>
      </>
    ),
  },
  {
    text: "The thick bar is the top of the neck. The thin lines below it are the frets.",
    glyph: (
      <>
        <path d="M3 9h26" strokeWidth="6" strokeLinecap="round" />
        <path d="M4 19h24M4 27h24" strokeWidth="1.5" opacity="0.5" />
      </>
    ),
  },
  {
    text: "The four upright lines are the strings G, C, E and A, the way you see them when the ukulele faces you.",
    glyph: <path d="M5 4v24M12.3 4v24M19.7 4v24M27 4v24" strokeWidth="2.2" />,
  },
];

export default function ChordsPage() {
  const uses = new Map<string, number>();
  for (const song of SONGS) {
    for (const name of compileSong(song).chordNames) uses.set(name, (uses.get(name) ?? 0) + 1);
  }
  const inSongs = [...uses.keys()].sort((a, b) => uses.get(b)! - uses.get(a)!);
  const others = Object.keys(CHORDS).filter((name) => !uses.has(name));

  return (
    <Shell>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        <header className="grid gap-x-12 gap-y-6 py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            <h1 className="font-display text-5xl sm:text-6xl">Chords</h1>
            <p className="mt-3 max-w-[32ch] text-xl leading-relaxed text-soft">
              Every chord in the songbook. Tap one to hear how it should sound.
            </p>
          </div>

          {/* How to read a chord box, using a real one. */}
          <section aria-labelledby="reading" className="flex gap-5 rounded-lg bg-wash p-4 sm:p-5">
            <ChordDiagram name="G7" className="hidden h-52 w-auto shrink-0 sm:block" />
            <div>
              <h2 id="reading" className="text-xl font-extrabold">
                How to read a chord box
              </h2>
              <ul className="mt-2 space-y-2">
                {KEY.map((item) => (
                  <li key={item.text} className="flex items-start gap-3 text-lg leading-snug">
                    <svg viewBox="0 0 32 32" className="mt-0.5 h-8 w-8 shrink-0" fill="none" stroke="currentColor" aria-hidden>
                      {item.glyph}
                    </svg>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </header>

        <h2 className="font-display text-3xl">In the songs</h2>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {inSongs.map((name) => (
            <ChordCard key={name} name={name} songs={uses.get(name)} />
          ))}
        </div>

        <h2 className="mt-14 font-display text-3xl">For later</h2>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {others.map((name) => (
            <ChordCard key={name} name={name} />
          ))}
        </div>
      </main>
    </Shell>
  );
}
