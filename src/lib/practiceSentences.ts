/**
 * "Oefenen"-zinnen — losstaand van Dagelijkse zinnen (dailySentences.ts):
 * dit is content specifiek voor kinderen op niveau B_OEFENEN of hoger (zie
 * experienceLevels.ts, ChildProfileData.level), met plaatje + korte zin,
 * verdeeld over categorieën (op verzoek: "allerlei categorieën" binnen dit
 * niveau, net als bij de gewone woordcategorieën).
 *
 * Zelfde regel als overal (hfst. 3, 54): Nederlandse zin + emoji-placeholder,
 * geen verzonnen Tashelhit-vertaling. `latinSpelling` hieronder is een
 * `[TASHELHIT_..._REVIEW_REQUIRED:...]`-placeholder — puur voor de studio-
 * weergave, in te vullen via opname. De ECHTE spelling die het kind te zien
 * krijgt komt (indien aanwezig) uit data/word-spellings.json, zie
 * useWordSpelling.ts/referenceAudio.ts; die is voor een aantal zinnen hier
 * al rechtstreeks door de ouder aangeleverd (dus geen placeholder nodig).
 *
 * "Ik heb honger", "Ik heb dorst" en "Ik ben moe" staan bewust NIET hier —
 * die zinnen bestaan al in dailySentences.ts (categorie basisbehoeften) en
 * zouden anders dubbel worden aangeboden; de aangeleverde spelling voor die
 * drie is aan de bestaande dailySentences-items gekoppeld.
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
  /**
   * Optioneel ARASAAC-pictogram (CC BY-NC-SA, naamsvermelding op
   * /ouder/overzicht) i.p.v. de kale emoji — rijkere, eenduidige illustratie
   * per zin. Rechtstreeks gelinkt naar static.arasaac.org (geen lokale
   * kopie, op verzoek): als die dienst ooit niet bereikbaar is valt de UI
   * terug op emoji (imageEmoji), nooit een kapot plaatje of vastlopen.
   */
  pictogramUrl?: string;
}

export const PRACTICE_SENTENCE_CATEGORIES: PracticeSentenceCategory[] = [
  { slug: "oefenen-acties", titleNl: "Acties & bewegen", emoji: "🚶" },
  { slug: "oefenen-verzoeken", titleNl: "Verzoeken", emoji: "🙏" },
  { slug: "oefenen-vragen", titleNl: "Vragen", emoji: "❓" },
  { slug: "oefenen-wensen", titleNl: "Wensen", emoji: "💭" },
  { slug: "oefenen-taal-leren", titleNl: "Taal leren", emoji: "🗣️" },
];

