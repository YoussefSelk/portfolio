import "server-only";

import { Pool } from "pg";

type AdminUserRow = {
  id: number;
  username: string;
  password_hash: string;
  is_active: number;
};

let poolInstance: Pool | null = null;
let adminSchemaReady: Promise<void> | null = null;

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

async function ensureAdminSchema() {
  if (adminSchemaReady) {
    return adminSchemaReady;
  }

  adminSchemaReady = (async () => {
    const pool = getPool();

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

    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);",
    );
  })();

  return adminSchemaReady;
}

export async function findAdminUserByUsername(username: string) {
  await ensureAdminSchema();

  const { rows } = await getPool().query<AdminUserRow>(
    "SELECT id::int AS id, username, password_hash, is_active FROM admin_users WHERE username = $1 LIMIT 1",
    [username],
  );

  return rows[0];
}

export async function findAdminUserById(id: number) {
  await ensureAdminSchema();

  const { rows } = await getPool().query<AdminUserRow>(
    "SELECT id::int AS id, username, password_hash, is_active FROM admin_users WHERE id = $1 LIMIT 1",
    [id],
  );

  return rows[0];
}

export async function upsertAdminUser(username: string, passwordHash: string) {
  await ensureAdminSchema();

  await getPool().query(
    `
      INSERT INTO admin_users (username, password_hash, is_active)
      VALUES ($1, $2, 1)
      ON CONFLICT(username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        is_active = 1,
        updated_at = NOW()
    `,
    [username, passwordHash],
  );
}
