import { NextResponse, type NextRequest } from "next/server";

/**
 * Wachtwoord-gate voor de interne opnamestudio (/studio/*, /api/studio/*).
 * Zie ARCHITECTUUR-OPNAMESTUDIO.md sectie 5 — bewust simpel gehouden.
 * De rest van de app (kinderen, ouders) blijft volledig open, hier niets aan
 * gewijzigd.
 */

const COOKIE_NAME = "studio_session";
const PUBLIC_STUDIO_PATHS = ["/studio/login", "/api/studio/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_STUDIO_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const expected = process.env.STUDIO_PASSWORD;
  const cookie = request.cookies.get(COOKIE_NAME)?.value;

  if (!expected || cookie !== expected) {
    if (pathname.startsWith("/api/studio")) {
      return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
    }
    const loginUrl = new URL("/studio/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/api/studio/:path*"],
};
