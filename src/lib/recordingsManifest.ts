import { promises as fs } from "fs";
import path from "path";
import type { ReviewStatus } from "@/types/domain";
import { recordingKey, type RecordingPersona } from "@/lib/recordableItems";

/**
 * Server-only opslag voor de opnamestudio (zie ARCHITECTUUR-OPNAMESTUDIO.md).
 * Schrijft naar lokale schijf — bedoeld om lokaal (`npm run dev`) te
 * draaien, niet op Vercel (read-only filesystem daar, zie architectuurdoc
 * sectie 2). Alleen importeren vanuit route handlers (src/app/api/studio/*),
 * nooit vanuit client components.
 */

export interface RecordingEntry {
  itemId: string;
  persona: RecordingPersona;
  fileName: string;
  mimeType: string;
  reviewStatus: ReviewStatus;
  recordedAt: string;
}

export type RecordingsManifest = Record<string, RecordingEntry>;

const MANIFEST_PATH = path.join(process.cwd(), "data", "recordings-manifest.json");
const AUDIO_DIR = path.join(process.cwd(), "public", "audio", "recordings");

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return typeof err === "object" && err !== null && "code" in err;
}

export async function readManifest(): Promise<RecordingsManifest> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf-8");
    return JSON.parse(raw) as RecordingsManifest;
  } catch (err) {
    if (isErrnoException(err) && err.code === "ENOENT") return {};
    throw err;
  }
}

async function writeManifest(manifest: RecordingsManifest): Promise<void> {
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

export async function saveRecording(params: {
  itemId: string;
  persona: RecordingPersona;
  audio: Buffer;
  mimeType: string;
}): Promise<RecordingEntry> {
  const extension = extensionForMimeType(params.mimeType);
  const key = recordingKey(params.itemId, params.persona);
  const fileName = `${key}.${extension}`;

  await fs.mkdir(AUDIO_DIR, { recursive: true });
  await fs.writeFile(path.join(AUDIO_DIR, fileName), params.audio);

  const manifest = await readManifest();

  // Oud bestand opruimen als de extensie veranderde (bv. opnieuw ingesproken
  // in een andere browser met een ander opnameformaat).
  const previous = manifest[key];
  if (previous && previous.fileName !== fileName) {
    await fs.rm(path.join(AUDIO_DIR, previous.fileName), { force: true });
  }

  // Elke nieuwe opname moet opnieuw beoordeeld worden (hfst. 21) — nooit
  // automatisch een eerdere goedkeuring laten "meeliften".
  const entry: RecordingEntry = {
    itemId: params.itemId,
    persona: params.persona,
    fileName,
    mimeType: params.mimeType,
    reviewStatus: "TE_REVIEWEN",
    recordedAt: new Date().toISOString(),
  };
  manifest[key] = entry;
  await writeManifest(manifest);
  return entry;
}

export async function updateReviewStatus(
  itemId: string,
  persona: RecordingPersona,
  reviewStatus: ReviewStatus
): Promise<RecordingEntry | null> {
  const manifest = await readManifest();
  const key = recordingKey(itemId, persona);
  const entry = manifest[key];
  if (!entry) return null;
  entry.reviewStatus = reviewStatus;
  manifest[key] = entry;
  await writeManifest(manifest);
  return entry;
}

export async function deleteRecording(itemId: string, persona: RecordingPersona): Promise<void> {
  const manifest = await readManifest();
  const key = recordingKey(itemId, persona);
  const entry = manifest[key];
  if (!entry) return;
  await fs.rm(path.join(AUDIO_DIR, entry.fileName), { force: true });
  delete manifest[key];
  await writeManifest(manifest);
}
