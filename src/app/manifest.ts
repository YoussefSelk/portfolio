import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Youssef Selk | Official Portfolio",
    short_name: "Youssef Selk",
    description:
      "Official portfolio of Youssef Selk, software engineering student and full-stack developer.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#34f5cd",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
