import { describe, expect, it } from "vitest";
import { dtwDistance, normalizedDtwDistance } from "@/domain/dtw";

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
