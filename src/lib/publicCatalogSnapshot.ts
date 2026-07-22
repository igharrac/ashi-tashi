import { promises as fs } from "fs";
import path from "path";
// Relatieve imports (i.p.v. @/lib/...): dit bestand wordt ook standalone
// gedraaid via scripts/regenerate-audio-catalog.ts (predev/prebuild), buiten
// Next.js' eigen bundelaar om, die de @/-alias niet kent.
import { readManifest } from "./recordingsManifest";
import { readSpellings } from "./wordSpellings";

/**
 * Bouwt public/audio-catalog.json opnieuw op vanuit de opname-manifest +
 * de fonetische spellingen. Bewust een STATISCH bestand onder public/, in
 * plaats van dat de kind-app een dynamische API-route laat die het
 * manifest live van schijf leest:
 *
 * Next.js' automatische file-tracing voor serverless functions (Vercel)
 * ziet geen dynamische fs.readFile-paden — data/*.json wordt runtime
 * samengesteld via process.cwd(), niet via een statische import — waardoor
 * die bestanden op Vercel zouden kunnen ontbreken in de gedeployde functie.
 * Bestanden onder public/ worden daarentegen altijd gewoon als statische
 * assets meegedeployed, dus dat is hier de betrouwbare weg. Zie
 * ARCHITECTUUR-OPNAMESTUDIO.md.
 *
 * Wordt aangeroepen vanuit de studio-route-handlers na elke wijziging
 * (opname opslaan/goedkeuren/verwijderen, spelling bijwerken).
 */

export interface PublicCatalogItem {
  phoneticSpelling: string | null;
  /** persona -> publieke URL van de goedgekeurde opname */
  recordings: Record<string, string>;
}

export interface PublicCatalogSnapshot {
  generatedAt: string;
  items: Record<string, PublicCatalogItem>;
}

const SNAPSHOT_PATH = path.join(process.cwd(), "public", "audio-catalog.json");

export async function regeneratePublicCatalog(): Promise<void> {
  const [manifest, spellings] = await Promise.all([readManifest(), readSpellings()]);

  const items: Record<string, PublicCatalogItem> = {};

  for (const entry of Object.values(manifest)) {
    if (entry.reviewStatus !== "GOEDGEKEURD") continue;
    const existing = items[entry.itemId] ?? { phoneticSpelling: spellings[entry.itemId] ?? null, recordings: {} };
    existing.recordings[entry.persona] = `/audio/recordings/${entry.fileName}`;
    items[entry.itemId] = existing;
  }

  // Ook woorden met alleen al een spelling maar (nog) geen goedgekeurde
  // opname meenemen, zodat de tekst zichtbaar kan zijn vóór er audio is.
  for (const [itemId, phoneticSpelling] of Object.entries(spellings)) {
    if (!items[itemId]) {
      items[itemId] = { phoneticSpelling, recordings: {} };
    }
  }

  const snapshot: PublicCatalogSnapshot = { generatedAt: new Date().toISOString(), items };
  await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
  await fs.writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf-8");
}
