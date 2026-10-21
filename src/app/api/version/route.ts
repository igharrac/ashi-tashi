import { NextResponse } from "next/server";

/**
 * Welke commit draait er live? Vercel zet VERCEL_GIT_COMMIT_SHA bij elke
 * deploy. Wordt door de studio (Stemmen > Live-status) vergeleken met HEAD.
 * Bevat bewust niets anders dan het commit-nummer.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
