import { describe, expect, it } from "vitest";
import {
  LENIENT_PRONUNCIATION_ATTEMPTS,
  leniencyDoneMessage,
  leniencyRetryMessage,
} from "@/domain/pronunciationLeniency";

describe("pronunciationLeniency", () => {
  it("vereist 3 pogingen (standaard aan, zie ChildProfileData.lenientPronunciationMode)", () => {
    expect(LENIENT_PRONUNCIATION_ATTEMPTS).toBe(3);
  });

  it("leniencyRetryMessage toont het aantal pogingen, zonder 'fout' te suggereren", () => {
    const message = leniencyRetryMessage(1, 3);
    expect(message).toContain("1/3");
    expect(message.toLowerCase()).not.toContain("fout");
    expect(message.toLowerCase()).not.toContain("bijna");
  });

  it("leniencyDoneMessage geeft altijd een niet-lege, positieve boodschap", () => {
    const message = leniencyDoneMessage();
    expect(message.length).toBeGreaterThan(0);
  });
});
