/**
 * Provider-onafhankelijke interface voor uitspraakbeoordeling (hfst. 22).
 *
 * Belangrijk uitgangspunt uit het brief: een correcte transcriptie betekent
 * niet automatisch een correcte uitspraak, en andersom. Beoordeel daarom
 * voorzichtig en kindvriendelijk, en toon nooit een numerieke score
 * (geen schijnprecisie zoals "63,7% correct").
 */

export interface AssessPronunciationInput {
  learnerAudio: Blob;
  expectedText: string;
  acceptedVariants?: string[];
  referenceAudioUrl?: string;
  languageCode: string;
  dialectCode?: string;
}

export type PronunciationFeedbackLevel = "aanmoediging" | "goed_geprobeerd" | "sterk";

export interface PronunciationAssessmentResult {
  feedbackLevel: PronunciationFeedbackLevel;
  feedbackMessageNl: string; // vriendelijke tekst, nooit een percentage (hfst. 22)
  shouldOfferRetry: boolean;
}

export interface PronunciationAssessmentProvider {
  assess(input: AssessPronunciationInput): Promise<PronunciationAssessmentResult>;
}
