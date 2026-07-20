/**
 * Badge-voorwaarden (hfst. 16) — pure functies, geen verborgen state.
 * Vermijdt expliciet lootbox-achtige willekeur: elke badge heeft een
 * vaste, uitlegbare voorwaarde.
 */

export interface BadgeContext {
  totalCorrectAnswers: number;
  totalSpokenAttempts: number; // aantal keer nagezegd via microfoon
  themeCompleted: boolean;
  isFirstCompletedExercise: boolean;
}

export type BadgeSlug = "eerste-woord" | "goede-luisteraar" | "durft-te-spreken" | "dierenkenner";

export function evaluateEarnedBadges(context: BadgeContext): BadgeSlug[] {
  const earned: BadgeSlug[] = [];

  if (context.isFirstCompletedExercise) {
    earned.push("eerste-woord");
  }
  if (context.totalCorrectAnswers >= 8) {
    earned.push("goede-luisteraar");
  }
  if (context.totalSpokenAttempts >= 1) {
    earned.push("durft-te-spreken");
  }
  if (context.themeCompleted) {
    earned.push("dierenkenner");
  }

  return earned;
}
