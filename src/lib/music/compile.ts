import { getChord, noteToMidi } from "./chords";
import type {
  ChordSpan,
  Line,
  Note,
  Section,
  Song,
  Strum,
  StrumKind,
  Timeline,
  Token,
} from "./types";

const EPS = 1e-6;
const STRUM_KINDS = new Set(["D", "d", "U", "u", "1", "2", "3", "4"]);

function parseBeats(raw: string, where: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${where}: bad duration "${raw}"`);
  return n;
}

/** Turn a hand-written song into a beat-accurate timeline. Throws on any mistake. */
export function compileSong(song: Song): Timeline {
  const slots = song.beatsPerBar * 2;
  if (song.strum.length !== slots) {
    throw new Error(
      `${song.slug}: strum pattern "${song.strum}" needs ${slots} slots for ${song.beatsPerBar}/4`,
    );
  }
  for (const ch of song.strum) {
    if (ch !== "-" && !STRUM_KINDS.has(ch)) {
      throw new Error(`${song.slug}: unknown strum symbol "${ch}"`);
    }
  }

  const lines: Line[] = [];
  const sections: Section[] = [];
  const notes: Note[] = [];
  const chords: ChordSpan[] = [];
  const chordNames: string[] = [];
  let beat = 0;
  let tokenId = 0;

  song.sections.forEach((section, sectionIndex) => {
    const sectionStart = beat;
    const firstLine = lines.length;

    section.lines.forEach((raw, i) => {
      const where = `${song.slug} › ${section.name} › line ${i + 1}`;
      const lineIndex = lines.length;
      const lineStart = beat;

      // chords
      const lineChords: ChordSpan[] = [];
      let c = lineStart;
      for (const part of raw.chords.trim().split(/\s+/)) {
        const [name, len] = part.split(":");
        getChord(name);
        const dur = parseBeats(len, where);
        const span = { index: chords.length, name, start: c, dur, line: lineIndex };
        chords.push(span);
        lineChords.push(span);
        if (!chordNames.includes(name)) chordNames.push(name);
        c += dur;
      }
      const lineDur = c - lineStart;

      // lyric + melody
      const tokens: Token[] = [];
      const push = (t: Omit<Token, "id" | "line" | "chords" | "pens">) =>
        tokens.push({ ...t, id: tokenId++, line: lineIndex, chords: [], pens: [] });

      if (raw.lyric) {
        let t = lineStart;
        for (const part of raw.lyric.trim().split(/\s+/)) {
          if (part.startsWith("~")) {
            const dur = parseBeats(part.slice(1), where);
            push({ text: "", joinNext: false, rest: true, start: t, dur });
            t += dur;
            continue;
          }
          const at = part.lastIndexOf("@");
          if (at < 1) throw new Error(`${where}: token "${part}" needs word@note:beats`);
          let text = part.slice(0, at).replace(/_/g, " ");
          const joinNext = text.endsWith("-");
          if (joinNext) text = text.slice(0, -1);
          const start = t;
          for (const n of part.slice(at + 1).split("+")) {
            const [pitch, len] = n.split(":");
            const dur = parseBeats(len, where);
            notes.push({ start: t, dur, midi: noteToMidi(pitch) });
            t += dur;
          }
          push({ text, joinNext, rest: false, start, dur: t - start });
        }
        if (Math.abs(t - lineStart - lineDur) > EPS) {
          throw new Error(
            `${where}: lyric lasts ${t - lineStart} beats but chords last ${lineDur}`,
          );
        }
      } else {
        // Instrumental line: one cell per chord, with a dot for every beat.
        // The dots fill in as the chord is played, so you can count along.
        for (const span of lineChords) {
          const beats = Math.max(1, Math.round(span.dur));
          const text = Array.from({ length: beats }, () => "•").join(" ");
          push({ text, joinNext: false, rest: false, start: span.start, dur: span.dur });
        }
      }

      for (const token of tokens) {
        const playing = lineChords.findLast((span) => span.start <= token.start + EPS) ?? lineChords[0];
        token.pens = [{ name: playing.name, from: 0 }];
        for (const span of lineChords) {
          const inside = span.start > token.start + EPS && span.start < token.start + token.dur - EPS;
          if (inside && span.name !== token.pens[token.pens.length - 1].name) {
            token.pens.push({ name: span.name, from: (span.start - token.start) / token.dur });
          }
        }
      }

      // hang each chord on the token that is sounding when it starts
      for (const span of lineChords) {
        const host =
          tokens.find((t) => span.start >= t.start - EPS && span.start < t.start + t.dur - EPS) ??
          tokens[tokens.length - 1];
        host.chords.push({ name: span.name, index: span.index });
      }

      lines.push({
        index: lineIndex,
        section: sectionIndex,
        start: lineStart,
        dur: lineDur,
        instrumental: !raw.lyric,
        tokens,
      });
      beat = lineStart + lineDur;
    });

    if (Math.abs((beat - sectionStart) % song.beatsPerBar) > EPS) {
      throw new Error(`${song.slug} › ${section.name}: does not end on a bar line`);
    }
    sections.push({
      index: sectionIndex,
      name: section.name,
      start: sectionStart,
      end: beat,
      firstLine,
      lastLine: lines.length - 1,
    });
  });

  // strumming: walk the eighth-note grid and ask the pattern what to play
  const strums: Strum[] = [];
  for (const span of chords) {
    const first = Math.ceil(span.start * 2 - EPS);
    const last = Math.ceil((span.start + span.dur) * 2 - EPS);
    for (let s = first; s < last; s++) {
      const kind = song.strum[s % slots];
      if (kind !== "-") strums.push({ beat: s / 2, kind: kind as StrumKind, chord: span.name });
    }
  }

  return { song, lines, sections, notes, chords, strums, chordNames, totalBeats: beat };
}

/** Index of the last item whose `start` is ≤ beat, or -1. Items must be sorted. */
export function findAt<T extends { start: number }>(items: T[], beat: number): number {
  let lo = 0;
  let hi = items.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (items[mid].start <= beat + EPS) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}
