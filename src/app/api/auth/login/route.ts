import { NextRequest, NextResponse } from "next/server";

import { findAdminUserByUsername } from "@/lib/auth/db";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string } = {};

  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, message: "Username and password are required." },
      { status: 400 },
    );
  }

  const user = await findAdminUserByUsername(username);

  if (!user || user.is_active !== 1) {
    return NextResponse.json(
      { ok: false, message: "Invalid credentials." },
      { status: 401 },
    );
  }

  const isValid = verifyPassword(password, user.password_hash);

  if (!isValid) {
    return NextResponse.json(
      { ok: false, message: "Invalid credentials." },
      { status: 401 },
    );
  }

  const token = createSessionToken({ userId: user.id, username: user.username });

  const response = NextResponse.json({ ok: true });

  response.cookies.set(getSessionCookieName(), token, getSessionCookieOptions());

  return response;
}
