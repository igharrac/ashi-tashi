import { NextResponse } from "next/server";
import {
  addConversation,
  deleteConversation,
  readConversationsContent,
  updateConversationMeta,
  updateConversationSteps,
  type ConversationStepInput,
} from "@/lib/conversationsStore";

/**
 * CRUD-API voor de Gesprekken-content — draai dit lokaal (`npm run dev`),
 * niet op Vercel (read-only filesystem daar, zie conversationsStore.ts).
 * Zit achter dezelfde studio-wachtwoordgate als de rest van /api/studio/*
 * (middleware.ts).
 */
export const runtime = "nodejs";

function isMutationError(value: unknown): value is { error: string } {
  return typeof value === "object" && value !== null && "error" in value;
}

export async function GET() {
  const content = await readConversationsContent();
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { kind?: "conversation"; titleNl?: string; emoji?: string; teaser?: string }
    | null;

  if (!body) return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });

  if (body.kind === "conversation") {
    const result = await addConversation({
      titleNl: body.titleNl ?? "",
      emoji: body.emoji ?? "",
      teaser: body.teaser ?? "",
    });
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ conversation: result });
  }

  return NextResponse.json({ error: "Onbekend soort item." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { kind?: "meta"; id?: string; titleNl?: string; emoji?: string; teaser?: string }
    | { kind?: "steps"; id?: string; steps?: ConversationStepInput[] }
    | null;

  if (!body) return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });

  if (body.kind === "meta") {
    const { id, titleNl, emoji, teaser } = body as { id?: string; titleNl?: string; emoji?: string; teaser?: string };
    if (typeof id !== "string") return NextResponse.json({ error: "Id is verplicht." }, { status: 400 });
    const result = await updateConversationMeta(id, { titleNl, emoji, teaser });
    if (result === null) return NextResponse.json({ error: "Gesprek niet gevonden." }, { status: 404 });
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ conversation: result });
  }

  if (body.kind === "steps") {
    const { id, steps } = body as { id?: string; steps?: ConversationStepInput[] };
    if (typeof id !== "string") return NextResponse.json({ error: "Id is verplicht." }, { status: 400 });
    if (!Array.isArray(steps)) return NextResponse.json({ error: "Stappen zijn verplicht." }, { status: 400 });
    const result = await updateConversationSteps(id, steps);
    if (result === null) return NextResponse.json({ error: "Gesprek niet gevonden." }, { status: 404 });
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ conversation: result });
  }

  return NextResponse.json({ error: "Onbekend soort item." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  if (!body || typeof body.id !== "string") {
    return NextResponse.json({ error: "Id is verplicht." }, { status: 400 });
  }
  const result = await deleteConversation(body.id);
  if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
