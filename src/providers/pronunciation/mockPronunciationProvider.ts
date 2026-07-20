import type {
  AssessPronunciationInput,
  PronunciationAssessmentProvider,
  PronunciationAssessmentResult,
} from "./types";

const ENCOURAGING_MESSAGES = [
  "Goed geprobeerd!",
  "Dat klonk al heel goed.",
  "Mooi, je komt dichtbij.",
  "Goed dat je het opnieuw probeert.",
];

const STRONG_MESSAGES = ["Dat was duidelijk te verstaan.", "Heel goed gedaan!"];

/**
 * Mock-implementatie van PronunciationAssessmentProvider.
 *
 * Geeft altijd vriendelijke, niet-beschamende feedback (hfst. 22) zonder
 * echte spraakherkenning uit te voeren. Bedoeld om de nazeg-flow end-to-end
 * te kunnen bouwen en testen voordat er een echte STT/uitspraakprovider is
 * gekoppeld. Toont nooit een score.
 */
export class MockPronunciationProvider implements PronunciationAssessmentProvider {
  async assess(input: AssessPronunciationInput): Promise<PronunciationAssessmentResult> {
    void input;
    await new Promise((resolve) => setTimeout(resolve, 50));

    // In de mock: altijd positief, met kleine variatie in toon.
    // Een latere echte provider levert een vergelijkbaar resultaat via
    // dezelfde interface, dus de UI hoeft niet te veranderen.
    const isStrong = Math.random() > 0.5;
    const message = isStrong
      ? STRONG_MESSAGES[Math.floor(Math.random() * STRONG_MESSAGES.length)]
      : ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];

    return {
      feedbackLevel: isStrong ? "sterk" : "goed_geprobeerd",
      feedbackMessageNl: message ?? "Goed geprobeerd!",
      shouldOfferRetry: !isStrong,
    };
  }
}

export const mockPronunciationProvider = new MockPronunciationProvider();
