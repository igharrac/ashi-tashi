/**
 * Seeddata voor de verticale MVP-slice: thema "Dieren".
 *
 * BELANGRIJK (hfst. 3, 54): alle Tashelhit-content hieronder is PLACEHOLDER.
 * Er is niets verzonnen — elk item krijgt reviewStatus = TE_REVIEWEN en een
 * duidelijke reviewNote. Niets hiervan mag als definitieve leercontent
 * worden gepubliceerd voordat een native speaker het heeft goedgekeurd.
 */
import { PrismaClient, ReviewStatus, ExerciseType, VocabularyItemType } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_REVIEW_NOTE = "DEMO — INHOUDELIJKE REVIEW VEREIST";

type SeedAnimal = {
  slug: string;
  translationNl: string;
  latinSpellingPlaceholder: string;
};

// Placeholders — GEEN echte Tashelhit-vertalingen. Zie reviewNote per item.
const ANIMALS: SeedAnimal[] = [
  { slug: "hond", translationNl: "hond", latinSpellingPlaceholder: "[TASHELHIT_WORD_REVIEW_REQUIRED:hond]" },
  { slug: "kat", translationNl: "kat", latinSpellingPlaceholder: "[TASHELHIT_WORD_REVIEW_REQUIRED:kat]" },
  { slug: "vogel", translationNl: "vogel", latinSpellingPlaceholder: "[TASHELHIT_WORD_REVIEW_REQUIRED:vogel]" },
  { slug: "vis", translationNl: "vis", latinSpellingPlaceholder: "[TASHELHIT_WORD_REVIEW_REQUIRED:vis]" },
  { slug: "koe", translationNl: "koe", latinSpellingPlaceholder: "[TASHELHIT_WORD_REVIEW_REQUIRED:koe]" },
  { slug: "schaap", translationNl: "schaap", latinSpellingPlaceholder: "[TASHELHIT_WORD_REVIEW_REQUIRED:schaap]" },
  { slug: "geit", translationNl: "geit", latinSpellingPlaceholder: "[TASHELHIT_WORD_REVIEW_REQUIRED:geit]" },
  { slug: "kip", translationNl: "kip", latinSpellingPlaceholder: "[TASHELHIT_WORD_REVIEW_REQUIRED:kip]" },
  { slug: "ezel", translationNl: "ezel", latinSpellingPlaceholder: "[TASHELHIT_WORD_REVIEW_REQUIRED:ezel]" },
  { slug: "kameel", translationNl: "kameel", latinSpellingPlaceholder: "[TASHELHIT_WORD_REVIEW_REQUIRED:kameel]" },
];

