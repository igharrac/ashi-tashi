/**
 * "Dagelijkse zinnen" — zinnen die in het dagelijks leven veel gebruikt
 * worden, los van de woordcategorieën (CATEGORIES in contentCatalog.ts).
 * Op verzoek: deze staan NIET achter de streng-opeenvolgende
 * categorie-keten (StepGrid.tsx) — een kind hoeft niet eerst Kleding
 * afgerond te hebben om "Ik heb dorst" te kunnen leren.
 *
 * Op verzoek is de content zelf (categorieën + zinnen) VERPLAATST van vaste
 * code naar bewerkbare data: `data/daily-sentences-content.json` (bewerkbaar
 * via de opnamestudio, src/lib/dailySentenceContentStore.ts) en de
 * statische snapshot `public/daily-sentences-content.json` die de app
 * runtime leest (zie dailySentenceContentClient.ts). Dit bestand bevat
 * alleen nog de gedeelde types + een pure mapper-functie — geen hardcoded
 * content meer, net als practiceSentences.ts.
 *
 * BELANGRIJK — zelfde regel als overal (hfst. 3, 54): dit zijn Nederlandse
 * zinnen + een enkel, eenduidig emoji als visuele placeholder. Er is GEEN
 * Tashelhit-vertaling verzonnen; elke zin krijgt een
 * `[TASHELHIT_SENTENCE_REVIEW_REQUIRED:...]`-placeholder, klaar om
 * ingesproken en gereviewd te worden via de opnamestudio ("Zinnen"-
 * tabblad, /studio/opnames).
 *
 * `contextNl` is de korte Nederlandse aanleiding ("Als je dorst hebt, zeg
 * je:") die de situatie schetst — belangrijk omdat een los emoji bij een
 * hele zin (in tegenstelling tot bij een enkel woord als "hond") niet altijd
 * vanzelfsprekend is voor een kind dat nog niet leest. Elke zin heeft
 * bewust maar ÉÉN duidelijk beeld, geen samengestelde emoji-scènes.
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

/** Zelfde vorm als RecordablePracticeSentenceItem (practiceSentences.ts) — bewust los gehouden i.p.v. gedeeld type, voorkomt een import-cyclus tussen de twee contentbestanden. */
export interface RecordableSentenceItem {
  id: string;
  translationNl: string;
  latinSpelling: string;
  itemKind: "zin";
  imageEmoji: string;
  categorySlug: string;
  categoryTitleNl: string;
}

/** Pure mapper, geen dataverzoek — de aanroeper geeft de zin + (indien gevonden) bijbehorende categorie mee. */
export function toRecordableSentence(
  sentence: DailySentenceDefinition,
  category: DailySentenceCategory | undefined,
): RecordableSentenceItem {
  return {
    id: sentence.id,
    translationNl: sentence.translationNl,
    latinSpelling: `[TASHELHIT_SENTENCE_REVIEW_REQUIRED:${sentence.id}]`,
    itemKind: "zin" as const,
    imageEmoji: sentence.emoji,
    categorySlug: sentence.categorySlug,
    categoryTitleNl: category?.titleNl ?? sentence.categorySlug,
  };
}
