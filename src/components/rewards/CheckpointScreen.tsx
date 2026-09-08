"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { checkpointIconForOccurrence } from "@/lib/rewardAssets";
import { playCheckpointCheer } from "@/lib/playCheckpointCheer";

interface CheckpointScreenProps {
  /** Voortgang binnen een langere les (12+ woorden) — samen met `total` gebruikt voor de standaard subtitel. */
  completed?: number;
  total?: number;
  /** Aangepaste titel/subtitel voor ander gebruik van hetzelfde scherm, bv. de overgang Ontdekken -> Oefenen. */
  title?: string;
  subtitle?: string;
  continueLabel?: string;
  /** Hoeveelste keer dit scherm binnen dezelfde les/sessie verschijnt (0-based) — bepaalt zowel het icoon als het melodietje, zodat een herhaald checkpoint niet steeds identiek is (op verzoek: "andere illustratie en een ander geluid"). */
  occurrence?: number;
  onContinue: () => void;
}

const CONFETTI_DOTS = [
  "left-6 top-8 h-3 w-3 bg-accent-400",
  "left-1/4 top-6 h-2 w-2 bg-secondary-300",
  "left-1/2 top-10 h-3 w-3 bg-accent-500",
  "right-1/4 top-8 h-2 w-2 bg-secondary-400",
  "right-6 top-14 h-3 w-3 bg-accent-300",
  "left-10 top-1/3 h-2 w-2 bg-secondary-300",
  "right-10 top-1/3 h-3 w-3 bg-accent-400",
  "left-8 bottom-28 h-3 w-3 bg-secondary-400",
  "left-1/3 bottom-16 h-2 w-2 bg-accent-500",
  "left-1/2 bottom-10 h-3 w-3 bg-secondary-300",
];

/**
 * Kort, licht tussenschermpje — "een level binnen een level" (op verzoek).
 * Bewust een veel lichtere solid-kleur (`primary-300`) dan het grote
 * "categorie compleet"-scherm (`primary-700`, zie CategoryCompleteScreen.tsx)
 * en zonder wachttijd vóór de knop: dit moet snel en laagdrempelig aanvoelen
 * — een checkpoint, geen tweede eindpunt.
 *
 * Twee gebruiken delen dit scherm: het herhalende mid-les-checkpoint (elke
 * 6 woorden, via `occurrence` voor icoon/geluid-variatie) en de overgang
 * Ontdekken -> Oefenen (via eigen `title`/`subtitle`/`continueLabel`).
 *
 * Speelt bij het verschijnen een vrolijk melodietje (playCheckpointCheer) —
 * op verzoek expliciet een eigen "vreugde audio" i.p.v. dat per ongeluk het
 * volgende woord al hoorbaar wordt (dat was de vorige bug: de aanroeper
 * moet dit scherm tonen VOORDAT de volgende oefening mount, zie
 * les/[lessonId]/page.tsx). Meer motion dan voorheen (op verzoek): een
 * pulserende ring achter het icoon, meer zwevende confetti en een
 * gefaseerde fade-in van titel/subtitel/knop.
 */
export function CheckpointScreen({
  completed,
  total,
  title,
  subtitle,
  continueLabel,
  occurrence = 0,
  onContinue,
}: CheckpointScreenProps) {
  const resolvedSubtitle =
    subtitle ?? (completed !== undefined && total !== undefined ? `Je bent al bij woord ${completed} van ${total}.` : undefined);
  const icon = checkpointIconForOccurrence(occurrence);

  useEffect(() => {
    playCheckpointCheer(occurrence);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-primary-300 px-6 py-10 text-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {CONFETTI_DOTS.map((pos, i) => (
          <span
            key={pos}
            className={`absolute rounded-sm motion-safe:animate-reward-dots-float ${pos}`}
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>

      <div className="relative flex h-24 w-24 items-center justify-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-accent-200/60 motion-safe:animate-reward-ring-pulse motion-reduce:animate-reward-fade" />
        <span className="absolute inset-2 rounded-full bg-accent-100" />
        <img
          key={icon}
          src={icon}
          alt=""
          className="relative h-[52%] w-[52%] motion-safe:animate-reward-pop motion-reduce:animate-reward-fade"
        />
      </div>

      <h1
        className="text-xl font-bold text-primary-900 motion-safe:animate-reward-fade"
        style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}
      >
        {title ?? "Lekker bezig!"}
      </h1>
      {resolvedSubtitle && (
        <p
          className="text-primary-800 motion-safe:animate-reward-fade"
          style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
        >
          {resolvedSubtitle}
        </p>
      )}

      <div
        className="motion-safe:animate-reward-fade"
        style={{ animationDelay: "0.45s", animationFillMode: "backwards" }}
      >
        <Button variant="secondary" onClick={onContinue}>
          {continueLabel ?? "Verder"}
        </Button>
      </div>
    </main>
  );
}
