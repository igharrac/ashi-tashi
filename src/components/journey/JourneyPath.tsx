"use client";

import { JOURNEY_ISLANDS } from "@/lib/demoData";
import { IslandNode } from "./IslandNode";

interface JourneyPathProps {
  childId: string;
  dierenLessonId: string;
  dierenCompleted: boolean;
}

/**
 * Reispad-visualisatie (hfst. 10, geïnspireerd op het Figma/Stitch-ontwerp
 * "Jouw Reis"): een kronkelend pad met eilanden per thema. Vereenvoudigd
 * als verticaal zigzag-pad met een gestreepte verbindingslijn i.p.v. een
 * exacte bezier-curve, om de bouwtijd behapbaar te houden — visueel dezelfde
 * gamification-taal (start, voltooid, vergrendeld, eindbestemming).
 */
export function JourneyPath({ childId, dierenLessonId, dierenCompleted }: JourneyPathProps) {
  return (
    <div className="relative mx-auto flex max-w-md flex-col gap-16 py-8">
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 top-8 w-0 -translate-x-1/2 border-l-4 border-dashed border-mint-200"
      />
      {JOURNEY_ISLANDS.map((island, index) => {
        const align = index % 2 === 0 ? "left" : "right";

        if (island.slug === "dieren") {
          return (
            <IslandNode
              key={island.slug}
              island={island}
              align={align}
              status={dierenCompleted ? "completed" : "start"}
              href={`/kind/${childId}/les/${dierenLessonId}`}
            />
          );
        }

        return (
          <IslandNode
            key={island.slug}
            island={island}
            align={align}
            status={island.isFinalDestination ? "final" : "locked"}
          />
        );
      })}
    </div>
  );
}
