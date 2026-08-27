import type { CategoryDefinition } from "@/lib/contentCatalog";

/**
 * Bewerkbare woordcategorieën (alle categorieën BEHALVE "Dieren", zie
 * contentCatalog.ts) — content zelf verplaatst van vaste code naar
 * bewerkbare data: `data/words-content.json` (bewerkbaar via de
 * opnamestudio, src/lib/wordsContentStore.ts) en de statische snapshot
 * `public/words-content.json` die de app runtime leest (zie
 * wordsContentClient.ts). Dit bestand bevat alleen de gedeelde types + een
 * pure mapper-functie — geen hardcoded content, zelfde patroon als
 * practiceSentences.ts / dailySentences.ts.
 */

export interface WordDefinition {
  slug: string;
  translationNl: string;
  emoji: string;
}

export interface WordCategoryDefinition {
  slug: string;
  levelSlug: string;
  titleNl: string;
  emoji: string;
  teaser: string;
  words: WordDefinition[];
}

/** Pure mapper: zet een bewerkbare woordcategorie om naar het CategoryDefinition-formaat dat contentCatalog.ts/lessonCatalog.ts al kennen (zelfde vorm als DIEREN_CATEGORY). */
export function toCategoryDefinition(category: WordCategoryDefinition): CategoryDefinition {
  return {
    slug: category.slug,
    levelSlug: category.levelSlug,
    titleNl: category.titleNl,
    emoji: category.emoji,
    teaser: category.teaser,
    isImplemented: false,
    words: category.words.map((word) => [word.slug, word.translationNl, word.emoji]),
  };
}
