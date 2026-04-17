import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  display: "swap",
  subsets: ["latin"],
});

const body = Fraunces({
  variable: "--font-body",
  display: "swap",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  display: "swap",
  subsets: ["latin"],
});

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.webmanifest",
  title: {
    default: "Youssef Selk — Full-Stack Developer · Internship Jun 2026",
    template: "%s | Youssef Selk",
  },
  description:
    "Portfolio of Youssef Selk: backend/full-stack projects, field-tested outcomes, and availability for internship in June 2026 then apprenticeship in September 2026.",
  applicationName: "Youssef Selk Portfolio",
  keywords: [
    "Youssef Selk",
    "youssef selk",
    "Youssef Benselk",
    "Selk",
    "Youssef",
    "YoussefSelk",
    "Software Engineer",
    "Full-Stack Developer",
    "AI Engineer",
    "Machine Learning",
    "Data Engineering",
    "Data Science",
    "Portfolio",
  ],
  authors: [{ name: "Youssef Selk", url: siteUrl }],
  creator: "Youssef Selk",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Youssef Selk — Full-Stack Developer · Internship Jun 2026",
    description:
      "Portfolio of Youssef Selk: backend/full-stack projects, field-tested outcomes, and availability for internship in June 2026 then apprenticeship in September 2026.",
    siteName: "Youssef Selk Portfolio",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Youssef Selk - Official Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Youssef Selk — Full-Stack Developer · Internship Jun 2026",
    description:
      "Portfolio of Youssef Selk: backend/full-stack projects, field-tested outcomes, and availability for internship in June 2026 then apprenticeship in September 2026.",
    images: ["/twitter-image"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-icon",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#top" className="skip-link">
          Skip to content
        </a>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
