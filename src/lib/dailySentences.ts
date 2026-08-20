/**
 * "Dagelijkse zinnen" — zinnen die in het dagelijks leven veel gebruikt
 * worden, los van de woordcategorieën (CATEGORIES in contentCatalog.ts).
 * Op verzoek: deze staan NIET achter de streng-opeenvolgende
 * categorie-keten (StepGrid.tsx) — een kind hoeft niet eerst Kleding
 * afgerond te hebben om "Ik heb dorst" te kunnen leren.
 *
 * BELANGRIJK — zelfde regel als overal (hfst. 3, 54): dit zijn Nederlandse
 * zinnen + een enkel, eenduidig emoji als visuele placeholder. Er is GEEN
 * Tashelhit-vertaling verzonnen; elke zin krijgt een
 * `[TASHELHIT_SENTENCE_REVIEW_REQUIRED:...]`-placeholder, klaar om
 * ingesproken en gereviewd te worden via de opnamestudio (nieuw
 * "Zinnen"-tabblad, /studio/opnames).
 *
 * `contextNl` is de korte Nederlandse aanleiding ("Als je dorst hebt, zeg
 * je:") die de situatie schetst — belangrijk omdat een los emoji bij een
 * hele zin (in tegenstelling tot bij een enkel woord als "hond") niet altijd
 * vanzelfsprekend is voor een kind dat nog niet leest. Elke zin heeft
 * bewust maar ÉÉN duidelijk beeld, geen samengestelde emoji-scènes (die
 * worden al snel als twee aparte dingen gelezen i.p.v. één samenhangend
 * beeld — zie review-opmerking bij het eerste ontwerp).
 */

export interface DailySentenceCategory {
  slug: string;
  titleNl: string;
  emoji: string;
}

export interface DailySentenceDefinition {
  id: string;
  categorySlug: string;
  translationNl: string;
  contextNl: string;
  emoji: string;
}

export const DAILY_SENTENCE_CATEGORIES: DailySentenceCategory[] = [
  { slug: "zin-begroeten", titleNl: "Begroeten en beleefdheid", emoji: "👋" },
  { slug: "zin-basisbehoeften", titleNl: "Basisbehoeften", emoji: "🍽️" },
  { slug: "zin-gevoelens", titleNl: "Gevoelens", emoji: "❤️" },
  { slug: "zin-vragen", titleNl: "Vragen", emoji: "❓" },
  { slug: "zin-routine", titleNl: "Dagelijkse routine", emoji: "🧼" },
  { slug: "zin-aanwijzen", titleNl: "Aanwijzen en benoemen", emoji: "👉" },
  { slug: "zin-instructies", titleNl: "Instructies van ouder naar kind", emoji: "👂" },
];

