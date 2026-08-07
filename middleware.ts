// ============================================================
// Server-side route protection for the admin panel.
// Runs on the Edge runtime. Verifies the JWT session cookie for
// every /admin/* path except /admin/login, redirecting unauth'd
// users. API routes protect themselves (see lib/auth requireAdmin).
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "mihad_admin_session";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) return new Uint8Array();
  return new TextEncoder().encode(s);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page itself.
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;

  let authed = false;
  if (token) {
    try {
      const key = secret();
      if (key.length > 0) {
        await jwtVerify(token, key, { algorithms: ["HS256"] });
        authed = true;
      }
    } catch {
      authed = false;
    }
  }

  if (!authed) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect everything under /admin except /admin/login.
  matcher: ["/admin/:path*"],
};
