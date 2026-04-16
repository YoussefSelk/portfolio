import "dotenv/config";

import { randomBytes, scryptSync } from "node:crypto";

import { Pool } from "pg";

function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const digest = scryptSync(password, salt, 64).toString("base64url");
  return `scrypt$${salt}$${digest}`;
}

const username = process.argv[2] || process.env.ADMIN_BOOTSTRAP_USERNAME;
const password = process.argv[3] || process.env.ADMIN_BOOTSTRAP_PASSWORD;

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

if (!username || !password) {
  console.error(
    "Usage: npm run admin:create -- <username> <password>\nOr set ADMIN_BOOTSTRAP_USERNAME and ADMIN_BOOTSTRAP_PASSWORD env vars.",
  );
  process.exit(1);
}

if (!databaseUrl) {
  console.error(
    "Missing Postgres connection string. Set DATABASE_URL or POSTGRES_URL.",
  );
  process.exit(1);
}

if (String(password).length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(databaseUrl),
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id BIGSERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const passwordHash = hashPassword(String(password));

  await pool.query(
    `
      INSERT INTO admin_users (username, password_hash, is_active)
      VALUES ($1, $2, 1)
      ON CONFLICT(username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        is_active = 1,
        updated_at = NOW()
    `,
    [String(username), passwordHash],
  );

  console.log(
    `Admin user '${username}' created/updated successfully in Postgres`,
  );
} finally {
  await pool.end();
}
