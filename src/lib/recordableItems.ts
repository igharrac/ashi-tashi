import { DIEREN_THEME } from "@/lib/demoData";
import type { ThemeView } from "@/types/domain";

/**
 * Opnamestudio (zie ARCHITECTUUR-OPNAMESTUDIO.md): welke woorden/zinnen kun
 * je inspreken? Deze lijst wordt automatisch afgeleid uit de bestaande
 * demo-content (src/lib/demoData.ts), zodat er geen aparte, met de hand
 * bijgehouden lijst hoeft te bestaan die uit de pas kan gaan lopen.
 *
 * Nu alleen "Dieren" (het enige thema met echte placeholder-content, hfst.
 * 54). Zodra een nieuw thema content krijgt, hier gewoon toevoegen aan
 * RECORDABLE_THEMES.
 */
const RECORDABLE_THEMES: ThemeView[] = [DIEREN_THEME];

export interface RecordableItem {
  id: string;
  translationNl: string;
  latinSpelling: string;
  itemKind: "woord" | "zin";
  imageEmoji: string;
  themeSlug: string;
  themeTitleNl: string;
}

export function getRecordableItems(): RecordableItem[] {
  const seen = new Map<string, RecordableItem>();

  for (const theme of RECORDABLE_THEMES) {
    for (const lesson of theme.lessons) {
      for (const exercise of lesson.exercises) {
        const item = exercise.vocabularyItem;
        if (seen.has(item.id)) continue;
        seen.set(item.id, {
          id: item.id,
          translationNl: item.translationNl,
          latinSpelling: item.latinSpelling,
          itemKind: item.itemKind ?? "woord",
          imageEmoji: item.imageEmoji,
          themeSlug: theme.slug,
          themeTitleNl: theme.titleNl,
        });
      }
    }
  }

  return Array.from(seen.values());
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
