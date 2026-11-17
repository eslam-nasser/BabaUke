import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { Tuner } from "@/components/Tuner";

export const metadata: Metadata = {
  title: "Ukulele tuner",
  description: "Tune your ukulele to G, C, E, A with your microphone, or by ear with reference notes.",
  openGraph: { title: "Ukulele tuner", url: "/tuner" },
};

const STEPS = [
  "Turn on the microphone.",
  "Pluck one string and let it ring.",
  "Turn that string's peg until the marker sits in the green.",
];

export default function TunerPage() {
  return (
    <Shell>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        <header className="grid items-end gap-x-12 gap-y-4 pb-10 pt-8 md:grid-cols-[auto_minmax(0,1fr)]">
          <h1 className="font-display text-5xl sm:text-6xl">Tuner</h1>
          <ol className="grid gap-x-6 gap-y-2 text-lg leading-snug sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-baseline gap-3 border-t-2 border-ink pt-2">
                <span className="font-display text-3xl leading-none" aria-hidden>
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </header>
        <Tuner />
      </main>
    </Shell>
  );
}
