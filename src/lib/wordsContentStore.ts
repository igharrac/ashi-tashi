import { promises as fs } from "fs";
import path from "path";
import { LEVELS } from "@/lib/contentCatalog";
import type { WordCategoryDefinition, WordDefinition } from "@/lib/wordsContent";

/**
 * Server-only opslag voor de bewerkbare woordcategorieën (alle categorieën
 * BEHALVE "Dieren", zie contentCatalog.ts DIEREN_CATEGORY) — zelfde patroon
 * als practiceContentStore.ts / dailySentenceContentStore.ts.
 * `data/words-content.json` is de bewerkbare bron (lokaal, via
 * `npm run dev`), `public/words-content.json` is de statische snapshot die
 * de gedeployde (read-only) app en de kind-schermen echt lezen — zie
 * regeneratePublicWordsContent hieronder.
 */

export interface WordsContent {
  categories: WordCategoryDefinition[];
}

const CONTENT_PATH = path.join(process.cwd(), "data", "words-content.json");
const SNAPSHOT_PATH = path.join(process.cwd(), "public", "words-content.json");

const EMPTY_CONTENT: WordsContent = { categories: [] };

/** "Dieren" is met opzet nooit onderdeel van deze bewerkbare data (zie contentCatalog.ts) — gereserveerd, mag niet als nieuwe/bestaande slug hier voorkomen. */
const RESERVED_CATEGORY_SLUG = "dieren";

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return typeof err === "object" && err !== null && "code" in err;
}

export async function readWordsContent(): Promise<WordsContent> {
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf-8");
    return JSON.parse(raw) as WordsContent;
  } catch (err) {
    if (isErrnoException(err) && err.code === "ENOENT") return EMPTY_CONTENT;
    throw err;
  }
}

async function writeWordsContent(content: WordsContent): Promise<void> {
  await fs.mkdir(path.dirname(CONTENT_PATH), { recursive: true });
  await fs.writeFile(CONTENT_PATH, `${JSON.stringify(content, null, 2)}\n`, "utf-8");
}

