import { chordColor } from "@/lib/music/chords";

/** One stretch of the song on a single chord: [chord name, length in beats]. */
export type ChordRun = [name: string, beats: number];

/**
 * The whole song drawn as a strip of chord colours, to scale.
 * At a glance it shows how many chords a song has and how often they change.
 */
export function ChordStrip({ runs, className = "" }: { runs: ChordRun[]; className?: string }) {
  return (
    <div dir="ltr" aria-hidden className={`flex overflow-hidden ${className}`}>
      {runs.map(([name, beats], i) => (
        <span key={i} style={{ flexGrow: beats, flexBasis: 0, background: chordColor(name) }} />
      ))}
    </div>
  );
}

export function ChordChip({ name, active = false, className = "" }: { name: string; active?: boolean; className?: string }) {
  return (
    <span
      dir="ltr"
      className={`inline-block rounded-[5px] px-1.5 font-sans font-black leading-[1.35] text-blot ${
        active ? "outline outline-[3px] outline-offset-1 outline-ink" : ""
      } ${className}`}
      style={{ background: chordColor(name) }}
    >
      {name}
    </span>
  );
}
