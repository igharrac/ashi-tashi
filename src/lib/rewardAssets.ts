/**
 * Mapping van RewardAnimation-types naar de aangeleverde reward-SVG's
 * (public/rewards/, zie README.md daar) — vervangt de losse 🎉-emoji's
 * door de app heen (op verzoek). Categorienaam uit de aangeleverde set
 * geeft het moment aan waarop een type hoort te verschijnen:
 * - micro-rewards   -> WORD_SUCCESS (elk goed antwoord)
 * - streaks         -> STREAK_SUCCESS
 * - unlocks         -> ITEM_UNLOCK
 * - collectibles-*  -> COLLECTIBLE (specifiek dier/object)
 * - category-complete + decorative-motion -> CATEGORY_COMPLETE
 */

export type RewardType = "WORD_SUCCESS" | "STREAK_SUCCESS" | "ITEM_UNLOCK" | "CATEGORY_COMPLETE" | "COLLECTIBLE";

export const MICRO_REWARD_ICONS = [
  "/rewards/01-micro-rewards/01-star-pop.svg",
  "/rewards/01-micro-rewards/02-sparkle-burst.svg",
  "/rewards/01-micro-rewards/03-confetti-pop.svg",
  "/rewards/01-micro-rewards/04-check-badge.svg",
  "/rewards/01-micro-rewards/05-heart-pop.svg",
  "/rewards/01-micro-rewards/06-thumb-spark.svg",
  "/rewards/01-micro-rewards/07-magic-ring.svg",
  "/rewards/01-micro-rewards/08-blob-bounce.svg",
];

export const STREAK_ICONS = ["/rewards/02-streaks/01-fire-streak.svg", "/rewards/02-streaks/04-crown.svg"];

export const UNLOCK_ICONS = ["/rewards/03-unlocks/01-gift-box.svg", "/rewards/03-unlocks/02-open-lock.svg"];

/** Verzameldieren/-objecten op bestandsnaam (zonder extensie) — bv. iconForCollectible("cat"). */
const COLLECTIBLE_ICON_MAP: Record<string, string> = {
  goat: "/rewards/04-collectibles-animals/01-goat.svg",
  camel: "/rewards/04-collectibles-animals/02-camel.svg",
  cow: "/rewards/04-collectibles-animals/03-cow.svg",
  cat: "/rewards/04-collectibles-animals/04-cat.svg",
  bird: "/rewards/04-collectibles-animals/05-bird.svg",
  fish: "/rewards/04-collectibles-animals/06-fish.svg",
  butterfly: "/rewards/04-collectibles-animals/07-butterfly.svg",
  turtle: "/rewards/04-collectibles-animals/08-turtle.svg",
  teapot: "/rewards/05-collectibles-food-nature/01-teapot.svg",
  bread: "/rewards/05-collectibles-food-nature/02-bread.svg",
  "argan-tree": "/rewards/05-collectibles-food-nature/03-argan-tree.svg",
  "palm-tree": "/rewards/05-collectibles-food-nature/04-palm-tree.svg",
  sun: "/rewards/05-collectibles-food-nature/05-sun.svg",
  mountain: "/rewards/05-collectibles-food-nature/06-mountain.svg",
  house: "/rewards/05-collectibles-food-nature/07-house.svg",
  drum: "/rewards/05-collectibles-food-nature/08-drum.svg",
};
const DEFAULT_COLLECTIBLE_ICON = "/rewards/06-category-complete/03-big-badge.svg";

export const CATEGORY_COMPLETE_ICONS = {
  trophy: "/rewards/06-category-complete/01-trophy.svg",
  medal: "/rewards/06-category-complete/02-medal.svg",
  rays: "/rewards/07-decorative-motion/03-rays.svg",
  rain: "/rewards/06-category-complete/04-celebration-rain.svg",
  blob: "/rewards/07-decorative-motion/05-organic-blob.svg",
};

/**
 * Illustraties voor het herhalende mid-les-checkpoint (elke 6 woorden, zie
 * CheckpointScreen.tsx) — cyclet per keer dat het scherm binnen dezelfde les
 * verschijnt, zodat het 2e/3e checkpoint niet exact hetzelfde plaatje toont
 * als het 1e (op verzoek: "andere illustratie").
 */
export const CHECKPOINT_ICONS = [
  "/rewards/06-category-complete/02-medal.svg",
  "/rewards/02-streaks/04-crown.svg",
  "/rewards/02-streaks/02-three-stars.svg",
  "/rewards/02-streaks/05-lightning.svg",
  "/rewards/02-streaks/06-growing-plant.svg",
  "/rewards/03-unlocks/05-golden-ticket.svg",
];

export function checkpointIconForOccurrence(occurrence: number): string {
  return CHECKPOINT_ICONS[occurrence % CHECKPOINT_ICONS.length]!;
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0]!;
}

export function iconForCollectible(collectibleId?: string): string {
  if (collectibleId && COLLECTIBLE_ICON_MAP[collectibleId]) return COLLECTIBLE_ICON_MAP[collectibleId]!;
  return DEFAULT_COLLECTIBLE_ICON;
}
