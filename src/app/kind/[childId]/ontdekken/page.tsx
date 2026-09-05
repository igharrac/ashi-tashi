"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { WordGrid } from "@/components/discover/WordGrid";
import { WordDetailModal } from "@/components/discover/WordDetailModal";
import { Button } from "@/components/ui/Button";
import { buildCatalogItems, type CatalogItem, type CategoryDefinition } from "@/lib/contentCatalog";
import { getUnlockedCategorySlugs } from "@/lib/lessonCatalog";
import { getItemIdsWithRecordings } from "@/lib/referenceAudio";
import { getWordsContent, mergeCategories } from "@/lib/wordsContentClient";
import type { VocabularyItemView } from "@/types/domain";

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
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryDefinition[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getItemIdsWithRecordings().then((ids) => {
      if (!cancelled) setRecordedIds(ids);
    });
    getWordsContent().then((content) => {
      if (!cancelled) setCategories(mergeCategories(content));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const child = getChild(params.childId);

  // Ontdekken toont elke categorie die het kind ook op het reispad al mag
  // spelen (zelfde regels als StepGrid.tsx, zie getUnlockedCategorySlugs) —
  // niet meer alleen "dieren". Nog op slot betekent hier ook nog niet
  // beschikbaar om vrij te browsen.
  const unlockedCategorySlugs = useMemo(() => {
    if (!recordedIds || !child || !categories) return [];
    return getUnlockedCategorySlugs(child.completedLessonIds, recordedIds, categories);
  }, [recordedIds, child, categories]);

  useEffect(() => {
    if (activeCategorySlug && unlockedCategorySlugs.includes(activeCategorySlug)) return;
    setActiveCategorySlug(unlockedCategorySlugs[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedCategorySlugs]);

  // Alleen woorden met een écht ingesproken opname worden getoond — anders
  // zou het kind bij een tik gewoon Nederlandse TTS te horen krijgen
  // (zelfde regel als het matchspel, zie getItemIdsWithRecordings).
  const items = useMemo(() => {
    if (!recordedIds || !activeCategorySlug || !categories) return [];
    return buildCatalogItems(categories)
      .filter((item) => item.categorySlug === activeCategorySlug && recordedIds.has(item.id))
      .map(toVocabularyItemView);
  }, [recordedIds, activeCategorySlug, categories]);

  if (!ready) return <p className="pt-12 text-center text-ink-muted">Even laden…</p>;
  if (!child) return notFound();

  const loading = recordedIds === null || categories === null;

  return (
    <AppShell child={child}>
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-2xl font-bold text-forest-500">Ontdekken</h1>
        <p className="mt-1 text-ink-muted">Tik op een plaatje om het woord te horen en zelf na te zeggen.</p>
        {activeCategorySlug && (
          <Link href={`/kind/${child.id}/ontdekken/spel?categorie=${activeCategorySlug}`} className="mt-4 inline-block">
            <Button variant="secondary" className="flex items-center gap-2">
              <span aria-hidden="true">🎮</span> Speel: Match het geluid
            </Button>
          </Link>
        )}
      </div>

      {!loading && unlockedCategorySlugs.length > 1 && (
        <div className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-2">
          {unlockedCategorySlugs.map((slug) => {
            const category = categories?.find((c) => c.slug === slug);
            if (!category) return null;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => setActiveCategorySlug(slug)}
                className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors
                  focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                  ${
                    slug === activeCategorySlug
                      ? "border-clay-500 bg-clay-500 text-white"
                      : "border-border-subtle bg-white text-ink hover:border-clay-400"
                  }`}
              >
                <span aria-hidden="true">{category.emoji}</span> {category.titleNl}
              </button>
            );
          })}
        </div>
      )}

      <div className="mx-auto mt-6 max-w-4xl">
        {loading ? (
          <p className="text-center text-ink-muted">Even laden…</p>
        ) : !activeCategorySlug ? (
          <p className="text-center text-ink-muted">Er is nog geen categorie met genoeg ingesproken woorden.</p>
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
          lenientPronunciationMode={child.lenientPronunciationMode}
          autoplayAudio={child.autoplayAudio}
        />
      )}
    </AppShell>
  );
}
