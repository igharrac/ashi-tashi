"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, getCatalogItems } from "@/lib/contentCatalog";
import {
  DAILY_SENTENCES_LESSON_ID,
  lessonIdForCategory,
  MIN_RECORDED_SENTENCES_FOR_LESSON,
  MIN_RECORDED_WORDS_FOR_LESSON,
} from "@/lib/lessonCatalog";
import { getDailySentenceItems } from "@/lib/dailySentences";
import { getItemIdsWithRecordings } from "@/lib/referenceAudio";
import type { ChildProfileData } from "@/types/domain";
import { StepTile, type StepStatus } from "./StepTile";

interface StepGridProps {
  childId: string;
  child: ChildProfileData;
  /** Dieren behoudt zijn eigen, handmatig samengestelde les-id (met zinnetjes-afsluiting) i.p.v. het generieke "lesson-<categorySlug>"-schema — zie lessonCatalog.ts. */
  dierenLessonId: string;
}

/**
 * Reispad als responsive grid (hfst. 10). Elke categorie met genoeg
 * ingesproken woorden (MIN_RECORDED_WORDS_FOR_LESSON, lessonCatalog.ts)
 * krijgt een eigen les — niet meer alleen "dieren" (zie ARCHITECTUUR-
 * OPNAMESTUDIO.md en lessonCatalog.ts). Op verzoek streng opeenvolgend:
 * een categorie ontgrendelt pas als de vorige categorie in de vaste
 * volgorde (CATEGORIES) écht is afgerond — geen los-van-elkaar-open grid.
 */
export function StepGrid({ childId, child, dierenLessonId }: StepGridProps) {
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

  if (recordedIds === null) {
    return <p className="py-6 text-center text-ink-muted">Even laden…</p>;
  }

  // Wordt op de eerste niet-afgeronde SPEELBARE categorie definitief true, en
  // blokkeert dan alle daaropvolgende categorieën — streng op volgorde, zoals
  // gekozen. Categorieën zonder genoeg opnames (hasEnoughContent false) tellen
  // hier bewust NIET in mee: zo'n categorie kan nooit "afgerond" worden (er is
  // geen les om te spelen), dus zou de keten anders voorgoed blokkeren voor
  // alles wat erna komt. Ze blijven zelf altijd op slot, maar breken de keten
  // niet voor categorieën die wél al content hebben (bv. dieren/lichaam/
  // kleding, die in CATEGORIES na een aantal nog-lege categorieën staan).
  let chainBroken = false;

  // "Dagelijkse zinnen" staat bewust los van de keten hierboven (op verzoek:
  // niet gekoppeld aan een woordcategorie, dus ook niet aan de streng-
  // opeenvolgende volgorde). Alleen zichtbaar zodra er genoeg zinnen echt
  // zijn ingesproken — anders leidt de tegel naar een lege les.
  const recordedSentenceCount = getDailySentenceItems().filter((sentence) =>
    recordedIds.has(sentence.id),
  ).length;
  const showDailySentencesTile = recordedSentenceCount >= MIN_RECORDED_SENTENCES_FOR_LESSON;
  const dailySentencesCompleted = child.completedLessonIds.includes(DAILY_SENTENCES_LESSON_ID);

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-3 gap-x-3 gap-y-6 py-6 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5">
      {showDailySentencesTile && (
        <StepTile
          category={{ emoji: "💬", titleNl: "Dagelijkse zinnen", teaser: "Zinnen die je elke dag gebruikt — altijd beschikbaar" }}
          status={dailySentencesCompleted ? "completed" : "active"}
          href={`/kind/${childId}/les/${DAILY_SENTENCES_LESSON_ID}`}
        />
      )}
      {CATEGORIES.map((category) => {
        const isDieren = category.slug === "dieren";
        const lessonId = isDieren ? dierenLessonId : lessonIdForCategory(category.slug);
        const isCompleted = child.completedLessonIds.includes(lessonId);

        const recordedCount = getCatalogItems().filter(
          (item) => item.categorySlug === category.slug && recordedIds.has(item.id),
        ).length;
        const hasEnoughContent = recordedCount >= MIN_RECORDED_WORDS_FOR_LESSON;

        let status: StepStatus;
        if (!hasEnoughContent) {
          // Nog geen les om te spelen — altijd op slot, telt niet mee in de keten.
          status = "locked";
        } else {
          const canPlay = !chainBroken;
          status = isCompleted ? "completed" : canPlay ? "active" : "locked";
          if (!isCompleted) chainBroken = true; // volgende speelbare categorie blokkeren tenzij deze al klaar was
        }

        return (
          <StepTile
            key={category.slug}
            category={category}
            status={status}
            href={status !== "locked" ? `/kind/${childId}/les/${lessonId}` : undefined}
          />
        );
      })}
    </div>
  );
}
