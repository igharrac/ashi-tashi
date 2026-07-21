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
  const { samples, sampleRate } = await decodeToMonoSamples(blob);
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
