export type Lang = "ar" | "en";

/** General MIDI voices we use to carry the tune. */
export type MelodyVoice = "music_box" | "marimba" | "kalimba" | "glockenspiel";

/**
 * One line of a song.
 *
 * `chords` — space separated `Name:beats`, e.g. `"C:4 Am:4"`.
 *
 * `lyric`  — space separated tokens:
 *   - `word@C4:1`          a word sung on one note lasting 1 beat
 *   - `word@C4:.5+D4:.5`   a word spread over several notes
 *   - `Twin-@C4:1 kle@C4:1` a trailing `-` glues the syllable to the next one
 *   - `two_words@C4:1`     `_` is shown as a space
 *   - `~2`                 a rest lasting 2 beats
 *
 * The beats in `lyric` must add up to the beats in `chords`.
 * Leave `lyric` out for an instrumental line.
 */
export type SongLine = {
  chords: string;
  lyric?: string;
};

export type SongSection = {
  name: string;
  lines: SongLine[];
};

export type Song = {
  slug: string;
  /** Title in the song's own language. */
  title: string;
  /** Translation or short tagline shown under the title. */
  subtitle: string;
  lang: Lang;
  origin: "original" | "traditional";
  credit: string;
  mood: string;
  about: string;
  difficulty: 1 | 2 | 3;
  bpm: number;
  beatsPerBar: 3 | 4;
  /**
   * One bar of strumming on an eighth-note grid (so 8 slots in 4/4, 6 in 3/4).
   * `D` down · `d` soft down · `U` up · `u` soft up · `1`-`4` pluck that string · `-` rest
   */
  strum: string;
  melody: MelodyVoice;
  /** When it is played: day songs get bright paper, night songs get dark paper for a dim room. */
  scene: "day" | "night";
  sections: SongSection[];
};

// ───────────────────────── compiled timeline ─────────────────────────

export type Token = {
  id: number;
  line: number;
  text: string;
  /** Glue to the next token with no space (syllables of one word). */
  joinNext: boolean;
  rest: boolean;
  start: number;
  dur: number;
  /**
   * Highlighter colours for this token: the chord playing when it starts, then any chord
   * that takes over while it is still being sung (`from` is how far through, 0 to 1).
   */
  pens: { name: string; from: number }[];
  /** Chords that begin while this token is sounding (`index` points into `Timeline.chords`). */
  chords: { name: string; index: number }[];
};

export type Note = { start: number; dur: number; midi: number };

export type ChordSpan = {
  index: number;
  name: string;
  start: number;
  dur: number;
  line: number;
};

export type StrumKind = "D" | "d" | "U" | "u" | "1" | "2" | "3" | "4";

export type Strum = {
  beat: number;
  kind: StrumKind;
  chord: string;
};

export type Line = {
  index: number;
  section: number;
  start: number;
  dur: number;
  instrumental: boolean;
  tokens: Token[];
};

export type Section = {
  index: number;
  name: string;
  start: number;
  end: number;
  firstLine: number;
  lastLine: number;
};

export type Timeline = {
  song: Song;
  lines: Line[];
  sections: Section[];
  notes: Note[];
  chords: ChordSpan[];
  strums: Strum[];
  /** Unique chord names in order of first appearance. */
  chordNames: string[];
  totalBeats: number;
};
