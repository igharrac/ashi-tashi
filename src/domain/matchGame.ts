/**
 * Zuivere hulpfuncties voor het matchspel (MatchGame.tsx) — geen React/
 * browser-afhankelijkheden, apart testbaar (tests/domain/matchGame.test.ts).
 */

/** Fisher-Yates shuffle. Muteert `items` niet. RNG injecteerbaar voor deterministisch testen. */
export function shuffleArray<T>(items: T[], rng: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

/** Kiest willekeurig maximaal `size` unieke items uit `items` voor één rondje van het matchspel. */
export function pickRound<T>(items: T[], size: number, rng: () => number = Math.random): T[] {
  return shuffleArray(items, rng).slice(0, Math.min(size, items.length));
}
