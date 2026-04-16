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
  if (!(await getAuthenticatedAdminFromRequest(request))) {
    return NextResponse.json(
      { ok: false, message: "Not Found" },
      { status: 404 },
    );
  }

  const content = await getPortfolioContent();

  return NextResponse.json({ ok: true, content });
}

export async function PUT(request: NextRequest) {
  if (!(await getAuthenticatedAdminFromRequest(request))) {
    return NextResponse.json(
      { ok: false, message: "Not Found" },
      { status: 404 },
    );
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

  try {
    const saved = await savePortfolioContent(body);

    revalidateTag(CONTENT_TAG, "max");
    revalidatePath("/");

    return NextResponse.json({ ok: true, content: saved });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown save error.";

    if (/EROFS|EPERM|EACCES|ENOSPC/i.test(message)) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Database write failed. Verify Supabase/Postgres credentials and permissions.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { ok: false, message: "Failed to save content." },
      { status: 500 },
    );
  }
}
