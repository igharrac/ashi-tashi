import { describe, expect, it } from "vitest";
import { computeLessonPoints, computeMastery, isLessonComplete } from "@/domain/progress";

describe("computeMastery", () => {
  it("markeert een woord als moeilijk na 2+ fouten met lage succesratio", () => {
    const result = computeMastery([
      { vocabularyItemId: "hond", isCorrect: false, attemptNumber: 1 },
      { vocabularyItemId: "hond", isCorrect: false, attemptNumber: 2 },
      { vocabularyItemId: "hond", isCorrect: true, attemptNumber: 3 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.isDifficult).toBe(true);
  });

  it("markeert een woord niet als moeilijk bij overwegend correcte pogingen", () => {
    const result = computeMastery([
      { vocabularyItemId: "kat", isCorrect: true, attemptNumber: 1 },
      { vocabularyItemId: "kat", isCorrect: true, attemptNumber: 2 },
      { vocabularyItemId: "kat", isCorrect: false, attemptNumber: 3 },
    ]);
    expect(result[0]?.isDifficult).toBe(false);
  });

  it("geeft een lege lijst terug zonder pogingen", () => {
    expect(computeMastery([])).toEqual([]);
  });
});

describe("computeLessonPoints", () => {
  it("kent 10 punten toe per correct antwoord", () => {
    expect(computeLessonPoints({ totalExercises: 5, correctExercises: 3 })).toBe(30);
  });

  it("kent een bonus toe bij een volledig correcte les", () => {
    expect(computeLessonPoints({ totalExercises: 5, correctExercises: 5 })).toBe(70);
  });

  it("geeft 0 punten bij een lege les", () => {
    expect(computeLessonPoints({ totalExercises: 0, correctExercises: 0 })).toBe(0);
  });
});

describe("isLessonComplete", () => {
  it("is compleet zodra elke oefening minstens één poging heeft", () => {
    expect(isLessonComplete(3, new Set(["a", "b", "c"]))).toBe(true);
  });

  it("is niet compleet bij ontbrekende pogingen", () => {
    expect(isLessonComplete(3, new Set(["a"]))).toBe(false);
  });

  it("is niet compleet bij een les zonder oefeningen", () => {
    expect(isLessonComplete(0, new Set())).toBe(false);
  });
});
