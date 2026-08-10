import { mockTtsProvider } from "@/providers/tts/mockTtsProvider";
import { speakDutchFallback } from "@/providers/tts/browserSpeechFallback";
import { getReferenceAudioForItem } from "@/lib/referenceAudio";

interface PlayWordAudioInput {
  itemId?: string;
  text: string;
  fallbackSpokenText?: string;
  slow?: boolean;
}

/**
 * Gedeelde afspeellogica achter AudioButton (echte opname > mock TTS >
 * NL-fallback) — hier als losse functie zodat andere plekken (bv.
 * WordGrid.tsx: meteen afspelen bij het aantikken van een plaatje, zonder
 * de volledige knop-UI nodig te hebben) 'm ook kunnen gebruiken zonder
 * logica te dupliceren.
 */
export async function playWordAudio({ itemId, text, fallbackSpokenText, slow = false }: PlayWordAudioInput): Promise<void> {
  if (itemId) {
    const reference = await getReferenceAudioForItem(itemId);
    if (reference) {
      const audio = new Audio(reference.url);
      audio.playbackRate = slow ? 0.7 : 1.0;
      try {
        await audio.play();
      } catch {
        // Afspelen kan mislukken (bv. autoplay-restricties) — geen harde fout, gewoon negeren.
      }
      return;
    }
  }

  await mockTtsProvider.generateSpeech({
    text,
    languageCode: "tzm",
    voiceId: "demo-voice",
    speakingRate: slow ? 0.7 : 1.0,
  });

  if (fallbackSpokenText) {
    speakDutchFallback(fallbackSpokenText, slow ? 0.7 : 1.0);
  }
}
