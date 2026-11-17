import type { Song } from "@/lib/music/types";

const up = "C:4 Am:4";
const ask = "F:4 G7:4";
const home = "F:2 G7:2 C:4";

const chorus = [
  { chords: "F:4 C:4", lyric: "Sleep@A4:1.5 now,@F4:.5 sleep@A4:1.5 now,@F4:.5 lit-@G4:1 tle@E4:1 one,@C4:2" },
  { chords: home, lyric: "wake@A4:1 up@A4:1 with@B4:1 the@B4:1 mor-@C5:1 ning@G4:1 sun.@C5:2" },
];

export const goodnightLittleZain: Song = {
  slug: "goodnight-little-zain",
  title: "Goodnight, Little Zain",
  subtitle: "A fingerpicked lullaby",
  lang: "en",
  origin: "original",
  credit: "Words and music written for Zain by BabaUke.",
  mood: "Lullaby",
  about:
    "No strumming here. Pluck one string per beat, from the string nearest your chin to the one nearest the floor: G, C, E, A. Quiet enough for a sleeping baby.",
  difficulty: 3,
  bpm: 80,
  beatsPerBar: 4,
  strum: "4-3-2-1-",
  melody: "music_box",
  scene: "night",
  sections: [
    { name: "Intro", lines: [{ chords: up }] },
    {
      name: "Verse 1",
      lines: [
        { chords: up, lyric: "Moon@E4:1 is@G4:1 up@C5:1 and@B4:1 stars@A4:1 are@G4:1 bright,@E4:2" },
        { chords: ask, lyric: "Ba-@F4:1 ba's@A4:1 here@C5:1 to@A4:1 say@G4:1 good-@B4:1 night.@D5:2" },
        { chords: up, lyric: "Close@E5:1 your@D5:1 eyes,@C5:1 my@G4:1 lit-@A4:1 tle@B4:1 Zain,@C5:2" },
        { chords: home, lyric: "dream@A4:1 of@A4:1 sun-@G4:1 shine@F4:1 af-@E4:1 ter@D4:1 rain.@C4:2" },
      ],
    },
    { name: "Chorus", lines: chorus },
    {
      name: "Verse 2",
      lines: [
        { chords: up, lyric: "Four@E4:1 small@G4:1 strings,@C5:1 a@B4:1 ti-@A4:1 ny@G4:1 tune,@E4:2" },
        { chords: ask, lyric: "sail-@F4:1 ing@A4:1 soft-@C5:1 ly@A4:1 past@G4:1 the@B4:1 moon.@D5:2" },
        { chords: up, lyric: "Eve-@E5:1 ry@D5:1 note@C5:1 I@G4:1 play@A4:1 for@B4:1 you@C5:2" },
        { chords: home, lyric: "says@A4:1 I@A4:1 love@G4:1 you,@F4:1 yes@E4:1 I@D4:1 do.@C4:2" },
      ],
    },
    { name: "Chorus", lines: chorus },
  ],
};
