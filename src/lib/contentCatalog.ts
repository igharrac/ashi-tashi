/**
 * Content-catalogus: Level > Categorie > Woord.
 *
 * Op verzoek: levels (elk één bolletje op het reispad, hfst. 10) bevatten elk
 * een paar categorieën (zoals "Dieren", "Eten & Drinken"); elke categorie
 * heeft ±40 woorden, minder waar 40 niet-verwarrende, duidelijk van elkaar te
 * onderscheiden items niet realistisch is (bv. Gevoelens, Lichaam — daar
 * lopen visueel/emoji-technisch te veel begrippen op elkaar, zoals de
 * hamster/rat-valkuil die expliciet vermeden moest worden).
 *
 * BELANGRIJK — zelfde regel als overal (hfst. 3, 54): dit zijn Nederlandse
 * woorden + een emoji als visuele placeholder. Er is GEEN Tashelhit-vertaling
 * verzonnen; elk woord krijgt een `[TASHELHIT_WORD_REVIEW_REQUIRED:...]`
 * placeholder, klaar om door een native speaker gereviewd te worden (zie ook
 * de opnamestudio, ARCHITECTUUR-OPNAMESTUDIO.md).
 *
 * LEVELS blijft hardcoded (structurele indeling + strenge, opeenvolgende
 * ontgrendelvolgorde — geen "level aanmaken" gevraagd, zie de studio-CMS
 * scope-keuze). De categorieën ZELF zijn op verzoek verplaatst van vaste
 * code naar bewerkbare data — BEHALVE "Dieren": die blijft, met opzet, hier
 * hardcoded als DIEREN_CATEGORY. Dieren heeft de enige al bestaande, echt
 * getoetste/speelbare les (DIEREN_THEME in demoData.ts, met een vaste
 * afsluiting van 3 zinnen en het "Dierenkenner"-badge) — die niet via de
 * studio bewerkbaar/verwijderbaar maken voorkomt dat die ene werkende les
 * per ongeluk kapot gemaakt kan worden. De overige 9 categorieën
 * (labels + woorden toevoegen/aanpassen/verwijderen, ook nieuwe categorieën)
 * zitten in `data/words-content.json` (bewerkbaar via de opnamestudio,
 * src/lib/wordsContentStore.ts) en de statische snapshot
 * `public/words-content.json` die de app runtime leest (zie
 * wordsContentClient.ts). Consumers die de VOLLEDIGE categorielijst nodig
 * hebben, voegen DIEREN_CATEGORY + de geladen woordcategorieën zelf samen
 * (zie wordsContentClient.ts: mergeCategories).
 */

export interface LevelDefinition {
  slug: string;
  titleNl: string;
  emoji: string;
  eyebrow?: string;
  teaser: string;
  categorySlugs: string[];
  isFinalDestination?: boolean;
}

/** [wordSlug, weergave in het Nederlands, emoji-placeholder] */
export type WordSeed = [string, string, string];

export interface CategoryDefinition {
  slug: string;
  levelSlug: string;
  titleNl: string;
  emoji: string;
  teaser: string;
  /** Heeft deze categorie al echte, speelbare lesoefeningen? Nu alleen "dieren". */
  isImplemented: boolean;
  words: WordSeed[];
  /**
   * Moeilijkheidsopbouw van de stap (hfst. 10: van losse woorden, via korte
   * zinnetjes, naar gesprekjes). Nu structureel klaargezet maar nog niet
   * benut — alle bestaande categorieën zijn "woorden"; content en
   * oefenvormen voor "zinnen"/"gesprek" zijn een apart vervolg. Ontbreekt
   * dit veld, dan geldt "woorden" als standaard.
   */
  stepType?: "woorden" | "zinnen" | "gesprek";
}

export const LEVELS: LevelDefinition[] = [
  {
    slug: "de-basis",
    titleNl: "De Basis",
    emoji: "🌱",
    eyebrow: "Level 1",
    teaser: "Dieren, je lichaam en kleding — de allereerste woorden.",
    categorySlugs: ["dieren", "lichaam", "kleding"],
  },
  {
    slug: "thuis-en-eten",
    titleNl: "Thuis & Eten",
    emoji: "🏠",
    eyebrow: "Level 2",
    teaser: "Eten en drinken, en spullen in huis.",
    categorySlugs: ["eten-en-drinken", "huis-en-spullen"],
  },
  {
    slug: "buiten-en-natuur",
    titleNl: "Buiten & Natuur",
    emoji: "🌳",
    eyebrow: "Level 3",
    teaser: "De natuur, onderweg, en buiten spelen.",
    categorySlugs: ["natuur-en-weer", "vervoer", "speelgoed-en-spel"],
  },
  {
    slug: "grote-wereld",
    titleNl: "Grote Wereld",
    emoji: "🏰",
    eyebrow: "Level 4",
    teaser: "Beroepen en school — de wereld om je heen.",
    categorySlugs: ["beroepen", "school"],
    isFinalDestination: true,
  },
];

