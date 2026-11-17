import type { Song } from "@/lib/music/types";

const chorus = [
  { chords: "C:4 G7:4", lyric: "صحّي@G4:1+G4:1 النوم!@A4:1+G4:1 صحّي@F4:1+F4:1 النوم!@G4:1+D4:1" },
  { chords: "F:4 G7:2 C:2", lyric: "يلا@A4:1+A4:1 يا@C5:1 زين،@A4:1 ده@G4:.5 أحلى@B4:.5+D5:1 يوم@C5:2" },
];

export const sabahElKheir: Song = {
  slug: "sabah-el-kheir-ya-zain",
  title: "صباح الخير يا زين",
  subtitle: "Good morning, Zain",
  lang: "ar",
  origin: "original",
  credit: "Words and music written for Zain by BabaUke.",
  mood: "Wake-up song",
  about:
    "A bouncy morning song on three chords. Try the island strum: down, down-up, up-down-up.",
  difficulty: 2,
  bpm: 108,
  beatsPerBar: 4,
  strum: "D-DU-UDU",
  melody: "marimba",
  scene: "day",
  sections: [
    { name: "مقدّمة", lines: [{ chords: "C:4 C:4" }] },
    {
      name: "المقطع الأول",
      lines: [
        {
          chords: "C:4 C:4 F:4 G7:4",
          lyric: "صباح@E4:1+G4:1 الخير@G4:1+A4:1 يا@G4:1 زين،@E4:2 ~1 صباح@A4:1+C5:2 النور@C5:1+B4:3 ~1",
        },
        {
          chords: "C:4 C:4 G7:4 C:4",
          lyric: "الشمس@E4:1+G4:1 صحيت@G4:1+A4:1 يا@G4:1 زين،@E4:2 ~1 والعصفور@D4:1+F4:1+G4:1 مسرور@F4:1+E4:3 ~1",
        },
        {
          chords: "F:4 C:4 G7:4 C:4",
          lyric: "قوم@A4:1 يا@A4:1 حبيبي،@C5:1+C5:1+G4:2 ~2 نلعب@G4:1+B4:1 ونغنّي@D5:1+D5:1+C5:2 ~2",
        },
        {
          chords: "F:4 C:4 G7:4 C:4",
          lyric: "ضحكتك@A4:1+A4:1+A4:1 الحلوة،@C5:1+C5:1+G4:1 ~2 بتفرّحني@G4:1+B4:1+D5:2+C5:2 ~2",
        },
      ],
    },
    { name: "اللازمة", lines: [...chorus, ...chorus] },
    {
      name: "المقطع التاني",
      lines: [
        {
          chords: "C:4 C:4 F:4 G7:4",
          lyric: "صباح@E4:1+G4:1 الخير@G4:1+A4:1 يا@G4:1 ماما،@E4:1+E4:1 ~1 صباح@A4:1+C5:2 الفل@C5:1+B4:3 ~1",
        },
        {
          chords: "C:4 C:4 G7:4 C:4",
          lyric: "صباح@E4:1+G4:1 الخير@G4:1+A4:1 يا@G4:1 بابا،@E4:1+E4:1 ~1 يا@D4:1 أحلى@F4:1+G4:1 الكل@F4:1+E4:3 ~1",
        },
        {
          chords: "F:4 C:4 G7:4 C:4",
          lyric: "هنفطر@A4:1+A4:1+C5:1 سوا،@C5:1+G4:2 ~2 ونشرب@G4:1+B4:1+D5:1 لبن@D5:1+C5:2 ~2",
        },
        {
          chords: "F:4 C:4 G7:4 C:4",
          lyric: "ونلعب@A4:1+A4:1+A4:1 كورة،@C5:2+G4:1 ~2 ونغنّي@G4:1+B4:1+D5:1 كمان@D5:1+C5:2 ~2",
        },
      ],
    },
    { name: "اللازمة", lines: [...chorus, ...chorus] },
  ],
};