/** Kopieert de bewerkbare data naar de statische public-snapshot — aanroepen na elke wijziging. */
export async function regeneratePublicWordsContent(): Promise<void> {
  const content = await readWordsContent();
  await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
  await fs.writeFile(SNAPSHOT_PATH, `${JSON.stringify(content, null, 2)}\n`, "utf-8");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CategoryMutationError {
  error: string;
}

export async function addCategory(
  levelSlug: string,
  titleNl: string,
  emoji: string,
  teaser: string,
): Promise<WordCategoryDefinition | CategoryMutationError> {
  const trimmedTitle = titleNl.trim();
  const trimmedEmoji = emoji.trim();
  const trimmedTeaser = teaser.trim();
  if (!trimmedTitle) return { error: "Naam is verplicht." };
  if (!trimmedEmoji) return { error: "Emoji is verplicht." };
  if (!trimmedTeaser) return { error: "Korte omschrijving is verplicht." };
  if (!LEVELS.some((level) => level.slug === levelSlug)) return { error: "Level niet gevonden." };

  const content = await readWordsContent();
  const baseSlug = slugify(trimmedTitle) || `categorie-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 2;
  while (slug === RESERVED_CATEGORY_SLUG || content.categories.some((category) => category.slug === slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const category: WordCategoryDefinition = {
    slug,
    levelSlug,
    titleNl: trimmedTitle,
    emoji: trimmedEmoji,
    teaser: trimmedTeaser,
    words: [],
  };
  content.categories.push(category);
  await writeWordsContent(content);
  await regeneratePublicWordsContent();
  return category;
}

export async function updateCategory(
  slug: string,
  patch: { titleNl?: string; emoji?: string; teaser?: string; levelSlug?: string },
): Promise<WordCategoryDefinition | null | CategoryMutationError> {
  if (slug === RESERVED_CATEGORY_SLUG) return { error: "Dieren is niet aanpasbaar via de studio." };

  const content = await readWordsContent();
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
  if (patch.teaser !== undefined) {
    const trimmed = patch.teaser.trim();
    if (!trimmed) return { error: "Korte omschrijving is verplicht." };
    category.teaser = trimmed;
  }
  if (patch.levelSlug !== undefined) {
    if (!LEVELS.some((level) => level.slug === patch.levelSlug)) return { error: "Level niet gevonden." };
    category.levelSlug = patch.levelSlug;
  }

  await writeWordsContent(content);
  await regeneratePublicWordsContent();
  return category;
}

export async function deleteCategory(slug: string): Promise<{ ok: true } | CategoryMutationError> {
  if (slug === RESERVED_CATEGORY_SLUG) return { error: "Dieren is niet verwijderbaar via de studio." };

  const content = await readWordsContent();
  const category = content.categories.find((c) => c.slug === slug);
  if (!category) return { error: "Categorie niet gevonden." };
  if (category.words.length > 0) {
    return { error: "Verwijder eerst alle woorden in deze categorie voordat je de categorie zelf verwijdert." };
  }

  content.categories = content.categories.filter((c) => c.slug !== slug);
  await writeWordsContent(content);
  await regeneratePublicWordsContent();
  return { ok: true };
}

export interface WordMutationError {
  error: string;
}

export async function addWord(
  categorySlug: string,
  translationNl: string,
  emoji: string,
): Promise<WordDefinition | WordMutationError> {
  if (categorySlug === RESERVED_CATEGORY_SLUG) return { error: "Dieren is niet aanpasbaar via de studio." };

  const trimmedTranslation = translationNl.trim();
  const trimmedEmoji = emoji.trim();
  if (!trimmedTranslation) return { error: "Woord is verplicht." };
  if (!trimmedEmoji) return { error: "Emoji is verplicht." };

  const content = await readWordsContent();
  const category = content.categories.find((c) => c.slug === categorySlug);
  if (!category) return { error: "Categorie niet gevonden." };

  const baseSlug = slugify(trimmedTranslation) || `woord-${Date.now()}`;
  let wordSlug = baseSlug;
  let suffix = 2;
  while (category.words.some((word) => word.slug === wordSlug)) {
    wordSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const word: WordDefinition = { slug: wordSlug, translationNl: trimmedTranslation, emoji: trimmedEmoji };
  category.words.push(word);
  await writeWordsContent(content);
  await regeneratePublicWordsContent();
  return word;
}

export async function updateWord(
  categorySlug: string,
  wordSlug: string,
  patch: { translationNl?: string; emoji?: string },
): Promise<WordDefinition | null | WordMutationError> {
  if (categorySlug === RESERVED_CATEGORY_SLUG) return { error: "Dieren is niet aanpasbaar via de studio." };

  const content = await readWordsContent();
  const category = content.categories.find((c) => c.slug === categorySlug);
  if (!category) return null;
  const word = category.words.find((w) => w.slug === wordSlug);
  if (!word) return null;

  if (patch.translationNl !== undefined) {
    const trimmed = patch.translationNl.trim();
    if (!trimmed) return { error: "Woord is verplicht." };
    word.translationNl = trimmed;
  }
  if (patch.emoji !== undefined) {
    const trimmed = patch.emoji.trim();
    if (!trimmed) return { error: "Emoji is verplicht." };
    word.emoji = trimmed;
  }

  await writeWordsContent(content);
  await regeneratePublicWordsContent();
  return word;
}

export async function deleteWord(categorySlug: string, wordSlug: string): Promise<{ ok: true } | WordMutationError> {
  if (categorySlug === RESERVED_CATEGORY_SLUG) return { error: "Dieren is niet aanpasbaar via de studio." };

  const content = await readWordsContent();
  const category = content.categories.find((c) => c.slug === categorySlug);
  if (!category) return { error: "Categorie niet gevonden." };
  const nextWords = category.words.filter((w) => w.slug !== wordSlug);
  if (nextWords.length === category.words.length) return { error: "Woord niet gevonden." };

  category.words = nextWords;
  await writeWordsContent(content);
  await regeneratePublicWordsContent();
  return { ok: true };
}
