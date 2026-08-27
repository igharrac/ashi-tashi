/**
 * "Oefenen"-zinnen (Praktijkzinnen) — losstaand van Dagelijkse zinnen
 * (dailySentences.ts): content specifiek voor kinderen op niveau B_OEFENEN
 * of hoger (zie experienceLevels.ts, ChildProfileData.level), met plaatje +
 * korte zin, verdeeld over categorieën.
 *
 * Op verzoek is de content zelf (categorieën + zinnen) VERPLAATST van vaste
 * code naar bewerkbare data: `data/practice-content.json` (bewerkbaar via de
 * opnamestudio, src/lib/practiceContentStore.ts) en de statische snapshot
 * `public/practice-content.json` die de app runtime leest (zie
 * practiceContentClient.ts). Dit bestand bevat alleen nog de gedeelde types
 * + een pure mapper-functie — geen hardcoded content meer.
 *
 * Zelfde regel als overal (hfst. 3, 54): Nederlandse zin + emoji-placeholder,
 * geen verzonnen Tashelhit-vertaling. `latinSpelling` hieronder is een
 * `[TASHELHIT_..._REVIEW_REQUIRED:...]`-placeholder — puur voor de studio-
 * weergave, in te vullen via opname. De ECHTE spelling die het kind te zien
 * krijgt komt (indien aanwezig) uit data/word-spellings.json, zie
 * useWordSpelling.ts/referenceAudio.ts.
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

/** Pure mapper, geen dataverzoek — de aanroeper geeft de zin + (indien gevonden) bijbehorende categorie mee. */
export function toRecordablePracticeSentence(
  sentence: PracticeSentenceDefinition,
  category: PracticeSentenceCategory | undefined,
): RecordablePracticeSentenceItem {
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
}