export const PRACTICE_SENTENCES: PracticeSentenceDefinition[] = [
  {
    id: "item-oefenen-naar-boven-lopen",
    categorySlug: "oefenen-acties",
    translationNl: "Naar boven lopen.",
    contextNl: "Als je de trap op gaat, zeg je:",
    emoji: "🪜",
    pictogramUrl: "https://static.arasaac.org/pictograms/2795/2795_500.png",
  },
  {
    id: "item-oefenen-ik-ga-naar-buiten",
    categorySlug: "oefenen-acties",
    translationNl: "Ik ga naar buiten.",
    contextNl: "Als je naar buiten gaat, zeg je:",
    emoji: "🚪",
    pictogramUrl: "https://static.arasaac.org/pictograms/2806/2806_500.png",
  },
  {
    id: "item-oefenen-ik-ga-naar-binnen",
    categorySlug: "oefenen-acties",
    translationNl: "Ik ga naar binnen.",
    contextNl: "Als je naar binnen gaat, zeg je:",
    emoji: "🏠",
    pictogramUrl: "https://static.arasaac.org/pictograms/2742/2742_500.png",
  },
  {
    id: "item-oefenen-we-gaan-eten",
    categorySlug: "oefenen-acties",
    translationNl: "We gaan eten.",
    contextNl: "Als het tijd is om te eten, zeg je:",
    emoji: "🍽️",
    pictogramUrl: "https://static.arasaac.org/pictograms/28675/28675_500.png",
  },

  // Verzoeken
  {
    id: "item-oefenen-geef-me-brood",
    categorySlug: "oefenen-verzoeken",
    translationNl: "Geef me brood.",
    contextNl: "Als je brood wilt, zeg je:",
    emoji: "🍞",
  },
  {
    id: "item-oefenen-geef-me-water",
    categorySlug: "oefenen-verzoeken",
    translationNl: "Geef me water.",
    contextNl: "Als je water wilt, zeg je:",
    emoji: "💧",
  },

  // Vragen
  {
    id: "item-oefenen-wat-zeg-je",
    categorySlug: "oefenen-vragen",
    translationNl: "Wat zeg je?",
    contextNl: "Als je iemand niet goed hoort, vraag je:",
    emoji: "👂",
  },
  {
    id: "item-oefenen-weet-niet-wat-je-zegt",
    categorySlug: "oefenen-vragen",
    translationNl: "Ik weet niet wat je zegt.",
    contextNl: "Als je iemand niet begrijpt, zeg je:",
    emoji: "🤷",
  },
  {
    id: "item-oefenen-waar-ben-je",
    categorySlug: "oefenen-vragen",
    translationNl: "Waar ben je?",
    contextNl: "Als je iemand zoekt, roep je:",
    emoji: "🔍",
  },
  {
    id: "item-oefenen-waar-ga-je-heen",
    categorySlug: "oefenen-vragen",
    translationNl: "Waar ga je heen?",
    contextNl: "Als je wilt weten waar iemand heen gaat, vraag je:",
    emoji: "🚶",
  },
  {
    id: "item-oefenen-wat-doe-je",
    categorySlug: "oefenen-vragen",
    translationNl: "Wat doe je?",
    contextNl: "Als je wilt weten wat iemand aan het doen is, vraag je:",
    emoji: "👀",
  },
  {
    id: "item-oefenen-wat-is-er",
    categorySlug: "oefenen-vragen",
    translationNl: "Wat is er?",
    contextNl: "Als je merkt dat er iets is, vraag je:",
    emoji: "❗",
  },
  {
    id: "item-oefenen-hoe-heet-je-meisje",
    categorySlug: "oefenen-vragen",
    translationNl: "Hoe heet je? (tegen een meisje)",
    contextNl: "Als je het aan een meisje vraagt, zeg je:",
    emoji: "🙋‍♀️",
  },
  {
    id: "item-oefenen-hoe-heet-je-jongen",
    categorySlug: "oefenen-vragen",
    translationNl: "Hoe heet je? (tegen een jongen)",
    contextNl: "Als je het aan een jongen vraagt, zeg je:",
    emoji: "🙋‍♂️",
  },
  {
    id: "item-oefenen-hoelaat-is-het",
    categorySlug: "oefenen-vragen",
    translationNl: "Hoe laat is het?",
    contextNl: "Als je wilt weten hoe laat het is, vraag je:",
    emoji: "🕐",
  },

  // Wensen
  {
    id: "item-oefenen-ik-wil-naar-huis",
    categorySlug: "oefenen-wensen",
    translationNl: "Ik wil naar huis.",
    contextNl: "Als je naar huis wilt, zeg je:",
    emoji: "🏠",
  },
  {
    id: "item-oefenen-ik-wil-niet",
    categorySlug: "oefenen-wensen",
    translationNl: "Ik wil niet.",
    contextNl: "Als je iets niet wilt, zeg je:",
    emoji: "🙅",
  },

  // Taal leren
  {
    id: "item-oefenen-tashelhit-leren",
    categorySlug: "oefenen-taal-leren",
    translationNl: "Ik wil Tashelhit leren.",
    contextNl: "Als je wilt vertellen dat je Tashelhit leert, zeg je:",
    emoji: "📚",
  },
  {
    id: "item-oefenen-tashelhit-praten-met-jou",
    categorySlug: "oefenen-taal-leren",
    translationNl: "Ik wil met jou Tashelhit praten.",
    contextNl: "Als je Tashelhit wilt oefenen met iemand, zeg je:",
    emoji: "🗣️",
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
  /** Zie PracticeSentenceDefinition.pictogramUrl — meegegeven zodat de opnamestudio (opnames/page.tsx) hetzelfde plaatje kan tonen als het kind straks ziet. */
  pictogramUrl?: string;
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
      pictogramUrl: sentence.pictogramUrl,
    };
  });
}
