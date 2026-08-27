import type { DailySentenceCategory, DailySentenceDefinition } from "@/lib/dailySentences";

/**
 * Client-side cache rond /daily-sentences-content.json — een STATISCH
 * bestand onder public/ (niet een dynamische API-route), gegenereerd door
 * de opnamestudio (src/lib/dailySentenceContentStore.ts). Zie dat bestand
 * voor waarom: zo werkt dit ook betrouwbaar op Vercel, niet alleen lokaal.
 * Zelfde patroon als practiceContentClient.ts / referenceAudio.ts.
 */

export interface DailySentenceContent {
  categories: DailySentenceCategory[];
  sentences: DailySentenceDefinition[];
}

const EMPTY_CONTENT: DailySentenceContent = { categories: [], sentences: [] };

let cachePromise: Promise<DailySentenceContent> | null = null;

async function loadContent(): Promise<DailySentenceContent> {
  const response = await fetch("/daily-sentences-content.json", { cache: "no-store" });
  if (!response.ok) return EMPTY_CONTENT;
  return (await response.json()) as DailySentenceContent;
}

export function getDailySentenceContent(): Promise<DailySentenceContent> {
  if (!cachePromise) cachePromise = loadContent();
  return cachePromise;
}

export async function getDailySentenceCategories(): Promise<DailySentenceCategory[]> {
  const content = await getDailySentenceContent();
  return content.categories;
}

export async function getDailySentenceItems(): Promise<DailySentenceDefinition[]> {
  const content = await getDailySentenceContent();
  return content.sentences;
}

export async function getDailySentenceCategoryBySlug(
  slug: string,
): Promise<DailySentenceCategory | undefined> {
  const content = await getDailySentenceContent();
  return content.categories.find((category) => category.slug === slug);
}

/** Voor tests/hertesten of vlak na een studio-wijziging: forceer een nieuwe fetch bij de volgende aanroep. */
export function resetDailySentenceContentCache(): void {
  cachePromise = null;
}
