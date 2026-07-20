import Link from "next/link";
import type { JourneyIsland } from "@/lib/demoData";

interface IslandNodeProps {
  island: JourneyIsland;
  status: "start" | "completed" | "locked" | "final";
  href?: string;
  align: "left" | "right";
}

const STATUS_RING: Record<IslandNodeProps["status"], string> = {
  start: "bg-forest-500 text-white shadow-forest",
  completed: "bg-forest-400 text-white shadow-forest",
  locked: "bg-white text-ink-muted border-4 border-border-subtle",
  final: "bg-gradient-to-br from-clay-500 to-forest-600 text-white shadow-soft",
};

/** Eén "eiland" op het reispad (hfst. 10: taal > thema > les), gebaseerd op het Figma-ontwerp. */
export function IslandNode({ island, status, href, align }: IslandNodeProps) {
  const isLocked = status === "locked";
  const size = status === "final" ? "h-32 w-32 text-4xl" : "h-28 w-28 text-3xl";

  const content = (
    <div className={`flex flex-col items-center gap-2 ${align === "right" ? "self-end" : "self-start"}`}>
      <div
        className={`flex ${size} items-center justify-center rounded-full transition-transform
          ${STATUS_RING[status]} ${!isLocked ? "hover:scale-105" : ""}`}
        aria-hidden="true"
      >
        {isLocked ? "🔒" : island.emoji}
      </div>
      <p className={`text-center text-sm font-bold ${isLocked ? "text-ink-muted" : "text-forest-700"}`}>
        {island.titleNl}
      </p>
      {status === "start" && (
        <span className="rounded-full bg-forest-500 px-3 py-0.5 text-xs font-bold text-white">START</span>
      )}
      {(isLocked || status === "final") && (
        <span className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-ink-muted shadow-sm">
          {status === "final" ? "Einde van de reis" : "Binnenkort"}
        </span>
      )}
    </div>
  );

  if (href && !isLocked) {
    return (
      <Link
        href={href}
        className="rounded-full focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        aria-label={`Open thema ${island.titleNl}`}
      >
        {content}
      </Link>
    );
  }

  return content;
}
