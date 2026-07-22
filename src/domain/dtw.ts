/**
 * Dynamic Time Warping (DTW): vergelijkt twee reeksen van vectoren
 * (bijvoorbeeld MFCC-frames van twee audio-opnames) en levert een
 * afstandsmaat die robuust is tegen verschillen in lengte/spreeksnelheid —
 * precies wat je nodig hebt om twee uitspraken van hetzelfde woord te
 * vergelijken zonder dat iemand precies even snel hoeft te praten.
 *
 * Pure functies, geen browser-APIs — makkelijk te unit-testen (tests/domain/dtw.test.ts).
 */

export type FeatureVector = number[];

function euclideanDistance(a: FeatureVector, b: FeatureVector): number {
  const len = Math.max(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/** Totale (niet-genormaliseerde) DTW-afstand. Lager = meer gelijkenis. */
export function dtwDistance(seriesA: FeatureVector[], seriesB: FeatureVector[]): number {
  const n = seriesA.length;
  const m = seriesB.length;
  if (n === 0 || m === 0) return Infinity;

  const cost: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(Infinity));
  cost[0]![0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const vectorA = seriesA[i - 1]!;
      const vectorB = seriesB[j - 1]!;
      const stepCost = euclideanDistance(vectorA, vectorB);
      const prevMin = Math.min(cost[i - 1]![j]!, cost[i]![j - 1]!, cost[i - 1]![j - 1]!);
      cost[i]![j] = stepCost + prevMin;
    }
  }

  return cost[n]![m]!;
}

/**
 * DTW-afstand genormaliseerd op padlengte, zodat een korte en een lange
 * opname eerlijk vergeleken worden (anders wint "korter" altijd van nature).
 */
export function normalizedDtwDistance(seriesA: FeatureVector[], seriesB: FeatureVector[]): number {
  const distance = dtwDistance(seriesA, seriesB);
  if (!Number.isFinite(distance)) return Infinity;
  return distance / (seriesA.length + seriesB.length);
}

/**
 * Cepstral mean normalization (CMN): trekt per dimensie het gemiddelde van
 * de hele reeks eraf, vóór DTW. MFCC-coëfficiënt 0 volgt ongeveer de
 * (log-)energie van het fragment — die verschilt van nature tussen twee
 * apart opgenomen fragmenten (afstand tot de microfoon, opnameapparaat,
 * automatische gain) ook al is het exact hetzelfde woord door dezelfde stem.
 * Zonder CMN domineert dat volumeverschil de afstand, waardoor zelfs een
 * geslaagde poging als "bijna" wordt beoordeeld. CMN maakt de vergelijking
 * ongevoelig voor dat soort constante verschillen per opname, en behoudt de
 * relatieve variatie binnen het fragment (het deel dat er akoestisch toe doet).
 */
export function cepstralMeanNormalize(series: FeatureVector[]): FeatureVector[] {
  if (series.length === 0) return series;
  const dimensions = series[0]!.length;
  const mean = new Array<number>(dimensions).fill(0);
  for (const vector of series) {
    for (let d = 0; d < dimensions; d++) {
      mean[d] = (mean[d] ?? 0) + (vector[d] ?? 0) / series.length;
    }
  }
  return series.map((vector) => vector.map((value, d) => value - (mean[d] ?? 0)));
}
