"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { DIEREN_THEME } from "@/lib/demoData";
import { getCategoriesForLevel, getLevelBySlug } from "@/lib/contentCatalog";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

/**
 * Levelpagina: toont de categorieën binnen één level (hfst. 10) als kaarten.
 * Nu is alleen de categorie "dieren" echt speelbaar (verwijst naar de
 * bestaande les); de overige categorieën in dit level tonen "binnenkort"
 * maar zijn al wel volledig gevuld met woorden in de opnamestudio
 * (src/lib/contentCatalog.ts).
 */
export default function LevelDetailPage() {
  const params = useParams<{ childId: string; levelSlug: string }>();
  const { getChild, ready } = useAppStore();

  if (!ready) return <p className="pt-12 text-center text-ink-muted">Even laden…</p>;

  const child = getChild(params.childId);
  if (!child) return notFound();

  const level = getLevelBySlug(params.levelSlug);
  if (!level) return notFound();

  const categories = getCategoriesForLevel(level.slug);
  const dierenLesson = DIEREN_THEME.lessons[0];
  const dierenCompleted = dierenLesson ? child.completedLessonIds.includes(dierenLesson.id) : false;

  return (
    <AppShell child={child}>
      <div className="mx-auto max-w-2xl text-center">
        <Link
          href={`/kind/${child.id}/route`}
          className="text-sm font-medium text-clay-500 underline underline-offset-2"
        >
          ← Terug naar de reis
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-forest-500">
          <span aria-hidden="true">{level.emoji}</span> {level.titleNl}
        </h1>
        <p className="mt-1 text-ink-muted">{level.teaser}</p>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 py-6 sm:grid-cols-2">
        {categories.map((category) => {
          const isDieren = category.slug === "dieren";
          const href = isDieren && dierenLesson ? `/kind/${child.id}/les/${dierenLesson.id}` : undefined;
          const statusLabel = isDieren ? (dierenCompleted ? "Voltooid" : "Start") : "Binnenkort";

          const content = (
            <Card
              className={`flex flex-col items-center gap-2 text-center ${
                href ? "transition-transform hover:scale-[1.02]" : "opacity-70"
              }`}
            >
              <span className="text-4xl" aria-hidden="true">
                {isDieren ? category.emoji : "🔒"}
              </span>
              <p className="font-bold text-forest-600">{category.titleNl}</p>
              <p className="text-xs text-ink-muted">{category.teaser}</p>
              <span className="rounded-full bg-mint-100 px-3 py-0.5 text-xs font-bold text-forest-700">
                {statusLabel}
              </span>
            </Card>
          );

          return href ? (
            <Link
              key={category.slug}
              href={href}
              className="rounded-xl3 focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
              aria-label={`Open categorie ${category.titleNl}: ${category.teaser}`}
            >
              {content}
            </Link>
          ) : (
            <div key={category.slug} aria-label={`${category.titleNl}: binnenkort beschikbaar`}>
              {content}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
