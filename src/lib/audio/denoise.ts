import { spawnSync } from "child_process";
import path from "path";

/**
 * Server-only ruisonderdrukking voor studio-opnames (hfst. 19: audio moet
 * professioneel/rustig klinken). Gebruikt de echte RNNoise-DSP (Xiph/Mozilla,
 * BSD-licentie) via de meegeleverde WASM-build uit het MIT-gelicenseerde
 * npm-pakket @sapphi-red/web-noise-suppressor — rechtstreeks aangeroepen op
 * de rauwe C-exports (rnnoise_process_frame e.d.), zonder hun
 * AudioWorklet-specifieke wrapper, want die bestaat alleen in de browser.
 *
 * ffmpeg wordt alleen gebruikt om te decoderen naar ruwe PCM en weer terug
 * te coderen naar het opnameformaat (webm/opus meestal) — geen speciale
 * ffmpeg-filter nodig, dus een gewone lokale ffmpeg-installatie (bv.
 * `brew install ffmpeg`) is voldoende.
 *
 * Faalt dit om wat voor reden dan ook (ffmpeg ontbreekt, wasm laadt niet,
 * onverwacht formaat) dan valt de functie terug op de ORIGINELE audio —
 * ruisonderdrukking is een verbetering, nooit een blokkade voor het
 * opslaan van een opname (zelfde principe als elders in de app, hfst. 22).
 */

const MODEL_FRAME_SIZE_FALLBACK = 480; // 10ms @ 48kHz — RNNoise's vaste framegrootte
const SAMPLE_RATE = 48000;
const PCM_SCALE = 32768; // RNNoise verwacht ~int16-schaal, geen [-1, 1] floats

let ffmpegAvailable: boolean | null = null;

function checkFfmpegAvailable(): boolean {
  if (ffmpegAvailable !== null) return ffmpegAvailable;
  try {
    const res = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
    ffmpegAvailable = res.status === 0;
  } catch {
    ffmpegAvailable = false;
  }
  return ffmpegAvailable;
}

function rnnoiseWasmPath(): string {
  // Zelfde patroon als MANIFEST_PATH/AUDIO_DIR in recordingsManifest.ts:
  // resolven t.o.v. de project-root (process.cwd()), niet t.o.v. deze file
  // (die na de Next.js-build ergens anders terecht kan komen).
  return path.join(
    process.cwd(),
    "node_modules",
    "@sapphi-red",
    "web-noise-suppressor",
    "dist",
    "rnnoise.wasm",
  );
}

async function loadRnnoise(): Promise<WebAssembly.Exports> {
  const fs = await import("fs");
  const bytes = fs.readFileSync(rnnoiseWasmPath());
  let memory: WebAssembly.Memory;
  const imports: WebAssembly.Imports = {
    env: {
      emscripten_memcpy_big: (dest: number, src: number, num: number) => {
        new Uint8Array(memory.buffer).copyWithin(dest, src, src + num);
      },
      emscripten_resize_heap: (requestedSize: number) => {
        const current = memory.buffer.byteLength;
        if (requestedSize <= current) return 1;
        const pages = Math.ceil((requestedSize - current) / 65536);
        try {
          memory.grow(pages);
          return 1;
        } catch {
          return 0;
        }
      },
      __assert_fail: () => {
        throw new Error("rnnoise wasm assertion failed");
      },
    },
  };
  const { instance } = await WebAssembly.instantiate(bytes, imports);
  memory = instance.exports.memory as WebAssembly.Memory;
  const ctors = instance.exports.__wasm_call_ctors as (() => void) | undefined;
  ctors?.();
  return instance.exports;
}

function denoisePcm(exp: WebAssembly.Exports, pcm: Float32Array): Float32Array {
  const getFrameSize = exp.rnnoise_get_frame_size as () => number;
  const create = exp.rnnoise_create as (model: number) => number;
  const destroy = exp.rnnoise_destroy as (state: number) => void;
  const processFrame = exp.rnnoise_process_frame as (state: number, out: number, input: number) => number;
  const malloc = exp.malloc as (size: number) => number;
  const free = exp.free as (ptr: number) => void;
  const memory = exp.memory as WebAssembly.Memory;

  const frameSize = getFrameSize() || MODEL_FRAME_SIZE_FALLBACK;
  const state = create(0); // 0 = ingebouwd standaardmodel, geen los modelbestand nodig
  const inPtr = malloc(frameSize * 4);
  const outPtr = malloc(frameSize * 4);

  const totalFrames = Math.ceil(pcm.length / frameSize);
  const padded = new Float32Array(totalFrames * frameSize);
  padded.set(pcm);
  const output = new Float32Array(padded.length);

  for (let f = 0; f < totalFrames; f++) {
    const slice = padded.subarray(f * frameSize, (f + 1) * frameSize);
    new Float32Array(memory.buffer, inPtr, frameSize).set(slice);
    processFrame(state, outPtr, inPtr);
    output.set(new Float32Array(memory.buffer, outPtr, frameSize), f * frameSize);
  }

  free(inPtr);
  free(outPtr);
  destroy(state);
  return output.subarray(0, pcm.length);
}

