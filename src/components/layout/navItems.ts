export interface NavItem {
  key: string;
  label: string;
  icon: string;
  hrefSuffix: string | null; // null = nog niet beschikbaar (hfst. 49: buiten MVP)
}

export const NAV_ITEMS: NavItem[] = [
  { key: "leren", label: "Leren", icon: "🎓", hrefSuffix: "route" },
  { key: "ontdekken", label: "Ontdekken", icon: "🧭", hrefSuffix: null },
  { key: "beloningen", label: "Beloningen", icon: "🏅", hrefSuffix: "beloningen" },
  { key: "profiel", label: "Profiel", icon: "👤", hrefSuffix: null },
];
