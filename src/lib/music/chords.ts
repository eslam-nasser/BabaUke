/**
 * Ukulele chord shapes in standard G-C-E-A tuning.
 * `frets` and `fingers` are listed string 4 → string 1 (G, C, E, A),
 * i.e. left to right as you look at a chord diagram.
 */
export type ChordShape = {
  name: string;
  frets: [number, number, number, number];
  /** Suggested finger per string: 1 index · 2 middle · 3 ring · 4 pinky · 0 open. */
  fingers?: [number, number, number, number];
  tip?: string;
};

const shapes: ChordShape[] = [
  { name: "C", frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3], tip: "One finger. The friendliest chord there is." },
  { name: "Am", frets: [2, 0, 0, 0], fingers: [2, 0, 0, 0], tip: "One finger on the top string." },
  { name: "F", frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0], tip: "Am plus your index finger." },
  { name: "G", frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2], tip: "A little triangle. Take your time with this one." },
  { name: "G7", frets: [0, 2, 1, 2], fingers: [0, 2, 1, 3], tip: "An upside-down triangle." },
  { name: "Dm", frets: [2, 2, 1, 0], fingers: [2, 3, 1, 0], tip: "F plus your ring finger." },
  { name: "E7", frets: [1, 2, 0, 2], fingers: [1, 2, 0, 3], tip: "Leave the E string open." },
  { name: "Em", frets: [0, 4, 3, 2], fingers: [0, 3, 2, 1], tip: "A staircase going down." },
  { name: "A", frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0] },
  { name: "A7", frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0], tip: "One finger again." },
  { name: "D", frets: [2, 2, 2, 0], fingers: [1, 2, 3, 0] },
  { name: "D7", frets: [2, 2, 2, 3], fingers: [1, 1, 1, 2] },
  { name: "C7", frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1] },
  { name: "Am7", frets: [0, 0, 0, 0], fingers: [0, 0, 0, 0], tip: "No fingers at all." },
  { name: "Cmaj7", frets: [0, 0, 0, 2], fingers: [0, 0, 0, 2] },
  { name: "Em7", frets: [0, 2, 0, 2], fingers: [0, 1, 0, 2] },
  { name: "Dm7", frets: [2, 2, 1, 3], fingers: [2, 3, 1, 4] },
  { name: "Gm", frets: [0, 2, 3, 1], fingers: [0, 2, 3, 1] },
  { name: "Bb", frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1] },
  { name: "Bm", frets: [4, 2, 2, 2], fingers: [3, 1, 1, 1] },
  { name: "B7", frets: [2, 3, 2, 2], fingers: [1, 2, 1, 1] },
  { name: "E", frets: [4, 4, 4, 2], fingers: [2, 3, 4, 1] },
  { name: "Fm", frets: [1, 0, 1, 3], fingers: [1, 0, 2, 4] },
  { name: "Cm", frets: [0, 3, 3, 3], fingers: [0, 1, 1, 1] },
];

export const CHORDS: Record<string, ChordShape> = Object.fromEntries(
  shapes.map((s) => [s.name, s]),
);

export function getChord(name: string): ChordShape {
  const chord = CHORDS[name];
  if (!chord) throw new Error(`Unknown ukulele chord "${name}"`);
  return chord;
}

/** MIDI numbers of the open strings G4 C4 E4 A4 (string 4 → string 1). */
export const OPEN_STRINGS = [67, 60, 64, 69] as const;

export function chordMidi(name: string): number[] {
  return getChord(name).frets.map((fret, i) => OPEN_STRINGS[i] + fret);
}

/** Every chord gets a colour from its root note, so kids can follow by colour. */
const ROOT_COLORS: Record<string, string> = {
  C: "#FFC21A",
  D: "#FF8A2B",
  E: "#FF5C7C",
  F: "#1ED3A0",
  G: "#4DAEFF",
  A: "#A68BFF",
  B: "#A8DA2A",
};

export function chordColor(name: string): string {
  return ROOT_COLORS[name[0]] ?? "#FFC21A";
}

const NOTE_OFFSETS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "C4" → 60, "F#4" → 66, "Bb3" → 58 */
export function noteToMidi(note: string): number {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(note);
  if (!m) throw new Error(`Bad note name "${note}"`);
  const accidental = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
  return 12 * (Number(m[3]) + 1) + NOTE_OFFSETS[m[1]] + accidental;
}
