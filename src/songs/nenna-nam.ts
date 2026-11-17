import type { Song } from "@/lib/music/types";

const verse = [
  { chords: "Am:4 Am:4", lyric: "ننّه@E4:1+E4:1 نام،@A4:2 ننّه@C5:1+B4:1 نام@A4:2" },
  { chords: "Dm:4 E7:4", lyric: "وادبحلك@F4:1+F4:1+A4:1 جوزين@A4:1+G#4:1 حمام@B4:1+E4:2" },
  { chords: "Am:4 Dm:4", lyric: "روح@C5:1 يا@B4:1 حمام،@A4:1+C5:1 ما@D5:1 تصدّقش@D5:1+A4:2" },
  { chords: "E7:4 Am:4", lyric: "بضحك@B4:1+B4:1 على@G#4:.5+G#4:.5 زين،@E4:1 لمّا@C5:1+B4:1 ينام@A4:2" },
];

export const nennaNam: Song = {
  slug: "nenna-nam",
  title: "ننّه نام",
  subtitle: "Hush now, sleep",
  lang: "ar",
  origin: "traditional",
  credit: "Traditional Egyptian lullaby words. Tune arranged by BabaUke.",
  mood: "Lullaby",
  about:
    "The lullaby every Egyptian grandmother knows. Families sing it a little differently, so treat this tune as a starting point and sing it your way.",
  difficulty: 2,
  bpm: 76,
  beatsPerBar: 4,
  strum: "D-d-D-d-",
  melody: "music_box",
  scene: "night",
  sections: [
    { name: "مقدّمة", lines: [{ chords: "Am:4 E7:4" }] },
    { name: "الغنوة", lines: verse },
    { name: "مرّة كمان", lines: verse },
    { name: "الختام", lines: [{ chords: "Am:4 Am:4", lyric: "ننّه@C5:1+B4:1 نام…@A4:6" }] },
  ],
};
