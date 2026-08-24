import type { ExperienceLevel } from "@/types/domain";

/**
 * Metadata voor de drie niveaus (hfst. 11.1) — gedeeld tussen het aanmaken
 * van een profiel (profiel/nieuw) en het later wijzigen ervan
 * (JourneySettingsMenu.tsx), zodat de omschrijving overal hetzelfde is.
 *
 * Bewust GEEN leeftijdsranges meer in de hint (op verzoek): leeftijd zegt
 * niks over waar een kind qua taalniveau staat. Alleen nog een omschrijving
 * van wat het niveau inhoudt.
 */
export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; hint: string }[] = [
  { value: "A_ONTDEKKEN", label: "Ontdekken", hint: "Veel audio, weinig tekst" },
  { value: "B_OEFENEN", label: "Oefenen", hint: "Woorden en korte zinnen" },
  { value: "C_SPREKEN", label: "Spreken", hint: "Langere zinnen en dialogen" },
];
