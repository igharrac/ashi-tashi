"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Persona = "vrouw" | "jongen" | "meisje" | "man";
type StepStatus = "wachten" | "bezig" | "klaar" | "fout" | "geannuleerd";

interface Step { persona: Persona; status: StepStatus; total: number; done: number; current: string | null }
interface Job {
  status: "idle" | "running" | "done" | "error" | "cancelled";
  startedAt: string | null;
  finishedAt: string | null;
  steps: Step[];
  log: string[];
}
interface Overview {
  manItems: number;
  missing: Record<"vrouw" | "jongen" | "meisje", string[]>;
  manPending: string[];
}

const LABEL: Record<Persona, string> = { vrouw: "Vrouw", jongen: "Jongen", meisje: "Meisje", man: "Man (anonimiseren)" };
const STATUS_LABEL: Record<StepStatus, string> = {
  wachten: "wacht", bezig: "bezig…", klaar: "klaar", fout: "fout", geannuleerd: "geannuleerd",
};

export default function StemmenPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [selected, setSelected] = useState<Record<Persona, boolean>>({ vrouw: true, jongen: true, meisje: true, man: false });
  const [error, setError] = useState<string | null>(null);
  const [codeChanges, setCodeChanges] = useState<string[]>([]);
  const [includeCode, setIncludeCode] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ ok: boolean; message: string; output: string } | null>(null);
  const logRef = useRef<HTMLPreElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/studio/stemmen", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Laden mislukt.");
      setOverview(data.overview);
      setJob(data.job);
      setCodeChanges(data.codeChanges ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Laden mislukt.");
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (job?.status !== "running") return;
    const t = setInterval(() => void refresh(), 2000);
    return () => clearInterval(t);
  }, [job?.status, refresh]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [job?.log.length]);

  async function post(body: object) {
    const res = await fetch("/api/studio/stemmen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { res, data: await res.json() };
  }

  async function handleStart() {
    setPublishResult(null);
    const personas = (Object.keys(selected) as Persona[]).filter((p) => selected[p]);
    const { res, data } = await post({ action: "start", personas });
    if (!res.ok) setError(data.error ?? "Starten mislukt.");
    await refresh();
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishResult(null);
    const { data } = await post({ action: "publish", includeCode });
    setPublishResult(data);
    setPublishing(false);
    await refresh();
  }

  const running = job?.status === "running";
  const todo = (p: Persona) => (!overview ? 0 : p === "man" ? overview.manPending.length : overview.missing[p].length);
  const totalTodo = (Object.keys(selected) as Persona[]).filter((p) => selected[p]).reduce((n, p) => n + todo(p), 0);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-500">Stemmen omzetten</h1>
          <p className="text-sm text-ink-muted">
            Zet de man-opnames om naar vrouw, jongen en meisje (FreeVC), en publiceer met één klik. Draai dit lokaal (npm run dev).
          </p>
        </div>
        <Link href="/studio/opnames"><Button variant="ghost" size="sm">← Opnamestudio</Button></Link>
      </div>

      {error && <Card className="text-sm text-red-700">{error}</Card>}

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-forest-500">1. Wat moet er omgezet worden?</h2>
        {!overview ? (
          <p className="text-sm text-ink-muted">Laden…</p>
        ) : (
          <>
            <p className="text-sm text-ink-muted">{overview.manItems} items hebben een man-opname.</p>
            {(["vrouw", "jongen", "meisje", "man"] as Persona[]).map((p) => (
              <label key={p} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5"
                  checked={selected[p]}
                  disabled={running}
                  onChange={(e) => setSelected((s) => ({ ...s, [p]: e.target.checked }))}
                />
                <span className="text-sm">
                  <strong>{LABEL[p]}</strong> — {todo(p)} item(s) nog te doen
                  {todo(p) > 0 && (
                    <span className="block text-xs text-ink-muted">
                      {(p === "man" ? overview.manPending : overview.missing[p]).slice(0, 6).join(", ")}
                      {todo(p) > 6 ? ` … +${todo(p) - 6}` : ""}
                    </span>
                  )}
                  {p === "man" && (
                    <span className="block text-xs text-clay-500">
                      Vervangt de man-opnames door de geanonimiseerde stem. Er wordt eerst automatisch een backup gemaakt
                      in backups/. Gebeurt altijd als laatste.
                    </span>
                  )}
                </span>
              </label>
            ))}
            <div className="flex gap-2">
              <Button onClick={handleStart} disabled={running || totalTodo === 0}>
                {totalTodo === 0 ? "Alles is al omgezet" : `Zet ${totalTodo} item(s) om`}
              </Button>
              {running && (
                <Button variant="outline" onClick={async () => { await post({ action: "cancel" }); await refresh(); }}>
                  Stoppen
                </Button>
              )}
            </div>
            <p className="text-xs text-ink-muted">De eerste keer wordt het model (~1GB) gedownload. Dat duurt even.</p>
          </>
        )}
      </Card>

      {job && job.status !== "idle" && (
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-forest-500">2. Voortgang</h2>
          {job.steps.map((s) => (
            <div key={s.persona} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span>{LABEL[s.persona]}{s.current ? ` — ${s.current}` : ""}</span>
                <span className="text-ink-muted">
                  {STATUS_LABEL[s.status]}{s.total > 0 ? ` (${Math.min(s.done, s.total)}/${s.total})` : ""}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-mint-100">
                <div
                  className={`h-full ${s.status === "fout" ? "bg-red-500" : "bg-forest-500"}`}
                  style={{ width: `${s.status === "klaar" ? 100 : s.total ? Math.round((Math.max(s.done - 1, 0) / s.total) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
          {job.status === "error" && <p className="text-sm text-red-700">Er ging iets mis — zie het logboek. De volgende stappen zijn niet uitgevoerd.</p>}
          <details open={job.status === "error"}>
            <summary className="cursor-pointer text-sm text-ink-muted">Logboek</summary>
            <pre ref={logRef} className="mt-2 max-h-64 overflow-auto rounded bg-black/5 p-2 text-xs">{job.log.join("\n")}</pre>
          </details>
        </Card>
      )}

      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-forest-500">3. Publiceren</h2>
        <p className="text-sm text-ink-muted">
          Ververst de audiocatalogus, commit audio, manifest, backups en studio-content (nieuwe items, spellingen, illustraties; geen kinderopnames of code) en pusht naar GitHub.
          Vercel deployt daarna automatisch.
        </p>
        {codeChanges.length > 0 && (
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5" checked={includeCode} onChange={(e) => setIncludeCode(e.target.checked)} />
            <span>
              <strong>Neem ook {codeChanges.length} code-wijziging(en) mee</strong> (typecheck draait eerst)
              <span className="block text-xs text-ink-muted">
                {codeChanges.slice(0, 6).join(", ")}{codeChanges.length > 6 ? ` … +${codeChanges.length - 6}` : ""}
              </span>
            </span>
          </label>
        )}
        <div>
          <Button onClick={handlePublish} disabled={running || publishing}>
            {publishing ? "Bezig met publiceren…" : "Publiceer naar de live app"}
          </Button>
        </div>
        {publishResult && (
          <div className={`text-sm ${publishResult.ok ? "text-forest-500" : "text-red-700"}`}>
            <p className="font-semibold">{publishResult.message}</p>
            {publishResult.output && <pre className="mt-2 max-h-48 overflow-auto rounded bg-black/5 p-2 text-xs">{publishResult.output}</pre>}
          </div>
        )}
      </Card>
    </main>
  );
}
