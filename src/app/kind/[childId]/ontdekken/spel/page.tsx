"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { MatchGame } from "@/components/discover/MatchGame";
import { CATEGORIES, getCatalogItems, type CatalogItem } from "@/lib/contentCatalog";
import { getUnlockedCategorySlugs } from "@/lib/lessonCatalog";
import { getItemIdsWithRecordings } from "@/lib/referenceAudio";
import { pickRound } from "@/domain/matchGame";
import type { VocabularyItemView } from "@/types/domain";

const ROUND_SIZE = 6;

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
 * "Match het geluid" — matchspel losstaand van de gestructureerde lessen
 * (hfst. 10), bereikbaar vanaf Ontdekken. Alleen woorden met een écht
 * ingesproken opname doen mee (zie getItemIdsWithRecordings), anders zou
 * een deel van de "geluiden" gewoon Nederlandse TTS zijn.
 */
export default function MatchGamePage() {
  const params = useParams<{ childId: string }>();
  const searchParams = useSearchParams();
  const { getChild, ready } = useAppStore();
  const [recordedIds, setRecordedIds] = useState<Set<string> | null>(null);
  const [roundKey, setRoundKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getItemIdsWithRecordings().then((ids) => {
      if (!cancelled) setRecordedIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const child = getChild(params.childId);

  // Alleen categorieën die het kind ook op het reispad al mag spelen (zelfde
  // regels als StepGrid.tsx/Ontdekken, zie getUnlockedCategorySlugs) —
  // voorkomt dat iemand via de URL een nog-op-slot categorie kan spelen.
  const unlockedCategorySlugs = useMemo(() => {
    if (!recordedIds || !child) return [];
    return getUnlockedCategorySlugs(child.completedLessonIds, recordedIds);
  }, [recordedIds, child]);

  const requestedCategorySlug = searchParams.get("categorie");
  const activeCategorySlug =
    requestedCategorySlug && unlockedCategorySlugs.includes(requestedCategorySlug)
      ? requestedCategorySlug
      : (unlockedCategorySlugs[0] ?? null);
  const activeCategory = CATEGORIES.find((c) => c.slug === activeCategorySlug);

  const pool = useMemo(() => {
    if (!recordedIds || !activeCategorySlug) return [];
    return getCatalogItems()
      .filter((item) => item.categorySlug === activeCategorySlug && recordedIds.has(item.id))
      .map(toVocabularyItemView);
  }, [recordedIds, activeCategorySlug]);

  // roundKey in de afhankelijkheden: bij "Nog een rondje" verandert de key
  // en wordt hier een nieuwe, andere selectie + volgorde bepaald.
  const roundItems = useMemo(() => pickRound(pool, ROUND_SIZE), [pool, roundKey]);

  if (!ready) return <p className="pt-12 text-center text-ink-muted">Even laden…</p>;
  if (!child) return notFound();

  return (
    <AppShell child={child}>
      <div className="mx-auto max-w-2xl text-center">
        <Link
          href={activeCategorySlug ? `/kind/${child.id}/ontdekken?categorie=${activeCategorySlug}` : `/kind/${child.id}/ontdekken`}
          className="text-sm font-semibold text-clay-500 hover:underline"
        >
          ← Terug naar Ontdekken
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-forest-500">
          Match het geluid{activeCategory ? ` · ${activeCategory.titleNl}` : ""}
        </h1>
        <p className="mt-1 text-ink-muted">Tik een plaatje en een geluidje aan die bij elkaar horen.</p>
      </div>

      <div className="mx-auto mt-6 max-w-2xl">
        {recordedIds === null ? (
          <p className="text-center text-ink-muted">Even laden…</p>
        ) : roundItems.length < 2 ? (
          <p className="text-center text-ink-muted">
            Er zijn nog niet genoeg ingesproken woorden om dit spel te spelen.
          </p>
        ) : (
          <MatchGame
            key={roundKey}
            items={roundItems}
            onPlayAgain={() => setRoundKey((k) => k + 1)}
            preferredPersona={child.preferredVoicePersona}
          />
        )}
      </div>
    </AppShell>
  );
}
