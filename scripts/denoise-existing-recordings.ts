/**
 * Eenmalig batch-script: past ruisonderdrukking (RNNoise, zie
 * src/lib/audio/denoise.ts) toe op alle reeds ingesproken opnames in
 * public/audio/recordings/. Draait NIET automatisch mee met dev/build —
 * bewust met de hand te starten (`npm run denoise:existing`), want dit
 * overschrijft bestaande bestanden (met een backup, zie hieronder).
 *
 * Backup: elk origineel bestand wordt eerst gekopieerd naar
 * data/audio-backups/originals/<bestandsnaam>, zodat je altijd kunt
 * vergelijken of teruggaan als de ruisonderdrukking een keer tegenvalt.
 * Draai je het script twee keer, dan wordt een bestaande backup NIET
 * overschreven (die bevat dan al het echte origineel).
 */
import { promises as fs } from "fs";
import path from "path";
import { readManifest, writeManifest } from "../src/lib/recordingsManifest";
import { denoiseAudioBuffer } from "../src/lib/audio/denoise";

const AUDIO_DIR = path.join(process.cwd(), "public", "audio", "recordings");
const BACKUP_DIR = path.join(process.cwd(), "data", "audio-backups", "originals");

async function main() {
  const manifest = await readManifest();
  const entries = Object.entries(manifest);

  if (entries.length === 0) {
    console.log("Geen opnames gevonden in data/recordings-manifest.json — niets te doen.");
    return;
  }

  await fs.mkdir(BACKUP_DIR, { recursive: true });

  let denoisedCount = 0;
  let skippedCount = 0;
  let alreadyDoneCount = 0;

  for (const [key, entry] of entries) {
    if (entry.denoised) {
      alreadyDoneCount++;
      console.log(`○ ${key}: al eerder gedenoised, overgeslagen.`);
      continue;
    }

    const filePath = path.join(AUDIO_DIR, entry.fileName);
    const backupPath = path.join(BACKUP_DIR, entry.fileName);

    let original: Buffer;
    try {
      original = await fs.readFile(filePath);
    } catch {
      console.warn(`✗ ${key}: bestand ${entry.fileName} niet gevonden, overgeslagen.`);
      skippedCount++;
      continue;
    }

    // Backup alleen wegschrijven als hij nog niet bestaat — zodat een tweede
    // run nooit een eerder-gemaakte backup (= het echte origineel) overschrijft.
    try {
      await fs.access(backupPath);
    } catch {
      await fs.writeFile(backupPath, original);
    }

    const result = await denoiseAudioBuffer(original, entry.mimeType);
    if (!result.applied) {
      console.warn(`✗ ${key}: ruisonderdrukking niet toegepast (${result.reason}).`);
      skippedCount++;
      continue;
    }

    await fs.writeFile(filePath, result.buffer);
    manifest[key] = { ...entry, denoised: true };
    denoisedCount++;
    console.log(`✓ ${key}: gedenoised (${original.length} → ${result.buffer.length} bytes).`);
  }

  await writeManifest(manifest);

  console.log("");
  console.log(
    `Klaar: ${denoisedCount} gedenoised, ${alreadyDoneCount} al eerder gedaan, ${skippedCount} overgeslagen.`,
  );
  if (denoisedCount > 0) {
    console.log(`Originelen staan in ${path.relative(process.cwd(), BACKUP_DIR)}/`);
  }
}

main().catch((err) => {
  console.error("Batch-script mislukt:", err);
  process.exit(1);
});
