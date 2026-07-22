import { describe, expect, it } from "vitest";
import { cepstralMeanNormalize, dtwDistance, normalizedDtwDistance } from "@/domain/dtw";

describe("dtwDistance", () => {
  it("geeft 0 voor identieke reeksen", () => {
    const series = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    expect(dtwDistance(series, series)).toBe(0);
  });

  it("geeft een duidelijk grotere afstand voor duidelijk verschillende reeksen", () => {
    const a = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    const b = [
      [10, 10],
      [10, 10],
      [10, 10],
    ];
    expect(dtwDistance(a, b)).toBeGreaterThan(20);
  });

  it("kan reeksen van verschillende lengte vergelijken (robuust tegen spreeksnelheid)", () => {
    const short = [
      [1, 1],
      [1, 1],
    ];
    const long = [
      [1, 1],
      [1, 1],
      [1, 1],
      [1, 1],
    ];
    expect(dtwDistance(short, long)).toBe(0);
  });

  it("geeft Infinity voor een lege reeks", () => {
    expect(dtwDistance([], [[1, 1]])).toBe(Infinity);
    expect(dtwDistance([[1, 1]], [])).toBe(Infinity);
  });

  it("is symmetrisch", () => {
    const a = [
      [1, 2],
      [3, 1],
    ];
    const b = [
      [2, 1],
      [1, 3],
      [0, 0],
    ];
    expect(dtwDistance(a, b)).toBeCloseTo(dtwDistance(b, a), 10);
  });
});

describe("normalizedDtwDistance", () => {
  it("normaliseert op padlengte", () => {
    const series = [
      [1, 1],
      [2, 2],
      [3, 3],
    ];
    expect(normalizedDtwDistance(series, series)).toBe(0);
  });

  it("geeft Infinity door bij een lege reeks", () => {
    expect(normalizedDtwDistance([], [[1, 1]])).toBe(Infinity);
  });
});

describe("cepstralMeanNormalize", () => {
  it("maakt twee reeksen die alleen in een constante offset verschillen identiek", () => {
    // Simuleert twee opnames van hetzelfde woord met verschillend
    // opnamevolume: reeks B is reeks A + een vaste offset per frame.
    const a = [
      [1, 2],
      [3, 1],
      [2, 3],
    ];
    const offset = [10, -5];
    const b = a.map(([x, y]) => [(x ?? 0) + offset[0]!, (y ?? 0) + offset[1]!]);

    const normalizedA = cepstralMeanNormalize(a);
    const normalizedB = cepstralMeanNormalize(b);

    expect(dtwDistance(normalizedA, normalizedB)).toBeCloseTo(0, 10);
  });

  it("trekt het gemiddelde per dimensie eraf", () => {
    const series = [
      [0, 10],
      [2, 20],
      [4, 30],
    ];
    const normalized = cepstralMeanNormalize(series);
    expect(normalized).toEqual([
      [-2, -10],
      [0, 0],
      [2, 10],
    ]);
  });

  it("geeft een lege reeks ongewijzigd terug", () => {
    expect(cepstralMeanNormalize([])).toEqual([]);
  });
});
