"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RecorderControl, type RecordingEntryData } from "@/components/studio/RecorderControl";
import { SpellingInput } from "@/components/studio/SpellingInput";
import { PERSONA_LABELS, RECORDING_PERSONAS, recordingKey, type RecordingPersona } from "@/lib/recordableItems";
import type { ConversationDefinition } from "@/lib/conversations";
import type { ConversationStepInput } from "@/lib/conversationsStore";

type ManifestState = Record<string, RecordingEntryData>;

/** Lokale bewerkbare vorm van een regel — een nieuwe regel heeft nog geen itemId (die krijgt de server pas bij Opslaan). */
interface DraftLine {
  itemId?: string;
  translationNl: string;
}
type DraftStep = { type: "app"; line: DraftLine } | { type: "choice"; options: DraftLine[] };

function toDraftSteps(conversation: ConversationDefinition): DraftStep[] {
  return conversation.steps.map((step) =>
    step.type === "app"
      ? { type: "app", line: { itemId: step.line.itemId, translationNl: step.line.translationNl } }
      : { type: "choice", options: step.options.map((o) => ({ itemId: o.itemId, translationNl: o.translationNl })) },
  );
}

/**
 * Studio-editor voor "Gesprekken" (zie conversations.ts) — bewust een eigen
 * pagina i.p.v. een vierde tab in opnames/page.tsx: een gesprek heeft een
 * geordende stappenlijst (met keuzemomenten van 2-3 opties) die niet in de
 * platte item-lijst van de bestaande drie contenttypes past.
 *
 * Werkwijze: de hele stappenlijst van een gesprek wordt lokaal bewerkt
 * (tekst toevoegen/aanpassen/herordenen/verwijderen) en in één keer
 * opgeslagen via "Opslaan" — dat is simpeler en minder foutgevoelig dan een
 * los endpoint per regel. Opnemen kan pas ZODRA een regel een itemId heeft
 * (dus na de eerste keer opslaan), want de opnamekoppeling werkt op itemId.
 */
