/**
 * Registry van de selecteerbare kleurthema's. De daadwerkelijke kleuren
 * staan als CSS-variabelen in src/app/globals.css (per [data-theme="..."]);
 * dit bestand kent alleen de geldige id's + weergavenamen, zodat
 * ThemeProvider/ThemeSwitcher en het anti-flits-script in layout.tsx één
 * bron van waarheid hebben. Nieuw thema toevoegen: hier een entry bij
 * zetten + het bijbehorende blok in globals.css.
 *
 * De labels tonen bewust geen "voor meisjes/voor jongens" in de UI zelf
 * (dat staat wel in de opdracht/documentatie) — een kind mag gewoon de
 * kleur kiezen die het mooi vindt, zonder dat de keuze zelf al een
 * geslacht impliceert.
 */
export const THEME_IDS = ["berry", "ocean", "atlas"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME_ID: ThemeId = "atlas";

export interface ThemeOption {
  id: ThemeId;
  label: string;
  /** Voor de swatch-knop in de wisselaar — hex uit dezelfde bron als globals.css. */
  swatch: { primary: string; secondary: string; accent: string };
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "berry",
    label: "Berry",
    swatch: { primary: "#8B5CF6", secondary: "#F472B6", accent: "#FBBF24" },
  },
  {
    id: "ocean",
    label: "Ocean",
    swatch: { primary: "#0EA5A8", secondary: "#3B82F6", accent: "#F97316" },
  },
  {
    id: "atlas",
    label: "Atlas",
    swatch: { primary: "#334155", secondary: "#0F766E", accent: "#F59E0B" },
  },
];

export function isThemeId(value: string): value is ThemeId {
  return (THEME_IDS as readonly string[]).includes(value);
}

export const THEME_STORAGE_KEY = "ashi-tashi:theme:v1";
