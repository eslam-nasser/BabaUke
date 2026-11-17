import type { Song } from "@/lib/music/types";

// Chords only, on purpose. The words and tune of this song are still under
// copyright, so they are not in this repository. The chord changes are the
// standard ones in the key of C; you bring the singing.
const form = [
  { chords: "C:4 C:4 C:4 C7:4" },
  { chords: "F:4 F:4 C:4 C:4" },
  { chords: "F:4 F:4 C:4 C:4" },
  { chords: "C:4 G7:4 C:4 C:4" },
];

export const youAreMySunshine: Song = {
  slug: "you-are-my-sunshine",
  title: "You Are My Sunshine",
  subtitle: "Chords only, you sing",
  lang: "en",
  origin: "traditional",
  credit: "Chord chart only. Words and music by Jimmie Davis and Charles Mitchell (1939) are not reproduced here.",
  mood: "Sing it yourself",
  about:
    "This one is still under copyright, so BabaUke strums and shows the chord changes while you sing the words you already know. Come in with “You are my” on beats 2, 3 and 4 of the second intro bar.",
  difficulty: 2,
  bpm: 126,
  beatsPerBar: 4,
  strum: "D-DU-UDU",
  melody: "music_box",
  scene: "day",
  sections: [
    { name: "Intro", lines: [{ chords: "C:4 C:4" }] },
    { name: "Chorus", lines: form },
    { name: "Verse", lines: form },
    { name: "Chorus", lines: form },
  ],
};
