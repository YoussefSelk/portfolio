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

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(
  /\/$/,
  "",
);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Youssef Selk | Software Engineering Portfolio",
    template: "%s | Youssef Selk",
  },
  description:
    "Official portfolio of Youssef Selk: software engineering projects, experience, certifications, and contact information.",
  applicationName: "Youssef Selk Portfolio",
  keywords: [
    "Youssef Selk",
    "Selk",
    "Youssef",
    "YoussefSelk",
    "Software Engineer",
    "Full-Stack Developer",
    "Portfolio",
  ],
  authors: [{ name: "Youssef Selk", url: siteUrl }],
  creator: "Youssef Selk",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Youssef Selk | Software Engineering Portfolio",
    description:
      "Official portfolio of Youssef Selk: software engineering projects, experience, certifications, and contact information.",
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
