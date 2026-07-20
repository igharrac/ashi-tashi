import { describe, expect, it } from "vitest";
import { addDaysIso, computeStreakDays, recordPracticeDay } from "@/domain/streak";

describe("addDaysIso", () => {
  it("telt dagen correct op en af", () => {
    expect(addDaysIso("2026-07-20", 1)).toBe("2026-07-21");
    expect(addDaysIso("2026-07-20", -1)).toBe("2026-07-19");
  });

  it("gaat correct over een maandgrens heen", () => {
    expect(addDaysIso("2026-07-31", 1)).toBe("2026-08-01");
  });
});

describe("recordPracticeDay", () => {
  it("voegt een nieuwe dag toe", () => {
    expect(recordPracticeDay(["2026-07-18"], "2026-07-19")).toEqual(["2026-07-18", "2026-07-19"]);
  });

  it("voegt geen duplicaat toe", () => {
    expect(recordPracticeDay(["2026-07-19"], "2026-07-19")).toEqual(["2026-07-19"]);
  });
});

describe("computeStreakDays", () => {
  it("geeft 0 zonder oefendagen", () => {
    expect(computeStreakDays([], "2026-07-20")).toBe(0);
  });

  it("telt opeenvolgende dagen tot en met vandaag", () => {
    const dates = ["2026-07-18", "2026-07-19", "2026-07-20"];
    expect(computeStreakDays(dates, "2026-07-20")).toBe(3);
  });

  it("telt door tot en met gisteren als vandaag nog niet geoefend is", () => {
    const dates = ["2026-07-18", "2026-07-19"];
    expect(computeStreakDays(dates, "2026-07-20")).toBe(2);
  });

  it("breekt de streak niet bij precies één gemiste dag (rustdag)", () => {
    // 16, 17 geoefend, 18 gemist (rustdag), 19 en 20 weer geoefend
    const dates = ["2026-07-16", "2026-07-17", "2026-07-19", "2026-07-20"];
    expect(computeStreakDays(dates, "2026-07-20")).toBe(4);
  });

  it("stopt de telling bij twee opeenvolgende gemiste dagen", () => {
    // 17 geoefend, 18 en 19 gemist, 20 geoefend
    const dates = ["2026-07-17", "2026-07-20"];
    expect(computeStreakDays(dates, "2026-07-20")).toBe(1);
  });
});
