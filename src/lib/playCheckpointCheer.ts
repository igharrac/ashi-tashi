"use client";

/**
 * Vrolijk melodietje voor het mid-les-checkpoint (zie CheckpointScreen.tsx)
 * — bewust een ander, iets voller geluid dan playSuccessChime.ts (dat is
 * het korte per-woord bevestigingstoontje). Op verzoek: "een vreugde audio
 * oid" i.p.v. dat per ongeluk het volgende woord al hoorbaar wordt.
 *
 * Meerdere melodietjes (variant 0, 1, 2, ...) zodat het 2e/3e checkpoint in
 * dezelfde les niet exact hetzelfde klinkt als het 1e (op verzoek: "een
 * ander geluid"). Web Audio API, geen los geluidsbestand nodig — faalt
 * altijd stil als de browser geen AudioContext heeft.
 */
const MELODIES = [
  [523.25, 659.25, 783.99, 1046.5], // C5-E5-G5-C6
  [587.33, 739.99, 880, 1174.66], // D5-F#5-A5-D6
  [659.25, 830.61, 987.77, 1318.51], // E5-G#5-B5-E6
  [493.88, 622.25, 739.99, 987.77], // B4-D#5-F#5-B5
];

export function playCheckpointCheer(variant = 0): void {
  if (typeof window === "undefined") return;

  const AudioContextClass: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const notes = MELODIES[variant % MELODIES.length]!;
    const now = ctx.currentTime;

    notes.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;

      const start = now + index * 0.1;
      const end = start + 0.32;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(end + 0.05);
    });

    window.setTimeout(() => void ctx.close(), 900);
  } catch {
    // Decoratief geluid — mag nooit de oefening blokkeren.
  }
}
