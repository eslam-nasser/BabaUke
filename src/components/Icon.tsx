/**
 * BabaUke's own small icon set, drawn like the chord diagrams:
 * round-ended ink strokes and solid ink shapes on a 24 × 24 grid.
 */
const ICONS = {
  play: <path d="M8 5.2v13.6L19.5 12z" fill="currentColor" />,
  pause: (
    <g fill="currentColor" stroke="none">
      <rect x="6" y="4.5" width="4.5" height="15" rx="1.2" />
      <rect x="13.5" y="4.5" width="4.5" height="15" rx="1.2" />
    </g>
  ),
  restart: (
    <>
      <path d="M6 5.5v13" />
      <path d="M19 5.5v13L9.5 12z" fill="currentColor" />
    </>
  ),
  back: <path d="M19.5 12h-15M11 5.5 4.5 12l6.5 6.5" />,
  down: <path d="M12 3.5v16.5M5.5 13.5 12 20l6.5-6.5" />,
  up: <path d="M12 20.5V4M5.5 10.5 12 4l6.5 6.5" />,
  repeat: <path d="m16.5 2.5 3.5 3.5-3.5 3.5M4 11.5V9a3 3 0 0 1 3-3h13M7.5 21.5 4 18l3.5-3.5M20 12.5V15a3 3 0 0 1-3 3H4" />,
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  speaker: (
    <>
      <path d="M3.5 9.5h3.8L12 5.8v12.4l-4.7-3.7H3.5z" fill="currentColor" />
      <path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.3 6.4a8 8 0 0 1 0 11.2" />
    </>
  ),
  mic: (
    <>
      <rect x="8.75" y="2.75" width="6.5" height="11.5" rx="3.25" fill="currentColor" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.25" />
    </>
  ),
  micOff: (
    <>
      <rect x="8.75" y="2.75" width="6.5" height="11.5" rx="3.25" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.25M4 3.5l16 17" />
    </>
  ),
  loading: <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 24,
  weight = 2.5,
  className,
}: {
  name: IconName;
  size?: number;
  /** Stroke width on the 24px grid. */
  weight?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}
