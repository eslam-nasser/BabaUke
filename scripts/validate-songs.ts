/**
 * Checks every song: beats add up, chords exist, notes parse, sections end on a bar line.
 * Run with `pnpm validate`.
 */
import { compileSong } from "../src/lib/music/compile";
import { SONGS } from "../src/songs";

let failed = false;
const slugs = new Set<string>();

for (const song of SONGS) {
  try {
    if (slugs.has(song.slug)) throw new Error(`duplicate slug "${song.slug}"`);
    slugs.add(song.slug);
    const t = compileSong(song);
    const bars = t.totalBeats / song.beatsPerBar;
    const seconds = Math.round((t.totalBeats / song.bpm) * 60);
    console.log(
      `✓ ${song.slug.padEnd(26)} ${String(bars).padStart(3)} bars · ${String(seconds).padStart(3)}s · ${t.chordNames.join(" ")}`,
    );
  } catch (err) {
    failed = true;
    console.error(`✗ ${song.slug}: ${(err as Error).message}`);
  }
}

if (failed) process.exit(1);
console.log(`\n${SONGS.length} songs OK`);
