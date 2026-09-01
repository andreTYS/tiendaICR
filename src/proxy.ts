/**
 * Next.js 16 Proxy (formerly middleware.ts — renamed in v16).
 *
 * Order:
 *   1. Admin auth guard         → redirect to /admin/login if unauthenticated
 *   2. Admin role guard         → reject ADMIN-only sub-paths from EDITOR;
 *                                 punt CLIENT users to /cliente.
 *   3. Client portal auth guard → redirect to /cliente/login if unauthenticated
 *   4. Locale detection         → 302 to /en/* when accept-language prefers EN
 *
 * Decision: JWT strategy — no DB read needed here.
 */
import { auth } from "@/shared/lib/auth";
import { NextResponse } from "next/server";

const ADMIN_ONLY_PATHS = ["/admin/usuarios", "/admin/settings"];

export default auth(function proxy(req) {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const session = req.auth;
  const role = session?.user?.role as
    | "ADMIN"
    | "EDITOR"
    | "CLIENT"
    | undefined;

  // ── 1. Admin area ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      // CLIENT signed in? Push them to their portal instead of the admin login.
      if (role === "CLIENT") {
        return NextResponse.redirect(new URL("/cliente", nextUrl.origin));
      }
      return NextResponse.next();
    }

    if (!session) {
      const loginUrl = new URL("/admin/login", nextUrl.origin);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // CLIENT users never see the admin shell.
    if (role === "CLIENT") {
      return NextResponse.redirect(new URL("/cliente", nextUrl.origin));
    }

    const isAdminOnly = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
    if (isAdminOnly && role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/admin?error=forbidden", nextUrl.origin),
      );
    }

    return NextResponse.next();
  }

  // ── 2. Client portal ──────────────────────────────────────────────────────
  if (pathname.startsWith("/cliente")) {
    if (pathname === "/cliente/login") {
      // Already signed in? Skip the login page.
      if (session) {
        return NextResponse.redirect(new URL("/cliente", nextUrl.origin));
      }
      return NextResponse.next();
    }

    if (!session) {
      const loginUrl = new URL("/cliente/login", nextUrl.origin);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ── 3. Locale detection for public routes ────────────────────────────────
  if (!pathname.startsWith("/en")) {
    const langCookie = req.cookies.get("icr-lang")?.value;

    if (!langCookie) {
      const acceptLang = req.headers.get("accept-language") ?? "";
      const prefersEn = /^en\b/i.test(acceptLang);

      if (prefersEn) {
        const enTarget = pathname === "/" ? "/en" : `/en${pathname}`;
        const res = NextResponse.redirect(new URL(enTarget, nextUrl.origin));
        res.cookies.set("icr-lang", "en", {
          path: "/",
          maxAge: 365 * 24 * 60 * 60,
          sameSite: "lax",
        });
        return res;
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all requests except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - /assets/      (public logo files)
     * - /api/         (Next.js API routes — handled separately)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|assets/|api/).*)",
  ],
};
