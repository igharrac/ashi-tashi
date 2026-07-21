/**
 * Tijdelijke, hoorbare fallback bovenop MockTtsProvider.
 *
 * MockTtsProvider zelf genereert geen echt geluid (er is nog geen
 * goedgekeurde Tashelhit-audio, zie hfst. 21: reviewworkflow). Om de
 * app-flow toch met écht hoorbare feedback te kunnen testen, gebruikt deze
 * fallback de gratis, in de browser ingebouwde Web Speech API om de
 * Nederlandse vertaling uit te spreken — nadrukkelijk NIET de Tashelhit-
 * placeholdertekst zelf (die zou als rare letterbrij klinken).
 *
 * Zodra er echte, gereviewde Tashelhit-audiobestanden zijn, vervang je dit
 * door <audio src={audioUrl} /> afspelen op basis van de provider-response.
 * Dit bestand kan dan volledig verwijderd worden.
 */
export function isBrowserSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakDutchFallback(text: string, rate: number = 1): void {
  if (!isBrowserSpeechAvailable()) return;

  // Voorkom overlappende spraak als een kind snel meerdere keren klikt.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "nl-NL";
  utterance.rate = Math.max(0.5, Math.min(rate, 1.2));
  utterance.pitch = 1.05; // iets vriendelijker/hoger, passend bij een kinderapp

  window.speechSynthesis.speak(utterance);
}
