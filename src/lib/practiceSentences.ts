/**
 * "Oefenen"-zinnen — losstaand van Dagelijkse zinnen (dailySentences.ts):
 * dit is content specifiek voor kinderen op niveau B_OEFENEN of hoger (zie
 * experienceLevels.ts, ChildProfileData.level), met plaatje + korte zin,
 * verdeeld over categorieën (op verzoek: "allerlei categorieën" binnen dit
 * niveau, net als bij de gewone woordcategorieën).
 *
 * Zelfde regel als overal (hfst. 3, 54): Nederlandse zin + emoji-placeholder,
 * geen verzonnen Tashelhit-vertaling. `latinSpelling` is een
 * `[TASHELHIT_..._REVIEW_REQUIRED:...]`-placeholder, in te vullen via de
 * opnamestudio (tabblad "Oefenen", src/app/studio/opnames/page.tsx).
 *
 * "Ik heb honger" staat bewust NIET hier — die zin bestaat al in
 * dailySentences.ts (categorie basisbehoeften) en zou anders dubbel worden
 * aangeboden.
 */

export interface PracticeSentenceCategory {
  slug: string;
  titleNl: string;
  emoji: string;
}

export interface PracticeSentenceDefinition {
  id: string;
  categorySlug: string;
  translationNl: string;
  contextNl: string;
  emoji: string;
}

export const PRACTICE_SENTENCE_CATEGORIES: PracticeSentenceCategory[] = [
  { slug: "oefenen-acties", titleNl: "Acties & bewegen", emoji: "🚶" },
];

export const PRACTICE_SENTENCES: PracticeSentenceDefinition[] = [
  {
    id: "item-oefenen-naar-boven-lopen",
    categorySlug: "oefenen-acties",
    translationNl: "Naar boven lopen.",
    contextNl: "Als je de trap op gaat, zeg je:",
    emoji: "🪜",
  },
  {
    id: "item-oefenen-ik-ga-naar-buiten",
    categorySlug: "oefenen-acties",
    translationNl: "Ik ga naar buiten.",
    contextNl: "Als je naar buiten gaat, zeg je:",
    emoji: "🚪",
  },
  {
    id: "item-oefenen-ik-ga-naar-binnen",
    categorySlug: "oefenen-acties",
    translationNl: "Ik ga naar binnen.",
    contextNl: "Als je naar binnen gaat, zeg je:",
    emoji: "🏠",
  },
  {
    id: "item-oefenen-we-gaan-eten",
    categorySlug: "oefenen-acties",
    translationNl: "We gaan eten.",
    contextNl: "Als het tijd is om te eten, zeg je:",
    emoji: "🍽️",
  },
];

export function getPracticeSentenceItems(): PracticeSentenceDefinition[] {
  return PRACTICE_SENTENCES;
}

export function getPracticeSentenceCategoryBySlug(slug: string): PracticeSentenceCategory | undefined {
  return PRACTICE_SENTENCE_CATEGORIES.find((category) => category.slug === slug);
}

/** Zelfde vorm als RecordableSentenceItem (dailySentences.ts) — bewust los gehouden i.p.v. gedeeld type, voorkomt een import-cyclus tussen de twee contentbestanden. */
export interface RecordablePracticeSentenceItem {
  id: string;
  translationNl: string;
  latinSpelling: string;
  itemKind: "zin";
  imageEmoji: string;
  categorySlug: string;
  categoryTitleNl: string;
}

export function getRecordablePracticeSentences(): RecordablePracticeSentenceItem[] {
  return PRACTICE_SENTENCES.map((sentence) => {
    const category = getPracticeSentenceCategoryBySlug(sentence.categorySlug);
    return {
      id: sentence.id,
      translationNl: sentence.translationNl,
      latinSpelling: `[TASHELHIT_SENTENCE_REVIEW_REQUIRED:${sentence.id}]`,
      itemKind: "zin" as const,
      imageEmoji: sentence.emoji,
      categorySlug: sentence.categorySlug,
      categoryTitleNl: category?.titleNl ?? sentence.categorySlug,
    };
  });
}
