import type { Song } from "@/lib/music/types";

const verseA = "C:3 Am:3 F:3 G7:3";
const verseB = "F:3 G7:3 C:6";

const chorus = [
  { chords: verseA, lyric: "ننّه@G4:2+E4:1 ننّه،@A4:2+E4:1 يا@F4:1 زين@A4:1 يا@C5:1 غالي@B4:2+G4:1" },
  { chords: verseB, lyric: "ننّه@A4:2+F4:1 ننّه،@G4:2+D4:1 يا@E4:1 أحلى@G4:1+E4:1 ليالي@D4:.5+D4:.5+C4:2" },
];

export const namYaZain: Song = {
  slug: "nam-ya-zain",
  title: "نام يا زين",
  subtitle: "Sleep, Zain",
  lang: "ar",
  origin: "original",
  credit: "Words and music written for Zain by BabaUke.",
  mood: "Lullaby",
  about:
    "A slow waltz for the end of the day. Three soft strums per bar: count 1, 2, 3 and let the first one ring.",
  difficulty: 3,
  bpm: 84,
  beatsPerBar: 3,
  strum: "D-d-d-",
  melody: "music_box",
  scene: "night",
  sections: [
    { name: "مقدّمة", lines: [{ chords: verseA }] },
    {
      name: "المقطع الأول",
      lines: [
        { chords: verseA, lyric: "نام@G4:2 يا@E4:1 زين،@A4:3 يا@A4:1 نور@G4:1 عيني@F4:.5+E4:.5 نام@D4:3" },
        { chords: verseB, lyric: "بابا@C5:2+A4:1 جنبك،@B4:2+G4:1 والدنيا@E4:1+G4:1+C5:1 سلام@D5:1+C5:2" },
        { chords: verseA, lyric: "القمر@E4:1+E4:1+G4:1 سهران،@E4:1+A4:2 بيغنّيلك@A4:1+A4:1+G4:1+D4:3" },
        { chords: verseB, lyric: "والنجوم@F4:1+A4:1+C5:1 حواليك،@B4:1+A4:1+G4:1 بتضحكلك@E4:1+D4:2+C4:3" },
      ],
    },
    { name: "اللازمة", lines: chorus },
    {
      name: "المقطع التاني",
      lines: [
        { chords: verseA, lyric: "غمّض@G4:2+E4:1 عينيك،@A4:1+A4:2 واحلم@A4:1+G4:1 يا@F4:1 صغيّر@E4:1+D4:2" },
        { chords: verseB, lyric: "بكرة@C5:2+A4:1 الدنيا،@B4:1+B4:1+G4:1 تضحكلك@E4:1+G4:1+C5:1 كتير@D5:1+C5:2" },
        { chords: verseA, lyric: "واليوكليلي،@E4:1+E4:1+G4:1+A4:2+E4:1 بتغنّي@A4:1+A4:1+G4:1 معايا@F4:.5+E4:.5+D4:2" },
        { chords: verseB, lyric: "وانت@F4:1+A4:1 في@C5:1 حضني،@B4:2+G4:1 يا@G4:1 أغلى@E4:1+E4:1 هدايا@D4:.5+D4:.5+C4:2" },
      ],
    },
    { name: "اللازمة", lines: chorus },
    {
      name: "الختام",
      lines: [{ chords: "C:3 G7:3 C:6", lyric: "نام@G4:3 يا@F4:1 زين…@D4:2 نام@C4:6" }],
    },
  ],
};
