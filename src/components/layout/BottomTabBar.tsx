"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";
import type { ChildProfileData } from "@/types/domain";

interface BottomTabBarProps {
  child: ChildProfileData;
}

/** Mobiele navigatie (hfst. 9: mobile-first), zelfde items als de Sidebar. */
export function BottomTabBar({ child }: BottomTabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hoofdnavigatie"
      className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-border-subtle
        bg-cream-card px-2 py-2 md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {NAV_ITEMS.map((item) => {
        const href = item.hrefSuffix ? `/kind/${child.id}/${item.hrefSuffix}` : null;
        const isActive = href ? pathname === href || pathname?.startsWith(`${href}/`) : false;

        if (!href) {
          return (
            <span key={item.key} aria-disabled="true" className="flex min-h-[56px] min-w-[56px] flex-col items-center justify-center gap-1 text-xs text-ink-muted/50">
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
      })}
    </nav>
  );
}
