import { describe, expect, it } from "vitest";
import { pickRound, shuffleArray } from "@/domain/matchGame";

describe("shuffleArray", () => {
  it("behoudt alle elementen (zelfde multiset), alleen de volgorde verandert", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input, () => 0.5);
    expect([...result].sort()).toEqual([...input].sort());
    expect(result.length).toBe(input.length);
  });

  it("muteert de originele array niet", () => {
    const input = [1, 2, 3];
    const original = [...input];
    shuffleArray(input, () => 0.9);
    expect(input).toEqual(original);
  });

  it("is deterministisch bij een vaste rng (herhaalbaar te testen)", () => {
    const input = ["a", "b", "c", "d"];
    const first = shuffleArray(input, () => 0);
    const second = shuffleArray(input, () => 0);
    expect(first).toEqual(second);
  });

  it("laat een lege array ongewijzigd", () => {
    expect(shuffleArray([])).toEqual([]);
  });
});

describe("pickRound", () => {
  it("kiest precies `size` unieke items als er genoeg zijn", () => {
    const items = ["a", "b", "c", "d", "e", "f"];
    const round = pickRound(items, 4, () => 0.3);
    expect(round.length).toBe(4);
    expect(new Set(round).size).toBe(4);
    for (const id of round) expect(items).toContain(id);
  });

  it("geeft alle items terug (geschud) als size groter is dan de pool", () => {
    const items = ["a", "b", "c"];
    const round = pickRound(items, 10, () => 0.5);
    expect(round.length).toBe(3);
    expect([...round].sort()).toEqual([...items].sort());
  });
});
