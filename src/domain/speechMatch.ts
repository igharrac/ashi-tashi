/**
 * Vergelijkt wat een kind daadwerkelijk heeft gezegd (transcript van de
 * browser-spraakherkenning) met de verwachte tekst.
 *
 * BELANGRIJK (hfst. 22): dit is bewust een eenvoudige, uitlegbare
 * tekstvergelijking — geen "harde" uitspraakbeoordeling en geen
 * schijnprecisie zoals een percentagescore. Ook vergelijkt dit tegen de
 * Nederlandse vertaling, niet tegen Tashelhit: er is nog geen Tashelhit-
 * spraakherkenning beschikbaar, dus dit is een tijdelijke, eerlijke
 * benadering totdat die er wel is (zie ook browserSpeechRecognition.ts).
 */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diakritische tekens weg (na NFD-normalisatie)
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

/** Levenshtein-afstand (aantal bewerkingen om het ene woord in het andere te veranderen). */
export function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i]![0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0]![j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1, // verwijderen
        matrix[i]![j - 1]! + 1, // invoegen
        matrix[i - 1]![j - 1]! + cost, // vervangen
      );
    }
  }

  return matrix[rows - 1]![cols - 1]!;
}

/**
 * Geeft true terug als het transcript "dicht genoeg" bij de verwachte tekst
 * ligt. Tolerant voor korte woorden (kinderen, soms ruizige microfoons).
 */
export function isSpeechMatch(transcript: string, expected: string): boolean {
  const t = normalize(transcript);
  const e = normalize(expected);

  if (!t || !e) return false;
  if (t === e) return true;
  if (t.includes(e) || e.includes(t)) return true;

  const distance = levenshteinDistance(t, e);
  const tolerance = Math.max(1, Math.round(e.length * 0.34));
  return distance <= tolerance;
}
