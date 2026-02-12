import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and auth API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth/")) {
    // If already authenticated and visiting login page, redirect to admin
    if (pathname === "/admin/login") {
      const session = await getIronSession<SessionData>(
        request,
        NextResponse.next(),
        sessionOptions
      );
      if (session.isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return NextResponse.next();
  }

  // Protect all /admin/* routes
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  );

  if (!session.isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
