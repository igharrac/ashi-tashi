import type {
  AssessPronunciationInput,
  PronunciationAssessmentProvider,
  PronunciationAssessmentResult,
} from "./types";
import { extractMfccSequence } from "@/domain/audioFeatures";
import { normalizedDtwDistance } from "@/domain/dtw";

const STRONG_MESSAGES = ["Dat klonk heel dichtbij!", "Heel goed uitgesproken!"];
const GOOD_MESSAGES = ["Goed geprobeerd, dat lijkt al veel!", "Mooi, je komt dichtbij."];
const RETRY_MESSAGES = ["Bijna! Luister nog eens en probeer opnieuw.", "Nog niet helemaal — nog een keertje?"];

// Empirische drempels op de genormaliseerde DTW-afstand tussen twee
// MFCC-reeksen. Niet wetenschappelijk gekalibreerd (daarvoor is een dataset
// met echte Tashelhit-opnames nodig) — bewust aan de milde kant, conform
// hfst. 22: liever een keer te positief dan een kind onterecht ontmoedigen.
const STRONG_THRESHOLD = 6;
const GOOD_THRESHOLD = 11;

function pick(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0]!;
}

/**
 * Vergelijkt de opname van het kind akoestisch met een referentie-opname uit
 * de opnamestudio (MFCC + Dynamic Time Warping, volledig lokaal in de
 * browser — geen server, geen kosten, geen data die wegstuurt). Dit is GEEN
 * spraakherkenning: het "begrijpt" het woord niet, het vergelijkt alleen hoe
 * de twee geluidsfragmenten klinken (toonhoogte/ritme/klankkleur). Daardoor
 * werkt dit net zo goed voor Tashelhit als voor elke andere taal — er hoeft
 * geen taalmodel voor te bestaan. Zie ARCHITECTUUR-OPNAMESTUDIO.md.
 *
 * Vereist `referenceAudioUrl` in de input; zonder referentie-opname kan deze
 * provider niets vergelijken. De aanroepende component moet in dat geval
 * niet deze provider gebruiken, maar de opname alleen bewaren voor latere
 * menselijke beoordeling (zie src/lib/childAttempts.ts).
 */
export class AudioSimilarityProvider implements PronunciationAssessmentProvider {
  async assess(input: AssessPronunciationInput): Promise<PronunciationAssessmentResult> {
    if (!input.referenceAudioUrl) {
      return {
        feedbackLevel: "aanmoediging",
        feedbackMessageNl: "Nog geen referentie-opname beschikbaar om mee te vergelijken.",
        shouldOfferRetry: false,
      };
    }

    try {
      const referenceResponse = await fetch(input.referenceAudioUrl);
      const referenceBlob = await referenceResponse.blob();

      const [referenceSequence, learnerSequence] = await Promise.all([
        extractMfccSequence(referenceBlob),
        extractMfccSequence(input.learnerAudio),
      ]);

      if (referenceSequence.length === 0 || learnerSequence.length === 0) {
        return {
          feedbackLevel: "aanmoediging",
          feedbackMessageNl: "Ik kon de opname niet goed verwerken — probeer het nog eens.",
          shouldOfferRetry: true,
        };
      }

      const distance = normalizedDtwDistance(referenceSequence, learnerSequence);

      if (distance <= STRONG_THRESHOLD) {
        return { feedbackLevel: "sterk", feedbackMessageNl: pick(STRONG_MESSAGES), shouldOfferRetry: false };
      }
      if (distance <= GOOD_THRESHOLD) {
        return { feedbackLevel: "goed_geprobeerd", feedbackMessageNl: pick(GOOD_MESSAGES), shouldOfferRetry: false };
      }
      return { feedbackLevel: "aanmoediging", feedbackMessageNl: pick(RETRY_MESSAGES), shouldOfferRetry: true };
    } catch {
      return {
        feedbackLevel: "aanmoediging",
        feedbackMessageNl: "Er ging iets mis bij het vergelijken — probeer het nog eens.",
        shouldOfferRetry: true,
      };
    }
  }
}

export const audioSimilarityProvider = new AudioSimilarityProvider();
