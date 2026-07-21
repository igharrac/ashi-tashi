import { NextResponse } from "next/server";
import { readManifest } from "@/lib/recordingsManifest";

/**
 * Publiek, alleen-lezen endpoint (géén wachtwoord — dit is de kind-app, niet
 * de opnamestudio) dat vertelt welke woorden al een GOEDGEKEURDE opname
 * hebben, en waar die audio staat. Gebruikt door AudioButton (echte audio
 * afspelen i.p.v. NL-fallback) en ListenAndSpeak (audio-vergelijking).
 *
 * Zelfde kanttekening als de opnamestudio: dit leest van de lokale schijf,
 * werkt dus alleen als de app lokaal draait of de opnames zijn meegecommit
 * en gedeployed als statische bestanden (zie ARCHITECTUUR-OPNAMESTUDIO.md).
 */
export const runtime = "nodejs";

export interface AudioCatalogEntry {
  itemId: string;
  persona: string;
  url: string;
}

export async function GET() {
  const manifest = await readManifest();
  const entries: AudioCatalogEntry[] = Object.values(manifest)
    .filter((entry) => entry.reviewStatus === "GOEDGEKEURD")
    .map((entry) => ({
      itemId: entry.itemId,
      persona: entry.persona,
      url: `/audio/recordings/${entry.fileName}`,
    }));

  return NextResponse.json({ entries });
}
