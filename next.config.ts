import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev badge sits on top of the play button, so move it out of the way.
  devIndicators: { position: "top-right" },
  // The link-preview images read these fonts at request time, so ship them with the server code.
  outputFileTracingIncludes: { "/**": ["./assets/fonts/*.woff"] },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
