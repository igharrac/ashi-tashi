import { promises as fs } from "fs";
import path from "path";
import type { DailySentenceCategory, DailySentenceDefinition } from "@/lib/dailySentences";

/**
 * Server-only opslag voor de Dagelijkse-zinnen-content (categorieën + zinnen)
 * — zelfde patroon als practiceContentStore.ts (op verzoek verplaatst van
 * vaste code naar bewerkbare data, zodat labels en items via de
 * opnamestudio aan te passen zijn). `data/daily-sentences-content.json` is
 * de bewerkbare bron (lokaal, via `npm run dev`), `public/daily-sentences-
 * content.json` is de statische snapshot die de gedeployde (read-only) app
 * en de kind-schermen echt lezen — zie regeneratePublicDailySentenceContent
 * hieronder.
 */

export interface DailySentenceContent {
  categories: DailySentenceCategory[];
  sentences: DailySentenceDefinition[];
}

const CONTENT_PATH = path.join(process.cwd(), "data", "daily-sentences-content.json");
const SNAPSHOT_PATH = path.join(process.cwd(), "public", "daily-sentences-content.json");

const EMPTY_CONTENT: DailySentenceContent = { categories: [], sentences: [] };

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return typeof err === "object" && err !== null && "code" in err;
}

export async function readDailySentenceContent(): Promise<DailySentenceContent> {
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf-8");
    return JSON.parse(raw) as DailySentenceContent;
  } catch (err) {
    if (isErrnoException(err) && err.code === "ENOENT") return EMPTY_CONTENT;
    throw err;
  }
}

async function writeDailySentenceContent(content: DailySentenceContent): Promise<void> {
  await fs.mkdir(path.dirname(CONTENT_PATH), { recursive: true });
  await fs.writeFile(CONTENT_PATH, `${JSON.stringify(content, null, 2)}\n`, "utf-8");
}

/** Kopieert de bewerkbare data naar de statische public-snapshot — aanroepen na elke wijziging. */
export async function regeneratePublicDailySentenceContent(): Promise<void> {
  const content = await readDailySentenceContent();
  await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
  await fs.writeFile(SNAPSHOT_PATH, `${JSON.stringify(content, null, 2)}\n`, "utf-8");
}

function slugifyBase(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugifyCategory(titleNl: string): string {
  const base = slugifyBase(titleNl);
  return `zin-${base}`;
}

export interface CategoryMutationError {
  error: string;
}

export async function addCategory(
  titleNl: string,
  emoji: string,
): Promise<DailySentenceCategory | CategoryMutationError> {
  const trimmedTitle = titleNl.trim();
  const trimmedEmoji = emoji.trim();
  if (!trimmedTitle) return { error: "Naam is verplicht." };
  if (!trimmedEmoji) return { error: "Emoji is verplicht." };

  const content = await readDailySentenceContent();
  const baseSlug = slugifyCategory(trimmedTitle);
  let slug = baseSlug || `zin-${Date.now()}`;
  let suffix = 2;
  while (content.categories.some((category) => category.slug === slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const category: DailySentenceCategory = { slug, titleNl: trimmedTitle, emoji: trimmedEmoji };
  content.categories.push(category);
  await writeDailySentenceContent(content);
  await regeneratePublicDailySentenceContent();
  return category;
}

export async function updateCategory(
  slug: string,
  patch: { titleNl?: string; emoji?: string },
): Promise<DailySentenceCategory | null | CategoryMutationError> {
  const content = await readDailySentenceContent();
  const category = content.categories.find((c) => c.slug === slug);
  if (!category) return null;

  if (patch.titleNl !== undefined) {
    const trimmed = patch.titleNl.trim();
    if (!trimmed) return { error: "Naam is verplicht." };
    category.titleNl = trimmed;
  }
  if (patch.emoji !== undefined) {
    const trimmed = patch.emoji.trim();
    if (!trimmed) return { error: "Emoji is verplicht." };
    category.emoji = trimmed;
  }

  await writeDailySentenceContent(content);
  await regeneratePublicDailySentenceContent();
  return category;
}

export async function deleteCategory(slug: string): Promise<{ ok: true } | CategoryMutationError> {
  const content = await readDailySentenceContent();
  const hasItems = content.sentences.some((sentence) => sentence.categorySlug === slug);
  if (hasItems) {
    return { error: "Verwijder eerst alle zinnen in deze categorie voordat je de categorie zelf verwijdert." };
  }
  const nextCategories = content.categories.filter((category) => category.slug !== slug);
  if (nextCategories.length === content.categories.length) return { error: "Categorie niet gevonden." };

  content.categories = nextCategories;
  await writeDailySentenceContent(content);
  await regeneratePublicDailySentenceContent();
  return { ok: true };
}

export interface SentenceMutationError {
  error: string;
}

export async function addSentence(input: {
  categorySlug: string;
  translationNl: string;
  contextNl: string;
  emoji: string;
}): Promise<DailySentenceDefinition | SentenceMutationError> {
  const translationNl = input.translationNl.trim();
  const contextNl = input.contextNl.trim();
  const emoji = input.emoji.trim();
  if (!translationNl) return { error: "Zin is verplicht." };
  if (!contextNl) return { error: "Context is verplicht." };
  if (!emoji) return { error: "Emoji is verplicht." };

  const content = await readDailySentenceContent();
  if (!content.categories.some((category) => category.slug === input.categorySlug)) {
    return { error: "Categorie niet gevonden." };
  }

  const baseId = `item-zin-${slugifyBase(translationNl)}`;
  let id = baseId;
  let suffix = 2;
  while (content.sentences.some((sentence) => sentence.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  const sentence: DailySentenceDefinition = {
    id,
    categorySlug: input.categorySlug,
    translationNl,
    contextNl,
    emoji,
  };
  content.sentences.push(sentence);
  await writeDailySentenceContent(content);
  await regeneratePublicDailySentenceContent();
  return sentence;
}

export async function updateSentence(
  id: string,
  patch: { translationNl?: string; contextNl?: string; emoji?: string },
): Promise<DailySentenceDefinition | null | SentenceMutationError> {
  const content = await readDailySentenceContent();
  const sentence = content.sentences.find((s) => s.id === id);
  if (!sentence) return null;

  if (patch.translationNl !== undefined) {
    const trimmed = patch.translationNl.trim();
    if (!trimmed) return { error: "Zin is verplicht." };
    sentence.translationNl = trimmed;
  }
  if (patch.contextNl !== undefined) {
    const trimmed = patch.contextNl.trim();
    if (!trimmed) return { error: "Context is verplicht." };
    sentence.contextNl = trimmed;
  }
  if (patch.emoji !== undefined) {
    const trimmed = patch.emoji.trim();
    if (!trimmed) return { error: "Emoji is verplicht." };
    sentence.emoji = trimmed;
  }

  await writeDailySentenceContent(content);
  await regeneratePublicDailySentenceContent();
  return sentence;
}

export async function deleteSentence(id: string): Promise<{ ok: true } | SentenceMutationError> {
  const content = await readDailySentenceContent();
  const nextSentences = content.sentences.filter((sentence) => sentence.id !== id);
  if (nextSentences.length === content.sentences.length) return { error: "Zin niet gevonden." };

  content.sentences = nextSentences;
  await writeDailySentenceContent(content);
  await regeneratePublicDailySentenceContent();
  return { ok: true };
}
