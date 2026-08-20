import Link from "next/link";
import type { CategoryDefinition } from "@/lib/contentCatalog";

export type StepStatus = "active" | "completed" | "locked";

interface StepTileProps {
  /** Meestal een echte categorie; de losstaande "Dagelijkse zinnen"-tegel (StepGrid.tsx) geeft alleen deze drie velden mee, geen volledige CategoryDefinition. */
  category: Pick<CategoryDefinition, "emoji" | "titleNl" | "teaser">;
  status: StepStatus;
  href?: string;
}

const STATUS_CIRCLE: Record<StepStatus, string> = {
  active: "bg-forest-500 text-white shadow-forest ring-4 ring-forest-100",
  completed: "bg-forest-400 text-white shadow-forest",
  locked: "bg-white text-ink-muted border-4 border-border-subtle",
};

/**
 * Eén stap in het reispad-grid (StepGrid.tsx) — komt overeen met één
 * categorie uit de content-catalogus. Duidelijk onderscheid tussen actief
 * (kan gespeeld worden, ring omheen), voltooid (medaille i.p.v. plaatje) en
 * op slot (nog niet beschikbaar) — geen aparte "level"-laag meer ertussen.
 */
export function StepTile({ category, status, href }: StepTileProps) {
  const isLocked = status === "locked";

  const circle = (
    <div className="relative shrink-0">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white text-3xl
          transition-transform sm:h-20 sm:w-20 sm:text-4xl ${STATUS_CIRCLE[status]} ${!isLocked ? "hover:scale-105" : ""}`}
        aria-hidden="true"
      >
        {isLocked ? "🔒" : status === "completed" ? "🏅" : category.emoji}
      </div>
      {status === "active" && (
        <span
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full
            bg-clay-500 text-xs text-white shadow-sm"
        >
          ▶
        </span>
      )}
    </div>
  );

  const label = (
    <p className={`max-w-[84px] text-center text-xs font-bold sm:text-sm ${isLocked ? "text-ink-muted" : "text-forest-700"}`}>
      {category.titleNl}
    </p>
  );

  const inner = (
    <div className="flex flex-col items-center gap-1.5">
      {circle}
      {label}
    </div>
  );

  if (href && !isLocked) {
    return (
      <Link
        href={href}
        className="rounded-xl2 focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        aria-label={`Open categorie ${category.titleNl}: ${category.teaser}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div aria-label={isLocked ? `${category.titleNl}: binnenkort beschikbaar` : category.titleNl}>{inner}</div>
  );
}
