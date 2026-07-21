import { NextResponse } from "next/server";
import { isRecordingPersona, type RecordingPersona } from "@/lib/recordableItems";
import {
  deleteRecording,
  readManifest,
  saveRecording,
  updateReviewStatus,
} from "@/lib/recordingsManifest";
import type { ReviewStatus } from "@/types/domain";

/**
 * API voor de opnamestudio (ARCHITECTUUR-OPNAMESTUDIO.md). Schrijft naar de
 * lokale schijf via src/lib/recordingsManifest.ts — draai dit dus lokaal
 * (`npm run dev`), niet op Vercel (read-only filesystem daar).
 */

export const runtime = "nodejs";

// Alleen simpele, veilige item-ids toestaan — dit wordt gebruikt in
// bestandsnamen, dus geen pad-traversal of rare tekens.
const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

const REVIEW_STATUSES_FROM_STUDIO: ReviewStatus[] = ["TE_REVIEWEN", "GOEDGEKEURD", "AFGEKEURD"];

export async function GET() {
  const manifest = await readManifest();
  return NextResponse.json({ manifest });
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const itemId = formData.get("itemId");
  const persona = formData.get("persona");
  const audio = formData.get("audio");

  if (typeof itemId !== "string" || !SAFE_ID_PATTERN.test(itemId)) {
    return NextResponse.json({ error: "Ongeldig itemId." }, { status: 400 });
  }
  if (typeof persona !== "string" || !isRecordingPersona(persona)) {
    return NextResponse.json({ error: "Ongeldige persona." }, { status: 400 });
  }
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Geen audiobestand ontvangen." }, { status: 400 });
  }

  const arrayBuffer = await audio.arrayBuffer();
  const entry = await saveRecording({
    itemId,
    persona: persona as RecordingPersona,
    audio: Buffer.from(arrayBuffer),
    mimeType: audio.type || "audio/webm",
  });

  return NextResponse.json({ entry });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    itemId?: string;
    persona?: string;
    reviewStatus?: string;
  } | null;

  const itemId = body?.itemId;
  const persona = body?.persona;
  const reviewStatus = body?.reviewStatus;

  if (typeof itemId !== "string" || !SAFE_ID_PATTERN.test(itemId)) {
    return NextResponse.json({ error: "Ongeldig itemId." }, { status: 400 });
  }
  if (typeof persona !== "string" || !isRecordingPersona(persona)) {
    return NextResponse.json({ error: "Ongeldige persona." }, { status: 400 });
  }
  if (
    typeof reviewStatus !== "string" ||
    !REVIEW_STATUSES_FROM_STUDIO.includes(reviewStatus as ReviewStatus)
  ) {
    return NextResponse.json({ error: "Ongeldige reviewstatus." }, { status: 400 });
  }

  const entry = await updateReviewStatus(itemId, persona as RecordingPersona, reviewStatus as ReviewStatus);
  if (!entry) {
    return NextResponse.json({ error: "Opname niet gevonden." }, { status: 404 });
  }
  return NextResponse.json({ entry });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as { itemId?: string; persona?: string } | null;
  const itemId = body?.itemId;
  const persona = body?.persona;

  if (typeof itemId !== "string" || !SAFE_ID_PATTERN.test(itemId)) {
    return NextResponse.json({ error: "Ongeldig itemId." }, { status: 400 });
  }
  if (typeof persona !== "string" || !isRecordingPersona(persona)) {
    return NextResponse.json({ error: "Ongeldige persona." }, { status: 400 });
  }

  await deleteRecording(itemId, persona as RecordingPersona);
  return NextResponse.json({ ok: true });
}