/** ffmpeg-argumenten om terug te coderen naar hetzelfde bestandsformaat als de originele opname. */
function encodeArgsForMimeType(mimeType: string): string[] | null {
  if (mimeType.includes("webm")) return ["-c:a", "libopus", "-f", "webm"];
  if (mimeType.includes("ogg")) return ["-c:a", "libvorbis", "-f", "ogg"];
  if (mimeType.includes("wav")) return ["-f", "wav"];
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return ["-c:a", "aac", "-f", "mp4"];
  return null; // onbekend formaat: niet proberen te her-coderen
}

export interface DenoiseResult {
  buffer: Buffer;
  applied: boolean;
  reason?: string;
}

export async function denoiseAudioBuffer(audio: Buffer, mimeType: string): Promise<DenoiseResult> {
  if (!checkFfmpegAvailable()) {
    return { buffer: audio, applied: false, reason: "ffmpeg niet gevonden (installeer bv. via 'brew install ffmpeg')" };
  }
  const encodeArgs = encodeArgsForMimeType(mimeType);
  if (!encodeArgs) {
    return { buffer: audio, applied: false, reason: `onbekend audioformaat: ${mimeType}` };
  }

  try {
    const decode = spawnSync(
      "ffmpeg",
      ["-y", "-i", "pipe:0", "-f", "f32le", "-ar", String(SAMPLE_RATE), "-ac", "1", "pipe:1"],
      { input: audio, maxBuffer: 1024 * 1024 * 100 },
    );
    if (decode.status !== 0 || !decode.stdout?.length) {
      return { buffer: audio, applied: false, reason: `ffmpeg decode mislukt: ${decode.stderr?.toString().slice(-300)}` };
    }

    const raw = decode.stdout;
    const pcm = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.length / 4));
    const scaled = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) scaled[i] = (pcm[i] ?? 0) * PCM_SCALE;

    const exp = await loadRnnoise();
    const denoised = denoisePcm(exp, scaled);

    const unscaled = new Float32Array(denoised.length);
    for (let i = 0; i < denoised.length; i++) unscaled[i] = (denoised[i] ?? 0) / PCM_SCALE;
    const pcmBuffer = Buffer.from(unscaled.buffer, unscaled.byteOffset, unscaled.byteLength);

    // Naar een echt (seekbaar) tijdelijk bestand schrijven i.p.v. naar
    // stdout pipen: de webm-muxer kan de duur/Cues pas aan het eind
    // terugschrijven in de header, en dat kan alleen als hij kan terug-seeken
    // — een pipe kan dat niet, met een stil kapotte (duration: N/A) header
    // tot gevolg. Zie ook getScratchPath() hieronder.
    const os = await import("os");
    const fsPromises = await import("fs/promises");
    const tmpPath = path.join(
      os.tmpdir(),
      `ashi-tashi-denoise-${process.pid}-${Date.now()}-${Math.round(Math.random() * 1e6)}${extensionFromEncodeArgs(encodeArgs)}`,
    );
    try {
      const encode = spawnSync(
        "ffmpeg",
        ["-y", "-f", "f32le", "-ar", String(SAMPLE_RATE), "-ac", "1", "-i", "pipe:0", ...encodeArgs, tmpPath],
        { input: pcmBuffer, maxBuffer: 1024 * 1024 * 100 },
      );
      if (encode.status !== 0) {
        return { buffer: audio, applied: false, reason: `ffmpeg encode mislukt: ${encode.stderr?.toString().slice(-300)}` };
      }
      const result = await fsPromises.readFile(tmpPath);
      if (!result.length) {
        return { buffer: audio, applied: false, reason: "ffmpeg encode leverde een leeg bestand op" };
      }
      return { buffer: result, applied: true };
    } finally {
      await fsPromises.rm(tmpPath, { force: true });
    }
  } catch (err) {
    return { buffer: audio, applied: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

function extensionFromEncodeArgs(args: string[]): string {
  const formatIndex = args.indexOf("-f");
  const format = formatIndex >= 0 ? args[formatIndex + 1] : undefined;
  return format ? `.${format}` : ".bin";
}

// Alleen gebruikt door scripts/denoise-existing-recordings.ts (batch-verwerking
// van reeds opgeslagen bestanden) — hier geëxporteerd zodat het script en de
// live upload-flow (recordingsManifest.ts) dezelfde implementatie delen.
export const __internal = { checkFfmpegAvailable, rnnoiseWasmPath };
