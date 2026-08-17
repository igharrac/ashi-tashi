"use client";

import { CATEGORIES } from "@/lib/contentCatalog";
import { StepTile, type StepStatus } from "./StepTile";

interface StepGridProps {
  childId: string;
  /** Enige op dit moment echt speelbare les (zie demoData.ts) — een vervolgstap is om per categorie een les te bouwen. */
  dierenLessonId: string;
  dierenCompleted: boolean;
}

/**
 * Reispad als responsive grid (hfst. 10) — verving het kronkelende S-pad op
 * verzoek: elke categorie is nu direct een tegel (geen aparte "level"-laag
 * meer voor het kind, die blijft alleen bestaan als browse-hulp in de
 * opnamestudio). Begint linksboven, vult zich rij voor rij; groeit vanzelf
 * mee als er later meer categorieën/stappen bijkomen.
 */
export function StepGrid({ childId, dierenLessonId, dierenCompleted }: StepGridProps) {
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-3 gap-x-3 gap-y-6 py-6 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5">
      {CATEGORIES.map((category) => {
        const isDieren = category.slug === "dieren";
        const status: StepStatus = !category.isImplemented ? "locked" : isDieren && dierenCompleted ? "completed" : "active";

        return (
          <StepTile
            key={category.slug}
            category={category}
            status={status}
            href={isDieren ? `/kind/${childId}/les/${dierenLessonId}` : undefined}
          />
        );
      })}
    </div>
  );
}
