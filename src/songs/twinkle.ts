import type { Song } from "@/lib/music/types";

const a = "C:4 F:2 C:2";
const b = "F:2 C:2 G7:2 C:2";
const c = "C:2 F:2 C:2 G7:2";

export const twinkle: Song = {
  slug: "twinkle-twinkle",
  title: "Twinkle, Twinkle, Little Star",
  subtitle: "With a verse just for Zain",
  lang: "en",
  origin: "traditional",
  credit: "Traditional. Words by Jane Taylor, 1806. Second verse by BabaUke.",
  mood: "Lullaby",
  about:
    "The tune everyone knows, so your ear will tell you when a chord is right. The changes come quickly, so slow it down first.",
  difficulty: 2,
  bpm: 92,
  beatsPerBar: 4,
  strum: "D-D-D-D-",
  melody: "music_box",
  scene: "night",
  sections: [
    { name: "Intro", lines: [{ chords: "C:4 G7:4" }] },
    {
      name: "Verse 1",
      lines: [
        { chords: a, lyric: "Twin-@C4:1 kle,@C4:1 twin-@G4:1 kle,@G4:1 lit-@A4:1 tle@A4:1 star,@G4:2" },
        { chords: b, lyric: "how@F4:1 I@F4:1 won-@E4:1 der@E4:1 what@D4:1 you@D4:1 are.@C4:2" },
        { chords: c, lyric: "Up@G4:1 a-@G4:1 bove@F4:1 the@F4:1 world@E4:1 so@E4:1 high,@D4:2" },
        { chords: c, lyric: "like@G4:1 a@G4:1 dia-@F4:1 mond@F4:1 in@E4:1 the@E4:1 sky.@D4:2" },
        { chords: a, lyric: "Twin-@C4:1 kle,@C4:1 twin-@G4:1 kle,@G4:1 lit-@A4:1 tle@A4:1 star,@G4:2" },
        { chords: b, lyric: "how@F4:1 I@F4:1 won-@E4:1 der@E4:1 what@D4:1 you@D4:1 are.@C4:2" },
      ],
    },
    {
      name: "Zain's verse",
      lines: [
        { chords: a, lyric: "Lit-@C4:1 tle@C4:1 Zain,@G4:1 it's@G4:1 time@A4:1 for@A4:1 bed,@G4:2" },
        { chords: b, lyric: "rest@F4:1 your@F4:1 slee-@E4:1 py@E4:1 lit-@D4:1 tle@D4:1 head.@C4:2" },
        { chords: c, lyric: "Ba-@G4:1 ba's@G4:1 uke@F4:1 will@F4:1 soft-@E4:1 ly@E4:1 play,@D4:2" },
        { chords: c, lyric: "dreams@G4:1 will@G4:1 car-@F4:1 ry@F4:1 you@E4:1 a-@E4:1 way.@D4:2" },
        { chords: a, lyric: "Twin-@C4:1 kle,@C4:1 twin-@G4:1 kle,@G4:1 lit-@A4:1 tle@A4:1 star,@G4:2" },
        { chords: b, lyric: "Ba-@F4:1 ba@F4:1 loves@E4:1 you@E4:1 as@D4:1 you@D4:1 are.@C4:2" },
      ],
    },
  ],
};
