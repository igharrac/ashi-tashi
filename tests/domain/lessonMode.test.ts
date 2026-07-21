import { describe, expect, it } from "vitest";
import { applySpeakFirstMode } from "@/domain/lessonMode";
import type { ExerciseView, VocabularyItemView } from "@/types/domain";

function wordItem(id: string): VocabularyItemView {
  return {
    id,
    translationNl: id,
    latinSpelling: `[TASHELHIT_WORD_REVIEW_REQUIRED:${id}]`,
    reviewStatus: "TE_REVIEWEN",
    imageAlt: id,
    imageEmoji: "🐾",
  };
}

function sentenceItem(id: string): VocabularyItemView {
  return { ...wordItem(id), itemKind: "zin" };
}

describe("applySpeakFirstMode", () => {
  it("voegt luisteren+nazeggen voor hetzelfde woord samen tot één zelfstandig-spreken-oefening", () => {
    const exercises: ExerciseView[] = [
      { id: "listen-hond", type: "LUISTEREN_EN_HERKENNEN", vocabularyItem: wordItem("hond") },
      { id: "repeat-hond", type: "NAZEGGEN", vocabularyItem: wordItem("hond") },
    ];
    const result = applySpeakFirstMode(exercises);
    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe("ZELFSTANDIG_SPREKEN");
    expect(result[0]?.vocabularyItem.id).toBe("hond");
  });

  it("laat zin-oefeningen ongewijzigd", () => {
    const exercises: ExerciseView[] = [
      { id: "sentence-1", type: "NAZEGGEN", vocabularyItem: sentenceItem("zin-hond") },
    ];
    const result = applySpeakFirstMode(exercises);
    expect(result).toEqual(exercises);
  });

  it("verwerkt meerdere woorden onafhankelijk van elkaar", () => {
    const exercises: ExerciseView[] = [
      { id: "listen-hond", type: "LUISTEREN_EN_HERKENNEN", vocabularyItem: wordItem("hond") },
      { id: "repeat-hond", type: "NAZEGGEN", vocabularyItem: wordItem("hond") },
      { id: "listen-kat", type: "LUISTEREN_EN_HERKENNEN", vocabularyItem: wordItem("kat") },
      { id: "repeat-kat", type: "NAZEGGEN", vocabularyItem: wordItem("kat") },
    ];
    const result = applySpeakFirstMode(exercises);
    expect(result.map((e) => e.vocabularyItem.id)).toEqual(["hond", "kat"]);
    expect(result.every((e) => e.type === "ZELFSTANDIG_SPREKEN")).toBe(true);
  });

  it("geeft een lege lijst terug bij een lege invoer", () => {
    expect(applySpeakFirstMode([])).toEqual([]);
  });
});
