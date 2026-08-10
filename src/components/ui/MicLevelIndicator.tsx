"use client";

import { useMicLevel } from "@/hooks/useMicLevel";

interface MicLevelIndicatorProps {
  /** Is er nu een opname/luistersessie bezig? */
  active: boolean;
  /** Bestaande stream hergebruiken (voorkomt een dubbele microfoon-aanvraag); laat weg voor een eigen aanvraag. */
  stream?: MediaStream | null;
}

// Elke staaf reageert net iets anders sterk op het volume, voor een
// natuurlijker "levend" effect i.p.v. alle staafjes exact gelijk.
const BAR_SENSITIVITY = [0.5, 0.8, 1, 0.8, 0.55];

/**
 * Visuele bevestiging dat de microfoon daadwerkelijk geluid oppikt tijdens
 * het opnemen — vijf staafjes die meebewegen met het echte geluidsniveau.
 * Puur decoratief/informatief (geen score, geen cijfer, hfst. 22); laat een
 * kind zien "ik word gehoord" zonder iets te beoordelen.
 */
export function MicLevelIndicator({ active, stream }: MicLevelIndicatorProps) {
  const level = useMicLevel(active, stream ?? "own");

  return (
    <div className="flex h-10 items-end gap-1.5" role="img" aria-label="Microfoon luistert">
      {BAR_SENSITIVITY.map((sensitivity, i) => {
        const heightRatio = active ? Math.min(1, 0.15 + level * sensitivity) : 0.1;
        return (
          <span
            key={i}
            aria-hidden="true"
            className="w-2 rounded-full bg-clay-500 transition-[height] duration-75 ease-out"
            style={{ height: `${heightRatio * 100}%` }}
          />
        );
      })}
    </div>
  );
}
