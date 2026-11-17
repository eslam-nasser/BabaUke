import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Player } from "@/components/player/Player";
import { Shell } from "@/components/Shell";
import { getSong, SONGS } from "@/songs";

type Props = PageProps<"/song/[slug]">;

export function generateStaticParams() {
  return SONGS.map((song) => ({ slug: song.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const song = getSong(slug);
  if (!song) return { title: "Song not found" };
  const title = song.lang === "ar" ? `${song.title} (${song.subtitle})` : song.title;
  const description = `Play “${title}” on ukulele with BabaUke. ${song.about}`;
  return {
    title,
    description,
    openGraph: { title: `${title} on ukulele`, description, url: `/song/${song.slug}`, type: "music.song" },
    twitter: { card: "summary_large_image", title: `${title} on ukulele`, description },
  };
}

// The song is looked up before any of the page is sent, so an unknown
// address gets a real "404 Not Found" instead of a normal page.
export const instant = false;

export default async function SongPage({ params }: Props) {
  const { slug } = await params;
  const song = getSong(slug);
  if (!song) notFound();
  return (
    <Shell scene={song.scene} fill>
      <Player key={song.slug} song={song} />
    </Shell>
  );
}