export const DAILY_SENTENCES: DailySentenceDefinition[] = [
  // Begroeten en beleefdheid
  { id: "item-zin-hallo", categorySlug: "zin-begroeten", translationNl: "Hallo.", contextNl: "Als je iemand ziet, zeg je:", emoji: "👋" },
  { id: "item-zin-dag-mama-papa", categorySlug: "zin-begroeten", translationNl: "Dag mama, dag papa.", contextNl: "Als je weggaat, zeg je:", emoji: "🙋" },
  { id: "item-zin-dank-je-wel", categorySlug: "zin-begroeten", translationNl: "Dank je wel.", contextNl: "Als je iets krijgt, zeg je:", emoji: "🙏" },
  { id: "item-zin-alsjeblieft", categorySlug: "zin-begroeten", translationNl: "Alsjeblieft.", contextNl: "Als je iets vraagt, zeg je:", emoji: "🤲" },
  { id: "item-zin-goedemorgen", categorySlug: "zin-begroeten", translationNl: "Goedemorgen.", contextNl: "Als je wakker wordt, zeg je:", emoji: "☀️" },
  { id: "item-zin-welterusten", categorySlug: "zin-begroeten", translationNl: "Welterusten.", contextNl: "Als je naar bed gaat, zeg je:", emoji: "🌙" },
  { id: "item-zin-tot-straks", categorySlug: "zin-begroeten", translationNl: "Tot straks.", contextNl: "Als je even weggaat, zeg je:", emoji: "🚪" },

  // Basisbehoeften
  { id: "item-zin-honger", categorySlug: "zin-basisbehoeften", translationNl: "Ik heb honger.", contextNl: "Als je trek hebt, zeg je:", emoji: "🍽️" },
  { id: "item-zin-dorst", categorySlug: "zin-basisbehoeften", translationNl: "Ik heb dorst.", contextNl: "Als je dorst hebt, zeg je:", emoji: "🥤" },
  { id: "item-zin-moe", categorySlug: "zin-basisbehoeften", translationNl: "Ik ben moe.", contextNl: "Als je moe bent, zeg je:", emoji: "😴" },
  { id: "item-zin-plassen", categorySlug: "zin-basisbehoeften", translationNl: "Ik moet plassen.", contextNl: "Als je naar de wc moet, zeg je:", emoji: "🚽" },
  { id: "item-zin-naar-buiten", categorySlug: "zin-basisbehoeften", translationNl: "Ik wil naar buiten.", contextNl: "Als je buiten wilt spelen, zeg je:", emoji: "🌳" },
  { id: "item-zin-naar-bed", categorySlug: "zin-basisbehoeften", translationNl: "Ik wil naar bed.", contextNl: "Als je slaperig bent, zeg je:", emoji: "🛏️" },

  // Gevoelens
  { id: "item-zin-blij", categorySlug: "zin-gevoelens", translationNl: "Ik ben blij.", contextNl: "Als je blij bent, zeg je:", emoji: "😊" },
  { id: "item-zin-verdrietig", categorySlug: "zin-gevoelens", translationNl: "Ik ben verdrietig.", contextNl: "Als je verdrietig bent, zeg je:", emoji: "😢" },
  { id: "item-zin-bang", categorySlug: "zin-gevoelens", translationNl: "Ik ben bang.", contextNl: "Als je bang bent, zeg je:", emoji: "😨" },
  { id: "item-zin-hou-van-jou", categorySlug: "zin-gevoelens", translationNl: "Ik hou van jou.", contextNl: "Als je iemand lief vindt, zeg je:", emoji: "❤️" },
  { id: "item-zin-boos", categorySlug: "zin-gevoelens", translationNl: "Ik ben boos.", contextNl: "Als je boos bent, zeg je:", emoji: "😠" },

  // Vragen
  { id: "item-zin-waar-is", categorySlug: "zin-vragen", translationNl: "Waar is...?", contextNl: "Als je iets zoekt, vraag je:", emoji: "🔍" },
  { id: "item-zin-wat-is-dit", categorySlug: "zin-vragen", translationNl: "Wat is dit?", contextNl: "Als je iets niet kent, vraag je:", emoji: "❓" },
  { id: "item-zin-mag-ik", categorySlug: "zin-vragen", translationNl: "Mag ik dit?", contextNl: "Als je iets wilt hebben, vraag je:", emoji: "🙋" },
  { id: "item-zin-kom-je", categorySlug: "zin-vragen", translationNl: "Kom je?", contextNl: "Als je samen wilt spelen, vraag je:", emoji: "🧑‍🤝‍🧑" },
  { id: "item-zin-ben-je-klaar", categorySlug: "zin-vragen", translationNl: "Ben je klaar?", contextNl: "Als je wilt weten of iemand klaar is, vraag je:", emoji: "⏳" },

  // Dagelijkse routine
  { id: "item-zin-tijd-om-te-eten", categorySlug: "zin-routine", translationNl: "Tijd om te eten.", contextNl: "Als het etenstijd is, zeg je:", emoji: "🍲" },
  { id: "item-zin-tijd-om-te-slapen", categorySlug: "zin-routine", translationNl: "Tijd om te slapen.", contextNl: "Als het bedtijd is, zeg je:", emoji: "🛌" },
  { id: "item-zin-handen-wassen", categorySlug: "zin-routine", translationNl: "Handen wassen.", contextNl: "Voordat je eet, zeg je:", emoji: "🧼" },
  { id: "item-zin-we-gaan-naar-buiten", categorySlug: "zin-routine", translationNl: "We gaan naar buiten.", contextNl: "Als jullie naar buiten gaan, zeg je:", emoji: "🚶" },
  { id: "item-zin-kleren-aandoen", categorySlug: "zin-routine", translationNl: "Kleren aandoen.", contextNl: "Voordat je naar buiten gaat, zeg je:", emoji: "👕" },

  // Aanwijzen en benoemen — vaste voorbeeldzinnen (geen live sjablonen)
  { id: "item-zin-ik-zie-een-hond", categorySlug: "zin-aanwijzen", translationNl: "Ik zie een hond.", contextNl: "Als je een dier ziet, zeg je:", emoji: "🐕" },
  { id: "item-zin-dit-is-mijn-hand", categorySlug: "zin-aanwijzen", translationNl: "Dit is mijn hand.", contextNl: "Als je jezelf aanwijst, zeg je:", emoji: "✋" },
  { id: "item-zin-ik-wil-water", categorySlug: "zin-aanwijzen", translationNl: "Ik wil water drinken.", contextNl: "Als je water wilt, zeg je:", emoji: "💧" },
  { id: "item-zin-de-bal-is-groot", categorySlug: "zin-aanwijzen", translationNl: "De bal is groot.", contextNl: "Als je iets beschrijft, zeg je:", emoji: "⚽" },

  // Instructies van ouder naar kind
  { id: "item-zin-kom-hier", categorySlug: "zin-instructies", translationNl: "Kom hier.", contextNl: "Als iemand je roept, hoor je:", emoji: "👉" },
  { id: "item-zin-kijk-eens", categorySlug: "zin-instructies", translationNl: "Kijk eens.", contextNl: "Als iemand iets laat zien, hoor je:", emoji: "👀" },
  { id: "item-zin-luister", categorySlug: "zin-instructies", translationNl: "Luister.", contextNl: "Als iemand aandacht vraagt, hoor je:", emoji: "👂" },
  { id: "item-zin-wacht-even", categorySlug: "zin-instructies", translationNl: "Wacht even.", contextNl: "Als je moet wachten, hoor je:", emoji: "🖐️" },
  { id: "item-zin-goed-gedaan", categorySlug: "zin-instructies", translationNl: "Goed gedaan!", contextNl: "Als je iets goed hebt gedaan, hoor je:", emoji: "👏" },
];

export function getDailySentenceItems(): DailySentenceDefinition[] {
  return DAILY_SENTENCES;
}

export function getDailySentenceCategoryBySlug(slug: string): DailySentenceCategory | undefined {
  return DAILY_SENTENCE_CATEGORIES.find((category) => category.slug === slug);
}

/** Vorm die de opnamestudio verwacht (zelfde velden als RecordableItem in recordableItems.ts, maar los gehouden i.p.v. het woorden-type te vermengen met zinnen). */
export interface RecordableSentenceItem {
  id: string;
  translationNl: string;
  latinSpelling: string;
  itemKind: "zin";
  imageEmoji: string;
  categorySlug: string;
  categoryTitleNl: string;
}

export function getRecordableSentences(): RecordableSentenceItem[] {
  return DAILY_SENTENCES.map((sentence) => {
    const category = getDailySentenceCategoryBySlug(sentence.categorySlug);
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
