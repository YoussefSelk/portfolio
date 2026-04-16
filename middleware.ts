import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function hidden() {
  return new NextResponse("Not Found", { status: 404 });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/studio")) {
    return hidden();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const hasSessionCookie = Boolean(request.cookies.get("admin_session")?.value);

    if (!hasSessionCookie) {
      return hidden();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/studio/:path*"],
};
