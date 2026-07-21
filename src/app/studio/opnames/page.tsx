"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RecorderControl, type RecordingEntryData } from "@/components/studio/RecorderControl";
import { LEVELS, getCategoriesForLevel } from "@/lib/contentCatalog";
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
 * middleware.ts. Genavigeerd via Level > Categorie (content-catalogus,
 * src/lib/contentCatalog.ts) zodat je per keer maar één categorie (±40
 * items) ziet, in plaats van alle 300+ woorden in één lange lijst.
 */
export default function StudioOpnamesPage() {
  const router = useRouter();
  const items = useMemo(() => getRecordableItems(), []);
  const [manifest, setManifest] = useState<ManifestState>({});
  const [loading, setLoading] = useState(true);
  const [activePersona, setActivePersona] = useState<RecordingPersona>("man");
  const [activeLevelSlug, setActiveLevelSlug] = useState(LEVELS[0]?.slug ?? "");

  const categoriesForLevel = useMemo(() => getCategoriesForLevel(activeLevelSlug), [activeLevelSlug]);
  const [activeCategorySlug, setActiveCategorySlug] = useState(categoriesForLevel[0]?.slug ?? "");

  useEffect(() => {
    const first = getCategoriesForLevel(activeLevelSlug)[0];
    setActiveCategorySlug(first?.slug ?? "");
  }, [activeLevelSlug]);

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

  const itemsForActiveCategory = useMemo(
    () => items.filter((item) => item.categorySlug === activeCategorySlug),
    [items, activeCategorySlug]
  );

  function countsFor(categorySlug: string, persona: RecordingPersona) {
    let recorded = 0;
    let approved = 0;
    let total = 0;
    for (const item of items) {
      if (item.categorySlug !== categorySlug) continue;
      total += 1;
      const entry = manifest[recordingKey(item.id, persona)];
      if (entry) {
        recorded += 1;
        if (entry.reviewStatus === "GOEDGEKEURD") approved += 1;
      }
    }
    return { recorded, approved, total };
  }

  const activeCategory = categoriesForLevel.find((category) => category.slug === activeCategorySlug);
  const activeCounts = activeCategory
    ? countsFor(activeCategory.slug, activePersona)
    : { recorded: 0, approved: 0, total: 0 };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-500">Opnamestudio</h1>
          <p className="text-sm text-ink-muted">
            {items.length} woorden in {LEVELS.length} levels. Draai dit lokaal (npm run dev) — zie
            ARCHITECTUUR-OPNAMESTUDIO.md.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Uitloggen
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.slug}
            type="button"
            onClick={() => setActiveLevelSlug(level.slug)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors
              focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
              ${
                level.slug === activeLevelSlug
                  ? "border-forest-500 bg-forest-500 text-white"
                  : "border-border-subtle bg-white text-ink hover:border-forest-400"
              }`}
          >
            <span aria-hidden="true">{level.emoji}</span> {level.titleNl}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {categoriesForLevel.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => setActiveCategorySlug(category.slug)}
            className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors
              focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
              ${
                category.slug === activeCategorySlug
                  ? "border-clay-500 bg-clay-500 text-white"
                  : "border-border-subtle bg-white text-ink hover:border-clay-400"
              }`}
          >
            <span aria-hidden="true">{category.emoji}</span> {category.titleNl}
            <span className="ml-1 opacity-70">({category.words.length})</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {RECORDING_PERSONAS.map((persona) => {
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
              </button>
            );
          })}
        </div>
        {activeCategory && (
          <p className="mt-3 text-sm text-ink-muted">
            {activeCategory.titleNl} · {activeCounts.recorded}/{activeCounts.total} opgenomen voor{" "}
            {PERSONA_LABELS[activePersona].toLowerCase()} · {activeCounts.approved} goedgekeurd
          </p>
        )}
      </Card>

      {loading && <p className="text-ink-muted">Opnamestatus laden…</p>}

      {!loading && (
        <div className="flex flex-col gap-3">
          {itemsForActiveCategory.map((item) => {
            const key = recordingKey(item.id, activePersona);
            const entry = manifest[key];
            return (
              <Card key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {item.imageEmoji}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{item.translationNl}</p>
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
      )}
    </main>
  );
}
