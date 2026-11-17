import type { Metadata, Viewport } from "next";
import { Rakkas, Zain } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

// Zain: a clear Arabic + Latin text face. Yes, it shares its name with the boy this was made for.
const zain = Zain({
  variable: "--font-zain",
  subsets: ["arabic", "latin"],
  weight: ["400", "700", "800", "900"],
});

// Rakkas: display lettering in the spirit of hand-painted Egyptian film posters.
const rakkas = Rakkas({
  variable: "--font-rakkas",
  subsets: ["arabic", "latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: ${SITE_TAGLINE.toLowerCase()}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "ukulele",
    "kids songs",
    "lullabies",
    "Arabic kids songs",
    "ukulele chords",
    "play along",
    "ukulele tuner",
    "أغاني أطفال",
    "يوكليلي",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME}: ${SITE_TAGLINE.toLowerCase()}`,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en",
    alternateLocale: ["ar_EG"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}: ${SITE_TAGLINE.toLowerCase()}`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c3a44" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${zain.variable} ${rakkas.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
