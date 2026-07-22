/**
 * Zet een audio-opname (Blob) om naar een reeks MFCC-vectoren — een
 * akoestische "vingerafdruk" per stukje geluid, gebruikt om twee opnames
 * met elkaar te vergelijken (src/domain/dtw.ts) zónder spraakherkenning of
 * tekst. Draait volledig lokaal in de browser via de Web Audio API en de
 * meyda-bibliotheek (MIT-licentie, geen server/API-kosten, geen data die
 * wegstuurt) — zie ARCHITECTUUR-OPNAMESTUDIO.md en de audioSimilarityProvider
 * voor de bredere context.
 */

const FRAME_SIZE = 512;
const HOP_SIZE = 256; // 50% overlap tussen frames, gangbaar voor MFCC-analyse

// Silence-trimming vóór MFCC/DTW: de opnamestudio neemt handmatig start/stop
// op (kort, strak om het woord), terwijl het kind/de ouder in de les een
// vaste opnameduur van enkele seconden krijgt (ListenAndSpeak.tsx) — met dus
// veel stilte/omgevingsgeluid vóór en na het woord. DTW moet die extra
// stilte-frames alsnog "uitlijnen" tegen het woord in de andere opname, wat
// de afstand kunstmatig opblaast — zelfs bij een identieke stem die exact
// hetzelfde woord inspreekt. Vandaar: eerst stilte wegsnijden op basis van
// energie (RMS), symmetrisch toegepast op zowel referentie- als leerlingopname.
const SILENCE_FRAME_SECONDS = 0.02; // 20ms analyseframes
const SILENCE_THRESHOLD_RATIO = 0.08; // relatief t.o.v. piek-RMS in het fragment
const SILENCE_PADDING_SECONDS = 0.08; // marge rond het gedetecteerde geluid, om in-/uitademing van het woord niet af te knippen

/**
 * Snijdt stilte aan begin en eind van `samples` weg op basis van een simpele
 * energiedrempel per frame. Puur functioneel (geen browser-API's) en dus
 * apart te unit-testen — zie tests/domain/audioFeatures.test.ts.
 */
export function trimSilence(samples: Float32Array, sampleRate: number): Float32Array {
  const frameSize = Math.round(sampleRate * SILENCE_FRAME_SECONDS);
  if (frameSize <= 0 || samples.length < frameSize * 2) return samples;

  const frameCount = Math.floor(samples.length / frameSize);
  const frameRms: number[] = [];
  let peakRms = 0;
  for (let i = 0; i < frameCount; i++) {
    const start = i * frameSize;
    let sumSquares = 0;
    for (let j = 0; j < frameSize; j++) {
      const value = samples[start + j] ?? 0;
      sumSquares += value * value;
    }
    const rms = Math.sqrt(sumSquares / frameSize);
    frameRms.push(rms);
    if (rms > peakRms) peakRms = rms;
  }

  // Geen bruikbaar signaal (stilte/lege opname) — niets om veilig te knippen,
  // laat de aanroeper dit afhandelen (bv. als "kon niet verwerken").
  if (peakRms <= 0) return samples;

  const threshold = peakRms * SILENCE_THRESHOLD_RATIO;
  const firstLoud = frameRms.findIndex((rms) => rms > threshold);
  if (firstLoud === -1) return samples;
  let lastLoud = frameRms.length - 1;
  while (lastLoud > firstLoud && (frameRms[lastLoud] ?? 0) <= threshold) lastLoud--;

  const paddingFrames = Math.ceil(SILENCE_PADDING_SECONDS / SILENCE_FRAME_SECONDS);
  const firstFrame = Math.max(0, firstLoud - paddingFrames);
  const lastFrame = Math.min(frameCount - 1, lastLoud + paddingFrames);

  const startSample = firstFrame * frameSize;
  const endSample = Math.min(samples.length, (lastFrame + 1) * frameSize);
  return samples.slice(startSample, endSample);
}

async function decodeToMonoSamples(blob: Blob): Promise<{ samples: Float32Array; sampleRate: number }> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    throw new Error("AudioContext wordt niet ondersteund in deze browser.");
  }
  const audioContext = new AudioContextCtor();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelCount = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const mono = new Float32Array(length);
    for (let channel = 0; channel < channelCount; channel++) {
      const data = audioBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        mono[i] = (mono[i] ?? 0) + (data[i] ?? 0) / channelCount;
      }
    }
    return { samples: mono, sampleRate: audioBuffer.sampleRate };
  } finally {
    void audioContext.close();
  }
}

/**
 * Levert een reeks MFCC-vectoren voor de gegeven audio, één per (overlappend)
 * frame van FRAME_SIZE samples. Lege array bij audio die te kort is om iets
 * uit te halen.
 */
export async function extractMfccSequence(blob: Blob): Promise<number[][]> {
  const { samples: rawSamples, sampleRate } = await decodeToMonoSamples(blob);
  const samples = trimSilence(rawSamples, sampleRate);
  if (samples.length < FRAME_SIZE) return [];

  const { default: Meyda } = await import("meyda");
  Meyda.sampleRate = sampleRate;
  Meyda.bufferSize = FRAME_SIZE;

  const sequence: number[][] = [];
  for (let start = 0; start + FRAME_SIZE <= samples.length; start += HOP_SIZE) {
    const frame = samples.subarray(start, start + FRAME_SIZE);
    const result = Meyda.extract("mfcc", frame) as number[] | null;
    if (result) sequence.push(result);
  }
  return sequence;
}
