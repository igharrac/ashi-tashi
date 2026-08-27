import { DIEREN_CATEGORY, type CategoryDefinition } from "@/lib/contentCatalog";
import { toCategoryDefinition, type WordCategoryDefinition } from "@/lib/wordsContent";

/**
 * Client-side cache rond /words-content.json — een STATISCH bestand onder
 * public/ (niet een dynamische API-route), gegenereerd door de
 * opnamestudio (src/lib/wordsContentStore.ts). Zie dat bestand voor waarom:
 * zo werkt dit ook betrouwbaar op Vercel, niet alleen lokaal. Zelfde
 * patroon als practiceContentClient.ts / dailySentenceContentClient.ts.
 */

export interface WordsContent {
  categories: WordCategoryDefinition[];
}

const EMPTY_CONTENT: WordsContent = { categories: [] };

let cachePromise: Promise<WordsContent> | null = null;

async function loadContent(): Promise<WordsContent> {
  const response = await fetch("/words-content.json", { cache: "no-store" });
  if (!response.ok) return EMPTY_CONTENT;
  return (await response.json()) as WordsContent;
}

export function getWordsContent(): Promise<WordsContent> {
  if (!cachePromise) cachePromise = loadContent();
  return cachePromise;
}

/** Voor tests/hertesten of vlak na een studio-wijziging: forceer een nieuwe fetch bij de volgende aanroep. */
export function resetWordsContentCache(): void {
  cachePromise = null;
}

/**
 * "Dieren" + de bewerkbare woordcategorieën samengevoegd tot één
 * CategoryDefinition[] — precies wat contentCatalog.ts's
 * getCategoriesForLevel/getCategoryBySlug/buildCatalogItems en
 * lessonCatalog.ts nodig hebben. Dieren staat altijd eerst (zelfde volgorde
 * als de vroegere vaste CATEGORIES-array), zodat de streng-opeenvolgende
 * ontgrendeling (getCategoryUnlockStatuses) niet verandert.
 */
export function mergeCategories(content: WordsContent): CategoryDefinition[] {
  return [DIEREN_CATEGORY, ...content.categories.map(toCategoryDefinition)];
}
