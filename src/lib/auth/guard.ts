import "server-only";

import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { findAdminUserById } from "@/lib/auth/db";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth/session";

function getActiveUserFromSessionToken(token: string | undefined) {
  const session = verifySessionToken(token);

  if (!session) {
    return null;
  }

  const user = findAdminUserById(session.userId);

  if (!user || user.is_active !== 1) {
    return null;
  }

  return user;
}

export async function getAuthenticatedAdminFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;

  return getActiveUserFromSessionToken(token);
}

export function getAuthenticatedAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  return getActiveUserFromSessionToken(token);
}

export async function requireAdminOrNotFound() {
  const user = await getAuthenticatedAdminFromCookies();

  if (!user) {
    notFound();
  }

  return user;
}
