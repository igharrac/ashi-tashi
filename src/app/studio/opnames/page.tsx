"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RecorderControl, type RecordingEntryData } from "@/components/studio/RecorderControl";
import { SpellingInput } from "@/components/studio/SpellingInput";
import { LEVELS, getCategoriesForLevel } from "@/lib/contentCatalog";
import {
  getRecordableItems,
  PERSONA_LABELS,
  RECORDING_PERSONAS,
  recordingKey,
  type RecordingPersona,
} from "@/lib/recordableItems";
import { DAILY_SENTENCE_CATEGORIES, getRecordableSentences, type RecordableSentenceItem } from "@/lib/dailySentences";
import {
  toRecordablePracticeSentence,
  type PracticeSentenceCategory,
  type PracticeSentenceDefinition,
  type RecordablePracticeSentenceItem,
} from "@/lib/practiceSentences";
import type { RecordableItem } from "@/lib/recordableItems";

type ManifestState = Record<string, RecordingEntryData>;
type StudioMode = "woorden" | "zinnen" | "oefenen";
/**
 * Gemeenschappelijke velden die de item-lijst hieronder nodig heeft —
 * RecordableItem (woorden), RecordableSentenceItem (zinnen) en
 * RecordablePracticeSentenceItem (oefenen) voldoen hier allemaal aan.
 * `pictogramUrl` bestaat alleen bij Oefenen-zinnen (optioneel, dus geen
 * probleem voor de andere twee) — zo zie je in de studio precies hetzelfde
 * plaatje als het kind straks bij deze zin te zien krijgt.
 */
type StudioListItem = Pick<
  RecordableItem | RecordableSentenceItem | RecordablePracticeSentenceItem,
  "id" | "translationNl" | "latinSpelling" | "imageEmoji"
> & { pictogramUrl?: string };

interface PracticeContentState {
  categories: PracticeSentenceCategory[];
  sentences: PracticeSentenceDefinition[];
}

const EMPTY_PRACTICE_CONTENT: PracticeContentState = { categories: [], sentences: [] };

/**
 * Opnamestudio-hoofdpagina (ARCHITECTUUR-OPNAMESTUDIO.md). Beschermd door
 * middleware.ts. Genavigeerd via Level > Categorie (content-catalogus,
 * src/lib/contentCatalog.ts) zodat je per keer maar één categorie (±40
 * items) ziet, in plaats van alle 300+ woorden in één lange lijst.
 *
 * Praktijkzinnen (mode "oefenen") is de eerste content-catalogus die op
 * verzoek volledig via de studio te beheren is — categorieën én zinnen zelf
 * toevoegen/aanpassen/verwijderen, i.p.v. dat daar code voor aangepast moet
 * worden (zie src/lib/practiceContentStore.ts). Woorden en Zinnen blijven
 * voorlopig vaste code-catalogi (gefaseerde aanpak, op verzoek).
 */
