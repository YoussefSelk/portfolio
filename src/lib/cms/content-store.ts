import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { unstable_cache } from "next/cache";

import { fallbackPortfolioContent } from "@/lib/fallback-content";
import type { PortfolioContent } from "@/lib/types";

const DATA_DIRECTORY = join(process.cwd(), "data");
const CONTENT_FILE = join(DATA_DIRECTORY, "portfolio-content.json");
const CONTENT_TAG = "portfolio-content";

function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

function normalizeContent(raw: unknown): PortfolioContent {
  if (!raw || typeof raw !== "object") {
    return fallbackPortfolioContent;
  }

  const candidate = raw as Partial<PortfolioContent>;

  return {
    site: candidate.site ?? fallbackPortfolioContent.site,
    experiences: sortByOrder(
      Array.isArray(candidate.experiences)
        ? (candidate.experiences as PortfolioContent["experiences"])
        : fallbackPortfolioContent.experiences,
    ),
    education: sortByOrder(
      Array.isArray(candidate.education)
        ? (candidate.education as PortfolioContent["education"])
        : fallbackPortfolioContent.education,
    ),
    projects: sortByOrder(
      Array.isArray(candidate.projects)
        ? (candidate.projects as PortfolioContent["projects"])
        : fallbackPortfolioContent.projects,
    ),
    skillGroups: sortByOrder(
      Array.isArray(candidate.skillGroups)
        ? (candidate.skillGroups as PortfolioContent["skillGroups"])
        : fallbackPortfolioContent.skillGroups,
    ),
    certifications: sortByOrder(
      Array.isArray(candidate.certifications)
        ? (candidate.certifications as PortfolioContent["certifications"])
        : fallbackPortfolioContent.certifications,
    ),
  };
}

async function ensureContentFile() {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await readFile(CONTENT_FILE, "utf-8");
  } catch {
    await writeFile(
      CONTENT_FILE,
      JSON.stringify(fallbackPortfolioContent, null, 2),
      "utf-8",
    );
  }
}

async function readContentFromDisk() {
  try {
    await ensureContentFile();
    const content = await readFile(CONTENT_FILE, "utf-8");
    return normalizeContent(JSON.parse(content));
  } catch {
    return fallbackPortfolioContent;
  }
}

const readCachedContent = unstable_cache(readContentFromDisk, ["portfolio-content"], {
  tags: [CONTENT_TAG],
  revalidate: 300,
});

export async function getPortfolioContent() {
  return readCachedContent();
}

export async function savePortfolioContent(content: PortfolioContent) {
  await ensureContentFile();
  const normalized = normalizeContent(content);

  await writeFile(CONTENT_FILE, JSON.stringify(normalized, null, 2), "utf-8");

  return normalized;
}

export { CONTENT_TAG };
