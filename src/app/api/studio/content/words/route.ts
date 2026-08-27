import { NextResponse } from "next/server";
import {
  addCategory,
  addWord,
  deleteCategory,
  deleteWord,
  readWordsContent,
  updateCategory,
  updateWord,
} from "@/lib/wordsContentStore";

/**
 * CRUD-API voor de bewerkbare woordcategorieën ("Dieren" niet inbegrepen,
 * zie contentCatalog.ts / wordsContentStore.ts) — draai dit lokaal
 * (`npm run dev`), niet op Vercel (read-only filesystem daar). Zit achter
 * dezelfde studio-wachtwoordgate als de rest van /api/studio/*
 * (middleware.ts).
 */
export const runtime = "nodejs";

function isMutationError(value: unknown): value is { error: string } {
  return typeof value === "object" && value !== null && "error" in value;
}

export async function GET() {
  const content = await readWordsContent();
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { kind?: "category"; levelSlug?: string; titleNl?: string; emoji?: string; teaser?: string }
    | { kind?: "word"; categorySlug?: string; translationNl?: string; emoji?: string }
    | null;

  if (!body) return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });

  if (body.kind === "category") {
    const { levelSlug, titleNl, emoji, teaser } = body as {
      levelSlug?: string;
      titleNl?: string;
      emoji?: string;
      teaser?: string;
    };
    if (typeof levelSlug !== "string") {
      return NextResponse.json({ error: "Level is verplicht." }, { status: 400 });
    }
    const result = await addCategory(levelSlug, titleNl ?? "", emoji ?? "", teaser ?? "");
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ category: result });
  }

  if (body.kind === "word") {
    const { categorySlug, translationNl, emoji } = body as {
      categorySlug?: string;
      translationNl?: string;
      emoji?: string;
    };
    if (typeof categorySlug !== "string") {
      return NextResponse.json({ error: "Categorie is verplicht." }, { status: 400 });
    }
    const result = await addWord(categorySlug, translationNl ?? "", emoji ?? "");
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ word: result });
  }

  return NextResponse.json({ error: "Onbekend soort item." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { kind?: "category"; slug?: string; titleNl?: string; emoji?: string; teaser?: string; levelSlug?: string }
    | { kind?: "word"; categorySlug?: string; wordSlug?: string; translationNl?: string; emoji?: string }
    | null;

  if (!body) return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });

  if (body.kind === "category") {
    const { slug, titleNl, emoji, teaser, levelSlug } = body as {
      slug?: string;
      titleNl?: string;
      emoji?: string;
      teaser?: string;
      levelSlug?: string;
    };
    if (typeof slug !== "string") return NextResponse.json({ error: "Slug is verplicht." }, { status: 400 });
    const result = await updateCategory(slug, { titleNl, emoji, teaser, levelSlug });
    if (result === null) return NextResponse.json({ error: "Categorie niet gevonden." }, { status: 404 });
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ category: result });
  }

  if (body.kind === "word") {
    const { categorySlug, wordSlug, translationNl, emoji } = body as {
      categorySlug?: string;
      wordSlug?: string;
      translationNl?: string;
      emoji?: string;
    };
    if (typeof categorySlug !== "string" || typeof wordSlug !== "string") {
      return NextResponse.json({ error: "Categorie en woord zijn verplicht." }, { status: 400 });
    }
    const result = await updateWord(categorySlug, wordSlug, { translationNl, emoji });
    if (result === null) return NextResponse.json({ error: "Woord niet gevonden." }, { status: 404 });
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ word: result });
  }

  return NextResponse.json({ error: "Onbekend soort item." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { kind?: "category"; slug?: string }
    | { kind?: "word"; categorySlug?: string; wordSlug?: string }
    | null;

  if (!body) return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });

  if (body.kind === "category") {
    const { slug } = body as { slug?: string };
    if (typeof slug !== "string") return NextResponse.json({ error: "Slug is verplicht." }, { status: 400 });
    const result = await deleteCategory(slug);
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  }

  if (body.kind === "word") {
    const { categorySlug, wordSlug } = body as { categorySlug?: string; wordSlug?: string };
    if (typeof categorySlug !== "string" || typeof wordSlug !== "string") {
      return NextResponse.json({ error: "Categorie en woord zijn verplicht." }, { status: 400 });
    }
    const result = await deleteWord(categorySlug, wordSlug);
    if (isMutationError(result)) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Onbekend soort item." }, { status: 400 });
}