export default function StudioOpnamesPage() {
  const router = useRouter();
  const items = useMemo(() => getRecordableItems(), []);
  const sentenceItems = useMemo(() => getRecordableSentences(), []);
  const [manifest, setManifest] = useState<ManifestState>({});
  const [spellings, setSpellings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activePersona, setActivePersona] = useState<RecordingPersona>("man");
  const [bulkApproving, setBulkApproving] = useState(false);
  const [mode, setMode] = useState<StudioMode>("woorden");
  const [activeLevelSlug, setActiveLevelSlug] = useState(LEVELS[0]?.slug ?? "");

  const categoriesForLevel = useMemo(() => getCategoriesForLevel(activeLevelSlug), [activeLevelSlug]);
  const [activeCategorySlug, setActiveCategorySlug] = useState(categoriesForLevel[0]?.slug ?? "");
  const [activeSentenceCategorySlug, setActiveSentenceCategorySlug] = useState(DAILY_SENTENCE_CATEGORIES[0]?.slug ?? "");

  // Praktijkzinnen-content komt (i.t.t. Woorden/Zinnen) niet uit een vaste
  // import maar wordt hier geladen — zie src/app/api/studio/content/practice.
  const [practiceContent, setPracticeContent] = useState<PracticeContentState>(EMPTY_PRACTICE_CONTENT);
  const [activePracticeCategorySlug, setActivePracticeCategorySlug] = useState("");
  const [contentError, setContentError] = useState<string | null>(null);
  const [contentSaving, setContentSaving] = useState(false);

  const [editingCategory, setEditingCategory] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState({ titleNl: "", emoji: "" });
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryDraft, setNewCategoryDraft] = useState({ titleNl: "", emoji: "" });

  const [editingSentenceId, setEditingSentenceId] = useState<string | null>(null);
  const [sentenceDraft, setSentenceDraft] = useState({ translationNl: "", contextNl: "", emoji: "" });
  const [addingSentence, setAddingSentence] = useState(false);
  const [newSentenceDraft, setNewSentenceDraft] = useState({ translationNl: "", contextNl: "", emoji: "" });

  useEffect(() => {
    const first = getCategoriesForLevel(activeLevelSlug)[0];
    setActiveCategorySlug(first?.slug ?? "");
  }, [activeLevelSlug]);

  async function loadPracticeContent() {
    const response = await fetch("/api/studio/content/practice");
    const data = (await response.json().catch(() => EMPTY_PRACTICE_CONTENT)) as PracticeContentState;
    setPracticeContent(data);
    setActivePracticeCategorySlug((prev) =>
      data.categories.some((category) => category.slug === prev) ? prev : (data.categories[0]?.slug ?? ""),
    );
    return data;
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/studio/recordings").then((res) => res.json()) as Promise<{ manifest: ManifestState }>,
      fetch("/api/studio/spellings").then((res) => res.json()) as Promise<{ spellings: Record<string, string> }>,
      loadPracticeContent(),
    ])
      .then(([recordingsData, spellingsData]) => {
        if (cancelled) return;
        setManifest(recordingsData.manifest);
        setSpellings(spellingsData.spellings);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /**
   * Alle nog-niet-goedgekeurde opnames van de huidige categorie + persona in
   * één keer goedkeuren (op verzoek: minder klikken dan elke opname apart
   * langsgaan). Losse goedkeuren/afkeuren per item (RecorderControl) blijft
   * gewoon bestaan voor wie liever per opname beslist.
   */
  async function handleBulkApprove(itemsToApprove: { itemId: string; persona: RecordingPersona }[]) {
    if (itemsToApprove.length === 0) return;
    setBulkApproving(true);
    try {
      const response = await fetch("/api/studio/recordings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToApprove, reviewStatus: "GOEDGEKEURD" }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as { entries: RecordingEntryData[] };
      setManifest((prev) => {
        const next = { ...prev };
        for (const entry of data.entries) {
          next[recordingKey(entry.itemId, entry.persona)] = entry;
        }
        return next;
      });
    } finally {
      setBulkApproving(false);
    }
  }

  // --- Praktijkzinnen CRUD -------------------------------------------------

  async function submitPracticeContent(
    method: "POST" | "PATCH" | "DELETE",
    body: Record<string, unknown>,
  ): Promise<boolean> {
    setContentSaving(true);
    setContentError(null);
    try {
      const response = await fetch("/api/studio/content/practice", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setContentError(data.error ?? "Opslaan is mislukt.");
        return false;
      }
      await loadPracticeContent();
      return true;
    } finally {
      setContentSaving(false);
    }
  }

  async function handleAddCategory() {
    const ok = await submitPracticeContent("POST", { kind: "category", ...newCategoryDraft });
    if (ok) {
      setAddingCategory(false);
      setNewCategoryDraft({ titleNl: "", emoji: "" });
    }
  }

  async function handleSaveCategory(slug: string) {
    const ok = await submitPracticeContent("PATCH", { kind: "category", slug, ...categoryDraft });
    if (ok) setEditingCategory(false);
  }

  async function handleDeleteCategory(slug: string) {
    const ok = await submitPracticeContent("DELETE", { kind: "category", slug });
    if (ok) setEditingCategory(false);
  }

  async function handleAddSentence() {
    const ok = await submitPracticeContent("POST", {
      kind: "sentence",
      categorySlug: activePracticeCategorySlug,
      ...newSentenceDraft,
    });
    if (ok) {
      setAddingSentence(false);
      setNewSentenceDraft({ translationNl: "", contextNl: "", emoji: "" });
    }
  }

  async function handleSaveSentence(id: string) {
    const ok = await submitPracticeContent("PATCH", { kind: "sentence", id, ...sentenceDraft });
    if (ok) setEditingSentenceId(null);
  }

  async function handleDeleteSentence(id: string) {
    await submitPracticeContent("DELETE", { kind: "sentence", id });
  }

  // --------------------------------------------------------------------------

  const practiceItems = useMemo(
    () =>
      practiceContent.sentences.map((sentence) =>
        toRecordablePracticeSentence(
          sentence,
          practiceContent.categories.find((category) => category.slug === sentence.categorySlug),
        ),
      ),
    [practiceContent],
  );

  const itemsForActiveCategory = useMemo(
    () => items.filter((item) => item.categorySlug === activeCategorySlug),
    [items, activeCategorySlug]
  );
  const sentencesForActiveCategory = useMemo(
    () => sentenceItems.filter((item) => item.categorySlug === activeSentenceCategorySlug),
    [sentenceItems, activeSentenceCategorySlug]
  );
  const practiceSentencesForActiveCategory = useMemo(
    () => practiceItems.filter((item) => item.categorySlug === activePracticeCategorySlug),
    [practiceItems, activePracticeCategorySlug]
  );
  const itemsForActiveSelection: StudioListItem[] =
    mode === "woorden" ? itemsForActiveCategory : mode === "zinnen" ? sentencesForActiveCategory : practiceSentencesForActiveCategory;

  // Items in de huidige categorie + persona die wél een opname hebben maar
  // nog niet goedgekeurd zijn — dit is precies wat "Alles goedkeuren" in
  // één klap goedkeurt.
  const itemsPendingApproval = itemsForActiveSelection
    .filter((item) => {
      const entry = manifest[recordingKey(item.id, activePersona)];
      return entry && entry.reviewStatus !== "GOEDGEKEURD";
    })
    .map((item) => ({ itemId: item.id, persona: activePersona }));

  function countsFor(pool: StudioListItem[], categorySlug: string, persona: RecordingPersona) {
    let recorded = 0;
    let approved = 0;
    let total = 0;
    for (const item of pool) {
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
  const activeSentenceCategory = DAILY_SENTENCE_CATEGORIES.find((category) => category.slug === activeSentenceCategorySlug);
  const activePracticeCategory = practiceContent.categories.find((category) => category.slug === activePracticeCategorySlug);
  const activeModeCategory =
    mode === "woorden" ? activeCategory : mode === "zinnen" ? activeSentenceCategory : activePracticeCategory;
  const activeCounts =
    mode === "woorden"
      ? activeCategory
        ? countsFor(
            items.filter((item) => item.categorySlug === activeCategory.slug),
            activeCategory.slug,
            activePersona,
          )
        : { recorded: 0, approved: 0, total: 0 }
      : mode === "zinnen"
        ? activeSentenceCategory
          ? countsFor(sentencesForActiveCategory, activeSentenceCategory.slug, activePersona)
          : { recorded: 0, approved: 0, total: 0 }
        : activePracticeCategory
          ? countsFor(practiceSentencesForActiveCategory, activePracticeCategory.slug, activePersona)
          : { recorded: 0, approved: 0, total: 0 };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-500">Opnamestudio</h1>
          <p className="text-sm text-ink-muted">
            {mode === "woorden"
              ? `${items.length} woorden in ${LEVELS.length} levels.`
              : mode === "zinnen"
                ? `${sentenceItems.length} dagelijkse zinnen in ${DAILY_SENTENCE_CATEGORIES.length} categorieën.`
                : `${practiceItems.length} praktijkzinnen in ${practiceContent.categories.length} categorieën.`}{" "}
            Draai dit lokaal (npm run dev) — zie ARCHITECTUUR-OPNAMESTUDIO.md.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/studio/deel-link">
            <Button variant="ghost" size="sm">
              Deel-link
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Uitloggen
          </Button>
        </div>
      </div>

      {/*
        Drie navigatieniveaus met bewust verschillend visueel gewicht i.p.v.
        drie identieke pillen (op verzoek, zag er "te druk" uit): contenttype
        als tabs (grootste keuze), level als segmented control, categorie als
        platte tags. "Oefenen" heet in de UI "Praktijkzinnen" om niet te
        botsen met de gelijknamige child-niveau ("Oefenen", zie
        experienceLevels.ts) — dat is een ander concept (child.level is
        vandaag niet gekoppeld aan welke woorden/zinnen-content bestaat).
      */}
      <div className="flex gap-6 border-b border-border-subtle">
        {(["woorden", "zinnen", "oefenen"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className={`-mb-px border-b-2 pb-2.5 text-[15px] transition-colors
              focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
              ${
                option === mode
                  ? "border-primary-600 font-medium text-primary-600"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
          >
            {option === "woorden" ? "Woorden" : option === "zinnen" ? "Zinnen" : "Praktijkzinnen"}
          </button>
        ))}
      </div>

      {mode === "woorden" ? (
        <>
          <div className="inline-flex w-fit gap-0.5 rounded-xl2 bg-primary-50 p-1">
            {LEVELS.map((level) => (
              <button
                key={level.slug}
                type="button"
                onClick={() => setActiveLevelSlug(level.slug)}
                className={`rounded-lg px-3.5 py-1.5 text-sm transition-colors
                  focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                  ${
                    level.slug === activeLevelSlug
                      ? "bg-white font-medium text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  }`}
              >
                <span aria-hidden="true">{level.emoji}</span> {level.titleNl}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {categoriesForLevel.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => setActiveCategorySlug(category.slug)}
                className={`flex items-center gap-1.5 text-sm transition-colors
                  focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                  ${
                    category.slug === activeCategorySlug
                      ? "font-medium text-clay-600"
                      : "text-ink-muted hover:text-ink"
                  }`}
              >
                {category.slug === activeCategorySlug && (
                  <span className="h-1.5 w-1.5 rounded-full bg-clay-500" aria-hidden="true" />
                )}
                <span aria-hidden="true">{category.emoji}</span> {category.titleNl}
                <span className="text-ink-muted">{category.words.length}</span>
              </button>
            ))}
          </div>
        </>
      ) : mode === "zinnen" ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {DAILY_SENTENCE_CATEGORIES.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveSentenceCategorySlug(category.slug)}
              className={`flex items-center gap-1.5 text-sm transition-colors
                focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                ${
                  category.slug === activeSentenceCategorySlug
                    ? "font-medium text-clay-600"
                    : "text-ink-muted hover:text-ink"
                }`}
            >
              {category.slug === activeSentenceCategorySlug && (
                <span className="h-1.5 w-1.5 rounded-full bg-clay-500" aria-hidden="true" />
              )}
              <span aria-hidden="true">{category.emoji}</span> {category.titleNl}
              <span className="text-ink-muted">
                {sentenceItems.filter((item) => item.categorySlug === category.slug).length}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {practiceContent.categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => {
                  setActivePracticeCategorySlug(category.slug);
                  setEditingCategory(false);
                }}
                className={`flex items-center gap-1.5 text-sm transition-colors
                  focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                  ${
                    category.slug === activePracticeCategorySlug
                      ? "font-medium text-clay-600"
                      : "text-ink-muted hover:text-ink"
                  }`}
              >
                {category.slug === activePracticeCategorySlug && (
                  <span className="h-1.5 w-1.5 rounded-full bg-clay-500" aria-hidden="true" />
                )}
                <span aria-hidden="true">{category.emoji}</span> {category.titleNl}
                <span className="text-ink-muted">
                  {practiceItems.filter((item) => item.categorySlug === category.slug).length}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setAddingCategory((v) => !v);
                setContentError(null);
              }}
              className="text-sm font-medium text-clay-500 underline underline-offset-2
                focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
            >
              + Categorie
            </button>
          </div>

          {addingCategory && (
            <Card className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                Naam
                <input
                  type="text"
                  value={newCategoryDraft.titleNl}
                  onChange={(e) => setNewCategoryDraft((prev) => ({ ...prev, titleNl: e.target.value }))}
                  placeholder="Bijvoorbeeld: Gevoelens"
                  className="rounded-lg border-2 border-border-subtle px-3 py-1.5 text-sm
                    focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                Emoji
                <input
                  type="text"
                  value={newCategoryDraft.emoji}
                  onChange={(e) => setNewCategoryDraft((prev) => ({ ...prev, emoji: e.target.value }))}
                  placeholder="❤️"
                  className="w-16 rounded-lg border-2 border-border-subtle px-3 py-1.5 text-sm
                    focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                />
              </label>
              <Button variant="primary" size="sm" onClick={handleAddCategory} disabled={contentSaving}>
                Toevoegen
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAddingCategory(false)}>
                Annuleren
              </Button>
            </Card>
          )}

          {activePracticeCategory && (
            <Card className="flex flex-col gap-3">
              {editingCategory ? (
                <div className="flex flex-wrap items-end gap-3">
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                    Naam
                    <input
                      type="text"
                      value={categoryDraft.titleNl}
                      onChange={(e) => setCategoryDraft((prev) => ({ ...prev, titleNl: e.target.value }))}
                      className="rounded-lg border-2 border-border-subtle px-3 py-1.5 text-sm
                        focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                    Emoji
                    <input
                      type="text"
                      value={categoryDraft.emoji}
                      onChange={(e) => setCategoryDraft((prev) => ({ ...prev, emoji: e.target.value }))}
                      className="w-16 rounded-lg border-2 border-border-subtle px-3 py-1.5 text-sm
                        focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                    />
                  </label>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveCategory(activePracticeCategory.slug)}
                    disabled={contentSaving}
                  >
                    Opslaan
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingCategory(false)}>
                    Annuleren
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(activePracticeCategory.slug)}
                    disabled={contentSaving}
                    className="text-clay-500"
                  >
                    Categorie verwijderen
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">
                    <span aria-hidden="true">{activePracticeCategory.emoji}</span> {activePracticeCategory.titleNl}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCategoryDraft({ titleNl: activePracticeCategory.titleNl, emoji: activePracticeCategory.emoji });
                      setEditingCategory(true);
                    }}
                  >
                    Label bewerken
                  </Button>
                </div>
              )}
            </Card>
          )}

          {contentError && (
            <p role="alert" className="text-sm font-medium text-clay-500">
              {contentError}
            </p>
          )}
        </div>
      )}

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
        {activeModeCategory && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-ink-muted">
              {activeModeCategory.titleNl} · {activeCounts.recorded}/
              {activeCounts.total} opgenomen voor {PERSONA_LABELS[activePersona].toLowerCase()} · {activeCounts.approved}{" "}
              goedgekeurd
            </p>
            {itemsPendingApproval.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkApprove(itemsPendingApproval)}
                disabled={bulkApproving}
              >
                {bulkApproving ? "Bezig…" : `Alles goedkeuren (${itemsPendingApproval.length})`}
              </Button>
            )}
          </div>
        )}
      </Card>

      {loading && <p className="text-ink-muted">Opnamestatus laden…</p>}

      {!loading && (
        <div className="flex flex-col gap-3">
          {itemsForActiveSelection.map((item) => {
            const key = recordingKey(item.id, activePersona);
            const entry = manifest[key];
            const isEditingSentence = mode === "oefenen" && editingSentenceId === item.id;
            return (
              <Card key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  {item.pictogramUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- extern ARASAAC-plaatje, geen lokale kopie
                    <img
                      src={item.pictogramUrl}
                      alt={item.translationNl}
                      className="h-12 w-12 shrink-0 rounded-lg bg-primary-50 object-contain p-1"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = "inline";
                      }}
                    />
                  ) : null}
                  <span
                    className="text-3xl"
                    aria-hidden="true"
                    style={item.pictogramUrl ? { display: "none" } : undefined}
                  >
                    {item.imageEmoji}
                  </span>
                  <div className="flex-1">
                    {isEditingSentence ? (
                      <div className="flex flex-col gap-2">
                        <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                          Zin
                          <input
                            type="text"
                            value={sentenceDraft.translationNl}
                            onChange={(e) => setSentenceDraft((prev) => ({ ...prev, translationNl: e.target.value }))}
                            className="rounded-lg border-2 border-border-subtle px-3 py-1.5 text-sm
                              focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                          Context ("Als je... zeg je:")
                          <input
                            type="text"
                            value={sentenceDraft.contextNl}
                            onChange={(e) => setSentenceDraft((prev) => ({ ...prev, contextNl: e.target.value }))}
                            className="rounded-lg border-2 border-border-subtle px-3 py-1.5 text-sm
                              focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                          Emoji
                          <input
                            type="text"
                            value={sentenceDraft.emoji}
                            onChange={(e) => setSentenceDraft((prev) => ({ ...prev, emoji: e.target.value }))}
                            className="w-16 rounded-lg border-2 border-border-subtle px-3 py-1.5 text-sm
                              focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                          />
                        </label>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSaveSentence(item.id)}
                            disabled={contentSaving}
                          >
                            Opslaan
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingSentenceId(null)}>
                            Annuleren
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSentence(item.id)}
                            disabled={contentSaving}
                            className="text-clay-500"
                          >
                            Verwijderen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink">{item.translationNl}</p>
                          {mode === "oefenen" && (
                            <button
                              type="button"
                              onClick={() => {
                                const sentence = practiceContent.sentences.find((s) => s.id === item.id);
                                setSentenceDraft({
                                  translationNl: item.translationNl,
                                  contextNl: sentence?.contextNl ?? "",
                                  emoji: item.imageEmoji,
                                });
                                setEditingSentenceId(item.id);
                              }}
                              className="text-xs font-medium text-clay-500 underline underline-offset-2
                                focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                            >
                              Label bewerken
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-ink-muted">{item.latinSpelling}</p>
                      </>
                    )}
                    <div className="mt-1">
                      <SpellingInput
                        itemId={item.id}
                        value={spellings[item.id] ?? ""}
                        onSaved={(value) =>
                          setSpellings((prev) => {
                            const next = { ...prev };
                            if (value) next[item.id] = value;
                            else delete next[item.id];
                            return next;
                          })
                        }
                      />
                    </div>
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

          {mode === "oefenen" && activePracticeCategory && (
            <Card className="flex flex-col gap-3">
              {addingSentence ? (
                <div className="flex flex-col gap-2">
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                    Zin
                    <input
                      type="text"
                      value={newSentenceDraft.translationNl}
                      onChange={(e) => setNewSentenceDraft((prev) => ({ ...prev, translationNl: e.target.value }))}
                      placeholder="Bijvoorbeeld: Ik ben blij."
                      className="rounded-lg border-2 border-border-subtle px-3 py-1.5 text-sm
                        focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                    Context ("Als je... zeg je:")
                    <input
                      type="text"
                      value={newSentenceDraft.contextNl}
                      onChange={(e) => setNewSentenceDraft((prev) => ({ ...prev, contextNl: e.target.value }))}
                      placeholder="Als je blij bent, zeg je:"
                      className="rounded-lg border-2 border-border-subtle px-3 py-1.5 text-sm
                        focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                    Emoji
                    <input
                      type="text"
                      value={newSentenceDraft.emoji}
                      onChange={(e) => setNewSentenceDraft((prev) => ({ ...prev, emoji: e.target.value }))}
                      placeholder="😊"
                      className="w-16 rounded-lg border-2 border-border-subtle px-3 py-1.5 text-sm
                        focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                    />
                  </label>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={handleAddSentence} disabled={contentSaving}>
                      Toevoegen
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setAddingSentence(false)}>
                      Annuleren
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setAddingSentence(true)} className="w-fit">
                  + Nieuwe zin in {activePracticeCategory.titleNl}
                </Button>
              )}
            </Card>
          )}
        </div>
      )}
    </main>
  );
}
