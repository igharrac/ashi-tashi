"use client";

import { Button } from "@/components/ui/Button";
import { CATEGORY_COMPLETE_ICONS } from "@/lib/rewardAssets";

interface CheckpointScreenProps {
  completed: number;
  total: number;
  onContinue: () => void;
}

const CONFETTI_DOTS = [
  "left-8 top-10 h-2 w-2 bg-accent-500",
  "right-10 top-16 h-3 w-3 bg-secondary-500",
  "left-1/2 bottom-16 h-2 w-2 bg-accent-400",
  "right-12 bottom-20 h-2 w-2 bg-secondary-400",
];

/**
 * Kort, licht tussenschermpje halverwege een langere les (12+ woorden,
 * na woord 6) — "een level binnen een level" (op verzoek). Bewust een veel
 * lichtere solid-kleur (`primary-300`) dan het grote "categorie
 * compleet"-scherm (`primary-700`, zie CategoryCompleteScreen.tsx) en
 * zonder wachttijd vóór de knop: dit moet snel en laagdrempelig aanvoelen
 * — een checkpoint, geen tweede eindpunt.
 */
export function CheckpointScreen({ completed, total, onContinue }: CheckpointScreenProps) {
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

      <h1 className="text-xl font-bold text-primary-900">Lekker bezig!</h1>
      <p className="text-primary-800">
        Je bent al bij woord {completed} van {total}.
      </p>

      <Button variant="secondary" onClick={onContinue}>
        Verder
      </Button>
    </main>
  );
}
