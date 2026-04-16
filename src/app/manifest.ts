import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Youssef Selk — Full-Stack Developer · Internship Jun 2026",
    short_name: "Youssef Selk",
    description:
      "Portfolio of Youssef Selk with backend/full-stack projects and internship availability for June 2026.",
    start_url: "/",
    display: "standalone",
    background_color: "#131110",
    theme_color: "#c6f24e",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
