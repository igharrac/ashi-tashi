import { getCatalogItems } from "@/lib/contentCatalog";

/**
 * Opnamestudio (zie ARCHITECTUUR-OPNAMESTUDIO.md): welke woorden kun je
 * inspreken? Bron is de volledige content-catalogus (src/lib/contentCatalog.ts,
 * Level > Categorie > Woord) — dus alle 11 categorieën, niet alleen "Dieren".
 */
export interface RecordableItem {
  id: string;
  translationNl: string;
  latinSpelling: string;
  itemKind: "woord";
  imageEmoji: string;
  levelSlug: string;
  levelTitleNl: string;
  categorySlug: string;
  categoryTitleNl: string;
}

export function getRecordableItems(): RecordableItem[] {
  return getCatalogItems().map((item) => ({
    id: item.id,
    translationNl: item.translationNl,
    latinSpelling: item.latinSpelling,
    itemKind: item.itemKind,
    imageEmoji: item.emoji,
    levelSlug: item.levelSlug,
    levelTitleNl: item.levelTitleNl,
    categorySlug: item.categorySlug,
    categoryTitleNl: item.categoryTitleNl,
  }));
}

/** Persona's zoals bedoeld in hfst. 19.1: man, vrouw, jongen, meisje. */
export const RECORDING_PERSONAS = ["man", "vrouw", "jongen", "meisje"] as const;
export type RecordingPersona = (typeof RECORDING_PERSONAS)[number];

export const PERSONA_LABELS: Record<RecordingPersona, string> = {
  man: "Man",
  vrouw: "Vrouw",
  jongen: "Jongen",
  meisje: "Meisje",
};

export function isRecordingPersona(value: string): value is RecordingPersona {
  return (RECORDING_PERSONAS as readonly string[]).includes(value);
}

/** Sleutel voor manifest-lookups; client-veilig (geen fs), zie recordingsManifest.ts voor de server-kant. */
export function recordingKey(itemId: string, persona: RecordingPersona): string {
  return `${itemId}__${persona}`;
}
