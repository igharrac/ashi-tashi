import type { ExerciseView } from "@/types/domain";

/**
 * "Zelfstandig spreken"-modus (hfst. 13.11): in plaats van eerst luisteren
 * en dan nazeggen, ziet het kind alleen het plaatje en spreekt het woord
 * zelf in, zonder het eerst gehoord te hebben. Dit is de laatste stap van
 * de opbouw uit hoofdstuk 14 (luisteren → herkennen → nazeggen →
 * zelfstandig antwoorden), hier per los woord toegankelijk als instelling.
 *
 * Deze functie voegt de bestaande "luisteren en herkennen" + "nazeggen"
 * oefeningen per woord samen tot één "zelfstandig spreken"-oefening.
 * Zin-oefeningen (itemKind "zin") blijven ongewijzigd — spreken zonder
 * ooit een voorbeeld gehoord te hebben is voor hele zinnen te zwaar voor
 * deze MVP-doelgroep.
 */
export function applySpeakFirstMode(exercises: ExerciseView[]): ExerciseView[] {
  const seenWordItemIds = new Set<string>();
  const result: ExerciseView[] = [];

  for (const exercise of exercises) {
    const isWordExercise = exercise.vocabularyItem.itemKind !== "zin";

    if (!isWordExercise) {
      result.push(exercise);
      continue;
    }

    const itemId = exercise.vocabularyItem.id;
    if (seenWordItemIds.has(itemId)) continue; // tweede oefening voor hetzelfde woord overslaan

    seenWordItemIds.add(itemId);
    result.push({
      id: `speak-${itemId}`,
      type: "ZELFSTANDIG_SPREKEN",
      vocabularyItem: exercise.vocabularyItem,
    });
  }

  return result;
}
