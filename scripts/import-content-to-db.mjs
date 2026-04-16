import "dotenv/config";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Pool } from "pg";

const sourcePathArg = process.argv[2];
const sourcePath = sourcePathArg ? resolve(process.cwd(), sourcePathArg) : null;

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

function normalizeDatabaseUrl(value) {
  try {
    const parsed = new URL(value);
    const sslMode = parsed.searchParams.get("sslmode");

    if (!sslMode || sslMode === "require") {
      parsed.searchParams.set("sslmode", "no-verify");
    }

    return parsed.toString();
  } catch {
    return value;
  }
}

if (!databaseUrl) {
  console.error(
    "Missing Postgres connection string. Set DATABASE_URL or POSTGRES_URL.",
  );
  process.exit(1);
}

if (!sourcePath) {
  console.error("Usage: npm run content:import -- <path-to-content-json>");
  process.exit(1);
}

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(databaseUrl),
  ssl: { rejectUnauthorized: false },
});

try {
  const raw = await readFile(sourcePath, "utf-8");
  const parsed = JSON.parse(raw);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS portfolio_content (
      content_key TEXT PRIMARY KEY,
      content JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(
    `
      INSERT INTO portfolio_content (content_key, content, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (content_key) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = NOW()
    `,
    ["main", JSON.stringify(parsed)],
  );

  console.log(`Content imported successfully from ${sourcePath}`);
} finally {
  await pool.end();
}
