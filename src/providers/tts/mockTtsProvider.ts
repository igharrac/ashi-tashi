import type { GenerateSpeechInput, GeneratedAudio, TextToSpeechProvider } from "./types";

/**
 * Mock-implementatie van TextToSpeechProvider.
 *
 * Gebruikt in de MVP zodat de volledige app-flow getest kan worden zonder
 * een echte TTS-leverancier of API-sleutel. Retourneert een placeholder
 * audio-URL die verwijst naar het gekoppelde AudioAsset in de seeddata
 * (zie prisma/seed.ts) in plaats van live spraak te genereren.
 *
 * Vervang deze klasse pas door een echte provider (ElevenLabs/Google/Azure)
 * nadat er goedgekeurde referentieaudio is (hfst. 21: reviewworkflow).
 */
export class MockTtsProvider implements TextToSpeechProvider {
  private readonly cache = new Map<string, GeneratedAudio>();

  async generateSpeech(input: GenerateSpeechInput): Promise<GeneratedAudio> {
    const cacheKey = JSON.stringify(input);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    // Simuleer netwerklatentie zodat UI-loading-states realistisch getest worden.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const result: GeneratedAudio = {
      audioUrl: `/demo-assets/audio/placeholder.mp3#text=${encodeURIComponent(input.text)}`,
      durationMs: 900,
      cached: false,
    };
    this.cache.set(cacheKey, result);
    return result;
  }
}

export const mockTtsProvider = new MockTtsProvider();
