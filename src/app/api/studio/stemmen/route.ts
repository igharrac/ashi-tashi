import { NextResponse } from "next/server";
import { cancelJob, getCodeChanges, getJob, getOverview, publish, startJob, type ConvertPersona } from "@/lib/voiceJobs";
import { isRecordingPersona } from "@/lib/recordableItems";

/**
 * Stemconversie vanuit de studio (anonymize_voices.py). Alleen lokaal:
 * op Vercel is er geen Python/ffmpeg en geen schrijfbare schijf.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function notLocal() {
  if (process.env.VERCEL) {
    return NextResponse.json({ error: "Stemconversie kan alleen lokaal (npm run dev)." }, { status: 400 });
  }
  return null;
}

export async function GET() {
  const blocked = notLocal();
  if (blocked) return blocked;
  return NextResponse.json({ overview: await getOverview(), job: getJob(), codeChanges: await getCodeChanges() });
}

export async function POST(request: Request) {
  const blocked = notLocal();
  if (blocked) return blocked;
  const body = (await request.json().catch(() => null)) as { action?: string; personas?: unknown; includeCode?: boolean } | null;
  if (!body) return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });

  if (body.action === "start") {
    const personas = Array.isArray(body.personas)
      ? (body.personas.filter((p): p is ConvertPersona => typeof p === "string" && isRecordingPersona(p)))
      : [];
    const result = await startJob(personas);
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }
  if (body.action === "cancel") return NextResponse.json({ ok: cancelJob() });
  if (body.action === "publish") {
    const result = await publish(body.includeCode === true);
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  }
  return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
}
