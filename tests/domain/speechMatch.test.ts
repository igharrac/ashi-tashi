import { describe, expect, it } from "vitest";
import { isSpeechMatch, levenshteinDistance } from "@/domain/speechMatch";

describe("levenshteinDistance", () => {
  it("geeft 0 voor identieke teksten", () => {
    expect(levenshteinDistance("hond", "hond")).toBe(0);
  });

  it("telt het aantal bewerkingen correct", () => {
    expect(levenshteinDistance("kat", "kad")).toBe(1);
    expect(levenshteinDistance("hond", "kat")).toBeGreaterThan(1);
  });
});

describe("isSpeechMatch", () => {
  it("herkent een exacte match", () => {
    expect(isSpeechMatch("hond", "hond")).toBe(true);
  });

  it("is ongevoelig voor hoofdletters en interpunctie", () => {
    expect(isSpeechMatch("Hond!", "hond")).toBe(true);
    expect(isSpeechMatch("de kat is lief", "De kat is lief.")).toBe(true);
  });

  it("staat kleine uitspraakvariaties toe", () => {
    expect(isSpeechMatch("hont", "hond")).toBe(true);
  });

  it("wijst een duidelijk ander woord af", () => {
    expect(isSpeechMatch("banaan", "hond")).toBe(false);
  });

  it("geeft false terug bij een leeg transcript", () => {
    expect(isSpeechMatch("", "hond")).toBe(false);
  });
});
