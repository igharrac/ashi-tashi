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

/**
 * "Van woordjes naar zinnen" (hfst. 14: conversaties worden stapsgewijs
 * opgebouwd). Na de losse woorden sluit de les af met een paar eenvoudige
 * zinnen die dezelfde, net geleerde woorden hergebruiken — het kind zegt de
 * hele zin na in plaats van alleen een keuze te maken. Placeholder-content,
 * zelfde reviewregels als losse woorden (hfst. 3).
 */
interface SentenceSeed {
  id: string;
  translationNl: string;
  emoji: string;
}

const SENTENCES: SentenceSeed[] = [
  { id: "zin-hond", translationNl: "Ik zie een hond.", emoji: "🐕" },
  { id: "zin-kat", translationNl: "De kat is lief.", emoji: "🐈" },
  { id: "zin-vis", translationNl: "Waar is de vis?", emoji: "🐟" },
];

export const DIEREN_THEME: ThemeView = {
  id: "seed-theme-dieren",
  slug: "dieren",
  titleNl: "Dieren",
  lessons: [
    {
      id: "seed-lesson-dieren-1",
      titleNl: "Dieren op de boerderij",
      targetMinutes: 6,
      exercises: [
        ...ANIMALS.flatMap((animal) => [
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
        // Zinnetjes-afsluiting: dezelfde woorden, nu in een korte zin, alleen nazeggen.
        ...SENTENCES.map((sentence) => ({
          id: `exercise-sentence-${sentence.id}`,
          type: "NAZEGGEN" as const,
          vocabularyItem: {
            id: `item-${sentence.id}`,
            translationNl: sentence.translationNl,
            latinSpelling: `[TASHELHIT_SENTENCE_REVIEW_REQUIRED:${sentence.id}]`,
            reviewStatus: "TE_REVIEWEN" as const,
            reviewNote: DEMO_REVIEW_NOTE,
            imageAlt: sentence.translationNl,
            imageEmoji: sentence.emoji,
            itemKind: "zin" as const,
          },
        })),
      ],
    },
  ],
};

export interface JourneyIsland {
  slug: string;
  titleNl: string;
  emoji: string;
  /** Kleine label boven de teaser, bv. "Les 1" (leeg = geen label). */
  eyebrow?: string;
  /** Korte teaser-tekst naast het eiland, overgenomen uit het Figma-ontwerp waar beschikbaar. */
  teaser: string;
  /** Alleen "dieren" heeft echt geïmplementeerde lessen in deze MVP-slice. */
  isImplemented: boolean;
  isFinalDestination?: boolean;
}

/**
 * Vijf demo-thema's in seeddata, één volledig geïmplementeerd (hfst. 54).
 * De overige vier tonen het reispad-concept en de te verwachten uitbreiding
 * (hfst. 12) zonder dat er al lessen achter zitten — duidelijk als
 * "binnenkort" gemarkeerd, geen nepcontent. Teaser-teksten voor "De Basis"
 * en "Eten & Thee" zijn 1-op-1 overgenomen uit het Figma/Stitch-ontwerp
 * (bestand Bz60fD3zucFgZvlDJxwBri, nodes 2:8 en 2:41); de overige zijn in
 * dezelfde toon geschreven.
 */
export const JOURNEY_ISLANDS: JourneyIsland[] = [
  {
    slug: "dieren",
    titleNl: "Dieren",
    emoji: "🐾",
    eyebrow: "Les 1",
    teaser: "Leer je eerste woorden in het Tashelhit.",
    isImplemented: true,
  },
  {
    slug: "begroeten",
    titleNl: "Begroeten",
    emoji: "👋",
    teaser: "Leer hallo en gedag zeggen op z'n Tashelhit.",
    isImplemented: false,
  },
  {
    slug: "familie",
    titleNl: "Familie",
    emoji: "👨‍👩‍👧",
    teaser: "Ontdek hoe je opa, oma en je familie noemt.",
    isImplemented: false,
  },
  {
    slug: "eten-en-drinken",
    titleNl: "Eten & Thee",
    emoji: "🍵",
    eyebrow: "Proef de Cultuur",
    teaser: "Maak een virtuele muntthee en leer alle ingrediënten kennen.",
    isImplemented: false,
  },
  {
    slug: "kleuren-en-getallen",
    titleNl: "De Grote Kasbah",
    emoji: "🏰",
    teaser: "Het einde van de reis: een magische oase in de Sahara.",
    isImplemented: false,
    isFinalDestination: true,
  },
];

export const DEMO_BADGES: Record<string, { titleNl: string; description: string; emoji: string }> = {
  "eerste-woord": { titleNl: "Eerste woord", description: "Je hebt je eerste woord geleerd!", emoji: "⭐" },
  "goede-luisteraar": { titleNl: "Goede luisteraar", description: "Je hebt goed geluisterd naar de woorden.", emoji: "👂" },
  "durft-te-spreken": { titleNl: "Durft te spreken", description: "Je hebt een woord hardop nagezegd.", emoji: "🎤" },
  dierenkenner: { titleNl: "Dierenkenner", description: "Je hebt het thema Dieren voltooid.", emoji: "🏆" },
};
