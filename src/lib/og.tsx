import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { chordColor, getChord } from "./music/chords";

/** Shared drawing code for the link-preview images (Open Graph / Twitter cards). */

export const OG_SIZE = { width: 1200, height: 630 };

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

const PAPER = { day: "#f3f8f7", night: "#0c3a44" };
const INK = { day: "#0d4a56", night: "#f4f1e6" };
const SOFT = { day: "#3d6d75", night: "#a9c8c6" };
const BLOT = "#062a31";

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="#ffc21a" />
      <path d="M8.5 8v18M13.5 8v18M18.5 8v18M23.5 8v18" stroke={BLOT} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 14h15M8.5 20h15" stroke={BLOT} strokeWidth="1.2" opacity="0.55" />
      <path d="M7.5 8h17" stroke={BLOT} strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="23.5" cy="23" r="3.7" fill={BLOT} />
    </svg>
  );
}

function Diagram({ name, ink, height }: { name: string; ink: string; height: number }) {
  const xs = [20, 46, 72, 98];
  const nut = 26;
  const gap = 27;
  const frets = getChord(name).frets;
  return (
    <svg width={(height * 118) / 138} height={height} viewBox="0 0 118 138">
      {[1, 2, 3, 4].map((f) => (
        <line key={f} x1={xs[0]} x2={xs[3]} y1={nut + gap * f} y2={nut + gap * f} stroke={ink} strokeWidth="1.5" opacity="0.45" />
      ))}
      {xs.map((x) => (
        <line key={x} x1={x} x2={x} y1={nut} y2={nut + gap * 4} stroke={ink} strokeWidth="2" />
      ))}
      <line x1={xs[0] - 1} x2={xs[3] + 1} y1={nut} y2={nut} stroke={ink} strokeWidth="6" strokeLinecap="round" />
      {frets.map((fret, i) =>
        fret === 0 ? (
          <circle key={i} cx={xs[i]} cy={nut - 14} r="5" fill="none" stroke={ink} strokeWidth="2" />
        ) : (
          <circle key={i} cx={xs[i]} cy={nut + gap * (fret - 0.5)} r="11" fill={chordColor(name)} stroke={BLOT} strokeWidth="2" />
        ),
      )}
    </svg>
  );
}

export async function renderCard({
  title,
  subtitle,
  scene,
  chords,
  strip,
}: {
  title: string;
  subtitle: string;
  scene: "day" | "night";
  /** Chord names shown as chips; the first one is also drawn as a diagram. */
  chords: string[];
  /** The song as [chord, beats] runs, drawn to scale along the bottom. */
  strip: [string, number][];
}) {
  const [rakkas, zain, zainBlack] = await Promise.all([
    font("Rakkas-Regular.woff"),
    font("Zain-Regular.woff"),
    font("Zain-Black.woff"),
  ]);
  const ink = INK[scene];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: PAPER[scene], color: ink, fontFamily: "Zain" }}>
        <div style={{ display: "flex", flex: 1, padding: "52px 64px 36px 64px" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 40 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Mark size={56} />
              <div style={{ marginLeft: 16, fontFamily: "Rakkas", fontSize: 50 }}>BabaUke</div>
            </div>
            <div style={{ display: "flex", marginTop: 36, fontFamily: "Rakkas", fontSize: title.length > 34 ? 64 : title.length > 22 ? 78 : 96, lineHeight: 1.05 }}>
              {title}
            </div>
            <div style={{ display: "flex", marginTop: 16, fontSize: 34, lineHeight: 1.3, color: SOFT[scene] }}>{subtitle}</div>
            <div style={{ display: "flex", marginTop: 24 }}>
              {chords.map((name) => (
                <div
                  key={name}
                  style={{ display: "flex", marginRight: 12, padding: "2px 16px", borderRadius: 10, background: chordColor(name), color: BLOT, fontSize: 44, fontWeight: 900 }}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Diagram name={chords[0]} ink={ink} height={340} />
          </div>
        </div>
        <div style={{ display: "flex", height: 64, width: "100%" }}>
          {strip.map(([name, beats], i) => (
            <div key={i} style={{ display: "flex", flexGrow: beats, flexBasis: 0, background: chordColor(name) }} />
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Rakkas", data: rakkas, weight: 400, style: "normal" },
        { name: "Zain", data: zain, weight: 400, style: "normal" },
        { name: "Zain", data: zainBlack, weight: 900, style: "normal" },
      ],
    },
  );
}

/** A song's chords merged into [chord, beats] runs. */
export function chordRuns(spans: { name: string; dur: number }[]): [string, number][] {
  const runs: [string, number][] = [];
  for (const span of spans) {
    const last = runs[runs.length - 1];
    if (last && last[0] === span.name) last[1] += span.dur;
    else runs.push([span.name, span.dur]);
  }
  return runs;
}
