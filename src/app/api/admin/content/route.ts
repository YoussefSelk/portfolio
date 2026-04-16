import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import {
  CONTENT_TAG,
  getPortfolioContent,
  savePortfolioContent,
} from "@/lib/cms/content-store";
import { getAuthenticatedAdminFromRequest } from "@/lib/auth/guard";
import type { PortfolioContent } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!getAuthenticatedAdminFromRequest(request)) {
    return NextResponse.json({ ok: false, message: "Not Found" }, { status: 404 });
  }

  const content = await getPortfolioContent();

  return NextResponse.json({ ok: true, content });
}

export async function PUT(request: NextRequest) {
  if (!getAuthenticatedAdminFromRequest(request)) {
    return NextResponse.json({ ok: false, message: "Not Found" }, { status: 404 });
  }

  let body: PortfolioContent;

  try {
    body = (await request.json()) as PortfolioContent;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const saved = await savePortfolioContent(body);

  revalidateTag(CONTENT_TAG, "max");
  revalidatePath("/");

  return NextResponse.json({ ok: true, content: saved });
}
