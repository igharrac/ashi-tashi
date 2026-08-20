import { NextResponse, type NextRequest } from "next/server";
import { SHARE_ACCESS_COOKIE, SHARE_TOKEN_QUERY_PARAM, verifyShareToken } from "@/lib/shareLink";

/**
 * Twee gescheiden gates:
 *
 * 1. Wachtwoord-gate voor de interne opnamestudio (/studio/*, /api/studio/*)
 *    — ongewijzigd, zie ARCHITECTUUR-OPNAMESTUDIO.md sectie 5.
 *
 * 2. Algemene toegangsgate voor de rest van de app (kind-ervaring), op
 *    verzoek toegevoegd zodat de app tijdelijk gedeeld kan worden via een
 *    deel-link (max 1 dag geldig, zie src/lib/shareLink.ts en
 *    /studio/deel-link). Deze gate is BEWUST ALLEEN actief als
 *    SHARE_LINK_SECRET is ingesteld — zonder die env var blijft de app
 *    volledig open, zoals voorheen. Dat voorkomt dat een vergeten env var na
 *    deploy iedereen (inclusief de eigenaar) per ongeluk buitensluit. Wie
 *    ingelogd is in de studio (studio_session) heeft altijd toegang, ook
 *    zonder deel-link.
 */

const STUDIO_COOKIE_NAME = "studio_session";
const PUBLIC_STUDIO_PATHS = ["/studio/login", "/api/studio/auth"];
const PUBLIC_PATHS = ["/geen-toegang"];

function isStudioPath(pathname: string): boolean {
  return pathname.startsWith("/studio") || pathname.startsWith("/api/studio");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (isStudioPath(pathname)) {
    if (PUBLIC_STUDIO_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    const expected = process.env.STUDIO_PASSWORD;
    const cookie = request.cookies.get(STUDIO_COOKIE_NAME)?.value;

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

  const shareSecret = process.env.SHARE_LINK_SECRET;
  if (!shareSecret) {
    return NextResponse.next();
  }

  // Eigenaar (ingelogd in de studio) heeft altijd toegang, ook zonder deel-link.
  const studioPassword = process.env.STUDIO_PASSWORD;
  const studioCookie = request.cookies.get(STUDIO_COOKIE_NAME)?.value;
  if (studioPassword && studioCookie === studioPassword) {
    return NextResponse.next();
  }

  const accessCookie = request.cookies.get(SHARE_ACCESS_COOKIE)?.value;
  if (accessCookie) {
    const result = await verifyShareToken(accessCookie, shareSecret);
    if (result.valid) {
      return NextResponse.next();
    }
  }

  const tokenParam = request.nextUrl.searchParams.get(SHARE_TOKEN_QUERY_PARAM);
  if (tokenParam) {
    const result = await verifyShareToken(tokenParam, shareSecret);
    if (result.valid && result.expiresAt) {
      const cleanUrl = new URL(request.nextUrl);
      cleanUrl.searchParams.delete(SHARE_TOKEN_QUERY_PARAM);
      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set(SHARE_ACCESS_COOKIE, tokenParam, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(result.expiresAt),
      });
      return response;
    }
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/geen-toegang", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
