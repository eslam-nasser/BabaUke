import type { Song } from "@/lib/music/types";

const count = [
  { chords: "C:8", lyric: "واحد،@C4:1+C4:1 اتنين،@E4:1+E4:1 تلاتة@G4:1+G4:1+G4:1 ~1" },
  { chords: "G7:4 C:4", lyric: "زين@F4:1 بيعدّ@F4:1+D4:1 مع@D4:1 بابا@E4:1+C4:2 ~1" },
  { chords: "C:8", lyric: "أربعة،@C4:.5+C4:.5+C4:1 خمسة،@E4:1+E4:1 ستة@G4:1+G4:2 ~1" },
  { chords: "G7:4 C:4", lyric: "يلا@F4:1+F4:1 نغنّي@D4:1+D4:1 حتة@E4:.5+E4:.5 حتة@C4:1+C4:1 ~1" },
  { chords: "C:8", lyric: "سبعة،@C4:1+C4:1 تمانية،@E4:.5+E4:.5+E4:1 تسعة@G4:1+G4:2 ~1" },
  { chords: "G7:4 C:4", lyric: "والدنيا@F4:1+F4:.5+F4:.5 حلوة@D4:1+D4:1 وواسعة@E4:.5+E4:.5+C4:2 ~1" },
  { chords: "C:8", lyric: "وآخر@C4:.5+C4:.5+E4:1 واحد@G4:1+G4:1 عشرة!@C5:1+C5:1+C5:1 ~1" },
  { chords: "G7:4 C:4", lyric: "وزين@G4:.5+B4:1.5 نوّر@A4:1+G4:1 السهرة@E4:.5+D4:.5+C4:2 ~1" },
];

export const wahedEtneenTalata: Song = {
  slug: "wahed-etneen-talata",
  title: "واحد اتنين تلاتة",
  subtitle: "One, two, three",
  lang: "ar",
  origin: "original",
  credit: "Words and music written for Zain by BabaUke.",
  mood: "Counting song",
  about:
    "Count to ten on just two chords, with four easy down-strums per bar. The best place to start.",
  difficulty: 1,
  bpm: 112,
  beatsPerBar: 4,
  strum: "D-D-D-D-",
  melody: "marimba",
  scene: "day",
  sections: [
    { name: "مقدّمة", lines: [{ chords: "C:4 G7:4" }] },
    { name: "يلا نعدّ", lines: count },
    { name: "مرّة كمان", lines: count },
  ],
};
