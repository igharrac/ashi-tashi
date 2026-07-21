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
 * Wat dit WEL en NIET is:
 * - Dit vult de opnamestudio (/studio/opnames) en de categorie-kaarten op
 *   het reispad met een volledige, doordachte woordenlijst.
 * - Dit bouwt NIET automatisch 314 nieuwe speel-oefeningen. Alleen "Dieren"
 *   heeft nog steeds echte, speelbare lesoefeningen (src/lib/demoData.ts,
 *   ongewijzigd: 10 dieren + 3 zinnen, hfst. 7.4 lesduur-richtlijn). De
 *   overige categorieën zijn nu wél volledig met woorden gevuld (dus
 *   opneembaar in de studio) maar staan in de kind-app nog als "binnenkort"
 *   — een vervolgstap is om er echte lessen omheen te bouwen.
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
type WordSeed = [string, string, string];

export interface CategoryDefinition {
  slug: string;
  levelSlug: string;
  titleNl: string;
  emoji: string;
  teaser: string;
  /** Heeft deze categorie al echte, speelbare lesoefeningen? Nu alleen "dieren". */
  isImplemented: boolean;
  words: WordSeed[];
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
    teaser: "Eten en drinken, spullen in huis, en hoe je je voelt.",
    categorySlugs: ["eten-en-drinken", "huis-en-spullen", "gevoelens"],
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

export const CATEGORIES: CategoryDefinition[] = [
  {
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
  },
  {
    slug: "lichaam",
    levelSlug: "de-basis",
    titleNl: "Lichaam",
    emoji: "🙂",
    teaser: "Van hoofd tot teen.",
    isImplemented: false,
    words: [
      ["oog", "oog", "👁️"],
      ["oor", "oor", "👂"],
      ["neus", "neus", "👃"],
      ["mond", "mond", "👄"],
      ["tand", "tand", "🦷"],
      ["tong", "tong", "👅"],
      ["hand", "hand", "✋"],
      ["vinger", "vinger", "👉"],
      ["vuist", "vuist", "✊"],
      ["arm", "arm", "💪"],
      ["been", "been", "🦵"],
      ["voet", "voet", "🦶"],
      ["hart", "hart", "🫀"],
      ["hersenen", "hersenen", "🧠"],
      ["longen", "longen", "🫁"],
      ["bot", "bot", "🦴"],
      ["nagel", "nagel", "💅"],
      ["schedel", "schedel", "💀"],
    ],
  },
  {
    slug: "kleding",
    levelSlug: "de-basis",
    titleNl: "Kleding",
    emoji: "👕",
    teaser: "Wat trek je vandaag aan?",
    isImplemented: false,
    words: [
      ["shirt", "shirt", "👕"],
      ["broek", "broek", "👖"],
      ["jurk", "jurk", "👗"],
      ["jas", "jas", "🧥"],
      ["sjaal", "sjaal", "🧣"],
      ["handschoenen", "handschoenen", "🧤"],
      ["sokken", "sokken", "🧦"],
      ["schoenen", "schoenen", "👞"],
      ["laarzen", "laarzen", "🥾"],
      ["sandalen", "sandalen", "👡"],
      ["hoge-hakken", "hoge hakken", "👠"],
      ["pet", "pet", "🧢"],
      ["hoed", "hoed", "🎩"],
      ["bikini", "bikini", "👙"],
      ["zwembroek", "zwembroek", "🩳"],
      ["das", "das", "👔"],
      ["zonnebril", "zonnebril", "🕶️"],
      ["kroon", "kroon", "👑"],
      ["ring", "ring", "💍"],
      ["horloge", "horloge", "⌚"],
      ["badpak", "badpak", "🩱"],
      ["kimono", "kimono", "👘"],
      ["sari", "sari", "🥻"],
      ["tulband", "tulband", "👳"],
    ],
  },
  {
    slug: "eten-en-drinken",
    levelSlug: "thuis-en-eten",
    titleNl: "Eten & Drinken",
    emoji: "🍎",
    teaser: "Proef de lekkerste woorden.",
    isImplemented: false,
    words: [
      ["appel", "appel", "🍎"],
      ["banaan", "banaan", "🍌"],
      ["sinaasappel", "sinaasappel", "🍊"],
      ["druiven", "druiven", "🍇"],
      ["aardbei", "aardbei", "🍓"],
      ["watermeloen", "watermeloen", "🍉"],
      ["peer", "peer", "🍐"],
      ["kers", "kers", "🍒"],
      ["ananas", "ananas", "🍍"],
      ["citroen", "citroen", "🍋"],
      ["perzik", "perzik", "🍑"],
      ["kiwi", "kiwi", "🥝"],
      ["mango", "mango", "🥭"],
      ["kokosnoot", "kokosnoot", "🥥"],
      ["brood", "brood", "🍞"],
      ["kaas", "kaas", "🧀"],
      ["ei", "ei", "🥚"],
      ["melk", "melk", "🥛"],
      ["water", "water", "💧"],
      ["thee", "thee", "🍵"],
      ["honing", "honing", "🍯"],
      ["boter", "boter", "🧈"],
      ["rijst", "rijst", "🍚"],
      ["pasta", "pasta", "🍝"],
      ["pizza", "pizza", "🍕"],
      ["taart", "taart", "🎂"],
      ["koekje", "koekje", "🍪"],
      ["chocolade", "chocolade", "🍫"],
      ["ijsje", "ijsje", "🍦"],
      ["wortel", "wortel", "🥕"],
      ["tomaat", "tomaat", "🍅"],
      ["komkommer", "komkommer", "🥒"],
      ["paprika", "paprika", "🫑"],
      ["aardappel", "aardappel", "🥔"],
      ["ui", "ui", "🧅"],
      ["knoflook", "knoflook", "🧄"],
      ["mais", "maïs", "🌽"],
      ["broccoli", "broccoli", "🥦"],
      ["paddenstoel", "paddenstoel", "🍄"],
      ["popcorn", "popcorn", "🍿"],
    ],
  },
  {
    slug: "huis-en-spullen",
    levelSlug: "thuis-en-eten",
    titleNl: "Huis & Spullen",
    emoji: "🏡",
    teaser: "Alles wat je thuis tegenkomt.",
    isImplemented: false,
    words: [
      ["stoel", "stoel", "🪑"],
      ["bed", "bed", "🛏️"],
      ["bank", "bank", "🛋️"],
      ["deur", "deur", "🚪"],
      ["raam", "raam", "🪟"],
      ["lamp", "lamp", "💡"],
      ["klok", "klok", "🕐"],
      ["spiegel", "spiegel", "🪞"],
      ["boek", "boek", "📖"],
      ["pen", "pen", "🖊️"],
      ["potlood", "potlood", "✏️"],
      ["schaar", "schaar", "✂️"],
      ["telefoon", "telefoon", "📱"],
      ["computer", "computer", "💻"],
      ["televisie", "televisie", "📺"],
      ["kopje", "kopje", "☕"],
      ["bord", "bord", "🍽️"],
      ["lepel", "lepel", "🥄"],
      ["vork", "vork", "🍴"],
      ["mes", "mes", "🔪"],
      ["pan", "pan", "🍳"],
      ["douche", "douche", "🚿"],
      ["bad", "bad", "🛁"],
      ["wc", "wc", "🚽"],
      ["sleutel", "sleutel", "🔑"],
      ["tas", "tas", "👜"],
      ["paraplu", "paraplu", "☂️"],
      ["bezem", "bezem", "🧹"],
      ["emmer", "emmer", "🪣"],
      ["zeep", "zeep", "🧼"],
      ["tandenborstel", "tandenborstel", "🪥"],
      ["kaars", "kaars", "🕯️"],
      ["schilderij", "schilderij", "🖼️"],
      ["koffer", "koffer", "🧳"],
      ["wekker", "wekker", "⏰"],
    ],
  },
  {
    slug: "gevoelens",
    levelSlug: "thuis-en-eten",
    titleNl: "Gevoelens",
    emoji: "😊",
    teaser: "Hoe voel jij je vandaag?",
    isImplemented: false,
    words: [
      ["blij", "blij", "😄"],
      ["verdrietig", "verdrietig", "😢"],
      ["boos", "boos", "😠"],
      ["bang", "bang", "😨"],
      ["geschokt", "geschokt", "😱"],
      ["verrast", "verrast", "😲"],
      ["moe", "moe", "😴"],
      ["verliefd", "verliefd", "😍"],
      ["ziek", "ziek", "🤒"],
      ["verveeld", "verveeld", "🥱"],
      ["nieuwsgierig", "nieuwsgierig", "🤔"],
      ["koud", "koud", "🥶"],
      ["warm", "warm", "🥵"],
      ["beschaamd", "beschaamd", "😳"],
      ["walging", "walging", "🤢"],
      ["trots", "trots", "😎"],
    ],
  },
  {
    slug: "natuur-en-weer",
    levelSlug: "buiten-en-natuur",
    titleNl: "Natuur & Weer",
    emoji: "🌦️",
    teaser: "Zon, regen en alles daartussenin.",
    isImplemented: false,
    words: [
      ["zon", "zon", "☀️"],
      ["maan", "maan", "🌙"],
      ["ster", "ster", "⭐"],
      ["wolk", "wolk", "☁️"],
      ["regen", "regen", "🌧️"],
      ["sneeuw", "sneeuw", "❄️"],
      ["wind", "wind", "💨"],
      ["regenboog", "regenboog", "🌈"],
      ["bliksem", "bliksem", "⚡"],
      ["berg", "berg", "⛰️"],
      ["vulkaan", "vulkaan", "🌋"],
      ["zee", "zee", "🌊"],
      ["strand", "strand", "🏖️"],
      ["boom", "boom", "🌳"],
      ["bloem", "bloem", "🌸"],
      ["gras", "gras", "🌱"],
      ["blad", "blad", "🍂"],
      ["eiland", "eiland", "🏝️"],
      ["woestijn", "woestijn", "🏜️"],
      ["bos", "bos", "🌲"],
      ["grot", "grot", "🕳️"],
      ["vuur", "vuur", "🔥"],
      ["ijs", "ijs", "🧊"],
      ["storm", "storm", "🌪️"],
      ["mist", "mist", "🌫️"],
      ["komeet", "komeet", "🌠"],
      ["planeet", "planeet", "🪐"],
      ["aarde", "aarde", "🌍"],
    ],
  },
  {
    slug: "vervoer",
    levelSlug: "buiten-en-natuur",
    titleNl: "Vervoer",
    emoji: "🚗",
    teaser: "Hoe kom je van A naar B?",
    isImplemented: false,
    words: [
      ["auto", "auto", "🚗"],
      ["bus", "bus", "🚌"],
      ["trein", "trein", "🚆"],
      ["vliegtuig", "vliegtuig", "✈️"],
      ["fiets", "fiets", "🚲"],
      ["motor", "motor", "🏍️"],
      ["boot", "boot", "⛵"],
      ["schip", "schip", "🚢"],
      ["helikopter", "helikopter", "🚁"],
      ["raket", "raket", "🚀"],
      ["tractor", "tractor", "🚜"],
      ["brandweerwagen", "brandweerwagen", "🚒"],
      ["ambulance", "ambulance", "🚑"],
      ["politieauto", "politieauto", "🚓"],
      ["taxi", "taxi", "🚕"],
      ["vrachtwagen", "vrachtwagen", "🚛"],
      ["step", "step", "🛴"],
      ["skateboard", "skateboard", "🛹"],
      ["rolstoel", "rolstoel", "♿"],
      ["kano", "kano", "🛶"],
      ["tram", "tram", "🚋"],
      ["metro", "metro", "🚇"],
      ["kabelbaan", "kabelbaan", "🚡"],
      ["slee", "slee", "🛷"],
      ["brommer", "brommer", "🛵"],
      ["luchtballon", "luchtballon", "🎈"],
      ["wagon", "wagon", "🚃"],
      ["raceauto", "raceauto", "🏎️"],
    ],
  },
  {
    slug: "speelgoed-en-spel",
    levelSlug: "buiten-en-natuur",
    titleNl: "Speelgoed & Spel",
    emoji: "🧸",
    teaser: "Tijd om te spelen!",
    isImplemented: false,
    words: [
      ["bal", "bal", "⚽"],
      ["pop", "pop", "🎎"],
      ["teddybeer", "teddybeer", "🧸"],
      ["puzzel", "puzzel", "🧩"],
      ["dobbelsteen", "dobbelsteen", "🎲"],
      ["kaartspel", "kaartspel", "🃏"],
      ["glijbaan", "glijbaan", "🛝"],
      ["vlieger", "vlieger", "🪁"],
      ["ballon", "ballon", "🎈"],
      ["zeepbellen", "zeepbellen", "🫧"],
      ["lego", "lego", "🧱"],
      ["spelcomputer", "spelcomputer", "🎮"],
      ["yoyo", "yo-yo", "🪀"],
      ["frisbee", "frisbee", "🥏"],
      ["badminton", "badminton", "🏸"],
      ["schaakbord", "schaakbord", "♟️"],
      ["draak", "speelgoeddraak", "🐉"],
      ["robot", "robot", "🤖"],
      ["magneet", "magneet", "🧲"],
      ["kompas", "kompas", "🧭"],
      ["verrekijker", "verrekijker", "🔭"],
      ["vergrootglas", "vergrootglas", "🔍"],
      ["vlag", "vlag", "🚩"],
      ["schat", "schat", "💰"],
    ],
  },
  {
    slug: "beroepen",
    levelSlug: "grote-wereld",
    titleNl: "Beroepen",
    emoji: "👷",
    teaser: "Wat wil jij later worden?",
    isImplemented: false,
    words: [
      ["dokter", "dokter", "🧑‍⚕️"],
      ["leraar", "leraar", "🧑‍🏫"],
      ["brandweerman", "brandweerman", "🧑‍🚒"],
      ["politieagent", "politieagent", "👮"],
      ["boer", "boer", "🧑‍🌾"],
      ["kok", "kok", "🧑‍🍳"],
      ["kapper", "kapper", "💇"],
      ["monteur", "monteur", "🧑‍🔧"],
      ["piloot", "piloot", "🧑‍✈️"],
      ["astronaut", "astronaut", "🧑‍🚀"],
      ["kunstenaar", "kunstenaar", "🧑‍🎨"],
      ["zanger", "zanger", "🧑‍🎤"],
      ["wetenschapper", "wetenschapper", "🧑‍🔬"],
      ["rechter", "rechter", "🧑‍⚖️"],
      ["visser", "visser", "🎣"],
      ["postbode", "postbode", "✉️"],
      ["bakker", "bakker", "🥖"],
      ["danser", "danser", "💃"],
      ["acteur", "acteur", "🎭"],
      ["schrijver", "schrijver", "✍️"],
      ["fotograaf", "fotograaf", "📷"],
      ["dierenarts", "dierenarts", "🐾"],
      ["tandarts", "tandarts", "🦷"],
      ["apotheker", "apotheker", "💊"],
      ["buschauffeur", "buschauffeur", "🚌"],
      ["treinmachinist", "treinmachinist", "🚆"],
      ["bouwvakker", "bouwvakker", "👷"],
      ["elektricien", "elektricien", "⚡"],
      ["loodgieter", "loodgieter", "🚰"],
      ["imker", "imker", "🐝"],
      ["kapitein", "kapitein", "⚓"],
      ["rechercheur", "rechercheur", "🔍"],
      ["bibliothecaris", "bibliothecaris", "📚"],
      ["architect", "architect", "📐"],
      ["scheidsrechter", "scheidsrechter", "🟨"],
    ],
  },
  {
    slug: "school",
    levelSlug: "grote-wereld",
    titleNl: "School",
    emoji: "🎒",
    teaser: "Alles voor in je schooltas.",
    isImplemented: false,
    words: [
      ["boek", "boek", "📚"],
      ["schrift", "schrift", "📓"],
      ["vulpen", "vulpen", "🖋️"],
      ["stift", "stift", "🖍️"],
      ["liniaal", "liniaal", "📏"],
      ["schaar", "schaar", "✂️"],
      ["rugzak", "rugzak", "🎒"],
      ["gymschoenen", "gymschoenen", "👟"],
      ["wereldbol", "wereldbol", "🌐"],
      ["landkaart", "landkaart", "🗺️"],
      ["computer", "computer", "💻"],
      ["prikbord", "prikbord", "📌"],
      ["rekenmachine", "rekenmachine", "🧮"],
      ["agenda", "agenda", "📅"],
      ["map", "map", "📁"],
      ["paperclip", "paperclip", "📎"],
      ["verfkwast", "verfkwast", "🖌️"],
      ["verf", "verf", "🎨"],
      ["blocnote", "blocnote", "🗒️"],
      ["label", "label", "🏷️"],
      ["bel", "schoolbel", "🔔"],
      ["microscoop", "microscoop", "🔬"],
      ["diploma", "diploma", "📜"],
      ["medaille", "medaille", "🏅"],
      ["trofee", "trofee", "🏆"],
      ["bril", "bril", "👓"],
    ],
  },
];

export function getCategoriesForLevel(levelSlug: string): CategoryDefinition[] {
  return CATEGORIES.filter((category) => category.levelSlug === levelSlug);
}

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function getLevelBySlug(slug: string): LevelDefinition | undefined {
  return LEVELS.find((level) => level.slug === slug);
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

/** Platte lijst van alle woorden in de catalogus, met level/categorie erbij — voor de opnamestudio. */
export function getCatalogItems(): CatalogItem[] {
  const items: CatalogItem[] = [];
  for (const category of CATEGORIES) {
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
