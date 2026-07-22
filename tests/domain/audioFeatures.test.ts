import { describe, expect, it } from "vitest";
import { trimSilence } from "@/domain/audioFeatures";

const SAMPLE_RATE = 16000;

function silence(seconds: number): number[] {
  return new Array(Math.round(SAMPLE_RATE * seconds)).fill(0);
}

function tone(seconds: number, amplitude = 0.5): number[] {
  const length = Math.round(SAMPLE_RATE * seconds);
  const values: number[] = [];
  for (let i = 0; i < length; i++) {
    values.push(amplitude * Math.sin((2 * Math.PI * 440 * i) / SAMPLE_RATE));
  }
  return values;
}

describe("trimSilence", () => {
  it("snijdt lange stilte aan begin en eind weg rond een kort geluidsfragment", () => {
    // Simuleert de vaste 4s opnameduur van een kind (ListenAndSpeak.tsx):
    // een half seconde "woord" ergens in een verder stil fragment.
    const samples = new Float32Array([...silence(1.5), ...tone(0.5), ...silence(2)]);

    const trimmed = trimSilence(samples, SAMPLE_RATE);

    // Fors korter dan het origineel (4s), maar het geluid zelf blijft erin.
    expect(trimmed.length).toBeLessThan(samples.length / 2);
    expect(trimmed.length).toBeGreaterThan(Math.round(SAMPLE_RATE * 0.5));
  });

  it("laat een al strak opgenomen fragment (nauwelijks stilte) grotendeels intact", () => {
    // Simuleert een studio-opname: handmatig strak gestart/gestopt rond het woord.
    const samples = new Float32Array([...silence(0.05), ...tone(0.6), ...silence(0.05)]);

    const trimmed = trimSilence(samples, SAMPLE_RATE);

    expect(trimmed.length).toBeGreaterThan(samples.length * 0.7);
  });

  it("laat pure stilte (geen signaal) ongewijzigd, zodat de aanroeper dit apart kan afhandelen", () => {
    const samples = new Float32Array(silence(1));
    const trimmed = trimSilence(samples, SAMPLE_RATE);
    expect(trimmed.length).toBe(samples.length);
  });

  it("laat een fragment korter dan één analyseframe ongewijzigd", () => {
    const samples = new Float32Array([0.1, 0.2, 0.3]);
    const trimmed = trimSilence(samples, SAMPLE_RATE);
    expect(trimmed.length).toBe(samples.length);
  });
});
