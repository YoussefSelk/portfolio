import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";

import Database from "better-sqlite3";

function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const digest = scryptSync(password, salt, 64).toString("base64url");
  return `scrypt$${salt}$${digest}`;
}

const username = process.argv[2] || process.env.ADMIN_BOOTSTRAP_USERNAME;
const password = process.argv[3] || process.env.ADMIN_BOOTSTRAP_PASSWORD;

if (!username || !password) {
  console.error(
    "Usage: npm run admin:create -- <username> <password>\nOr set ADMIN_BOOTSTRAP_USERNAME and ADMIN_BOOTSTRAP_PASSWORD env vars.",
  );
  process.exit(1);
}

if (String(password).length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const configuredName = process.env.ADMIN_DB_PATH?.trim();
const safeFileName = configuredName
  ? configuredName.replace(/^[./\\]+/, "")
  : "auth.db";
const dbPath = join(process.cwd(), "data", safeFileName);
const dir = dirname(dbPath);

if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

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

const passwordHash = hashPassword(String(password));

db.prepare(`
  INSERT INTO admin_users (username, password_hash, is_active)
  VALUES (?, ?, 1)
  ON CONFLICT(username) DO UPDATE SET
    password_hash = excluded.password_hash,
    is_active = 1,
    updated_at = CURRENT_TIMESTAMP
`).run(String(username), passwordHash);

console.log(`Admin user '${username}' created/updated successfully at ${dbPath}`);
