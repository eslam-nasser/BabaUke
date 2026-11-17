"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div data-scene="day" className="min-h-dvh bg-paper text-ink">
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-5xl sm:text-6xl">Something broke on this page.</h1>
        <p className="mt-3 max-w-[54ch] text-xl text-soft">
          It is not you. Try loading it again. If it keeps happening, the rest of the songbook should still work.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center rounded-lg bg-ink px-5 text-xl font-extrabold text-paper hover:bg-sun hover:text-blot"
          >
            Load this page again
          </button>
          <Link href="/" className="inline-flex min-h-12 items-center rounded-lg border-2 border-ink px-5 text-xl font-extrabold hover:bg-wash">
            See all songs
          </Link>
        </div>
      </main>
    </div>
  );
}
