import { spawn, execFile, type ChildProcess } from "child_process";
import path from "path";
import { promisify } from "util";
import { readManifest } from "@/lib/recordingsManifest";
import { regeneratePublicCatalog } from "@/lib/publicCatalogSnapshot";
import { RECORDING_PERSONAS, type RecordingPersona } from "@/lib/recordableItems";

/**
 * Server-only: draait anonymize_voices.py (FreeVC/VCTK, zie AGENT-WERKWIJZE.md)
 * als achtergrondproces vanuit de studio, en publiceert het resultaat via git.
 * Alleen lokaal (`npm run dev`) — Vercel heeft geen Python/ffmpeg en een
 * read-only filesystem. Alleen importeren vanuit route handlers.
 */

const execFileAsync = promisify(execFile);

export type ConvertPersona = Exclude<RecordingPersona, "man"> | "man";

export type StepStatus = "wachten" | "bezig" | "klaar" | "fout" | "geannuleerd";

export interface JobStep {
  persona: ConvertPersona;
  status: StepStatus;
  total: number;
  done: number;
  current: string | null;
}

export interface VoiceJob {
  status: "idle" | "running" | "done" | "error" | "cancelled";
  startedAt: string | null;
  finishedAt: string | null;
  steps: JobStep[];
  log: string[];
}

interface JobRuntime {
  job: VoiceJob;
  child: ChildProcess | null;
  cancelled: boolean;
}

// Op globalThis zodat de state HMR-herladen in `next dev` overleeft.
const g = globalThis as unknown as { __voiceJobRuntime?: JobRuntime };
function runtime(): JobRuntime {
  if (!g.__voiceJobRuntime) {
    g.__voiceJobRuntime = {
      job: { status: "idle", startedAt: null, finishedAt: null, steps: [], log: [] },
      child: null,
      cancelled: false,
    };
  }
  return g.__voiceJobRuntime;
}

export function getJob(): VoiceJob {
  return runtime().job;
}

const DERIVED_ORDER: ConvertPersona[] = ["vrouw", "jongen", "meisje"];
const SPEAKERS: Record<ConvertPersona, string> = { vrouw: "p225", jongen: "p226", meisje: "p297", man: "p256" };

function pushLog(rt: JobRuntime, line: string) {
  rt.job.log.push(line);
  if (rt.job.log.length > 400) rt.job.log.splice(0, rt.job.log.length - 400);
}

export interface VoiceOverview {
  manItems: number;
  missing: Record<"vrouw" | "jongen" | "meisje", string[]>;
  manPending: string[];
}

export async function getOverview(): Promise<VoiceOverview> {
  const manifest = await readManifest();
  const manEntries = Object.values(manifest).filter((e) => e.persona === "man");
  const manIds = manEntries.map((e) => e.itemId).sort();
  const missing = { vrouw: [] as string[], jongen: [] as string[], meisje: [] as string[] };
  for (const id of manIds) {
    for (const p of DERIVED_ORDER as Array<"vrouw" | "jongen" | "meisje">) {
      if (!manifest[`${id}__${p}`]) missing[p].push(id);
    }
  }
  const manPending = manEntries.filter((e) => !e.voiceConverted).map((e) => e.itemId).sort();
  return { manItems: manIds.length, missing, manPending };
}

function runStep(rt: JobRuntime, step: JobStep): Promise<number> {
  const root = process.cwd();
  const args = [
    path.join(root, "anonymize_voices.py"),
    "--recordings-dir", path.join(root, "public", "audio", "recordings"),
    "--manifest", path.join(root, "data", "recordings-manifest.json"),
    "--out-dir", path.join(root, ".voice-output", step.persona),
    "--persona", step.persona,
    "--target-speaker", SPEAKERS[step.persona],
    "--apply",
    "--auto-approve",
  ];
  if (process.env.VOICE_VCTK_DIR) args.push("--vctk-dir", process.env.VOICE_VCTK_DIR);

  return new Promise((resolve) => {
    const child = spawn(process.env.VOICE_PYTHON || "python3", args, { cwd: root, env: process.env });
    rt.child = child;
    let buffer = "";
    const handle = (chunk: Buffer) => {
      buffer += chunk.toString("utf-8");
      const parts = buffer.split(/\r?\n|\r/);
      buffer = parts.pop() ?? "";
      for (const raw of parts) {
        const line = raw.trimEnd();
        if (!line) continue;
        pushLog(rt, `[${step.persona}] ${line}`);
        const total = line.match(/^(\d+) item\(s\) te converteren/);
        if (total) step.total = Number(total[1]);
        const item = line.match(/^\s*→\s+(\S+)/);
        if (item) {
          step.current = item[1] ?? null;
          step.done += 1;
        }
      }
    };
    child.stdout.on("data", handle);
    child.stderr.on("data", handle);
    child.on("error", (err) => {
      pushLog(rt, `[${step.persona}] FOUT: kon Python niet starten (${err.message}). Zet evt. VOICE_PYTHON in .env.local.`);
      resolve(1);
    });
    child.on("close", (code) => {
      rt.child = null;
      resolve(code ?? 1);
    });
  });
}

