import type { Song } from "@/lib/music/types";

const chorus = [
  { chords: "C:4 Am:4 F:4 G:4", lyric: "دو@C5:2 ~2 لا@A4:2 ~2 فا@F4:2 ~2 صول@G4:3 ~1" },
  {
    chords: "C:4 Am:4 F:2 G:2 C:4",
    lyric: "غنّي@G4:1+E4:1 يا@G4:2 زين،@A4:3 ~1 غنّي@A4:1+A4:1 على@B4:1+B4:1 طول@C5:3 ~1",
  },
];

export const babaWelUkulele: Song = {
  slug: "baba-wel-ukulele",
  title: "بابا واليوكليلي",
  subtitle: "Baba and the ukulele",
  lang: "ar",
  origin: "original",
  credit: "Words and music written for Zain by BabaUke.",
  mood: "Sing-along",
  about:
    "The chorus sings the names of the four chords you are playing (دو، لا، فا، صول), so you always know where you are.",
  difficulty: 3,
  bpm: 100,
  beatsPerBar: 4,
  strum: "D-DU-UDU",
  melody: "marimba",
  scene: "day",
  sections: [
    { name: "مقدّمة", lines: [{ chords: "C:4 Am:4 F:4 G:4" }] },
    {
      name: "المقطع الأول",
      lines: [
        {
          chords: "C:4 Am:4 F:4 G:4",
          lyric: "بابا@E4:1+E4:1 جاب@G4:2 يوكليلي،@A4:1+A4:1+G4:1+E4:1 صغيّر@F4:1+A4:1+C5:1 وخفيف@A4:1+B4:3 ~1",
        },
        {
          chords: "C:4 Am:4 F:4 G:4",
          lyric: "أربع@E4:1+E4:1 أوتار@G4:1+G4:1 بس،@A4:2 ~2 وصوته@F4:1+A4:1+C5:1 لطيف@C5:1+D5:3 ~1",
        },
      ],
    },
    { name: "اللازمة", lines: [...chorus, ...chorus] },
    {
      name: "المقطع التاني",
      lines: [
        {
          chords: "C:4 Am:4 F:4 G:4",
          lyric: "زين@E4:2 بيسقّف،@G4:1+G4:1+A4:2 ~2 ويهزّ@F4:1+A4:2 راسه@C5:1+B4:3 ~1",
        },
        {
          chords: "C:4 Am:4 F:4 G:4",
          lyric: "وبابا@E4:1+E4:1+G4:1 بيعزف،@G4:1+A4:2 ~2 بكل@F4:1+A4:1 إحساسه@C5:1+C5:1+D5:3 ~1",
        },
      ],
    },
    { name: "اللازمة", lines: [...chorus, ...chorus] },
  ],
};
