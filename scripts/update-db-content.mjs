import "dotenv/config";

import { Pool } from "pg";

const raw =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!raw) {
  throw new Error("Missing DB URL.");
}

const url = new URL(raw);
const sslmode = url.searchParams.get("sslmode");

if (!sslmode || sslmode === "require") {
  url.searchParams.set("sslmode", "no-verify");
}

const pool = new Pool({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: false },
});

try {
  const { rows } = await pool.query(
    "SELECT content FROM portfolio_content WHERE content_key = $1 LIMIT 1",
    ["main"],
  );

  if (!rows[0]) {
    throw new Error("No content row found for content_key=main.");
  }

  const content = rows[0].content;

  content.site.footerText = "Made by Youssef Selk";
  content.site.contactDescription =
    "I'm interested in backend-heavy and full-stack opportunities where I can contribute quickly, with strong interest in AI and Data.";

  await pool.query(
    "UPDATE portfolio_content SET content = $2::jsonb, updated_at = NOW() WHERE content_key = $1",
    ["main", JSON.stringify(content)],
  );

  console.log("Updated DB content successfully.");
} finally {
  await pool.end();
}
