"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";
import { DailyTipCard } from "@/components/ui/DailyTipCard";
import type { ChildProfileData } from "@/types/domain";

interface SidebarProps {
  child: ChildProfileData;
}

/**
 * Desktop-zijbalk (hfst. 8, ontwerp: Ashi & Tashi Figma/Stitch-bestand):
 * mascotte-avatar, naam, navigatie, dagelijkse tip. Op mobiel vervangen
 * door <BottomTabBar> — zie AppShell.
 */
export function Sidebar({ child }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border-subtle bg-cream-card p-6 md:flex">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint-100 text-2xl" aria-hidden="true">
          {child.avatarId}
        </span>
        <div>
          <p className="font-bold text-forest-500">Ashi &amp; Tashi</p>
          <p className="text-xs text-ink-muted">{child.displayName}s avontuur</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Hoofdnavigatie">
        {NAV_ITEMS.map((item) => {
          const href = item.hrefSuffix ? `/kind/${child.id}/${item.hrefSuffix}` : null;
          const isActive = href ? pathname === href || pathname?.startsWith(`${href}/`) : false;

          if (!href) {
            return (
              <span
                key={item.key}
                aria-disabled="true"
                title="Binnenkort beschikbaar"
                className="flex items-center gap-3 rounded-full px-4 py-2 text-ink-muted/60"
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.key}
              href={href}
              className={`flex items-center gap-3 rounded-full px-4 py-2 font-semibold transition-colors
                focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                ${isActive ? "bg-mint-100 text-forest-700" : "text-ink hover:bg-mint-100/40"}`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <DailyTipCard />
      </div>
    </aside>
  );
}
