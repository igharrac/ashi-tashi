import Link from "next/link";
import type { JourneyIsland } from "@/lib/demoData";

interface IslandNodeProps {
  island: JourneyIsland;
  status: "start" | "completed" | "locked" | "final";
  href?: string;
  /** Aan welke kant van het pad dit eiland staat; bepaalt waar de teaser-tekst komt. */
  align: "left" | "right";
}

const STATUS_RING: Record<IslandNodeProps["status"], string> = {
  start: "bg-forest-500 text-white shadow-forest",
  completed: "bg-forest-400 text-white shadow-forest",
  locked: "bg-white text-ink-muted border-4 border-border-subtle",
  final: "bg-gradient-to-br from-clay-500 to-forest-600 text-white shadow-soft",
};

const STATUS_BADGE_TEXT: Record<IslandNodeProps["status"], string | null> = {
  start: "START",
  completed: "Voltooid",
  locked: "Binnenkort",
  final: "Einde van de reis",
};

/** Eén "eiland" op het reispad (hfst. 10: taal > thema > les), gebaseerd op het Figma-ontwerp. */
export function IslandNode({ island, status, href, align }: IslandNodeProps) {
  const isLocked = status === "locked";
  const circleSize = status === "final" ? "h-32 w-32 text-4xl" : "h-28 w-28 text-3xl";
  const badgeText = STATUS_BADGE_TEXT[status];

  const circle = (
    <div className="relative shrink-0">
      <div
        className={`flex ${circleSize} items-center justify-center rounded-full border-4 border-white transition-transform
          ${STATUS_RING[status]} ${!isLocked ? "hover:scale-105" : ""}`}
        aria-hidden="true"
      >
        {isLocked ? "🔒" : island.emoji}
      </div>
      {badgeText && (
        <span
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-0.5
            text-xs font-bold text-forest-600 shadow-sm"
        >
          {badgeText}
        </span>
      )}
    </div>
  );

  const teaser = (
    <div className={`max-w-[180px] ${align === "right" ? "text-left" : "text-right"}`}>
      <p className="text-sm font-bold text-forest-600">{island.eyebrow ?? island.titleNl}</p>
      <p className="text-sm text-ink">{island.teaser}</p>
    </div>
  );

  const inner = (
    <div
      className={`flex items-center gap-4 ${align === "right" ? "flex-row" : "flex-row-reverse"}
        ${align === "right" ? "self-end" : "self-start"}`}
    >
      {circle}
      {teaser}
    </div>
  );

  if (href && !isLocked) {
    return (
      <Link
        href={href}
        className="rounded-full focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        aria-label={`Open thema ${island.titleNl}: ${island.teaser}`}
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
