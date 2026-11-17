export const SITE_NAME = "BabaUke";

export const SITE_TAGLINE = "Play ukulele for your baby";

export const SITE_DESCRIPTION =
  "Kids' songs in Arabic and English for ukulele. The chords and the words light up in time so you can strum and sing along. Free and open source.";

export const REPO_URL = "https://github.com/eslam-nasser/BabaUke";

/**
 * Where the site lives, used for share links.
 * Set NEXT_PUBLIC_SITE_URL to your own domain. Without it, the address that
 * Netlify (URL) or Vercel gives the site is used.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
