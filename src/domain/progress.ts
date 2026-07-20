/**
 * Pure, uitlegbare voortgangslogica (hfst. 15, 39).
 *
 * Bewust géén ondoorzichtig AI-model — dit zijn eenvoudige, testbare regels
 * op basis van correct/incorrect, aantal pogingen en tijd sinds laatste
 * oefening, zoals het brief voorschrijft ("Bouw geen ondoorzichtig
 * AI-model wanneer eenvoudige logica voldoende is.").
 */

export interface ExerciseAttemptRecord {
  vocabularyItemId: string;
  isCorrect: boolean;
  attemptNumber: number;
}

export interface ItemMastery {
  vocabularyItemId: string;
  timesCorrect: number;
  timesIncorrect: number;
  isDifficult: boolean;
}

/** Een woord is "moeilijk" als het minstens 2x fout is gegaan en de kind-succesratio onder de 50% ligt. */
export function computeMastery(attempts: ExerciseAttemptRecord[]): ItemMastery[] {
  const byItem = new Map<string, { correct: number; incorrect: number }>();

  for (const attempt of attempts) {
    const current = byItem.get(attempt.vocabularyItemId) ?? { correct: 0, incorrect: 0 };
    if (attempt.isCorrect) {
      current.correct += 1;
    } else {
      current.incorrect += 1;
    }
    byItem.set(attempt.vocabularyItemId, current);
  }

  return Array.from(byItem.entries()).map(([vocabularyItemId, counts]) => {
    const total = counts.correct + counts.incorrect;
    const successRatio = total === 0 ? 1 : counts.correct / total;
    const isDifficult = counts.incorrect >= 2 && successRatio < 0.5;
    return {
      vocabularyItemId,
      timesCorrect: counts.correct,
      timesIncorrect: counts.incorrect,
      isDifficult,
    };
  });
}

export interface LessonCompletionInput {
  totalExercises: number;
  correctExercises: number;
}

/** Puntentelling voor een lesafronding: 10 punten per correct antwoord + 20 bonus bij volledig correct. */
export function computeLessonPoints(input: LessonCompletionInput): number {
  if (input.totalExercises <= 0) return 0;
  const basePoints = input.correctExercises * 10;
  const perfectBonus = input.correctExercises === input.totalExercises ? 20 : 0;
  return basePoints + perfectBonus;
}

/** Bepaalt of een les als "voltooid" telt: elk item moet minstens één keer geprobeerd zijn. */
export function isLessonComplete(totalExercises: number, attemptedExerciseIds: Set<string>): boolean {
  return totalExercises > 0 && attemptedExerciseIds.size >= totalExercises;
}
