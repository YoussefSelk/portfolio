import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  userId: number;
  username: string;
  exp: number;
};

function getSessionSecret() {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV !== "production") {
    return "dev-only-admin-session-secret-change-me";
  }

  throw new Error("Missing ADMIN_SESSION_SECRET in production.");
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

export function createSessionToken(input: { userId: number; username: string }) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;

  const payload = JSON.stringify({
    userId: input.userId,
    username: input.username,
    exp,
  } satisfies SessionPayload);

  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf-8"),
    ) as SessionPayload;

    if (!payload?.userId || !payload?.username || !payload?.exp) {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
