import { NextResponse } from "next/server";
import { saveChildAttempt } from "@/lib/childAttempts";

/**
 * Slaat een gesproken poging van een kind op (src/lib/childAttempts.ts).
 * Publiek endpoint (geen wachtwoord — dit is de kind-app), maar schrijft
 * best-effort: een mislukte opslag (bv. read-only filesystem op Vercel) mag
 * de les nooit blokkeren, dus altijd een soepel antwoord teruggeven.
 */
export const runtime = "nodejs";

const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ ok: false });

  const childId = formData.get("childId");
  const itemId = formData.get("itemId");
  const audio = formData.get("audio");
  const hadReference = formData.get("hadReference") === "true";

  if (typeof childId !== "string" || !SAFE_ID_PATTERN.test(childId)) {
    return NextResponse.json({ ok: false });
  }
  if (typeof itemId !== "string" || !SAFE_ID_PATTERN.test(itemId)) {
    return NextResponse.json({ ok: false });
  }
  if (!(audio instanceof File)) {
    return NextResponse.json({ ok: false });
  }

  try {
    const arrayBuffer = await audio.arrayBuffer();
    await saveChildAttempt({
      childId,
      itemId,
      audio: Buffer.from(arrayBuffer),
      mimeType: audio.type || "audio/webm",
      hadReference,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, softError: true });
  }
}
