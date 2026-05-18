import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
);

const PUBLIC_PATHS = ["/login", "/register", "/api/auth/login", "/api/auth/register"];
const ADMIN_PATHS = ["/admin", "/api/admin"];

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

function addSecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static assets
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("fitness_session")?.value;
  let payload: { id?: string; isAdmin?: boolean } | null = null;

  if (token) {
    try {
      const result = await jwtVerify(token, SECRET);
      payload = result.payload as { id?: string; isAdmin?: boolean };
    } catch {
      // Invalid token — treat as logged out
    }
  }

  const isLoggedIn = payload !== null;
  const isAdmin = payload?.isAdmin === true;

  // Redirect already-logged-in users away from login/register
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return addSecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
  }

  // Public paths — allow through (but still add security headers)
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Unauthenticated — redirect to login
  if (!isLoggedIn) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    // Clear any malformed cookie
    res.cookies.delete("fitness_session");
    return addSecurityHeaders(res);
  }

  // Admin-only routes — block non-admins
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isAdmin) {
      // API routes get a 403 JSON response; pages get a redirect
      if (pathname.startsWith("/api/")) {
        return addSecurityHeaders(
          NextResponse.json({ error: "אין לך הרשאת גישה" }, { status: 403 })
        );
      }
      return addSecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
