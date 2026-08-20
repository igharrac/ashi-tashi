import type { ExerciseView, LessonView } from "@/types/domain";
import { CATEGORIES, getCatalogItems, getCategoryBySlug } from "@/lib/contentCatalog";
import { DEMO_REVIEW_NOTE } from "@/lib/demoData";
import { getDailySentenceItems } from "@/lib/dailySentences";

/**
 * Generieke lesopbouw voor elke categorie buiten "dieren" (die blijft op
 * zijn bestaande, handmatig samengestelde DIEREN_THEME in demoData.ts —
 * niet aangeraakt, om de al werkende/geteste 3x-flow daar niet te
 * verstoren). Op verzoek: elke categorie met genoeg ingesproken woorden
 * moet vanzelf speelbaar worden, te beginnen met Lichaam en Kleding.
 *
 * Eén oefening per woord (LUISTEREN_EN_HERKENNEN — bevat al plaatje, geluid
 * en opnemen in één scherm, zie ListenAndSpeak.tsx), geen zinnetjes-
 * afsluiting zoals bij dieren (die content bestaat nog niet per categorie).
 * De oefeningenlijst bevat hier bewust ALLE woorden van de categorie, ook
 * de nog niet ingesproken — de les/[lessonId]-pagina filtert al op
 * getItemIdsWithRecordings() zodat een kind nooit een niet-ingesproken
 * woord te zien krijgt (zie ARCHITECTUUR-OPNAMESTUDIO.md).
 */
const LESSON_ID_PREFIX = "lesson-";

/** Ondergrens voordat een categorie de moeite waard is als losse les (te weinig woorden voelt als een lege stap). */
export const MIN_RECORDED_WORDS_FOR_LESSON = 5;

export function lessonIdForCategory(categorySlug: string): string {
  return `${LESSON_ID_PREFIX}${categorySlug}`;
}

function categorySlugFromLessonId(lessonId: string): string | null {
  return lessonId.startsWith(LESSON_ID_PREFIX) ? lessonId.slice(LESSON_ID_PREFIX.length) : null;
}

function buildLessonForCategory(categorySlug: string): LessonView | null {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;

  const exercises: ExerciseView[] = getCatalogItems()
    .filter((item) => item.categorySlug === categorySlug)
    .map((item) => ({
      id: `exercise-listen-${item.id}`,
      type: "LUISTEREN_EN_HERKENNEN" as const,
      vocabularyItem: {
        id: item.id,
        translationNl: item.translationNl,
        latinSpelling: item.latinSpelling,
        reviewStatus: "TE_REVIEWEN" as const,
        reviewNote: DEMO_REVIEW_NOTE,
        imageAlt: `Illustratie van een ${item.translationNl}`,
        imageEmoji: item.emoji,
      },
    }));

  return {
    id: lessonIdForCategory(categorySlug),
    titleNl: category.titleNl,
    targetMinutes: Math.max(3, Math.round(exercises.length * 0.4)),
    exercises,
  };
}

/**
 * Losstaande "Dagelijkse zinnen" (dailySentences.ts) — op verzoek NIET
 * onderdeel van de streng-opeenvolgende categorie-keten (StepGrid.tsx):
 * deze zinnen horen niet bij één woordcategorie en moeten altijd
 * beschikbaar zijn zodra er genoeg van zijn ingesproken. Alle oefeningen
 * zijn NAZEGGEN (RepeatAfterMe toont bij itemKind "zin" een plaatje +
 * contextNl als aanleiding, zie RepeatAfterMe.tsx) — geen vergelijkbaar
 * "luister en herken"-scherm nodig zoals bij losse woorden.
 */
export const DAILY_SENTENCES_LESSON_ID = "lesson-dagelijkse-zinnen";

/** Lager dan MIN_RECORDED_WORDS_FOR_LESSON: zinnen zijn trager te produceren en hoeven niet met 5 tegelijk te komen om al de moeite waard te zijn. */
export const MIN_RECORDED_SENTENCES_FOR_LESSON = 3;

function buildDailySentencesLesson(): LessonView {
  const exercises: ExerciseView[] = getDailySentenceItems().map((sentence) => ({
    id: `exercise-zin-${sentence.id}`,
    type: "NAZEGGEN" as const,
    vocabularyItem: {
      id: sentence.id,
      translationNl: sentence.translationNl,
      contextNl: sentence.contextNl,
      latinSpelling: `[TASHELHIT_SENTENCE_REVIEW_REQUIRED:${sentence.id}]`,
      reviewStatus: "TE_REVIEWEN" as const,
      reviewNote: DEMO_REVIEW_NOTE,
      imageAlt: sentence.translationNl,
      imageEmoji: sentence.emoji,
      itemKind: "zin" as const,
    },
  }));

  return {
    id: DAILY_SENTENCES_LESSON_ID,
    titleNl: "Dagelijkse zinnen",
    targetMinutes: Math.max(3, Math.round(exercises.length * 0.5)),
    exercises,
  };
}

/** Levert een gegenereerde les op basis van een lessonId in het "lesson-<categorySlug>"-formaat (of de vaste dagelijkse-zinnen-les-id), of null als er niets bij past. */
export function getGenericLessonById(lessonId: string): LessonView | null {
  if (lessonId === DAILY_SENTENCES_LESSON_ID) return buildDailySentencesLesson();
  const categorySlug = categorySlugFromLessonId(lessonId);
  if (!categorySlug) return null;
  return buildLessonForCategory(categorySlug);
}

/** Categorieslugs in de vaste, bedoelde volgorde (Level > Categorie, zie CATEGORIES) — bepaalt de strenge, opeenvolgende ontgrendeling op het reispad. */
export function getOrderedCategorySlugs(): string[] {
  return CATEGORIES.map((category) => category.slug);
}
