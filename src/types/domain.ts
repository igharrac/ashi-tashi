/**
 * UI-laag types voor de verticale MVP-demo.
 *
 * Deze demo-laag werkt met statische seeddata (src/lib/demoData.ts) en
 * lokale opslag (localStorage) in plaats van live Prisma/Postgres-calls,
 * zodat de volledige gebruikersflow (hfst. 55) getest kan worden zonder
 * database-verbinding. Het Prisma-schema (prisma/schema.prisma) beschrijft
 * de bedoelde productiedatamodel; zie README voor de overstap naar echte
 * API-routes.
 */

export type ReviewStatus =
  | "CONCEPT"
  | "TE_REVIEWEN"
  | "AFGEKEURD"
  | "GOEDGEKEURD"
  | "GEPUBLICEERD"
  | "GEARCHIVEERD";

export interface VocabularyItemView {
  id: string;
  translationNl: string;
  latinSpelling: string; // kan een placeholder zijn, zie reviewStatus
  reviewStatus: ReviewStatus;
  reviewNote?: string;
  imageAlt: string;
  imageEmoji: string; // eenvoudige visuele placeholder i.p.v. echte illustraties
  /** "woord" (standaard) of "zin" — hfst. 14: van woordjes naar zinnen. */
  itemKind?: "woord" | "zin";
}

export type ExerciseType =
  | "LUISTEREN_EN_HERKENNEN"
  | "AFBEELDING_EN_WOORD"
  | "NAZEGGEN"
  | "ZELFSTANDIG_SPREKEN"; // hfst. 13.11: plaatje zien, zelf inspreken zonder het woord eerst te horen

export interface ExerciseView {
  id: string;
  type: ExerciseType;
  vocabularyItem: VocabularyItemView;
}

export interface LessonView {
  id: string;
  titleNl: string;
  targetMinutes: number;
  exercises: ExerciseView[];
}

export interface ThemeView {
  id: string;
  slug: string;
  titleNl: string;
  lessons: LessonView[];
}

export type ExperienceLevel = "A_ONTDEKKEN" | "B_OEFENEN" | "C_SPREKEN";

/** Zelfde persona's als in de opnamestudio (src/lib/recordableItems.ts), hier los gedefinieerd om een import-cyclus te vermijden. */
export type VoicePersona = "man" | "vrouw" | "jongen" | "meisje";

export interface ChildProfileData {
  id: string;
  displayName: string;
  avatarId: string;
  level: ExperienceLevel;
  microphoneOptIn: boolean;
  /** null = automatisch (bestaande voorkeursvolgorde man > vrouw > jongen > meisje); anders expliciete keuze van de gebruiker. */
  preferredVoicePersona: VoicePersona | null;
  /** Aan: plaatje zien + zelf inspreken (hfst. 13.11). Uit (standaard): eerst horen, dan nazeggen. */
  speakFirstMode: boolean;
  /**
   * Aan (standaard): een spreekoefening is klaar zodra het woord
   * LENIENT_PRONUNCIATION_ATTEMPTS keer is ingesproken, ongeacht of de
   * uitspraak (bijna) exact matchte — voorkomt dat een kind vastloopt op
   * een score die het nooit haalt. Uit: de oefening vraagt om een echte
   * match/goede beoordeling voordat het kind door kan (met onbeperkt
   * "probeer opnieuw").
   */
  lenientPronunciationMode: boolean;
  points: number;
  earnedBadgeSlugs: string[];
  itemStats: Record<string, { correct: number; incorrect: number }>;
  completedLessonIds: string[];
  practiceDatesIso: string[]; // hfst. 16: basis voor de zachte streak
  createdAt: string;
  /** Waar het kind gebleven was in een niet-afgemaakte les, zodat een tussentijds afgesloten les hervat kan worden i.p.v. opnieuw te beginnen. */
  lessonProgress?: { lessonId: string; index: number } | null;
}

export interface AppStateData {
  parentEmail: string | null;
  children: ChildProfileData[];
}
