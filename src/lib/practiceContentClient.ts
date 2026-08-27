import type { PracticeSentenceCategory, PracticeSentenceDefinition } from "@/lib/practiceSentences";

/**
 * Client-side cache rond /practice-content.json — een STATISCH bestand
 * onder public/ (niet een dynamische API-route), gegenereerd door de
 * opnamestudio (src/lib/practiceContentStore.ts). Zie dat bestand voor
 * waarom: zo werkt dit ook betrouwbaar op Vercel, niet alleen lokaal.
 * Zelfde patroon als referenceAudio.ts voor de audio-catalogus.
 */

export interface PracticeContent {
  categories: PracticeSentenceCategory[];
  sentences: PracticeSentenceDefinition[];
}

const EMPTY_CONTENT: PracticeContent = { categories: [], sentences: [] };

let cachePromise: Promise<PracticeContent> | null = null;

async function loadContent(): Promise<PracticeContent> {
  const response = await fetch("/practice-content.json", { cache: "no-store" });
  if (!response.ok) return EMPTY_CONTENT;
  return (await response.json()) as PracticeContent;
}

export function getPracticeContent(): Promise<PracticeContent> {
  if (!cachePromise) cachePromise = loadContent();
  return cachePromise;
}

export async function getPracticeSentenceCategories(): Promise<PracticeSentenceCategory[]> {
  const content = await getPracticeContent();
  return content.categories;
}

export async function getPracticeSentenceItems(): Promise<PracticeSentenceDefinition[]> {
  const content = await getPracticeContent();
  return content.sentences;
}

export async function getPracticeSentenceCategoryBySlug(
  slug: string,
): Promise<PracticeSentenceCategory | undefined> {
  const content = await getPracticeContent();
  return content.categories.find((category) => category.slug === slug);
}

/** Voor tests/hertesten of vlak na een studio-wijziging: forceer een nieuwe fetch bij de volgende aanroep. */
export function resetPracticeContentCache(): void {
  cachePromise = null;
}
