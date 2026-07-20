import { describe, expect, it } from "vitest";
import { evaluateEarnedBadges } from "@/domain/badges";

describe("evaluateEarnedBadges", () => {
  it("kent 'eerste-woord' toe bij de eerste voltooide oefening", () => {
    const earned = evaluateEarnedBadges({
      totalCorrectAnswers: 1,
      totalSpokenAttempts: 0,
      themeCompleted: false,
      isFirstCompletedExercise: true,
    });
    expect(earned).toContain("eerste-woord");
  });

  it("kent 'durft-te-spreken' toe zodra er een nazegpoging is", () => {
    const earned = evaluateEarnedBadges({
      totalCorrectAnswers: 0,
      totalSpokenAttempts: 1,
      themeCompleted: false,
      isFirstCompletedExercise: false,
    });
    expect(earned).toContain("durft-te-spreken");
  });

  it("kent 'dierenkenner' alleen toe bij een voltooid thema", () => {
    const earned = evaluateEarnedBadges({
      totalCorrectAnswers: 0,
      totalSpokenAttempts: 0,
      themeCompleted: true,
      isFirstCompletedExercise: false,
    });
    expect(earned).toEqual(["dierenkenner"]);
  });

  it("geeft geen badges zonder dat aan enige voorwaarde is voldaan", () => {
    const earned = evaluateEarnedBadges({
      totalCorrectAnswers: 0,
      totalSpokenAttempts: 0,
      themeCompleted: false,
      isFirstCompletedExercise: false,
    });
    expect(earned).toEqual([]);
  });

  it("kent 'goede-luisteraar' toe bij 8 of meer correcte antwoorden", () => {
    const earned = evaluateEarnedBadges({
      totalCorrectAnswers: 8,
      totalSpokenAttempts: 0,
      themeCompleted: false,
      isFirstCompletedExercise: false,
    });
    expect(earned).toContain("goede-luisteraar");
  });
});
