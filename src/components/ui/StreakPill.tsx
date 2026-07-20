import { Pill } from "./Pill";

interface StreakPillProps {
  days: number;
}

/**
 * Toont de zachte streak (hfst. 16). Bewust geen waarschuwing of
 * schuldgevoel-tekst bij 0 dagen — gewoon een neutrale, vriendelijke start.
 */
export function StreakPill({ days }: StreakPillProps) {
  return (
    <Pill tone="peach" icon="🔥">
      {days === 0 ? "Begin vandaag!" : `${days} ${days === 1 ? "dag" : "dagen"}`}
    </Pill>
  );
}
