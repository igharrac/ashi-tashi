import { NextResponse } from "next/server";
import {
  addCategory,
  addSentence,
  deleteCategory,
  deleteSentence,
  readDailySentenceContent,
  updateCategory,
  updateSentence,
} from "@/lib/dailySentenceContentStore";

/**
 * CRUD-API voor de Dagelijkse-zinnen-content (categorieën + zinnen) — draai
 * dit lokaal (`npm run dev`), niet op Vercel (read-only filesystem daar, zie
 * dailySentenceContentStore.ts). Zit achter dezelfde studio-wachtwoordgate
 * als de rest van /api/studio/* (middleware.ts).
 */
export const runtime = "nodejs";

function isMutationError(value: unknown): value is { error: string } {
  return typeof value === "object" && value !== null && "error" in value;
}

export async function GET() {
  const content = await readDailySentenceContent();
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { kind?: "category"; titleNl?: string; emoji?: string }
    | { kind?: "sentence"; categorySlug?: string; translationNl?: string; contextNl?: string; emoji?: string }
    | null;

  if (!body) return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });

  if (body.kind === "category") {
    const result = await addCategory(body.titleNl ?? "", body.emoji ?? "");
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ category: result });
  }

  if (body.kind === "sentence") {
    const { categorySlug, translationNl, contextNl, emoji } = body as {
      categorySlug?: string;
      translationNl?: string;
      contextNl?: string;
      emoji?: string;
    };
    if (typeof categorySlug !== "string") {
      return NextResponse.json({ error: "Categorie is verplicht." }, { status: 400 });
    }
    const result = await addSentence({
      categorySlug,
      translationNl: translationNl ?? "",
      contextNl: contextNl ?? "",
      emoji: emoji ?? "",
    });
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ sentence: result });
  }

  return NextResponse.json({ error: "Onbekend soort item." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { kind?: "category"; slug?: string; titleNl?: string; emoji?: string }
    | { kind?: "sentence"; id?: string; translationNl?: string; contextNl?: string; emoji?: string }
    | null;

  if (!body) return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });

  if (body.kind === "category") {
    const { slug, titleNl, emoji } = body as { slug?: string; titleNl?: string; emoji?: string };
    if (typeof slug !== "string") return NextResponse.json({ error: "Slug is verplicht." }, { status: 400 });
    const result = await updateCategory(slug, { titleNl, emoji });
    if (result === null) return NextResponse.json({ error: "Categorie niet gevonden." }, { status: 404 });
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ category: result });
  }

  if (body.kind === "sentence") {
    const { id, translationNl, contextNl, emoji } = body as {
      id?: string;
      translationNl?: string;
      contextNl?: string;
      emoji?: string;
    };
    if (typeof id !== "string") return NextResponse.json({ error: "Id is verplicht." }, { status: 400 });
    const result = await updateSentence(id, { translationNl, contextNl, emoji });
    if (result === null) return NextResponse.json({ error: "Zin niet gevonden." }, { status: 404 });
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ sentence: result });
  }

  return NextResponse.json({ error: "Onbekend soort item." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { kind?: "category"; slug?: string }
    | { kind?: "sentence"; id?: string }
    | null;

  if (!body) return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });

  if (body.kind === "category") {
    const { slug } = body as { slug?: string };
    if (typeof slug !== "string") return NextResponse.json({ error: "Slug is verplicht." }, { status: 400 });
    const result = await deleteCategory(slug);
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  }

  if (body.kind === "sentence") {
    const { id } = body as { id?: string };
    if (typeof id !== "string") return NextResponse.json({ error: "Id is verplicht." }, { status: 400 });
    const result = await deleteSentence(id);
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Onbekend soort item." }, { status: 400 });
}
