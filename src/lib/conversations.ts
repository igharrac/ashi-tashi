/**
 * Types voor "Gesprekken" (hfst. — nieuw): een kort, vertakt gesprekje
 * tussen de app en het kind. Bewust GEEN boomstructuur met verwijzingen:
 * een gesprek is gewoon een geordende lijst van stappen, omdat een
 * keuzemoment altijd naar dezelfde volgende stap doorgaat (de keuze bepaalt
 * alleen wélke zin het kind inspreekt/oefent, niet de verdere verhaallijn).
 * Zie AGENT-WERKWIJZE.md / gespreksgeschiedenis voor de ontwerpkeuzes.
 */

export interface ConversationLine {
  /** Recordable item-id, zelfde systeem als woorden/zinnen (recordableItems.ts) — koppelt aan opnames in alle 4 stemmen. */
  itemId: string;
  translationNl: string;
}

export type ConversationStep =
  | { type: "app"; line: ConversationLine }
  | { type: "choice"; options: ConversationLine[] };

export interface ConversationDefinition {
  id: string;
  titleNl: string;
  emoji: string;
  teaser: string;
  steps: ConversationStep[];
}
