"use client";

import { JOURNEY_ISLANDS } from "@/lib/demoData";
import { IslandNode } from "./IslandNode";

interface JourneyPathProps {
  childId: string;
  dierenLessonId: string;
  dierenCompleted: boolean;
}

const ISLAND_COUNT = JOURNEY_ISLANDS.length;
const ROW_HEIGHT = 176; // px, moet overeenkomen met de gap tussen eilanden hieronder

/**
 * Reispad-visualisatie (hfst. 10, geïnspireerd op het Figma/Stitch-ontwerp
 * "Jouw Reis"): een vloeiend kronkelend S-pad met wolken, en eilanden per
 * thema die afwisselend links/rechts van het pad liggen.
 */
export function JourneyPath({ childId, dierenLessonId, dierenCompleted }: JourneyPathProps) {
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
    </div>
  );
}
