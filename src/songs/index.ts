import type { Song } from "@/lib/music/types";
import { babaWelUkulele } from "./baba-wel-ukulele";
import { goodnightLittleZain } from "./goodnight-little-zain";
import { maryHadALittleLamb } from "./mary-had-a-little-lamb";
import { namYaZain } from "./nam-ya-zain";
import { nennaNam } from "./nenna-nam";
import { sabahElKheir } from "./sabah-el-kheir";
import { twinkle } from "./twinkle";
import { wahedEtneenTalata } from "./wahed-etneen-talata";
import { youAreMySunshine } from "./you-are-my-sunshine";

/** Shown in this order in the library. To add a song, write a file next to these and list it here. */
export const SONGS: Song[] = [
  namYaZain,
  wahedEtneenTalata,
  sabahElKheir,
  babaWelUkulele,
  nennaNam,
  twinkle,
  maryHadALittleLamb,
  youAreMySunshine,
  goodnightLittleZain,
];

export function getSong(slug: string): Song | undefined {
  return SONGS.find((s) => s.slug === slug);
}
