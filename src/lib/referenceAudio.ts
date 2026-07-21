import type { RecordingPersona } from "@/lib/recordableItems";

/**
 * Client-side cache rond GET /api/audio-catalog (publiek, alleen-lezen):
 * welke woorden hebben al een goedgekeurde admin-opname, en waar staat die?
 * Gebruikt door AudioButton en ListenAndSpeak.
 */

export interface ReferenceAudio {
  url: string;
  persona: RecordingPersona;
}

const PERSONA_PREFERENCE: RecordingPersona[] = ["man", "vrouw", "jongen", "meisje"];

let cachePromise: Promise<Map<string, ReferenceAudio[]>> | null = null;

async function loadCatalog(): Promise<Map<string, ReferenceAudio[]>> {
  const response = await fetch("/api/audio-catalog");
  const data = (await response.json()) as { entries: { itemId: string; persona: string; url: string }[] };
  const map = new Map<string, ReferenceAudio[]>();
  for (const entry of data.entries) {
    const list = map.get(entry.itemId) ?? [];
    list.push({ url: entry.url, persona: entry.persona as RecordingPersona });
    map.set(entry.itemId, list);
  }
  return map;
}

function getCatalog(): Promise<Map<string, ReferenceAudio[]>> {
  if (!cachePromise) cachePromise = loadCatalog();
  return cachePromise;
}

/** Beste beschikbare referentie-opname voor dit item (voorkeur man > vrouw > jongen > meisje), of null. */
export async function getReferenceAudioForItem(itemId: string): Promise<ReferenceAudio | null> {
  const catalog = await getCatalog();
  const options = catalog.get(itemId);
  if (!options || options.length === 0) return null;
  for (const persona of PERSONA_PREFERENCE) {
    const match = options.find((option) => option.persona === persona);
    if (match) return match;
  }
  return options[0] ?? null;
}

/** Voor tests/hertesten: forceer een nieuwe fetch bij de volgende aanroep. */
export function resetReferenceAudioCache(): void {
  cachePromise = null;
}
