import "server-only";

import { unstable_cache } from "next/cache";
import { Pool } from "pg";

import { fallbackPortfolioContent } from "@/lib/fallback-content";
import type { PortfolioContent } from "@/lib/types";

const CONTENT_TAG = "portfolio-content";
const CONTENT_KEY = "main";

let poolInstance: Pool | null = null;
let contentSchemaReady: Promise<void> | null = null;

function getDatabaseUrl() {
  const value =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim();

  if (!value) {
    throw new Error(
      "Missing Postgres connection string. Set DATABASE_URL or POSTGRES_URL.",
    );
  }

  try {
    const normalizedUrl = new URL(value);
    const sslMode = normalizedUrl.searchParams.get("sslmode");

    if (!sslMode || sslMode === "require") {
      normalizedUrl.searchParams.set("sslmode", "no-verify");
    }

    return normalizedUrl.toString();
  } catch {
    return value;
  }
}

function getPool() {
  if (poolInstance) {
    return poolInstance;
  }

  poolInstance = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

  return poolInstance;
}

function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

function normalizeContent(raw: unknown): PortfolioContent {
  if (!raw || typeof raw !== "object") {
    return fallbackPortfolioContent;
  }

  const candidate = raw as Partial<PortfolioContent>;
  const candidateSite =
    candidate.site && typeof candidate.site === "object"
      ? (candidate.site as Partial<PortfolioContent["site"]>)
      : {};

  return {
    site: {
      ...fallbackPortfolioContent.site,
      ...candidateSite,
      socialLinks: Array.isArray(candidateSite.socialLinks)
        ? candidateSite.socialLinks
        : fallbackPortfolioContent.site.socialLinks,
      stats: Array.isArray(candidateSite.stats)
        ? candidateSite.stats
        : fallbackPortfolioContent.site.stats,
      languages: Array.isArray(candidateSite.languages)
        ? candidateSite.languages
        : fallbackPortfolioContent.site.languages,
      contentOverrides: Array.isArray(candidateSite.contentOverrides)
        ? candidateSite.contentOverrides
        : fallbackPortfolioContent.site.contentOverrides,
    },
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

async function ensureContentSchema() {
  if (contentSchemaReady) {
    return contentSchemaReady;
  }

  contentSchemaReady = (async () => {
    const pool = getPool();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS portfolio_content (
        content_key TEXT PRIMARY KEY,
        content JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(
      `
      INSERT INTO portfolio_content (content_key, content)
      VALUES ($1, $2::jsonb)
      ON CONFLICT (content_key) DO NOTHING
      `,
      [CONTENT_KEY, JSON.stringify(fallbackPortfolioContent)],
    );
  })();

  return contentSchemaReady;
}

async function readContentFromDatabase() {
  try {
    await ensureContentSchema();

    const { rows } = await getPool().query<{ content: unknown }>(
      "SELECT content FROM portfolio_content WHERE content_key = $1 LIMIT 1",
      [CONTENT_KEY],
    );

    const raw = rows[0]?.content ?? fallbackPortfolioContent;
    return normalizeContent(raw);
  } catch {
    return fallbackPortfolioContent;
  }
}

const readCachedContent = unstable_cache(
  readContentFromDatabase,
  ["portfolio-content"],
  {
    tags: [CONTENT_TAG],
    revalidate: 300,
  },
);

export async function getPortfolioContent() {
  return readCachedContent();
}

export async function savePortfolioContent(content: PortfolioContent) {
  await ensureContentSchema();
  const normalized = normalizeContent(content);

  await getPool().query(
    `
      INSERT INTO portfolio_content (content_key, content, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (content_key) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = NOW()
    `,
    [CONTENT_KEY, JSON.stringify(normalized)],
  );

  return normalized;
}

export { CONTENT_TAG };
