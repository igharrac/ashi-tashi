"use client";

import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { DEMO_BADGES } from "@/lib/demoData";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

/**
 * Beloningen-scherm: alle badges, behaald en nog te behalen (hfst. 16).
 * Bewust geen ranglijst of vergelijking met andere kinderen — alleen de
 * eigen voortgang, geen publieke competitie voor jonge kinderen.
 */
export default function RewardsPage() {
  const params = useParams<{ childId: string }>();
  const { getChild, ready } = useAppStore();

  if (!ready) return <p className="pt-12 text-center text-ink-muted">Even laden…</p>;

  const child = getChild(params.childId);
  if (!child) return notFound();

  const allBadges = Object.entries(DEMO_BADGES);
  const earnedCount = child.earnedBadgeSlugs.length;

  return (
    <AppShell child={child}>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-forest-500">Beloningen</h1>
        <p className="mt-1 text-ink-muted">
          {earnedCount} van {allBadges.length} badges verdiend &middot; {child.points} punten
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {allBadges.map(([slug, badge]) => {
            const earned = child.earnedBadgeSlugs.includes(slug);
            return (
              <Card
                key={slug}
                className={`flex flex-col items-center gap-2 text-center ${earned ? "" : "opacity-50 grayscale"}`}
              >
                <span className="text-5xl" aria-hidden="true">
                  {badge.emoji}
                </span>
                <p className="font-bold text-forest-700">{badge.titleNl}</p>
                <p className="text-xs text-ink-muted">{badge.description}</p>
                {!earned && <span className="text-xs font-semibold text-ink-muted">🔒 Nog niet behaald</span>}
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
