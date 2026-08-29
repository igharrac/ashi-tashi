"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";
import { useIsBottomBarHidden } from "./BottomBarVisibilityContext";
import type { ChildProfileData } from "@/types/domain";

interface BottomTabBarProps {
  child: ChildProfileData;
}

/**
 * Mobiele navigatie (hfst. 9: mobile-first), zelfde items als de Sidebar.
 * Op verzoek gesplitst rond een subtiel, niet-klikbaar beeldmerk in het
 * midden (Leren/Ontdekken links, Beloningen/Profiel rechts) — dat is
 * tegelijk de nieuwe plek voor het merk-logo, dat eerder los bovenin de
 * mobiele header stond (zie AppShell.tsx).
 */
export function BottomTabBar({ child }: BottomTabBarProps) {
  const pathname = usePathname();
  const hidden = useIsBottomBarHidden();

  // Verborgen zolang er een schermvullende mobiele overlay open is (bv.
  // SettingsMenu) — anders valt overlay-inhoud er half achter en is niet
  // alles bereikbaar/scrollbaar. Zie BottomBarVisibilityContext.
  if (hidden) return null;

  const midpoint = Math.ceil(NAV_ITEMS.length / 2);
  const leftItems = NAV_ITEMS.slice(0, midpoint);
  const rightItems = NAV_ITEMS.slice(midpoint);

  function renderItem(item: (typeof NAV_ITEMS)[number]) {
    const href = item.hrefSuffix ? `/kind/${child.id}/${item.hrefSuffix}` : null;
    const isActive = href ? pathname === href || pathname?.startsWith(`${href}/`) : false;

    if (!href) {
      return (
        <span
          key={item.key}
          aria-disabled="true"
          className="flex min-h-[56px] min-w-[56px] flex-col items-center justify-center gap-1 text-xs text-ink-muted/50"
        >
          <span aria-hidden="true" className="text-xl">
            {item.icon}
          </span>
          {item.label}
        </span>
      );
    }

    return (
      <Link
        key={item.key}
        href={href}
        className={`flex min-h-[56px] min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl2 px-3 text-xs font-semibold
          focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
          ${isActive ? "text-forest-600" : "text-ink-muted"}`}
      >
        <span aria-hidden="true" className="text-xl">
          {item.icon}
        </span>
        {item.label}
      </Link>
    );
  }

  return (
    <nav
      aria-label="Hoofdnavigatie"
      className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-border-subtle
        bg-cream-card px-2 py-2 md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {leftItems.map(renderItem)}
      {/* eslint-disable-next-line @next/next/no-img-element -- lokaal SVG-beeldmerk (public/brand), geen next/image-optimalisatie nodig */}
      <img src="/brand/icon-mark.svg" alt="" aria-hidden="true" className="h-6 w-6 shrink-0 opacity-60" />
      {rightItems.map(renderItem)}
    </nav>
  );
}
