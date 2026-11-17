import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: a chord box showing C, four strings and one finger. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffc21a" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path d="M8.5 8v18M13.5 8v18M18.5 8v18M23.5 8v18" stroke="#062a31" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8.5 14h15M8.5 20h15" stroke="#062a31" strokeWidth="1.2" opacity="0.55" />
          <path d="M7.5 8h17" stroke="#062a31" strokeWidth="3.6" strokeLinecap="round" />
          <circle cx="23.5" cy="23" r="3.7" fill="#062a31" />
        </svg>
      </div>
    ),
    size,
  );
}
