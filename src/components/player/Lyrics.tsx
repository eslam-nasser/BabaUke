"use client";

import { useEffect, useMemo, useRef } from "react";
import { ChordChip } from "@/components/ChordStrip";
import { Icon } from "@/components/Icon";
import { chordColor } from "@/lib/music/chords";
import { findAt } from "@/lib/music/compile";
import type { Line, Timeline, Token } from "@/lib/music/types";
import type { BeatListener, Frame } from "./usePlayer";

/** Text for the controls inside the lyric sheet, in the song's own language. */
const WORDS = {
  en: {
    repeat: (part: string) => `Repeat ${part}`,
    stop: (part: string) => `Stop repeating ${part}`,
    jump: (text: string) => `Jump to: ${text}`,
    instrumental: "instrumental",
    chordsOnly: "Chords only. Each box is one beat: strum along and sing the words you know.",
  },
  ar: {
    repeat: (part: string) => `كرّر ${part}`,
    stop: (part: string) => `وقّف تكرار ${part}`,
    jump: (text: string) => `روح لـ: ${text}`,
    instrumental: "موسيقى",
    chordsOnly: "كوردات بس. كل مربّع عدّة واحدة: اعزف وغنّي الكلام اللي انت عارفه.",
  },
} as const;

/** Syllables of one word stay glued together; words get a space between them. */
function groupWords(line: Line): Token[][] {
  const words: Token[][] = [];
  let current: Token[] = [];
  for (const token of line.tokens) {
    if (token.rest && token.chords.length === 0) continue;
    current.push(token);
    if (!token.joinNext) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/** The highlighter for one word: one flat colour, or hard-edged bands if the chord changes mid-word. */
function pen(token: Token, rtl: boolean): string {
  const ink = (name: string) => `color-mix(in srgb, ${chordColor(name)} var(--mark), transparent)`;
  if (token.pens.length === 1) return ink(token.pens[0].name);
  const stops = token.pens.map((p, i) => {
    const to = token.pens[i + 1]?.from ?? 1;
    return `${ink(p.name)} ${(p.from * 100).toFixed(1)}% ${(to * 100).toFixed(1)}%`;
  });
  return `linear-gradient(to ${rtl ? "left" : "right"}, ${stops.join(", ")})`;
}

export function Lyrics({
  timeline,
  frame,
  loop,
  onBeat,
  onSeek,
  onLoopSection,
  plain = false,
}: {
  timeline: Timeline;
  frame: Frame;
  loop: { start: number; end: number } | null;
  onBeat: (listener: BeatListener) => () => void;
  onSeek: (beat: number) => void;
  onLoopSection?: (section: number) => void;
  /** Just the lines: no part names, no repeat buttons, no scrolling room. Used for the small demo. */
  plain?: boolean;
}) {
  const { song, lines, sections } = timeline;
  const rtl = song.lang === "ar";
  const words = WORDS[song.lang];
  const chordsOnly = lines.every((line) => line.instrumental);
  const scroller = useRef<HTMLDivElement>(null);
  const lineEls = useRef<(HTMLDivElement | null)[]>([]);
  const tokenEls = useRef(new Map<number, HTMLSpanElement>());
  const grouped = useMemo(() => lines.map(groupWords), [lines]);

  // Keep the line being sung in the upper-middle of the panel.
  useEffect(() => {
    const box = scroller.current;
    const el = lineEls.current[frame.line];
    if (!box || !el || plain) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.offsetTop - box.clientHeight * 0.38 + el.offsetHeight / 2;
    box.scrollTo({ top: Math.max(0, top), behavior: calm ? "auto" : "smooth" });
  }, [frame.line, plain]);

  // Run the highlighter across each word as it is sung: straight to the DOM, no re-render.
  useEffect(() => {
    let lastLine = -1;
    const clear = (index: number) => {
      for (const token of lines[index]?.tokens ?? []) {
        tokenEls.current.get(token.id)?.style.removeProperty("--p");
      }
    };
    const stop = onBeat((beat) => {
      const index = Math.max(0, findAt(lines, beat));
      if (index !== lastLine) {
        if (lastLine >= 0) clear(lastLine);
        lastLine = index;
      }
      for (const token of lines[index].tokens) {
        if (token.rest) continue;
        const el = tokenEls.current.get(token.id);
        if (!el) continue;
        const p = Math.min(1, Math.max(0, (beat - token.start) / token.dur));
        el.style.setProperty("--p", p.toFixed(3));
      }
    });
    return () => {
      stop();
      if (lastLine >= 0) clear(lastLine);
    };
  }, [lines, onBeat]);

  return (
    <div
      ref={scroller}
      dir={rtl ? "rtl" : "ltr"}
      lang={song.lang}
      className={plain ? "relative" : "no-scrollbar absolute inset-0 overflow-y-auto"}
    >
      {/* The space after the last line lets it scroll up to the reading position. */}
      <div className={plain ? "relative" : "relative px-3 pb-[50vh] pt-3 sm:px-6"}>
        {chordsOnly && !plain && <p className="max-w-[60ch] px-2 pb-3 text-lg text-soft">{words.chordsOnly}</p>}

        {sections.map((section) => {
          const looping = loop?.start === section.start && loop?.end === section.end;
          return (
            <section key={section.index} className={plain ? "" : "mb-4"} aria-label={section.name}>
              {!plain && (
                <div className="flex items-center gap-1 px-2">
                  <h2 className="text-base font-bold text-soft">{section.name}</h2>
                  <button
                    type="button"
                    onClick={() => onLoopSection?.(section.index)}
                    aria-pressed={looping}
                    aria-label={looping ? words.stop(section.name) : words.repeat(section.name)}
                    className={`grid h-11 w-11 place-items-center rounded-md ${
                      looping ? "bg-ink text-paper" : "text-soft hover:bg-wash hover:text-ink"
                    }`}
                  >
                    <Icon name="repeat" size={18} />
                  </button>
                </div>
              )}

              {lines.slice(section.firstLine, section.lastLine + 1).map((line) => {
                const state = line.index < frame.line ? "past" : line.index === frame.line ? "active" : "future";
                const text = line.instrumental
                  ? words.instrumental
                  : line.tokens.map((t) => (t.rest ? "" : t.text + (t.joinNext ? "" : " "))).join("").trim();
                return (
                  <div
                    key={line.index}
                    ref={(el) => {
                      lineEls.current[line.index] = el;
                    }}
                    data-state={state}
                    role="button"
                    tabIndex={0}
                    aria-label={words.jump(text)}
                    aria-current={state === "active" ? "true" : undefined}
                    onClick={() => onSeek(line.start)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSeek(line.start);
                      }
                    }}
                    className={`cursor-pointer rounded-md px-2 py-1.5 ${
                      state === "active" ? "bg-wash" : state === "future" ? "text-soft hover:text-ink" : ""
                    }`}
                  >
                    <div
                      className={`flex flex-wrap items-end gap-x-[0.3em] gap-y-1 font-extrabold ${
                        rtl ? "text-[1.9rem] leading-[1.45] lg:text-[2.4rem]" : "text-[1.7rem] leading-[1.3] lg:text-[2.1rem]"
                      }`}
                    >
                      {grouped[line.index].map((word, w) => (
                        <span key={w} className="inline-flex items-end">
                          {word.map((token) => (
                            <span key={token.id} className="inline-flex flex-col items-start">
                              <span dir="ltr" className="flex h-7 items-center gap-1">
                                {token.chords.map((chord) => (
                                  <ChordChip key={chord.index} name={chord.name} active={chord.index === frame.chord} className="text-base" />
                                ))}
                              </span>
                              {token.rest ? (
                                // a sung line pauses here while the chord changes
                                <span className="mx-1.5 mb-[0.5em] inline-block h-2 w-2 rounded-full bg-soft" aria-hidden />
                              ) : line.instrumental ? (
                                // no words: one box per beat, filled in as the chord is played
                                <span
                                  className="tok inline-flex min-h-[1.1em] items-center gap-[0.28em] px-[0.12em]"
                                  style={{ "--pen": pen(token, rtl) } as React.CSSProperties}
                                  ref={(el) => {
                                    if (el) tokenEls.current.set(token.id, el);
                                    else tokenEls.current.delete(token.id);
                                  }}
                                  aria-hidden
                                >
                                  {Array.from({ length: Math.max(1, Math.round(token.dur)) }, (_, b) => (
                                    <span key={b} className="inline-block h-[0.5em] w-[0.72em] rounded-[3px] border-2 border-current" />
                                  ))}
                                </span>
                              ) : (
                                <span
                                  className="tok whitespace-nowrap"
                                  style={{ "--pen": pen(token, rtl) } as React.CSSProperties}
                                  ref={(el) => {
                                    if (el) tokenEls.current.set(token.id, el);
                                    else tokenEls.current.delete(token.id);
                                  }}
                                >
                                  {token.text}
                                </span>
                              )}
                            </span>
                          ))}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}
