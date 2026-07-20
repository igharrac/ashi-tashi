"use client";

import { useState } from "react";

interface MascotIllustrationProps {
  className?: string;
  variant?: "cloud" | "compact";
}

/**
 * Plek voor de originele "Ashi & Tashi op een wolk"-illustratie uit het
 * Figma/Stitch-ontwerp (node 2:315, bestand Bz60fD3zucFgZvlDJxwBri).
 *
 * De afbeelding kon niet automatisch opgehaald worden (geen netwerktoegang
 * tot Figma's asset-server vanuit de bouwomgeving). Om de echte illustratie
 * te gebruiken:
 *   1. Open het Figma-bestand, selecteer de laag "Ashi and Tashi sitting on
 *      a cloud in a magical sky" (of de bijbehorende containerlaag).
 *   2. Rechtsklik → Export as PNG (2x).
 *   3. Sla het bestand op als public/illustrations/mascot-cloud.png in dit
 *      project.
 * Zodra dat bestand bestaat, toont dit component de echte afbeelding
 * automatisch — er hoeft niets aan de code te veranderen.
 */
export function MascotIllustration({ className = "", variant = "cloud" }: MascotIllustrationProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const size = variant === "cloud" ? 320 : 160;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl3 border-4 border-mint-200/30
        bg-gradient-to-br from-mint-100 via-sky-200 to-peach-100 shadow-soft ${className}`}
      style={{ width: size, height: Math.round((size * 88) / 158) }}
    >
      {!imageFailed && (
        // eslint-disable-next-line @next/next/no-img-element -- lokaal placeholder-pad, mag nog ontbreken
        <img
          src="/illustrations/mascot-cloud.png"
          alt="Ashi en Tashi zitten samen op een wolk in een magische lucht"
          className="absolute inset-0 h-full w-full object-contain"
          onError={() => setImageFailed(true)}
        />
      )}
      {imageFailed && (
        <span aria-hidden="true" className="select-none text-6xl">
          🦊🦊
        </span>
      )}
    </div>
  );
}
