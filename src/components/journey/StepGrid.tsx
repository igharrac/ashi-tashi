"use client";

import { useEffect, useState } from "react";
import type { CategoryDefinition } from "@/lib/contentCatalog";
import {
  DAILY_SENTENCES_LESSON_ID,
  getCategoryUnlockStatuses,
  getPracticeCategoryStatuses,
  MIN_RECORDED_SENTENCES_FOR_LESSON,
} from "@/lib/lessonCatalog";
import { getDailySentenceContent, type DailySentenceContent } from "@/lib/dailySentenceContentClient";
import { getPracticeContent, type PracticeContent } from "@/lib/practiceContentClient";
import { getWordsContent, mergeCategories } from "@/lib/wordsContentClient";
import { getItemIdsWithRecordings } from "@/lib/referenceAudio";
import type { ChildProfileData } from "@/types/domain";
import { StepTile } from "./StepTile";

interface StepGridProps {
  childId: string;
  child: ChildProfileData;
}

/**
 * Reispad als responsive grid (hfst. 10). Elke categorie met genoeg
 * ingesproken woorden (MIN_RECORDED_WORDS_FOR_LESSON, lessonCatalog.ts)
 * krijgt een eigen les — niet meer alleen "dieren" (zie ARCHITECTUUR-
 * OPNAMESTUDIO.md en lessonCatalog.ts). Op verzoek streng opeenvolgend:
 * een categorie ontgrendelt pas als de vorige categorie in de vaste
 * volgorde (CATEGORIES) écht is afgerond — geen los-van-elkaar-open grid.
 */
type FilterKey = "alles" | "zinnen" | "oefenen" | "woorden";

const FILTER_META: Record<FilterKey, { label: string; emoji: string }> = {
  alles: { label: "Alles", emoji: "🌈" },
  zinnen: { label: "Zinnen", emoji: "💬" },
  oefenen: { label: "Oefenen", emoji: "🗣️" },
  woorden: { label: "Woorden", emoji: "🔤" },
};

