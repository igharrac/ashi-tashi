import type { RecordingPersona } from "@/lib/recordableItems";

/**
 * Client-side cache rond /audio-catalog.json — een STATISCH bestand onder
 * public/ (niet een dynamische API-route), gegenereerd door de opnamestudio
 * (src/lib/publicCatalogSnapshot.ts). Zie dat bestand voor waarom: zo werkt
 * dit ook betrouwbaar op Vercel, niet alleen lokaal.
 *
 * Gebruikt door AudioButton (echte opname afspelen), ListenAndSpeak
 * (audio-vergelijking) en de oefencomponenten die de fonetische spelling
 * tonen i.p.v. het Nederlandse woord zodra die beschikbaar is.
 */

export interface ReferenceAudio {
  url: string;
  persona: RecordingPersona;
}

interface CatalogItem {
  phoneticSpelling: string | null;
  recordings: Record<string, string>;
}

interface CatalogSnapshot {
  generatedAt: string;
  items: Record<string, CatalogItem>;
}

const PERSONA_PREFERENCE: RecordingPersona[] = ["man", "vrouw", "jongen", "meisje"];

let cachePromise: Promise<CatalogSnapshot> | null = null;

async function loadCatalog(): Promise<CatalogSnapshot> {
  const response = await fetch("/audio-catalog.json", { cache: "no-store" });
  if (!response.ok) return { generatedAt: "", items: {} };
  return (await response.json()) as CatalogSnapshot;
}

function getCatalog(): Promise<CatalogSnapshot> {
  if (!cachePromise) cachePromise = loadCatalog();
  return cachePromise;
}

/**
 * Beste beschikbare referentie-opname voor dit item.
 * - Met `preferredPersona`: die stem als er een opname voor bestaat.
 * - Zonder (of als de gekozen stem ontbreekt voor dit specifieke woord):
 *   terugvallen op de vaste voorkeursvolgorde man > vrouw > jongen > meisje,
 *   zodat een gekozen stem nooit een woord laat "verdwijnen" dat wel in een
 *   andere stem is ingesproken.
 */
export async function getReferenceAudioForItem(
  itemId: string,
  preferredPersona?: RecordingPersona | null,
): Promise<ReferenceAudio | null> {
  const catalog = await getCatalog();
  const recordings = catalog.items[itemId]?.recordings;
  if (!recordings) return null;

  if (preferredPersona) {
    const url = recordings[preferredPersona];
    if (url) return { url, persona: preferredPersona };
  }

  for (const persona of PERSONA_PREFERENCE) {
    const url = recordings[persona];
    if (url) return { url, persona };
  }
  const fallbackEntry = Object.entries(recordings)[0];
  if (!fallbackEntry) return null;
  return { url: fallbackEntry[1], persona: fallbackEntry[0] as RecordingPersona };
}

/** De door een beheerder ingevoerde fonetische spelling voor dit woord, of null als die er nog niet is. */
export async function getPhoneticSpellingForItem(itemId: string): Promise<string | null> {
  const catalog = await getCatalog();
  return catalog.items[itemId]?.phoneticSpelling ?? null;
}

/**
 * Alle item-id's die minstens één goedgekeurde opname hebben — gebruikt door
 * MatchGame.tsx om alleen woorden met écht Tashelhit-geluid in de rondes te
 * stoppen (i.p.v. items die zonder opname op de Nederlandse fallback zouden
 * terugvallen, wat het spel minder zinvol maakt).
 */
export async function getItemIdsWithRecordings(): Promise<Set<string>> {
  const catalog = await getCatalog();
  return new Set(
    Object.entries(catalog.items)
      .filter(([, item]) => Object.keys(item.recordings).length > 0)
      .map(([itemId]) => itemId),
  );
}

/** Voor tests/hertesten: forceer een nieuwe fetch bij de volgende aanroep. */
export function resetReferenceAudioCache(): void {
  cachePromise = null;
}
