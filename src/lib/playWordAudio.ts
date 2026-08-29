import { mockTtsProvider } from "@/providers/tts/mockTtsProvider";
import { speakDutchFallback } from "@/providers/tts/browserSpeechFallback";
import { getReferenceAudioForItem } from "@/lib/referenceAudio";
import type { RecordingPersona } from "@/lib/recordableItems";

// Eén gedeelde referentie naar het HTMLAudioElement dat nu (mogelijk) nog
// speelt — module-scope, niet per component-instance, want een <audio>
// blijft gewoon doorspelen ook nadat het component dat 'm startte al
// unmount is (bv. bij snel doorklikken naar de volgende vraag). Zonder dit
// zou het vorige woordje nog uitgesproken worden terwijl het nieuwe al
// begint.
let currentAudio: HTMLAudioElement | null = null;

/**
 * Kapt alles af wat nog klinkt van een vorige playWordAudio-aanroep: zowel
 * een lopende opname (currentAudio) als browserspraaksynthese
 * (speakDutchFallback annuleert zichzelf al bij een volgende aanroep, maar
 * niet als de vólgende aanroep juist een échte opname afspeelt).
 */
function stopCurrentPlayback(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

interface PlayWordAudioInput {
  itemId?: string;
  text: string;
  fallbackSpokenText?: string;
  slow?: boolean;
  /** Gekozen stem van de gebruiker (JourneySettingsMenu); zie getReferenceAudioForItem voor het terugvalgedrag. */
  preferredPersona?: RecordingPersona | null;
}

/**
 * Gedeelde afspeellogica achter AudioButton (echte opname > mock TTS >
 * NL-fallback) — hier als losse functie zodat andere plekken (bv.
 * WordGrid.tsx: meteen afspelen bij het aantikken van een plaatje, zonder
 * de volledige knop-UI nodig te hebben) 'm ook kunnen gebruiken zonder
 * logica te dupliceren.
 */
export async function playWordAudio({
  itemId,
  text,
  fallbackSpokenText,
  slow = false,
  preferredPersona,
}: PlayWordAudioInput): Promise<void> {
  // Meteen afkappen wat nog van een vorige aanroep speelt — vóór het
  // (async) ophalen van de referentie hieronder, zodat een oud fragment
  // niet nog even doorloopt terwijl het nieuwe al wordt opgehaald.
  stopCurrentPlayback();

  if (itemId) {
    const reference = await getReferenceAudioForItem(itemId, preferredPersona);
    if (reference) {
      // Nogmaals afkappen: tussen het ophalen hierboven (await) en hier kan
      // er alweer een nieuwere aanroep gestart zijn die zelf ook al
      // afgekapt heeft — anders zou dit inmiddels verouderde fragment
      // alsnog van start gaan bovenop het nieuwere.
      stopCurrentPlayback();
      const audio = new Audio(reference.url);
      audio.playbackRate = slow ? 0.7 : 1.0;
      currentAudio = audio;
      audio.addEventListener("ended", () => {
        if (currentAudio === audio) currentAudio = null;
      });
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
