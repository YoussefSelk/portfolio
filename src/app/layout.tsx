import type { Metadata } from "next";
import { Anton, Hanken_Grotesk, Space_Mono } from "next/font/google";

import "./globals.css";

const display = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.webmanifest",
  title: {
    default: "Youssef Selk | Official Portfolio",
    template: "%s | Youssef Selk",
  },
  description:
    "Official website and portfolio of Youssef Selk, software engineering student and full-stack developer.",
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
    title: "Youssef Selk | Software Engineering Portfolio",
    description:
      "Official portfolio of Youssef Selk: software engineering projects, experience, certifications, and contact information.",
    siteName: "Youssef Selk Portfolio",
    locale: "en_US",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Youssef Selk - Official Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Youssef Selk | Software Engineering Portfolio",
    description:
      "Official portfolio of Youssef Selk: software engineering projects, experience, certifications, and contact information.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
