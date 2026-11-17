import { Icon } from "./Icon";

const STRING_NAMES: Record<string, string> = { "4": "G", "3": "C", "2": "E", "1": "A" };

function describe(kind: string) {
  if (kind === "-") return "let it ring";
  if (STRING_NAMES[kind]) return `pluck ${STRING_NAMES[kind]}`;
  const soft = kind === "d" || kind === "u" ? "soft " : "";
  return `${soft}${kind.toLowerCase() === "d" ? "down" : "up"}`;
}

/** One bar of strumming: arrows for strums, letters for plucked strings, counted underneath. */
export function StrumPattern({
  pattern,
  active = -1,
  color = "#ffc21a",
}: {
  pattern: string;
  /** Slot to light up, or -1. */
  active?: number;
  color?: string;
}) {
  const kinds = pattern.split("");
  return (
    <div dir="ltr" role="img" aria-label={`One bar: ${kinds.map(describe).join(", ")}`} className="flex">
      {kinds.map((kind, i) => {
        const on = i === active;
        const rest = kind === "-";
        const soft = kind === "d" || kind === "u";
        const down = kind === "D" || kind === "d";
        const pluck = STRING_NAMES[kind];
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1" aria-hidden>
            <div
              className={`grid h-10 w-full place-items-center rounded-md ${on && !rest ? "text-blot" : rest ? "text-soft" : "text-ink"}`}
              style={on && !rest ? { background: color } : undefined}
            >
              {rest ? (
                <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-ink" : "bg-soft opacity-50"}`} />
              ) : pluck ? (
                <span className="text-2xl font-black leading-none">{pluck}</span>
              ) : (
                <Icon name={down ? "down" : "up"} size={soft ? 18 : 28} weight={soft ? 2.5 : 3.25} />
              )}
            </div>
            <span className={`text-base font-bold leading-none ${i % 2 === 0 ? "text-ink" : "text-soft"}`}>
              {i % 2 === 0 ? i / 2 + 1 : "+"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** One sentence that explains the symbols used in this song's pattern. */
export function strumLegend(pattern: string): string {
  const parts: string[] = [];
  if (/[DU]/.test(pattern)) parts.push("A big arrow is a full strum, down or up.");
  if (/[du]/.test(pattern)) parts.push("A small arrow is a soft strum.");
  if (/[1-4]/.test(pattern)) parts.push("A letter is one string to pluck.");
  if (pattern.includes("-")) parts.push("On a dot, let it ring.");
  parts.push(`Count out loud: ${pattern.split("").map((_, i) => (i % 2 === 0 ? i / 2 + 1 : "and")).join(", ")}.`);
  return parts.join(" ");
}
