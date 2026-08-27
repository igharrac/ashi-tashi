import type { ExerciseView, LessonView } from "@/types/domain";
import { CATEGORIES, getCatalogItems, getCategoryBySlug } from "@/lib/contentCatalog";
import { DEMO_REVIEW_NOTE, DIEREN_THEME } from "@/lib/demoData";
import { getDailySentenceItems } from "@/lib/dailySentences";
import type { PracticeContent } from "@/lib/practiceContentClient";

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

/**
 * "Oefenen"-zinnen (practiceSentences.ts) — content voor kinderen op niveau
 * B_OEFENEN of hoger (child.level, zie experienceLevels.ts). Elke categorie
 * krijgt, net als een woordcategorie, zijn EIGEN les/tegel i.p.v. alles
 * samen te voegen zoals bij Dagelijkse zinnen — op verzoek "allerlei
 * categorieën" binnen dit niveau, dus dezelfde per-categorie opzet als de
 * gewone woordcategorieën (buildLessonForCategory hierboven), maar dan met
 * NAZEGGEN-oefeningen (plaatje + contextNl) i.p.v. LUISTEREN_EN_HERKENNEN.
 * Ook deze staan los van de streng-opeenvolgende woordcategorie-keten (zie
 * StepGrid.tsx) — alleen het niveau van het kind bepaalt of ze zichtbaar
 * zijn, niet de voortgang in de woordcategorieën.
 */
const PRACTICE_LESSON_ID_PREFIX = "lesson-oefenen-";

/** Praktijkcategorieën zijn klein van opzet (een handvol zinnen per categorie) — vandaar een lagere drempel dan bij woorden of Dagelijkse zinnen. */
export const MIN_RECORDED_PRACTICE_SENTENCES_FOR_LESSON = 2;

export function practiceLessonIdForCategory(categorySlug: string): string {
  return `${PRACTICE_LESSON_ID_PREFIX}${categorySlug}`;
}

function practiceCategorySlugFromLessonId(lessonId: string): string | null {
  return lessonId.startsWith(PRACTICE_LESSON_ID_PREFIX) ? lessonId.slice(PRACTICE_LESSON_ID_PREFIX.length) : null;
}

function buildPracticeLessonForCategory(categorySlug: string, practiceContent: PracticeContent): LessonView | null {
  const category = practiceContent.categories.find((c) => c.slug === categorySlug);
  if (!category) return null;

  const exercises: ExerciseView[] = practiceContent.sentences
    .filter((sentence) => sentence.categorySlug === categorySlug)
    .map((sentence) => ({
      id: `exercise-oefenen-${sentence.id}`,
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
        pictogramUrl: sentence.pictogramUrl,
        itemKind: "zin" as const,
      },
    }));

  return {
    id: practiceLessonIdForCategory(categorySlug),
    titleNl: category.titleNl,
    targetMinutes: Math.max(3, Math.round(exercises.length * 0.5)),
    exercises,
  };
}

export interface PracticeCategoryStatus {
  categorySlug: string;
  status: "active" | "completed" | "locked";
  lessonId: string;
}

/** Los van de woordcategorie-keten (geen chainBroken-logica): elke Oefenen-categorie ontgrendelt onafhankelijk zodra er genoeg zinnen zijn ingesproken. */
export function getPracticeCategoryStatuses(
  completedLessonIds: string[],
  recordedIds: Set<string>,
  practiceContent: PracticeContent,
): PracticeCategoryStatus[] {
  return practiceContent.categories.map((category) => {
    const lessonId = practiceLessonIdForCategory(category.slug);
    const isCompleted = completedLessonIds.includes(lessonId);
    const recordedCount = practiceContent.sentences.filter(
      (item) => item.categorySlug === category.slug && recordedIds.has(item.id),
    ).length;
    const hasEnoughContent = recordedCount >= MIN_RECORDED_PRACTICE_SENTENCES_FOR_LESSON;
    const status: PracticeCategoryStatus["status"] = !hasEnoughContent ? "locked" : isCompleted ? "completed" : "active";
    return { categorySlug: category.slug, status, lessonId };
  });
}

/** Levert een gegenereerde les op basis van een lessonId in het "lesson-<categorySlug>"-formaat (of de vaste dagelijkse-zinnen-les-id, of een "lesson-oefenen-<categorySlug>"-id), of null als er niets bij past. */
export function getGenericLessonById(lessonId: string, practiceContent: PracticeContent): LessonView | null {
  if (lessonId === DAILY_SENTENCES_LESSON_ID) return buildDailySentencesLesson();
  const practiceCategorySlug = practiceCategorySlugFromLessonId(lessonId);
  if (practiceCategorySlug) return buildPracticeLessonForCategory(practiceCategorySlug, practiceContent);
  const categorySlug = categorySlugFromLessonId(lessonId);
  if (!categorySlug) return null;
  return buildLessonForCategory(categorySlug);
}

/** Categorieslugs in de vaste, bedoelde volgorde (Level > Categorie, zie CATEGORIES) — bepaalt de strenge, opeenvolgende ontgrendeling op het reispad. */
export function getOrderedCategorySlugs(): string[] {
  return CATEGORIES.map((category) => category.slug);
}

export interface CategoryUnlockStatus {
  categorySlug: string;
  status: "active" | "completed" | "locked";
  lessonId: string;
}

/**
 * Zelfde streng-opeenvolgende ontgrendelingslogica als StepGrid.tsx (op
 * verzoek "Streng na elkaar"), maar hier op één plek gedeeld zodat andere
 * schermen — Ontdekken en het matchspel (zie ontdekken/page.tsx en
 * ontdekken/spel/page.tsx) — precies dezelfde "welke categorie mag deze
 * kind al zien"-regels gebruiken i.p.v. een eigen kopie die kan afwijken
 * (zoals eerder gebeurde: die twee stonden nog hardcoded vast op "dieren").
 */
export function getCategoryUnlockStatuses(
  completedLessonIds: string[],
  recordedIds: Set<string>,
): CategoryUnlockStatus[] {
  const dierenLessonId = DIEREN_THEME.lessons[0]?.id ?? lessonIdForCategory("dieren");
  let chainBroken = false;

  return CATEGORIES.map((category) => {
    const isDieren = category.slug === "dieren";
    const lessonId = isDieren ? dierenLessonId : lessonIdForCategory(category.slug);
    const isCompleted = completedLessonIds.includes(lessonId);

    const recordedCount = getCatalogItems().filter(
      (item) => item.categorySlug === category.slug && recordedIds.has(item.id),
    ).length;
    const hasEnoughContent = recordedCount >= MIN_RECORDED_WORDS_FOR_LESSON;

    let status: CategoryUnlockStatus["status"];
    if (!hasEnoughContent) {
      status = "locked";
    } else {
      const canPlay = !chainBroken;
      status = isCompleted ? "completed" : canPlay ? "active" : "locked";
      if (!isCompleted) chainBroken = true;
    }

    return { categorySlug: category.slug, status, lessonId };
  });
}

/** Categorieslugs die het kind al mag zien (voltooid of nu actief) — voor Ontdekken/matchspel, zie getCategoryUnlockStatuses hierboven. */
export function getUnlockedCategorySlugs(completedLessonIds: string[], recordedIds: Set<string>): string[] {
  return getCategoryUnlockStatuses(completedLessonIds, recordedIds)
    .filter((entry) => entry.status !== "locked")
    .map((entry) => entry.categorySlug);
}
