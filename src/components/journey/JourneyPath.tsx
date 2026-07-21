"use client";

import { LEVELS } from "@/lib/contentCatalog";
import { IslandNode } from "./IslandNode";

interface JourneyPathProps {
  childId: string;
  /** Is de (enige, tot nu toe echt speelbare) inhoud van het eerste level afgerond? */
  firstLevelCompleted: boolean;
}

// Alleen het eerste level heeft nu echt speelbare inhoud (de categorie
// "dieren" erin) — zie ARCHITECTUUR-OPNAMESTUDIO.md / contentCatalog.ts.
const UNLOCKED_LEVEL_SLUG = "de-basis";

const ISLAND_COUNT = LEVELS.length;
const ROW_HEIGHT = 176; // px, moet overeenkomen met de gap tussen eilanden hieronder

/**
 * Reispad-visualisatie (hfst. 10, geïnspireerd op het Figma/Stitch-ontwerp
 * "Jouw Reis"): een vloeiend kronkelend S-pad met wolken, en één bolletje per
 * LEVEL (elk level bevat meerdere categorieën, zie contentCatalog.ts) die
 * afwisselend links/rechts van het pad liggen.
 */
export function JourneyPath({ childId, firstLevelCompleted }: JourneyPathProps) {
  const svgHeight = ROW_HEIGHT * ISLAND_COUNT;

  // Genereer een vloeiende S-curve die door het midden van elke rij zigzagt.
  const points = Array.from({ length: ISLAND_COUNT + 1 }, (_, i) => {
    const y = i * ROW_HEIGHT;
    const x = i % 2 === 0 ? 30 : 70; // percentage van de breedte
    return { x, y };
  });
  const pathD = points
    .map((point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      const prev = points[i - 1];
      if (!prev) return "";
      const midY = (prev.y + point.y) / 2;
      return `C ${prev.x} ${midY}, ${point.x} ${midY}, ${point.x} ${point.y}`;
    })
    .join(" ");

  return (
    <div className="relative mx-auto max-w-md py-8" style={{ minHeight: svgHeight }}>
      <svg
        aria-hidden="true"
        viewBox={`0 0 100 ${svgHeight}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* Duolingo-achtige gestippelde lijn: ronde bolletjes i.p.v. streepjes. */}
        <path
          d={pathD}
          fill="none"
          stroke="#b2e2d4"
          strokeWidth={5}
          strokeDasharray="0 11"
          strokeLinecap="round"
        />
      </svg>

      {/* Zwevende wolk-decoraties langs het pad, puur ornamenteel. */}
      <span aria-hidden="true" className="absolute -left-4 top-16 text-3xl opacity-70">
        ☁️
      </span>
      <span aria-hidden="true" className="absolute -right-2 top-[45%] text-2xl opacity-60">
        ☁️
      </span>
      <span aria-hidden="true" className="absolute -left-2 bottom-24 text-3xl opacity-60">
        ☁️
      </span>

      <div className="relative flex flex-col" style={{ gap: `${ROW_HEIGHT - 112}px` }}>
        {LEVELS.map((level, index) => {
          const align = index % 2 === 0 ? "left" : "right";

          if (level.slug === UNLOCKED_LEVEL_SLUG) {
            return (
              <IslandNode
                key={level.slug}
                island={level}
                align={align}
                status={firstLevelCompleted ? "completed" : "start"}
                href={`/kind/${childId}/route/${level.slug}`}
              />
            );
          }

          return (
            <IslandNode
              key={level.slug}
              island={level}
              align={align}
              status={level.isFinalDestination ? "final" : "locked"}
            />
          );
        })}
      </div>
    </div>
  );
}
