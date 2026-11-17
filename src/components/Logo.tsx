/**
 * The BabaUke mark is a chord box showing C: four strings and one finger.
 * It is the first chord anyone learns, and all you need for your first song.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="7" fill="#ffc21a" />
      <g stroke="#062a31" fill="none">
        <path d="M8.5 8v18M13.5 8v18M18.5 8v18M23.5 8v18" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8.5 14h15M8.5 20h15" strokeWidth="1.2" opacity="0.55" />
        <path d="M7.5 8h17" strokeWidth="3.6" strokeLinecap="round" />
      </g>
      <circle cx="23.5" cy="23" r="3.7" fill="#062a31" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="h-8 w-8 sm:h-9 sm:w-9" />
      <span className="font-display text-2xl leading-none sm:text-[1.7rem]">BabaUke</span>
    </span>
  );
}
