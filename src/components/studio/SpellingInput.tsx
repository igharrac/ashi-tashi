"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface SpellingInputProps {
  itemId: string;
  value: string;
  onSaved: (value: string) => void;
}

/**
 * Invoerveld voor de fonetische/Latijnse Tashelhit-spelling van een woord
 * (los van de audio-opname zelf — zie src/lib/wordSpellings.ts). Zodra dit
 * is ingevuld, toont de kind-app dit i.p.v. de Nederlandse vertaling.
 */
export function SpellingInput({ itemId, value, onSaved }: SpellingInputProps) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const isDirty = draft.trim() !== value.trim();

  async function handleSave() {
    setSaving(true);
    const response = await fetch("/api/studio/spellings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, phoneticSpelling: draft }),
    });
    setSaving(false);
    if (response.ok) onSaved(draft.trim());
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Fonetische spelling (bv. aydi)"
        className="w-44 rounded-lg border-2 border-border-subtle px-2 py-1 text-sm
          focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
      />
      {isDirty && (
        <Button variant="secondary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "…" : "Opslaan"}
        </Button>
      )}
    </div>
  );
}
