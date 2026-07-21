import { promises as fs } from "fs";
import path from "path";

/**
 * Server-only opslag voor gesproken pogingen van kinderen die (nog) niet
 * automatisch vergeleken konden worden (geen goedgekeurde referentie-opname
 * — zie audioSimilarityProvider.ts). Bewaard voor latere menselijke
 * beoordeling door een ouder/beheerder (hfst. 21) — er is nu nog GEEN
 * review-scherm hiervoor gebouwd, dit is puur de opslag-kant.
 *
 * Bewust NIET onder public/ (privacy, hfst. 23): deze bestanden zijn niet
 * publiek benaderbaar via een URL, in tegenstelling tot de opnamestudio-audio.
 *
 * Zelfde kanttekening als de opnamestudio: schrijft naar lokale schijf, werkt
 * dus alleen als de app lokaal draait, niet op Vercel (read-only filesystem
 * daar). Opslaan is expres "best effort" — een mislukte opslag mag de
 * lesflow van het kind nooit blokkeren.
 */

export interface ChildAttemptEntry {
  childId: string;
  itemId: string;
  fileName: string;
  mimeType: string;
  recordedAt: string;
  /** Was er een referentie-opname om automatisch mee te vergelijken? */
  hadReference: boolean;
}

const ATTEMPTS_DIR = path.join(process.cwd(), "data", "child-attempts");
const MANIFEST_PATH = path.join(ATTEMPTS_DIR, "manifest.json");

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return typeof err === "object" && err !== null && "code" in err;
}

async function readManifest(): Promise<ChildAttemptEntry[]> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf-8");
    return JSON.parse(raw) as ChildAttemptEntry[];
  } catch (err) {
    if (isErrnoException(err) && err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeManifest(entries: ChildAttemptEntry[]): Promise<void> {
  await fs.mkdir(ATTEMPTS_DIR, { recursive: true });
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(entries, null, 2)}\n`, "utf-8");
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

export async function saveChildAttempt(params: {
  childId: string;
  itemId: string;
  audio: Buffer;
  mimeType: string;
  hadReference: boolean;
}): Promise<void> {
  const extension = extensionForMimeType(params.mimeType);
  const fileName = `${params.childId}__${params.itemId}__${Date.now()}.${extension}`;

  await fs.mkdir(ATTEMPTS_DIR, { recursive: true });
  await fs.writeFile(path.join(ATTEMPTS_DIR, fileName), params.audio);

  const entries = await readManifest();
  entries.push({
    childId: params.childId,
    itemId: params.itemId,
    fileName,
    mimeType: params.mimeType,
    recordedAt: new Date().toISOString(),
    hadReference: params.hadReference,
  });
  await writeManifest(entries);
}
