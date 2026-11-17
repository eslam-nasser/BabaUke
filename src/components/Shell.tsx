import Link from "next/link";
import { REPO_URL } from "@/lib/site";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

/**
 * Page frame: sets the paper (day or night) and draws the header.
 * `fill` makes the page exactly one screen tall, for the player. On phones
 * the player drops the site header (it has its own back link) to leave room
 * for the words.
 */
export function Shell({
  scene = "day",
  fill = false,
  children,
}: {
  scene?: "day" | "night";
  fill?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      data-scene={scene}
      className={`flex flex-col bg-paper text-ink ${fill ? "h-dvh overflow-hidden" : "min-h-dvh"}`}
    >
      <header className={`border-b-2 border-ink ${fill ? "max-sm:hidden short:hidden" : ""}`}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-1.5 sm:px-6">
          <Link href="/" aria-label="BabaUke, all songs" className="flex min-h-11 items-center">
            <Logo />
          </Link>
          <nav className="flex items-center text-lg font-bold sm:gap-3" aria-label="Main">
            <NavLinks />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden min-h-11 items-center px-2 decoration-2 underline-offset-[0.35em] hover:underline sm:inline-flex"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