export function StepGrid({ childId, child }: StepGridProps) {
  const [recordedIds, setRecordedIds] = useState<Set<string> | null>(null);
  const [practiceContent, setPracticeContent] = useState<PracticeContent | null>(null);
  const [dailySentenceContent, setDailySentenceContent] = useState<DailySentenceContent | null>(null);
  const [categories, setCategories] = useState<CategoryDefinition[] | null>(null);
  // Op verzoek: "alles staat door elkaar" — kunnen filteren op Zinnen/
  // Oefenen/Woorden i.p.v. altijd alle drie groepen tegelijk zien.
  const [filter, setFilter] = useState<FilterKey>("alles");

  useEffect(() => {
    let cancelled = false;
    getItemIdsWithRecordings().then((ids) => {
      if (!cancelled) setRecordedIds(ids);
    });
    getPracticeContent().then((content) => {
      if (!cancelled) setPracticeContent(content);
    });
    getDailySentenceContent().then((content) => {
      if (!cancelled) setDailySentenceContent(content);
    });
    getWordsContent().then((content) => {
      if (!cancelled) setCategories(mergeCategories(content));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (recordedIds === null || practiceContent === null || dailySentenceContent === null || categories === null) {
    return <p className="py-6 text-center text-ink-muted">Even laden…</p>;
  }

  // Streng-opeenvolgende ontgrendeling, gedeeld met Ontdekken/matchspel (zie
  // getCategoryUnlockStatuses in lessonCatalog.ts) zodat die schermen precies
  // dezelfde "welke categorie mag dit kind al zien"-regels gebruiken i.p.v.
  // een eigen kopie.
  const unlockStatuses = getCategoryUnlockStatuses(child.completedLessonIds, recordedIds, categories);

  // "Dagelijkse zinnen" staat bewust los van de keten hierboven (op verzoek:
  // niet gekoppeld aan een woordcategorie, dus ook niet aan de streng-
  // opeenvolgende volgorde). Alleen zichtbaar zodra er genoeg zinnen echt
  // zijn ingesproken — anders leidt de tegel naar een lege les.
  const recordedSentenceCount = dailySentenceContent.sentences.filter((sentence) =>
    recordedIds.has(sentence.id),
  ).length;
  const showDailySentencesTile = recordedSentenceCount >= MIN_RECORDED_SENTENCES_FOR_LESSON;
  const dailySentencesCompleted = child.completedLessonIds.includes(DAILY_SENTENCES_LESSON_ID);

  // "Oefenen"-categorieën (practiceSentences.ts) — alleen zichtbaar voor
  // kinderen op niveau Oefenen of Spreken (child.level), los van de
  // woordcategorie-keten, net als Dagelijkse zinnen hierboven. Ontdekken-
  // niveau ziet deze tegels helemaal niet, ook al zou er content zijn.
  const showPracticeTiles = child.level !== "A_ONTDEKKEN";
  const practiceStatuses = showPracticeTiles
    ? getPracticeCategoryStatuses(child.completedLessonIds, recordedIds, practiceContent)
    : [];

  // Filterbalk alleen tonen als er ook echt iets te filteren valt (meer dan
  // alleen "Woorden") — anders is de balk overbodige ruis.
  const availableFilters: FilterKey[] = ["alles"];
  if (showDailySentencesTile) availableFilters.push("zinnen");
  if (showPracticeTiles && practiceStatuses.some((s) => s.status !== "locked")) availableFilters.push("oefenen");
  availableFilters.push("woorden");
  const showFilterBar = availableFilters.length > 2;
  const activeFilter = availableFilters.includes(filter) ? filter : "alles";

  const showZinnen = activeFilter === "alles" || activeFilter === "zinnen";
  const showOefenen = activeFilter === "alles" || activeFilter === "oefenen";
  const showWoorden = activeFilter === "alles" || activeFilter === "woorden";

  return (
    <div>
      {showFilterBar && (
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2 px-2 pt-4" role="group" aria-label="Filter op categorie">
          {availableFilters.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={activeFilter === key}
              className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-semibold
                focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                ${
                  activeFilter === key
                    ? "border-forest-500 bg-forest-500 text-white"
                    : "border-border-subtle bg-white text-ink-muted hover:border-forest-300"
                }`}
            >
              <span aria-hidden="true">{FILTER_META[key].emoji}</span>
              {FILTER_META[key].label}
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-x-3 gap-y-6 py-6 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5">
        {showZinnen && showDailySentencesTile && (
          <StepTile
            category={{ emoji: "💬", titleNl: "Dagelijkse zinnen", teaser: "Zinnen die je elke dag gebruikt — altijd beschikbaar" }}
            status={dailySentencesCompleted ? "completed" : "active"}
            href={`/kind/${childId}/les/${DAILY_SENTENCES_LESSON_ID}`}
          />
        )}
        {showOefenen &&
          practiceStatuses.map(({ categorySlug, status, lessonId }) => {
            const category = practiceContent.categories.find((c) => c.slug === categorySlug);
            if (!category || status === "locked") return null;
            return (
              <StepTile
                key={categorySlug}
                category={{ emoji: category.emoji, titleNl: category.titleNl, teaser: `Oefenen: ${category.titleNl.toLowerCase()}` }}
                status={status}
                href={`/kind/${childId}/les/${lessonId}`}
              />
            );
          })}
        {showWoorden &&
          unlockStatuses.map(({ categorySlug, status, lessonId }) => {
            const category = categories.find((c) => c.slug === categorySlug);
            if (!category) return null;
            return (
              <StepTile
                key={categorySlug}
                category={category}
                status={status}
                href={status !== "locked" ? `/kind/${childId}/les/${lessonId}` : undefined}
              />
            );
          })}
      </div>
    </div>
  );
}
