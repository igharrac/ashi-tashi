import type { ThemeView } from "@/types/domain";

/**
 * Statische spiegel van prisma/seed.ts voor de client-side demo-flow.
 *
 * BELANGRIJK: alle Tashelhit-content hier is PLACEHOLDER (hfst. 3, 54).
 * Niets hiervan is een echte, gereviewde vertaling. Elk item is gemarkeerd
 * met reviewStatus "TE_REVIEWEN" en een zichtbare reviewNote.
 */

const DEMO_REVIEW_NOTE = "DEMO — INHOUDELIJKE REVIEW VEREIST";

interface AnimalSeed {
  id: string;
  translationNl: string;
  emoji: string;
}

const ANIMALS: AnimalSeed[] = [
  { id: "hond", translationNl: "hond", emoji: "🐕" },
  { id: "kat", translationNl: "kat", emoji: "🐈" },
  { id: "vogel", translationNl: "vogel", emoji: "🐦" },
  { id: "vis", translationNl: "vis", emoji: "🐟" },
  { id: "koe", translationNl: "koe", emoji: "🐄" },
  { id: "schaap", translationNl: "schaap", emoji: "🐑" },
  { id: "geit", translationNl: "geit", emoji: "🐐" },
  { id: "kip", translationNl: "kip", emoji: "🐔" },
  { id: "ezel", translationNl: "ezel", emoji: "🫏" },
  { id: "kameel", translationNl: "kameel", emoji: "🐫" },
];

export const AVATARS = ["🦊", "🐻", "🐼", "🐯", "🐰", "🐨"];

export const DIEREN_THEME: ThemeView = {
  id: "seed-theme-dieren",
  slug: "dieren",
  titleNl: "Dieren",
  lessons: [
    {
      id: "seed-lesson-dieren-1",
      titleNl: "Dieren op de boerderij",
      targetMinutes: 5,
      exercises: ANIMALS.flatMap((animal) => [
        {
          id: `exercise-listen-${animal.id}`,
          type: "LUISTEREN_EN_HERKENNEN" as const,
          vocabularyItem: {
            id: `item-${animal.id}`,
            translationNl: animal.translationNl,
            latinSpelling: `[TASHELHIT_WORD_REVIEW_REQUIRED:${animal.id}]`,
            reviewStatus: "TE_REVIEWEN" as const,
            reviewNote: DEMO_REVIEW_NOTE,
            imageAlt: `Illustratie van een ${animal.translationNl}`,
            imageEmoji: animal.emoji,
          },
        },
        {
          id: `exercise-repeat-${animal.id}`,
          type: "NAZEGGEN" as const,
          vocabularyItem: {
            id: `item-${animal.id}`,
            translationNl: animal.translationNl,
            latinSpelling: `[TASHELHIT_WORD_REVIEW_REQUIRED:${animal.id}]`,
            reviewStatus: "TE_REVIEWEN" as const,
            reviewNote: DEMO_REVIEW_NOTE,
            imageAlt: `Illustratie van een ${animal.translationNl}`,
            imageEmoji: animal.emoji,
          },
        },
      ]),
    },
  ],
};

export const DEMO_BADGES: Record<string, { titleNl: string; description: string; emoji: string }> = {
  "eerste-woord": { titleNl: "Eerste woord", description: "Je hebt je eerste woord geleerd!", emoji: "⭐" },
  "goede-luisteraar": { titleNl: "Goede luisteraar", description: "Je hebt goed geluisterd naar de woorden.", emoji: "👂" },
  "durft-te-spreken": { titleNl: "Durft te spreken", description: "Je hebt een woord hardop nagezegd.", emoji: "🎤" },
  dierenkenner: { titleNl: "Dierenkenner", description: "Je hebt het thema Dieren voltooid.", emoji: "🏆" },
};
