import type {
  AssessPronunciationInput,
  PronunciationAssessmentProvider,
  PronunciationAssessmentResult,
} from "./types";
import { extractMfccSequence } from "@/domain/audioFeatures";
import { cepstralMeanNormalize, normalizedDtwDistance } from "@/domain/dtw";

const STRONG_MESSAGES = ["Dat klonk heel dichtbij!", "Heel goed uitgesproken!"];
const GOOD_MESSAGES = ["Goed geprobeerd, dat lijkt al veel!", "Mooi, je komt dichtbij."];
const RETRY_MESSAGES = ["Bijna! Luister nog eens en probeer opnieuw.", "Nog niet helemaal — nog een keertje?"];

// Empirische drempels op de genormaliseerde DTW-afstand tussen twee
// (cepstraal genormaliseerde) MFCC-reeksen. Niet wetenschappelijk
// gekalibreerd (daarvoor is een dataset met echte Tashelhit-opnames nodig)
// — bewust ruim aan de milde kant, conform hfst. 22: liever een keer te
// positief dan een kind onterecht ontmoedigen. De echte afstand wordt ook
// naar de browserconsole gelogd (zie hieronder) zodat deze drempels met
// echte cijfers bijgesteld kunnen worden i.p.v. gokken.
const STRONG_THRESHOLD = 10;
const GOOD_THRESHOLD = 20;

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

    // eslint-disable-next-line no-console
    console.error("[uitspraakvergelijking] start, referentie:", input.referenceAudioUrl);

    try {
      const referenceResponse = await fetch(input.referenceAudioUrl);
      if (!referenceResponse.ok) {
        const info = `kon referentie-audio niet ophalen (HTTP ${referenceResponse.status})`;
        // eslint-disable-next-line no-console
        console.error("[uitspraakvergelijking]", info);
        return {
          feedbackLevel: "aanmoediging",
          feedbackMessageNl: "Ik kon de opname niet goed verwerken — probeer het nog eens.",
          shouldOfferRetry: true,
          debugInfo: info,
        };
      }
      const referenceBlob = await referenceResponse.blob();

      const [referenceSequence, learnerSequence] = await Promise.all([
        extractMfccSequence(referenceBlob),
        extractMfccSequence(input.learnerAudio),
      ]);

      if (referenceSequence.length === 0 || learnerSequence.length === 0) {
        const info = `MFCC-extractie leverde niets op (referentie: ${referenceSequence.length} frames, leerling: ${learnerSequence.length} frames) — vermoedelijk kan deze browser het audioformaat niet decoderen`;
        // eslint-disable-next-line no-console
        console.error("[uitspraakvergelijking]", info);
        return {
          feedbackLevel: "aanmoediging",
          feedbackMessageNl: "Ik kon de opname niet goed verwerken — probeer het nog eens.",
          shouldOfferRetry: true,
          debugInfo: info,
        };
      }

      // CMN vóór DTW: maakt de vergelijking ongevoelig voor volumeverschillen
      // tussen twee apart opgenomen fragmenten (zie cepstralMeanNormalize).
      const distance = normalizedDtwDistance(
        cepstralMeanNormalize(referenceSequence),
        cepstralMeanNormalize(learnerSequence),
      );

      // Tijdelijke diagnose-log (geen kindgegevens, alleen een getal) — zo
      // kunnen STRONG_THRESHOLD/GOOD_THRESHOLD hierboven met echte cijfers
      // bijgesteld worden i.p.v. blind gokken. Mag later weg als de
      // drempels eenmaal kloppen. console.error i.p.v. console.log/debug:
      // die worden in sommige browsers standaard weggefilterd — een error
      // wordt altijd getoond.
      const info = `genormaliseerde afstand: ${distance.toFixed(2)} (drempels: sterk<=${STRONG_THRESHOLD}, goed<=${GOOD_THRESHOLD})`;
      // eslint-disable-next-line no-console
      console.error("[uitspraakvergelijking]", info);

      if (distance <= STRONG_THRESHOLD) {
        return { feedbackLevel: "sterk", feedbackMessageNl: pick(STRONG_MESSAGES), shouldOfferRetry: false, debugInfo: info };
      }
      if (distance <= GOOD_THRESHOLD) {
        return {
          feedbackLevel: "goed_geprobeerd",
          feedbackMessageNl: pick(GOOD_MESSAGES),
          shouldOfferRetry: false,
          debugInfo: info,
        };
      }
      return { feedbackLevel: "aanmoediging", feedbackMessageNl: pick(RETRY_MESSAGES), shouldOfferRetry: true, debugInfo: info };
    } catch (err) {
      const info = `onverwachte fout: ${err instanceof Error ? err.message : String(err)}`;
      // eslint-disable-next-line no-console
      console.error("[uitspraakvergelijking]", info, err);
      return {
        feedbackLevel: "aanmoediging",
        feedbackMessageNl: "Er ging iets mis bij het vergelijken — probeer het nog eens.",
        shouldOfferRetry: true,
        debugInfo: info,
      };
    }
  }
}

export const audioSimilarityProvider = new AudioSimilarityProvider();
