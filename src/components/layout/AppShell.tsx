import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomTabBar } from "./BottomTabBar";
import { BottomBarVisibilityProvider } from "./BottomBarVisibilityContext";
import { StreakPill } from "@/components/ui/StreakPill";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { computeStreakDays, todayIso } from "@/domain/streak";
import type { ChildProfileData } from "@/types/domain";

interface AppShellProps {
  child: ChildProfileData;
  children: ReactNode;
}

/**
 * Layout voor de kind-gerichte appschermen (leerroute, beloningen):
 * zijbalk op desktop, onderbalk op mobiel, streak zichtbaar in de kop.
 * Lesschermen zelf gebruiken bewust geen AppShell — daar is één
 * primaire taak per scherm belangrijker dan navigatie (hfst. 7.3).
 */
export function AppShell({ child, children }: AppShellProps) {
  const streakDays = computeStreakDays(child.practiceDatesIso ?? [], todayIso());

  return (
    <BottomBarVisibilityProvider>
      <div className="flex min-h-screen">
        <Sidebar child={child} />
        <div className="flex-1 pb-20 md:pb-0">
          <header className="flex items-center justify-between gap-3 px-6 py-4">
            {/* Alleen op mobiel: op desktop staat het beeldmerk al in de
                zijbalk (Sidebar.tsx), dat hier nogmaals tonen zou dubbelop
                zijn. Op mobiel is linksboven anders leeg (geen zijbalk). */}
            {/* eslint-disable-next-line @next/next/no-img-element -- lokaal SVG-beeldmerk (public/brand), geen next/image-optimalisatie nodig */}
            <img src="/brand/icon-mark.svg" alt="Ashi & Tashi" className="h-10 w-10 md:hidden" />
            <div className="flex items-center gap-3">
              <StreakPill days={streakDays} />
              <ThemeSwitcher />
            </div>
          </header>
          <div className="px-6 pb-10">{children}</div>
        </div>
        <BottomTabBar child={child} />
      </div>
    </BottomBarVisibilityProvider>
  );
}
