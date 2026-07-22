import { NextResponse } from "next/server";
import { readSpellings, setSpelling } from "@/lib/wordSpellings";
import { regeneratePublicCatalog } from "@/lib/publicCatalogSnapshot";

/**
 * API voor de fonetische/Latijnse spelling per woord (los van de
 * audio-opnames, zie src/lib/wordSpellings.ts). Zelfde bescherming als
 * /api/studio/recordings (via middleware.ts): alleen lokaal, achter het
 * studio-wachtwoord.
 */
export const runtime = "nodejs";

const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export async function GET() {
  const spellings = await readSpellings();
  return NextResponse.json({ spellings });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    itemId?: string;
    phoneticSpelling?: string;
  } | null;

  const itemId = body?.itemId;
  const phoneticSpelling = body?.phoneticSpelling;

  if (typeof itemId !== "string" || !SAFE_ID_PATTERN.test(itemId)) {
    return NextResponse.json({ error: "Ongeldig itemId." }, { status: 400 });
  }
  if (typeof phoneticSpelling !== "string") {
    return NextResponse.json({ error: "Ongeldige spelling." }, { status: 400 });
  }

  const spellings = await setSpelling(itemId, phoneticSpelling);
  await regeneratePublicCatalog();
  return NextResponse.json({ spellings });
}
