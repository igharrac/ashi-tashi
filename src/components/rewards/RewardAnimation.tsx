"use client";

import { useState } from "react";
import {
  CATEGORY_COMPLETE_ICONS,
  MICRO_REWARD_ICONS,
  STREAK_ICONS,
  UNLOCK_ICONS,
  iconForCollectible,
  pickRandom,
  type RewardType,
} from "@/lib/rewardAssets";

interface RewardAnimationProps {
  type: RewardType;
  /** Alleen voor COLLECTIBLE: welk dier/object (bestandsnaam zonder extensie, bv. "cat", "argan-tree"). */
  collectibleId?: string;
  /** Tailwind-afmetingsklassen, bv. "h-24 w-24" (standaard) of "h-16 w-16" voor een kleinere plek. */
  sizeClassName?: string;
}

/**
 * Vervangt de losse 🎉-emoji's door de app heen (op verzoek van de
 * gebruiker, na eerdere preview/goedkeuring van de aangeleverde
 * "Ashi d' Tashi Reward Library v2", zie public/rewards/README.md).
 *
 * Vijf types, met de bijbehorende assets/motion uit de aangeleverde spec:
 * - WORD_SUCCESS / STREAK_SUCCESS: korte pop-animatie (scale+rotate+fade,
 *   ~0,6-0,7s) — vervangt het 🎉 bij een goed antwoord.
 * - ITEM_UNLOCK / COLLECTIBLE: fade + pop + lichte bounce (~0,7s).
 * - CATEGORY_COMPLETE: trophy (pop) op een gecentreerde, pulserende
 *   cirkel-achtergrond (CSS, geen los SVG-asset), voor het "les/gesprek
 *   voltooid"-scherm. Op verzoek geen rays meer (te druk/asymmetrisch).
 *
 * Respecteert prefers-reduced-motion via Tailwinds motion-safe:/
 * motion-reduce:-varianten (geen extra config nodig) — bij "verminder
 * beweging" blijft alleen een fade over, verder identiek aan de preview
 * die eerder is goedgekeurd.
 */
export function RewardAnimation({ type, collectibleId, sizeClassName = "h-24 w-24" }: RewardAnimationProps) {
  const [icon] = useState(() => {
    switch (type) {
      case "WORD_SUCCESS":
        return pickRandom(MICRO_REWARD_ICONS);
      case "STREAK_SUCCESS":
        return pickRandom(STREAK_ICONS);
      case "ITEM_UNLOCK":
        return pickRandom(UNLOCK_ICONS);
      case "COLLECTIBLE":
        return iconForCollectible(collectibleId);
      case "CATEGORY_COMPLETE":
        return null;
    }
  });

  if (type === "CATEGORY_COMPLETE") {
    return (
      <div className={`relative flex items-center justify-center ${sizeClassName}`} aria-hidden="true">
        <span
          className="absolute inset-0 rounded-full bg-accent-200/70 motion-safe:animate-reward-blob-breathe motion-reduce:animate-reward-fade"
        />
        <img
          src={CATEGORY_COMPLETE_ICONS.trophy}
          alt=""
          className="relative h-[68%] w-[68%] motion-safe:animate-reward-unlock motion-reduce:animate-reward-fade"
        />
      </div>
    );
  }

  const isPop = type === "WORD_SUCCESS" || type === "STREAK_SUCCESS";

  return (
    <img
      src={icon ?? undefined}
      alt=""
      aria-hidden="true"
      className={`${sizeClassName} ${
        isPop
          ? "motion-safe:animate-reward-pop motion-reduce:animate-reward-fade"
          : "motion-safe:animate-reward-unlock motion-reduce:animate-reward-fade"
      }`}
    />
  );
}
