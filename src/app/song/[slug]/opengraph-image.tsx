import { compileSong } from "@/lib/music/compile";
import { chordRuns, OG_SIZE, renderCard } from "@/lib/og";
import { getSong, SONGS } from "@/songs";

export const alt = "A BabaUke song: its chords, and the whole song drawn as a strip of chord colours.";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return SONGS.map((song) => ({ slug: song.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = getSong(slug) ?? SONGS[0];
  const timeline = compileSong(song);
  const count = timeline.chordNames.length;
  // The preview renderer cannot join Arabic letters, so Arabic songs use their English name here.
  const arabic = song.lang === "ar";
  return renderCard({
    title: arabic ? song.subtitle : song.title,
    subtitle: `${song.mood}${arabic ? " in Arabic" : ""} for ukulele, ${count} chords.`,
    scene: song.scene,
    chords: timeline.chordNames,
    strip: chordRuns(timeline.chords),
  });
}
