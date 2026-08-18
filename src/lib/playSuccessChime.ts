"use client";

/**
 * Korte, vrolijke bevestigingstoon zodra een spreekoefening klaar is (hfst.
 * 22: een duidelijk, positief signaal — geen getal/score). Gegenereerd met
 * de Web Audio API, geen los geluidsbestand nodig. Faalt altijd stil als
 * de browser geen AudioContext heeft; nooit de oefening blokkeren.
 */
export function playSuccessChime(): void {
  if (typeof window === "undefined") return;

  const AudioContextClass: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99]; // C5–E5–G5: kort, vrolijk drieklankje
    const now = ctx.currentTime;

    notes.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      const start = now + index * 0.12;
      const end = start + 0.28;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
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
