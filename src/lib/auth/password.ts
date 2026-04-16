import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = scryptSync(password, salt, KEY_LENGTH).toString("base64url");

  return `${HASH_PREFIX}$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [prefix, salt, digest] = storedHash.split("$");

  if (!prefix || !salt || !digest || prefix !== HASH_PREFIX) {
    return false;
  }

  const providedDigest = scryptSync(password, salt, KEY_LENGTH).toString("base64url");

  const providedBuffer = Buffer.from(providedDigest);
  const storedBuffer = Buffer.from(digest);

  if (providedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, storedBuffer);
}