export function getLevelBySlug(slug: string): LevelDefinition | undefined {
  return LEVELS.find((level) => level.slug === slug);
}

/**
 * "Dieren" — bewust NIET in data/words-content.json, zie de bestandskop
 * hierboven. Zelfde 39 dieren als altijd; ongewijzigd t.o.v. de eerdere
 * vaste CATEGORIES-array.
 */
export const DIEREN_CATEGORY: CategoryDefinition = {
  slug: "dieren",
  levelSlug: "de-basis",
  titleNl: "Dieren",
  emoji: "🐾",
  teaser: "Leer je eerste dieren in het Tashelhit.",
  isImplemented: true,
  words: [
    ["hond", "hond", "🐕"],
    ["kat", "kat", "🐈"],
    ["vogel", "vogel", "🐦"],
    ["vis", "vis", "🐟"],
    ["koe", "koe", "🐄"],
    ["schaap", "schaap", "🐑"],
    ["geit", "geit", "🐐"],
    ["kip", "kip", "🐔"],
    ["ezel", "ezel", "🫏"],
    ["kameel", "kameel", "🐫"],
    ["paard", "paard", "🐴"],
    ["varken", "varken", "🐖"],
    ["eend", "eend", "🦆"],
    ["konijn", "konijn", "🐇"],
    ["muis", "muis", "🐭"],
    ["olifant", "olifant", "🐘"],
    ["leeuw", "leeuw", "🦁"],
    ["tijger", "tijger", "🐯"],
    ["beer", "beer", "🐻"],
    ["aap", "aap", "🐒"],
    ["giraffe", "giraffe", "🦒"],
    ["zebra", "zebra", "🦓"],
    ["kangoeroe", "kangoeroe", "🦘"],
    ["koala", "koala", "🐨"],
    ["panda", "panda", "🐼"],
    ["vos", "vos", "🦊"],
    ["wolf", "wolf", "🐺"],
    ["hert", "hert", "🦌"],
    ["eekhoorn", "eekhoorn", "🐿️"],
    ["egel", "egel", "🦔"],
    ["slang", "slang", "🐍"],
    ["schildpad", "schildpad", "🐢"],
    ["kikker", "kikker", "🐸"],
    ["vlinder", "vlinder", "🦋"],
    ["bij", "bij", "🐝"],
    ["lieveheersbeestje", "lieveheersbeestje", "🐞"],
    ["spin", "spin", "🕷️"],
    ["uil", "uil", "🦉"],
    ["pinguin", "pinguïn", "🐧"],
    ["dolfijn", "dolfijn", "🐬"],
  ],
};

// "Gevoelens" bewust GEEN losse woordcategorie (was hier eerder wel,
// isImplemented: false, nooit ingesproken). Emoties laten zich in veel
// talen — waarschijnlijk ook Tashelhit — niet los vertalen zoals een
// zelfstandig naamwoord: "blij"/"bang"/"verdrietig" zijn in het Nederlands
// koppelwerkwoord + bijvoeglijk naamwoord, maar dat patroon bestaat niet
// overal (zelfde soort geval als "ik heb dorst", geen "ik ben dorstig").
// Op verzoek verplaatst naar dailySentences.ts (categorie "zin-gevoelens")
// — daar wordt om een hele natuurlijke zin gevraagd i.p.v. een los woord,
// wat een native speaker daadwerkelijk kan invullen.

/** Categorieën binnen één level uit een gegeven (samengevoegde) categorielijst — zie wordsContentClient.ts mergeCategories. */
export function getCategoriesForLevel(levelSlug: string, categories: CategoryDefinition[]): CategoryDefinition[] {
  return categories.filter((category) => category.levelSlug === levelSlug);
}

export function getCategoryBySlug(slug: string, categories: CategoryDefinition[]): CategoryDefinition | undefined {
  return categories.find((category) => category.slug === slug);
}

export interface CatalogItem {
  id: string;
  translationNl: string;
  emoji: string;
  latinSpelling: string;
  itemKind: "woord";
  categorySlug: string;
  categoryTitleNl: string;
  levelSlug: string;
  levelTitleNl: string;
}

/** Platte lijst van alle woorden in een gegeven (samengevoegde) categorielijst, met level erbij — voor de opnamestudio en de kind-app. */
export function buildCatalogItems(categories: CategoryDefinition[]): CatalogItem[] {
  const items: CatalogItem[] = [];
  for (const category of categories) {
    const level = getLevelBySlug(category.levelSlug);
    for (const [wordSlug, translationNl, emoji] of category.words) {
      items.push({
        id: `item-${category.slug}-${wordSlug}`,
        translationNl,
        emoji,
        latinSpelling: `[TASHELHIT_WORD_REVIEW_REQUIRED:${wordSlug}]`,
        itemKind: "woord",
        categorySlug: category.slug,
        categoryTitleNl: category.titleNl,
        levelSlug: category.levelSlug,
        levelTitleNl: level?.titleNl ?? category.levelSlug,
      });
    }
  }
  return items;
}
