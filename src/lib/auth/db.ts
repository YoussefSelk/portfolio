import "server-only";

import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import Database from "better-sqlite3";

type AdminUserRow = {
  id: number;
  username: string;
  password_hash: string;
  is_active: number;
};

let dbInstance: Database.Database | null = null;

function getDbPath() {
  const configuredName = process.env.ADMIN_DB_PATH?.trim();
  const safeFileName = configuredName
    ? configuredName.replace(/^[./\\]+/, "")
    : "auth.db";

  return join(process.cwd(), "data", safeFileName);
}

function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);",
  );
}

export function getAuthDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getDbPath();
  const dir = dirname(dbPath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  initializeDatabase(db);

  dbInstance = db;

  return db;
}

export function findAdminUserByUsername(username: string) {
  const db = getAuthDb();
  return db
    .prepare(
      "SELECT id, username, password_hash, is_active FROM admin_users WHERE username = ? LIMIT 1",
    )
    .get(username) as AdminUserRow | undefined;
}

export function findAdminUserById(id: number) {
  const db = getAuthDb();
  return db
    .prepare(
      "SELECT id, username, password_hash, is_active FROM admin_users WHERE id = ? LIMIT 1",
    )
    .get(id) as AdminUserRow | undefined;
}

export function upsertAdminUser(username: string, passwordHash: string) {
  const db = getAuthDb();

  db.prepare(
    `
      INSERT INTO admin_users (username, password_hash, is_active)
      VALUES (?, ?, 1)
      ON CONFLICT(username) DO UPDATE SET
        password_hash = excluded.password_hash,
        is_active = 1,
        updated_at = CURRENT_TIMESTAMP
    `,
  ).run(username, passwordHash);
}
