import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomTabBar } from "./BottomTabBar";
import { StreakPill } from "@/components/ui/StreakPill";
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
    <div className="flex min-h-screen">
      <Sidebar child={child} />
      <div className="flex-1 pb-20 md:pb-0">
        <header className="flex items-center justify-end gap-3 px-6 py-4">
          <StreakPill days={streakDays} />
        </header>
        <div className="px-6 pb-10">{children}</div>
      </div>
      <BottomTabBar child={child} />
    </div>
  );
}