export default function StudioGesprekkenPage() {
  const [conversations, setConversations] = useState<ConversationDefinition[] | null>(null);
  const [manifest, setManifest] = useState<ManifestState>({});
  const [spellings, setSpellings] = useState<Record<string, string>>({});
  const [activePersona, setActivePersona] = useState<RecordingPersona>("man");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [draftSteps, setDraftSteps] = useState<DraftStep[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [newTeaser, setNewTeaser] = useState("");
  const [addingConversation, setAddingConversation] = useState(false);

  const [metaDraft, setMetaDraft] = useState<{ titleNl: string; emoji: string; teaser: string } | null>(null);

  async function reload() {
    const [convData, recordingsData, spellingsData] = await Promise.all([
      fetch("/api/studio/content/conversations").then((res) => res.json()) as Promise<{ conversations: ConversationDefinition[] }>,
      fetch("/api/studio/recordings").then((res) => res.json()) as Promise<{ manifest: ManifestState }>,
      fetch("/api/studio/spellings").then((res) => res.json()) as Promise<{ spellings: Record<string, string> }>,
    ]);
    setConversations(convData.conversations);
    setManifest(recordingsData.manifest);
    setSpellings(spellingsData.spellings);
  }

  useEffect(() => {
    reload();
  }, []);

  const activeConversation = conversations?.find((c) => c.id === activeConversationId) ?? null;

  function selectConversation(conversation: ConversationDefinition) {
    setActiveConversationId(conversation.id);
    setDraftSteps(toDraftSteps(conversation));
    setMetaDraft({ titleNl: conversation.titleNl, emoji: conversation.emoji, teaser: conversation.teaser });
    setDirty(false);
    setSaveError(null);
  }

  async function handleAddConversation() {
    if (!newTitle.trim() || !newEmoji.trim()) return;
    setAddingConversation(true);
    const response = await fetch("/api/studio/content/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "conversation", titleNl: newTitle, emoji: newEmoji, teaser: newTeaser }),
    });
    setAddingConversation(false);
    if (!response.ok) return;
    const data = (await response.json()) as { conversation: ConversationDefinition };
    setNewTitle("");
    setNewEmoji("");
    setNewTeaser("");
    await reload();
    selectConversation(data.conversation);
  }

  async function handleSaveMeta() {
    if (!activeConversation || !metaDraft) return;
    const response = await fetch("/api/studio/content/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "meta", id: activeConversation.id, ...metaDraft }),
    });
    if (!response.ok) return;
    await reload();
  }

  async function handleDeleteConversation(id: string) {
    if (!window.confirm("Dit gesprek verwijderen? Opnames blijven bestaan maar zijn niet meer gekoppeld.")) return;
    const response = await fetch("/api/studio/content/conversations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) return;
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setDraftSteps([]);
    }
    await reload();
  }

  async function handleSaveSteps() {
    if (!activeConversation) return;
    setSaving(true);
    setSaveError(null);
    const body: ConversationStepInput[] = draftSteps.map((step) =>
      step.type === "app"
        ? { type: "app", line: { itemId: step.line.itemId, translationNl: step.line.translationNl } }
        : { type: "choice", options: step.options.map((o) => ({ itemId: o.itemId, translationNl: o.translationNl })) },
    );
    const response = await fetch("/api/studio/content/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "steps", id: activeConversation.id, steps: body }),
    });
    setSaving(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setSaveError(data.error ?? "Opslaan mislukt.");
      return;
    }
    const data = (await response.json()) as { conversation: ConversationDefinition };
    await reload();
    setDraftSteps(toDraftSteps(data.conversation));
    setDirty(false);
  }

  function updateSteps(updater: (steps: DraftStep[]) => DraftStep[]) {
    setDraftSteps((prev) => updater(prev));
    setDirty(true);
  }

  function moveStep(index: number, direction: -1 | 1) {
    updateSteps((steps) => {
      const next = [...steps];
      const target = index + direction;
      if (target < 0 || target >= next.length) return steps;
      const [removed] = next.splice(index, 1);
      next.splice(target, 0, removed!);
      return next;
    });
  }

  function removeStep(index: number) {
    updateSteps((steps) => steps.filter((_, i) => i !== index));
  }

  function addAppStep() {
    updateSteps((steps) => [...steps, { type: "app", line: { translationNl: "" } }]);
  }

  function addChoiceStep() {
    updateSteps((steps) => [
      ...steps,
      { type: "choice", options: [{ translationNl: "" }, { translationNl: "" }] },
    ]);
  }

  function updateAppLineText(index: number, text: string) {
    updateSteps((steps) =>
      steps.map((step, i) => (i === index && step.type === "app" ? { ...step, line: { ...step.line, translationNl: text } } : step)),
    );
  }

  function updateOptionText(stepIndex: number, optionIndex: number, text: string) {
    updateSteps((steps) =>
      steps.map((step, i) =>
        i === stepIndex && step.type === "choice"
          ? { ...step, options: step.options.map((o, j) => (j === optionIndex ? { ...o, translationNl: text } : o)) }
          : step,
      ),
    );
  }

  function addOption(stepIndex: number) {
    updateSteps((steps) =>
      steps.map((step, i) => (i === stepIndex && step.type === "choice" ? { ...step, options: [...step.options, { translationNl: "" }] } : step)),
    );
  }

  function removeOption(stepIndex: number, optionIndex: number) {
    updateSteps((steps) =>
      steps.map((step, i) =>
        i === stepIndex && step.type === "choice" && step.options.length > 2
          ? { ...step, options: step.options.filter((_, j) => j !== optionIndex) }
          : step,
      ),
    );
  }

  if (conversations === null) {
    return <p className="p-8 text-center text-ink-muted">Even laden…</p>;
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-500">Gesprekken</h1>
          <p className="text-sm text-ink-muted">
            {conversations.length} gesprek{conversations.length === 1 ? "" : "ken"}. Draai dit lokaal (npm run dev).
          </p>
        </div>
        <Link href="/studio/opnames">
          <Button variant="ghost" size="sm">
            Terug naar opnames
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => selectConversation(conversation)}
            className={`rounded-full border-2 px-3.5 py-1.5 text-sm transition-colors
              focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
              ${
                conversation.id === activeConversationId
                  ? "border-primary-500 bg-primary-50 font-medium text-primary-700"
                  : "border-border-subtle text-ink-muted hover:text-ink"
              }`}
          >
            <span aria-hidden="true">{conversation.emoji}</span> {conversation.titleNl}{" "}
            <span className="text-xs text-ink-muted">({conversation.steps.length} stappen)</span>
          </button>
        ))}
      </div>

      <Card className="flex flex-col gap-3">
        <p className="text-sm font-medium text-ink">Nieuw gesprek</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titel (bv. Hoe gaat het?)"
            className="w-56 rounded-lg border-2 border-border-subtle px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
          />
          <input
            type="text"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            placeholder="Emoji"
            className="w-20 rounded-lg border-2 border-border-subtle px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
          />
          <input
            type="text"
            value={newTeaser}
            onChange={(e) => setNewTeaser(e.target.value)}
            placeholder="Korte omschrijving (optioneel)"
            className="w-64 rounded-lg border-2 border-border-subtle px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
          />
          <Button variant="primary" size="sm" onClick={handleAddConversation} disabled={addingConversation}>
            {addingConversation ? "…" : "+ Toevoegen"}
          </Button>
        </div>
      </Card>

      {activeConversation && metaDraft && (
        <>
          <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={metaDraft.titleNl}
                onChange={(e) => setMetaDraft({ ...metaDraft, titleNl: e.target.value })}
                className="w-56 rounded-lg border-2 border-border-subtle px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
              />
              <input
                type="text"
                value={metaDraft.emoji}
                onChange={(e) => setMetaDraft({ ...metaDraft, emoji: e.target.value })}
                className="w-20 rounded-lg border-2 border-border-subtle px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
              />
              <input
                type="text"
                value={metaDraft.teaser}
                onChange={(e) => setMetaDraft({ ...metaDraft, teaser: e.target.value })}
                placeholder="Korte omschrijving"
                className="w-64 rounded-lg border-2 border-border-subtle px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
              />
              <Button variant="secondary" size="sm" onClick={handleSaveMeta}>
                Label opslaan
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteConversation(activeConversation.id)}>
                Gesprek verwijderen
              </Button>
            </div>
          </Card>

          <div className="inline-flex w-fit gap-0.5 rounded-xl2 bg-primary-50 p-1">
            {RECORDING_PERSONAS.map((persona) => (
              <button
                key={persona}
                type="button"
                onClick={() => setActivePersona(persona)}
                className={`rounded-lg px-3.5 py-1.5 text-sm transition-colors
                  focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                  ${persona === activePersona ? "bg-white font-medium text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
              >
                {PERSONA_LABELS[persona]}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {draftSteps.map((step, stepIndex) => (
              <Card key={stepIndex} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${
                      step.type === "app" ? "bg-sky-200 text-forest-700" : "bg-peach-100 text-clay-600"
                    }`}
                  >
                    {step.type === "app" ? "App zegt" : "Keuzemoment"}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => moveStep(stepIndex, -1)} aria-label="Omhoog">
                      ↑
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => moveStep(stepIndex, 1)} aria-label="Omlaag">
                      ↓
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeStep(stepIndex)}>
                      Verwijderen
                    </Button>
                  </div>
                </div>

                {step.type === "app" ? (
                  <ConversationLineEditor
                    key={step.line.itemId ?? `app-${stepIndex}`}
                    line={step.line}
                    persona={activePersona}
                    manifest={manifest}
                    spellings={spellings}
                    onTextChange={(text) => updateAppLineText(stepIndex, text)}
                    onManifestChange={reload}
                    onSpellingSaved={(itemId, value) => setSpellings((prev) => ({ ...prev, [itemId]: value }))}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {step.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-start gap-2 border-l-2 border-border-subtle pl-3">
                        <div className="flex-1">
                          <ConversationLineEditor
                            key={option.itemId ?? `option-${stepIndex}-${optionIndex}`}
                            line={option}
                            persona={activePersona}
                            manifest={manifest}
                            spellings={spellings}
                            onTextChange={(text) => updateOptionText(stepIndex, optionIndex, text)}
                            onManifestChange={reload}
                            onSpellingSaved={(itemId, value) => setSpellings((prev) => ({ ...prev, [itemId]: value }))}
                          />
                        </div>
                        {step.options.length > 2 && (
                          <Button variant="ghost" size="sm" onClick={() => removeOption(stepIndex, optionIndex)}>
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    {step.options.length < 3 && (
                      <Button variant="ghost" size="sm" onClick={() => addOption(stepIndex)} className="w-fit">
                        + Optie toevoegen
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={addAppStep}>
              + App-regel toevoegen
            </Button>
            <Button variant="secondary" size="sm" onClick={addChoiceStep}>
              + Keuzemoment toevoegen
            </Button>
          </div>

          <div className="sticky bottom-4 flex items-center gap-3 rounded-xl2 border-2 border-primary-100 bg-white p-3 shadow-soft">
            <Button variant="primary" onClick={handleSaveSteps} disabled={!dirty || saving}>
              {saving ? "Opslaan…" : "Stappen opslaan"}
            </Button>
            {dirty && !saving && <span className="text-sm text-clay-600">Niet-opgeslagen wijzigingen</span>}
            {saveError && <span className="text-sm font-medium text-clay-600">{saveError}</span>}
          </div>
        </>
      )}
    </main>
  );
}

interface ConversationLineEditorProps {
  line: DraftLine;
  persona: RecordingPersona;
  manifest: ManifestState;
  spellings: Record<string, string>;
  onTextChange: (text: string) => void;
  onManifestChange: () => void;
  onSpellingSaved: (itemId: string, value: string) => void;
}

/** Eén regel (app-zin of keuze-optie): tekstveld + spelling + opnameknop (pas beschikbaar zodra de regel een itemId heeft, dus na de eerste keer opslaan). */
function ConversationLineEditor({ line, persona, manifest, spellings, onTextChange, onManifestChange, onSpellingSaved }: ConversationLineEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={line.translationNl}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Nederlandse tekst"
        className="w-full rounded-lg border-2 border-border-subtle px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
      />
      {line.itemId ? (
        <div className="flex flex-wrap items-center gap-3">
          <SpellingInput
            key={line.itemId}
            itemId={line.itemId}
            value={spellings[line.itemId] ?? ""}
            onSaved={(value) => onSpellingSaved(line.itemId!, value)}
          />
          <RecorderControl
            itemId={line.itemId}
            persona={persona}
            entry={manifest[recordingKey(line.itemId, persona)]}
            onChange={onManifestChange}
          />
        </div>
      ) : (
        <p className="text-xs text-ink-muted">Sla eerst de stappen op om deze regel te kunnen inspreken.</p>
      )}
    </div>
  );
}
