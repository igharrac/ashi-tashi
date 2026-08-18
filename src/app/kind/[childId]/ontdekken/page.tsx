"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { WordGrid } from "@/components/discover/WordGrid";
import { WordDetailModal } from "@/components/discover/WordDetailModal";
import { Button } from "@/components/ui/Button";
import { getCatalogItems, type CatalogItem } from "@/lib/contentCatalog";
import { getItemIdsWithRecordings } from "@/lib/referenceAudio";
import type { VocabularyItemView } from "@/types/domain";

// Alleen "dieren" heeft nu echt speelbare inhoud (zie ARCHITECTUUR-OPNAMESTUDIO.md
// en demoData.ts) — dezelfde beperking als de gestructureerde lessen.
const DISCOVER_CATEGORY_SLUG = "dieren";

function toVocabularyItemView(item: CatalogItem): VocabularyItemView {
  return {
    id: item.id,
    translationNl: item.translationNl,
    latinSpelling: item.latinSpelling,
    reviewStatus: "TE_REVIEWEN",
    imageAlt: `Illustratie van een ${item.translationNl}`,
    imageEmoji: item.emoji,
    itemKind: item.itemKind,
  };
}

/**
 * "Ontdekken" (hfst. 10, sidebar-navigatie): vrij browsen door alle woorden
 * van een categorie in een grid, los van de gestructureerde lessen — voor
 * kinderen die al even willen oefenen of gewoon willen rondkijken.
 */
export default function DiscoverPage() {
  const params = useParams<{ childId: string }>();
  const { getChild, ready } = useAppStore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [recordedIds, setRecordedIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getItemIdsWithRecordings().then((ids) => {
      if (!cancelled) setRecordedIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Alleen woorden met een écht ingesproken opname worden getoond — anders
  // zou het kind bij een tik gewoon Nederlandse TTS te horen krijgen
  // (zelfde regel als het matchspel, zie getItemIdsWithRecordings).
  const items = useMemo(() => {
    if (!recordedIds) return [];
    return getCatalogItems()
      .filter((item) => item.categorySlug === DISCOVER_CATEGORY_SLUG && recordedIds.has(item.id))
      .map(toVocabularyItemView);
  }, [recordedIds]);

  if (!ready) return <p className="pt-12 text-center text-ink-muted">Even laden…</p>;
  const child = getChild(params.childId);
  if (!child) return notFound();

  return (
    <AppShell child={child}>
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-2xl font-bold text-forest-500">Ontdekken</h1>
        <p className="mt-1 text-ink-muted">Tik op een plaatje om het woord te horen en zelf na te zeggen.</p>
        <Link href={`/kind/${child.id}/ontdekken/spel`} className="mt-4 inline-block">
          <Button variant="secondary" className="flex items-center gap-2">
            <span aria-hidden="true">🎮</span> Speel: Match het geluid
          </Button>
        </Link>
      </div>

      <div className="mx-auto mt-6 max-w-4xl">
        {recordedIds === null ? (
          <p className="text-center text-ink-muted">Even laden…</p>
        ) : (
          <WordGrid items={items} onSelect={setSelectedIndex} />
        )}
      </div>

      {selectedIndex !== null && (
        <WordDetailModal
          items={items}
          currentIndex={selectedIndex}
          childId={child.id}
          microphoneOptIn={child.microphoneOptIn}
          onNavigate={setSelectedIndex}
          onClose={() => setSelectedIndex(null)}
          preferredPersona={child.preferredVoicePersona}
        />
      )}
    </AppShell>
  );
}
