"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Songs" },
  { href: "/chords", label: "Chords" },
  { href: "/tuner", label: "Tuner" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {LINKS.map((link) => {
        const current = link.href === "/" ? pathname === "/" || pathname.startsWith("/song") : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={`inline-flex min-h-11 items-center px-1.5 decoration-2 sm:px-2 underline-offset-[0.35em] hover:underline ${
              current ? "underline" : ""
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
