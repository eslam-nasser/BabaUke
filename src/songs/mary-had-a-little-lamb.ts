import type { Song } from "@/lib/music/types";

export const maryHadALittleLamb: Song = {
  slug: "mary-had-a-little-lamb",
  title: "Mary Had a Little Lamb",
  subtitle: "Two chords, one happy lamb",
  lang: "en",
  origin: "traditional",
  credit: "Traditional. Words by Sarah Josepha Hale, 1830.",
  mood: "Nursery rhyme",
  about:
    "Only C and G7, with plenty of time between changes. A perfect first song in English.",
  difficulty: 1,
  bpm: 104,
  beatsPerBar: 4,
  strum: "D-D-D-D-",
  melody: "marimba",
  scene: "day",
  sections: [
    { name: "Intro", lines: [{ chords: "C:4 G7:4" }] },
    {
      name: "Verse 1",
      lines: [
        { chords: "C:8", lyric: "Ma-@E4:1 ry@D4:1 had@C4:1 a@D4:1 lit-@E4:1 tle@E4:1 lamb,@E4:2" },
        { chords: "G7:4 C:4", lyric: "lit-@D4:1 tle@D4:1 lamb,@D4:2 lit-@E4:1 tle@G4:1 lamb.@G4:2" },
        { chords: "C:8", lyric: "Ma-@E4:1 ry@D4:1 had@C4:1 a@D4:1 lit-@E4:1 tle@E4:1 lamb,@E4:1 its@E4:1" },
        { chords: "G7:4 C:4", lyric: "fleece@D4:1 was@D4:1 white@E4:1 as@D4:1 snow.@C4:4" },
      ],
    },
    {
      name: "Verse 2",
      lines: [
        { chords: "C:8", lyric: "Ev-@E4:1 ery-@D4:1 where@C4:1 that@D4:1 Ma-@E4:1 ry@E4:1 went,@E4:2" },
        { chords: "G7:4 C:4", lyric: "Ma-@D4:1 ry@D4:1 went,@D4:2 Ma-@E4:1 ry@G4:1 went.@G4:2" },
        { chords: "C:8", lyric: "Ev-@E4:1 ery-@D4:1 where@C4:1 that@D4:1 Ma-@E4:1 ry@E4:1 went,@E4:1 the@E4:1" },
        { chords: "G7:4 C:4", lyric: "lamb@D4:1 was@D4:1 sure@E4:1 to@D4:1 go.@C4:4" },
      ],
    },
  ],
};
