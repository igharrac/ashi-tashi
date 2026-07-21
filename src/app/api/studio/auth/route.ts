import { NextResponse } from "next/server";

/**
 * Eenvoudige wachtwoord-gate voor de opnamestudio (zie
 * ARCHITECTUUR-OPNAMESTUDIO.md, sectie 5). Bewust simpel: één gedeeld
 * wachtwoord via env var STUDIO_PASSWORD, geen aparte gebruikers. Prima voor
 * een interne tool die alleen jij gebruikt; kan later vervangen worden door
 * een echt authsysteem.
 */

export const runtime = "nodejs";

const COOKIE_NAME = "studio_session";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const expected = process.env.STUDIO_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "STUDIO_PASSWORD is niet ingesteld op de server. Zet deze in .env." },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const submitted = body?.password ?? "";

  if (submitted !== expected) {
    return NextResponse.json({ error: "Onjuist wachtwoord." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
