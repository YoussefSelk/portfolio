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
    "SELECT content->'site'->>'footerText' AS footer_text, content->'site'->>'contactDescription' AS contact_description FROM portfolio_content WHERE content_key = $1 LIMIT 1",
    ["main"],
  );

  console.log(rows[0]);
} finally {
  await pool.end();
}