async function main() {
  console.log("Seeding: talen, dialecten, thema Dieren, badges...");

  const tashelhit = await prisma.language.upsert({
    where: { code: "tzm-shilha" },
    update: {},
    create: { code: "tzm-shilha", name: "Tashelhit / Tachelhit", isTarget: true },
  });

  const nederlands = await prisma.language.upsert({
    where: { code: "nl" },
    update: {},
    create: { code: "nl", name: "Nederlands", isTarget: false },
  });
  void nederlands;

  const dialect = await prisma.dialect.upsert({
    where: { languageId_code: { languageId: tashelhit.id, code: "tashelhit-marokko-generiek" } },
    update: {},
    create: {
      languageId: tashelhit.id,
      code: "tashelhit-marokko-generiek",
      region: "[TIFINAGH_REVIEW_REQUIRED regio nader te bepalen door taalreviewer]",
    },
  });

  const theme = await prisma.theme.upsert({
    where: { slug: "dieren" },
    update: {},
    create: {
      languageId: tashelhit.id,
      slug: "dieren",
      titleNl: "Dieren",
      description: "Eerste thema van de verticale MVP-slice (hfst. 11.2).",
      sortOrder: 0,
    },
  });

  const lesson = await prisma.lesson.upsert({
    where: { id: "seed-lesson-dieren-1" },
    update: {},
    create: {
      id: "seed-lesson-dieren-1",
      themeId: theme.id,
      titleNl: "Dieren op de boerderij",
      sortOrder: 0,
      targetMinutes: 5,
    },
  });

  for (const [index, animal] of ANIMALS.entries()) {
    const image = await prisma.imageAsset.upsert({
      where: { id: `seed-image-${animal.slug}` },
      update: {},
      create: {
        id: `seed-image-${animal.slug}`,
        url: `/demo-assets/images/${animal.slug}.svg`,
        altText: `Illustratie van een ${animal.translationNl}`,
        reviewStatus: ReviewStatus.GOEDGEKEURD,
      },
    });

    const audio = await prisma.audioAsset.upsert({
      where: { id: `seed-audio-${animal.slug}` },
      update: {},
      create: {
        id: `seed-audio-${animal.slug}`,
        url: `[REFERENCE_AUDIO_REQUIRED:${animal.slug}]`,
        sourceType: "AI_GEGENEREERD",
        provider: "mock",
        reviewStatus: ReviewStatus.TE_REVIEWEN,
      },
    });

    const item = await prisma.vocabularyItem.upsert({
      where: { id: `seed-item-${animal.slug}` },
      update: {},
      create: {
        id: `seed-item-${animal.slug}`,
        dialectId: dialect.id,
        type: VocabularyItemType.WOORD,
        conceptMeaning: animal.slug,
        latinSpelling: animal.latinSpellingPlaceholder,
        translationNl: animal.translationNl,
        reviewStatus: ReviewStatus.TE_REVIEWEN,
        reviewNote: DEMO_REVIEW_NOTE,
        imageAssetId: image.id,
        audioAssetId: audio.id,
      },
    });

    await prisma.exercise.upsert({
      where: { id: `seed-exercise-listen-${animal.slug}` },
      update: {},
      create: {
        id: `seed-exercise-listen-${animal.slug}`,
        lessonId: lesson.id,
        vocabularyItemId: item.id,
        type: ExerciseType.LUISTEREN_EN_HERKENNEN,
        sortOrder: index * 10,
      },
    });

    await prisma.exercise.upsert({
      where: { id: `seed-exercise-repeat-${animal.slug}` },
      update: {},
      create: {
        id: `seed-exercise-repeat-${animal.slug}`,
        lessonId: lesson.id,
        vocabularyItemId: item.id,
        type: ExerciseType.NAZEGGEN,
        sortOrder: index * 10 + 1,
      },
    });
  }

  // "Van woordjes naar zinnen" (hfst. 14): zelfde soort placeholder-content,
  // nu als korte zin die de net geleerde woorden hergebruikt.
  const sentences = [
    { id: "zin-hond", translationNl: "Ik zie een hond." },
    { id: "zin-kat", translationNl: "De kat is lief." },
    { id: "zin-vis", translationNl: "Waar is de vis?" },
  ];
  for (const [index, sentence] of sentences.entries()) {
    const item = await prisma.vocabularyItem.upsert({
      where: { id: `seed-item-${sentence.id}` },
      update: {},
      create: {
        id: `seed-item-${sentence.id}`,
        dialectId: dialect.id,
        type: VocabularyItemType.ZIN,
        conceptMeaning: sentence.id,
        latinSpelling: `[TASHELHIT_SENTENCE_REVIEW_REQUIRED:${sentence.id}]`,
        translationNl: sentence.translationNl,
        reviewStatus: ReviewStatus.TE_REVIEWEN,
        reviewNote: DEMO_REVIEW_NOTE,
      },
    });

    await prisma.exercise.upsert({
      where: { id: `seed-exercise-sentence-${sentence.id}` },
      update: {},
      create: {
        id: `seed-exercise-sentence-${sentence.id}`,
        lessonId: lesson.id,
        vocabularyItemId: item.id,
        type: ExerciseType.NAZEGGEN,
        sortOrder: 1000 + index,
      },
    });
  }

  const badges = [
    { slug: "eerste-woord", titleNl: "Eerste woord", description: "Je hebt je eerste woord geleerd!" },
    { slug: "goede-luisteraar", titleNl: "Goede luisteraar", description: "Je hebt goed geluisterd naar alle woorden." },
    { slug: "durft-te-spreken", titleNl: "Durft te spreken", description: "Je hebt een woord hardop nagezegd." },
    { slug: "dierenkenner", titleNl: "Dierenkenner", description: "Je hebt het thema Dieren voltooid." },
  ];
  for (const badge of badges) {
    await prisma.badge.upsert({ where: { slug: badge.slug }, update: {}, create: badge });
  }

  console.log(`Seed klaar: ${ANIMALS.length} leeritems in thema "Dieren" (alles placeholder, TE_REVIEWEN).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
