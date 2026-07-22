/**
 * Bouwt public/audio-catalog.json opnieuw op vanuit data/recordings-manifest.json
 * en data/word-spellings.json — vóórdat de app opstart (predev/prebuild, zie
 * package.json), zodat je nooit meer een lege/verouderde catalogus kunt
 * krijgen zonder ooit zelf de opnamestudio te hoeven openen. Zie
 * src/lib/publicCatalogSnapshot.ts en ARCHITECTUUR-OPNAMESTUDIO.md.
 */
import { regeneratePublicCatalog } from "../src/lib/publicCatalogSnapshot";

regeneratePublicCatalog()
  .then(() => {
    console.log("✓ public/audio-catalog.json bijgewerkt.");
  })
  .catch((err) => {
    // Nooit npm run dev/build laten falen hierop — best effort.
    console.warn("Kon public/audio-catalog.json niet bijwerken:", err);
  });
