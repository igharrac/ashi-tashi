"use client";

import { Button } from "@/components/ui/Button";
import { CATEGORY_COMPLETE_ICONS } from "@/lib/rewardAssets";

interface CheckpointScreenProps {
  /** Voortgang binnen een langere les (12+ woorden) — samen met `total` gebruikt voor de standaard subtitel. */
  completed?: number;
  total?: number;
  /** Aangepaste titel/subtitel voor ander gebruik van hetzelfde scherm, bv. de overgang Ontdekken -> Oefenen. */
  title?: string;
  subtitle?: string;
  continueLabel?: string;
  onContinue: () => void;
}

const CONFETTI_DOTS = [
  "left-8 top-10 h-2 w-2 bg-accent-500",
  "right-10 top-16 h-3 w-3 bg-secondary-500",
  "left-1/2 bottom-16 h-2 w-2 bg-accent-400",
  "right-12 bottom-20 h-2 w-2 bg-secondary-400",
];

/**
 * Kort, licht tussenschermpje — "een level binnen een level" (op verzoek).
 * Bewust een veel lichtere solid-kleur (`primary-300`) dan het grote
 * "categorie compleet"-scherm (`primary-700`, zie CategoryCompleteScreen.tsx)
 * en zonder wachttijd vóór de knop: dit moet snel en laagdrempelig aanvoelen
 * — een checkpoint, geen tweede eindpunt.
 *
 * Twee gebruiken delen dit scherm: het oorspronkelijke mid-les-checkpoint
 * (via `completed`/`total`) en de overgang Ontdekken -> Oefenen (via eigen
 * `title`/`subtitle`/`continueLabel`) — op verzoek: "Wanneer je met
 * 'ontdekken' klaar bent, dan zou je automatisch naar 'Oefenen' moeten via
 * een mooie CheckpointScreen screen."
 */
export function CheckpointScreen({ completed, total, title, subtitle, continueLabel, onContinue }: CheckpointScreenProps) {
  const resolvedSubtitle =
    subtitle ?? (completed !== undefined && total !== undefined ? `Je bent al bij woord ${completed} van ${total}.` : undefined);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-primary-300 px-6 py-10 text-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {CONFETTI_DOTS.map((pos, i) => (
          <span
            key={pos}
            className={`absolute rounded-sm motion-safe:animate-reward-dots-float ${pos}`}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <div className="relative flex h-20 w-20 items-center justify-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-accent-100" />
        <img
          src={CATEGORY_COMPLETE_ICONS.medal}
          alt=""
          className="relative h-[68%] w-[68%] motion-safe:animate-reward-pop motion-reduce:animate-reward-fade"
        />
      </div>

      <h1 className="text-xl font-bold text-primary-900">{title ?? "Lekker bezig!"}</h1>
      {resolvedSubtitle && <p className="text-primary-800">{resolvedSubtitle}</p>}

      <Button variant="secondary" onClick={onContinue}>
        {continueLabel ?? "Verder"}
      </Button>
    </main>
  );
}