export async function startJob(personas: ConvertPersona[]): Promise<{ ok: boolean; error?: string }> {
  const rt = runtime();
  if (rt.job.status === "running") return { ok: false, error: "Er loopt al een conversie." };

  const wanted = RECORDING_PERSONAS.filter((p) => personas.includes(p));
  // man altijd als laatste: vrouw/jongen/meisje worden van de originele man afgeleid.
  const ordered: ConvertPersona[] = [...DERIVED_ORDER.filter((p) => wanted.includes(p)), ...(wanted.includes("man") ? (["man"] as const) : [])];
  if (ordered.length === 0) return { ok: false, error: "Kies minstens één stem." };

  rt.cancelled = false;
  rt.job = {
    status: "running",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    steps: ordered.map((persona) => ({ persona, status: "wachten", total: 0, done: 0, current: null })),
    log: [],
  };

  void (async () => {
    let failed = false;
    for (const step of rt.job.steps) {
      if (rt.cancelled) {
        step.status = "geannuleerd";
        continue;
      }
      step.status = "bezig";
      const code = await runStep(rt, step);
      if (rt.cancelled) step.status = "geannuleerd";
      else if (code === 0) {
        step.status = "klaar";
        step.current = null;
      } else {
        step.status = "fout";
        failed = true;
        break; // bij fout niet doorgaan (zeker niet naar de destructieve man-stap)
      }
    }
    rt.job.finishedAt = new Date().toISOString();
    rt.job.status = rt.cancelled ? "cancelled" : failed ? "error" : "done";
    if (!failed && !rt.cancelled) await regeneratePublicCatalog().catch(() => undefined);
  })();

  return { ok: true };
}

export function cancelJob(): boolean {
  const rt = runtime();
  if (rt.job.status !== "running") return false;
  rt.cancelled = true;
  rt.child?.kill("SIGTERM");
  return true;
}

async function git(args: string[]): Promise<string> {
  const { stdout, stderr } = await execFileAsync("git", args, { cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 });
  return `${stdout}${stderr}`.trim();
}

/**
 * Publiceren = catalogus verversen, ALLEEN audio/manifest/catalogus/backups
 * stagen (nooit data/child-attempts of andere wijzigingen), committen en
 * pushen. Vercel deployt daarna vanzelf vanaf main.
 */
const CONTENT_PATH = /^(public\/audio\/|public\/illustrations\/|backups\/|public\/[^/]+\.json$|data\/[^/]+\.json$)/;

/** Openstaande wijzigingen die NIET onder studio-content/audio vallen (dus code/config). */
export async function getCodeChanges(): Promise<string[]> {
  const out = await git(["status", "--porcelain", "-uall"]).catch(() => "");
  return out
    .split("\n")
    .map((l) => l.slice(3).trim().replace(/^"|"$/g, ""))
    .filter((f) => f && !CONTENT_PATH.test(f));
}

export async function publish(includeCode = false): Promise<{ ok: boolean; message: string; output: string }> {
  if (runtime().job.status === "running") return { ok: false, message: "Wacht tot de conversie klaar is.", output: "" };
  const out: string[] = [];
  try {
    await regeneratePublicCatalog();
    if (includeCode) {
      try {
        await execFileAsync("npx", ["tsc", "--noEmit"], { cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 });
      } catch (err) {
        const e = err as { stdout?: string; stderr?: string; message?: string };
        return {
          ok: false,
          message: "Code bevat fouten (typecheck) — er is niets gepubliceerd. Los dit eerst op of zet 'Neem code mee' uit.",
          output: (e.stdout || e.stderr || e.message || "").slice(0, 4000),
        };
      }
    }
    // Audio + manifest + catalogus + backups, én de studio-content (data/*.json,
    // de public/*.json-spiegels en illustraties), zodat een nieuw item samen met
    // zijn audio live gaat. Nooit code en nooit data/child-attempts/ (submap).
    await git([
      "add", "--",
      "public/audio", "public/illustrations", "backups",
      ":(glob)public/*.json",
      ":(glob)data/*.json",
    ]);
    if (includeCode) await git(["add", "-A"]); // .gitignore houdt o.a. .env*.local en data/child-attempts/ buiten beeld
    const staged = await git(["diff", "--cached", "--name-only"]);
    if (!staged) return { ok: true, message: "Niets nieuws om te publiceren.", output: "" };
    const count = staged.split("\n").filter((f) => f.startsWith("public/audio/recordings/")).length;
    out.push(`${staged.split("\n").length} bestand(en) gestaged.`);
    out.push(await git(["commit", "-m", `Stemmen: ${count} audiobestand(en) bijgewerkt via studio`]));
    out.push(await git(["push", "origin", "HEAD"]));
    return { ok: true, message: "Gepubliceerd — Vercel is nu aan het deployen.", output: out.join("\n") };
  } catch (err) {
    const e = err as { message?: string; stderr?: string };
    return { ok: false, message: "Publiceren mislukt.", output: [...out, e.stderr ?? e.message ?? String(err)].join("\n") };
  }
}
