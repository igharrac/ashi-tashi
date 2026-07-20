/**
 * Provider-onafhankelijke interface voor text-to-speech (hfst. 18).
 *
 * Elke concrete implementatie (ElevenLabs, Google, Azure, mock, ...) moet
 * hieraan voldoen. De rest van de app praat nooit rechtstreeks met een
 * specifieke TTS-leverancier — alleen met deze interface. Zo kan een
 * provider later vervangen worden zonder de applicatie te herschrijven.
 *
 * BELANGRIJK: generatie loopt altijd via de backend. Plaats nooit een
 * TTS_API_KEY in frontend-code.
 */

export interface GenerateSpeechInput {
  text: string;
  languageCode: string;
  dialectCode?: string;
  voiceId: string;
  speakingRate?: number; // 1.0 = normaal, < 1.0 = langzamer (hfst. 9: vertraagd afspelen)
  style?: "rustig" | "enthousiast" | "leeruitspraak";
}

export interface GeneratedAudio {
  audioUrl: string;
  durationMs: number;
  cached: boolean; // hfst. 18: dezelfde zin hoeft niet telkens opnieuw gegenereerd te worden
}

export interface TextToSpeechProvider {
  generateSpeech(input: GenerateSpeechInput): Promise<GeneratedAudio>;
}
