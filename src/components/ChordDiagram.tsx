import { chordColor, getChord } from "@/lib/music/chords";

const STRING_X = [20, 46, 72, 98];
const NUT_Y = 26;
const FRET_GAP = 27;
const FRETS = 4;
const LABELS = ["G", "C", "E", "A"];

/**
 * A ukulele chord box, drawn in the page's ink.
 * Filled dots are fingers (numbered), rings are open strings.
 */
export function ChordDiagram({
  name,
  className,
  showFingers = true,
  showStrings = true,
}: {
  name: string;
  className?: string;
  showFingers?: boolean;
  showStrings?: boolean;
}) {
  const chord = getChord(name);
  const color = chordColor(name);
  const bottom = NUT_Y + FRET_GAP * FRETS;
  const fingering = chord.frets
    .map((fret, i) => (fret === 0 ? `${LABELS[i]} open` : `${LABELS[i]} fret ${fret}`))
    .join(", ");

  return (
    <svg
      viewBox={`0 0 118 ${showStrings ? 156 : 138}`}
      className={className}
      role="img"
      aria-label={`${name} chord: ${fingering}`}
      fill="none"
      stroke="currentColor"
    >
      {/* frets */}
      {Array.from({ length: FRETS }, (_, i) => (
        <line key={i} x1={STRING_X[0]} x2={STRING_X[3]} y1={NUT_Y + FRET_GAP * (i + 1)} y2={NUT_Y + FRET_GAP * (i + 1)} strokeWidth="1.5" opacity="0.45" />
      ))}
      {/* strings */}
      {STRING_X.map((x, i) => (
        <line key={i} x1={x} x2={x} y1={NUT_Y} y2={bottom} strokeWidth="2" />
      ))}
      {/* nut */}
      <line x1={STRING_X[0] - 1} x2={STRING_X[3] + 1} y1={NUT_Y} y2={NUT_Y} strokeWidth="6" strokeLinecap="round" />

      {chord.frets.map((fret, i) =>
        fret === 0 ? (
          <circle key={i} cx={STRING_X[i]} cy={NUT_Y - 14} r="5" strokeWidth="2" />
        ) : (
          <g key={i} stroke="none">
            <circle cx={STRING_X[i]} cy={NUT_Y + FRET_GAP * (fret - 0.5)} r="12" fill={color} stroke="#062a31" strokeWidth="2" />
            {showFingers && chord.fingers?.[i] ? (
              <text
                x={STRING_X[i]}
                y={NUT_Y + FRET_GAP * (fret - 0.5) + 6}
                textAnchor="middle"
                fontSize="18"
                fontWeight="900"
                fill="#062a31"
                fontFamily="var(--font-zain), sans-serif"
              >
                {chord.fingers[i]}
              </text>
            ) : null}
          </g>
        ),
      )}

      {showStrings &&
        LABELS.map((label, i) => (
          <text key={label} x={STRING_X[i]} y={bottom + 18} textAnchor="middle" fontSize="14" fontWeight="800" fill="currentColor" stroke="none" fontFamily="var(--font-zain), sans-serif">
            {label}
          </text>
        ))}
    </svg>
  );
}
