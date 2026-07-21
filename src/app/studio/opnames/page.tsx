"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RecorderControl, type RecordingEntryData } from "@/components/studio/RecorderControl";
import {
  getRecordableItems,
  PERSONA_LABELS,
  RECORDING_PERSONAS,
  recordingKey,
  type RecordingPersona,
} from "@/lib/recordableItems";

type ManifestState = Record<string, RecordingEntryData>;

/**
 * Opnamestudio-hoofdpagina (ARCHITECTUUR-OPNAMESTUDIO.md). Beschermd door
 * middleware.ts. Laat per woord/zin x persona zien of er al een opname is,
 * en biedt opnemen/afspelen/goed-of-afkeuren via RecorderControl.
 */
export default function StudioOpnamesPage() {
  const router = useRouter();
  const items = useMemo(() => getRecordableItems(), []);
  const [manifest, setManifest] = useState<ManifestState>({});
  const [loading, setLoading] = useState(true);
  const [activePersona, setActivePersona] = useState<RecordingPersona>("man");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/studio/recordings")
      .then((res) => res.json())
      .then((data: { manifest: ManifestState }) => {
        if (!cancelled) setManifest(data.manifest);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleEntryChange(itemId: string, persona: RecordingPersona, entry: RecordingEntryData | null) {
    const key = recordingKey(itemId, persona);
    setManifest((prev) => {
      const next = { ...prev };
      if (entry) {
        next[key] = entry;
      } else {
        delete next[key];
      }
      return next;
    });
  }

  async function handleLogout() {
    await fetch("/api/studio/auth", { method: "DELETE" });
    router.push("/studio/login");
    router.refresh();
  }

  const personaCounts = useMemo(() => {
    const counts: Record<RecordingPersona, { recorded: number; approved: number }> = {
      man: { recorded: 0, approved: 0 },
      vrouw: { recorded: 0, approved: 0 },
      jongen: { recorded: 0, approved: 0 },
      meisje: { recorded: 0, approved: 0 },
    };
    for (const entry of Object.values(manifest)) {
      counts[entry.persona].recorded += 1;
      if (entry.reviewStatus === "GOEDGEKEURD") counts[entry.persona].approved += 1;
    }
    return counts;
  }, [manifest]);

  const groupedByTheme = useMemo(() => {
    const groups = new Map<string, { themeTitleNl: string; items: typeof items }>();
    for (const item of items) {
      const group = groups.get(item.themeSlug) ?? { themeTitleNl: item.themeTitleNl, items: [] };
      group.items.push(item);
      groups.set(item.themeSlug, group);
    }
    return Array.from(groups.values());
  }, [items]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-500">Opnamestudio</h1>
          <p className="text-sm text-ink-muted">
            Neem woorden en zinnen in per persona. Draai dit lokaal (npm run dev) — zie
            ARCHITECTUUR-OPNAMESTUDIO.md.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Uitloggen
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {RECORDING_PERSONAS.map((persona) => {
            const counts = personaCounts[persona];
            const isActive = persona === activePersona;
            return (
              <button
                key={persona}
                type="button"
                onClick={() => setActivePersona(persona)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors
                  focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                  ${
                    isActive
                      ? "border-forest-500 bg-forest-500 text-white"
                      : "border-border-subtle bg-white text-ink hover:border-forest-400"
                  }`}
              >
                {PERSONA_LABELS[persona]}
                <span className="ml-2 font-normal opacity-80">
                  {counts.recorded}/{items.length} · {counts.approved} ✓
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {loading && <p className="text-ink-muted">Opnamestatus laden…</p>}

      {!loading &&
        groupedByTheme.map((group) => (
          <section key={group.themeTitleNl} className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-forest-600">{group.themeTitleNl}</h2>
            <div className="flex flex-col gap-3">
              {group.items.map((item) => {
                const key = recordingKey(item.id, activePersona);
                const entry = manifest[key];
                return (
                  <Card key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl" aria-hidden="true">
                        {item.imageEmoji}
                      </span>
                      <div>
                        <p className="font-semibold text-ink">
                          {item.translationNl}
                          <span className="ml-2 rounded-full bg-sky-200 px-2 py-0.5 text-xs font-bold text-forest-700">
                            {item.itemKind}
                          </span>
                        </p>
                        <p className="text-xs text-ink-muted">{item.latinSpelling}</p>
                        <div className="mt-1 flex gap-1">
                          {RECORDING_PERSONAS.map((persona) => {
                            const otherEntry = manifest[recordingKey(item.id, persona)];
                            const dotClass = !otherEntry
                              ? "bg-border-subtle"
                              : otherEntry.reviewStatus === "GOEDGEKEURD"
                                ? "bg-forest-500"
                                : otherEntry.reviewStatus === "AFGEKEURD"
                                  ? "bg-clay-500"
                                  : "bg-peach-200";
                            return (
                              <span
                                key={persona}
                                title={`${PERSONA_LABELS[persona]}: ${otherEntry ? otherEntry.reviewStatus : "geen opname"}`}
                                className={`h-2 w-2 rounded-full ${dotClass}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <RecorderControl
                      itemId={item.id}
                      persona={activePersona}
                      entry={entry}
                      onChange={(next) => handleEntryChange(item.id, activePersona, next)}
                    />
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
    </main>
  );
}
