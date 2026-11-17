import { compileSong } from "@/lib/music/compile";
import { chordRuns, OG_SIZE, renderCard } from "@/lib/og";
import { SONGS } from "@/songs";

export const alt = "BabaUke: play ukulele for your baby. Kids' songs in Arabic and English with chords that light up in time.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  // The strip along the bottom is a real song from the songbook.
  const song = SONGS.find((s) => s.slug === "baba-wel-ukulele") ?? SONGS[0];
  return renderCard({
    title: "Play ukulele for your baby.",
    subtitle: "Kids' songs in Arabic and English. The chords and the words light up in time.",
    scene: "day",
    chords: ["C", "Am", "F", "G7"],
    strip: chordRuns(compileSong(song).chords),
  });
}
