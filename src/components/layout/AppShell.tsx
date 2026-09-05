import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomTabBar } from "./BottomTabBar";
import { BottomBarVisibilityProvider } from "./BottomBarVisibilityContext";
import { SettingsMenu } from "./SettingsMenu";
import { StreakPill } from "@/components/ui/StreakPill";
import { computeStreakDays, todayIso } from "@/domain/streak";
import { useAppStore } from "@/lib/store";
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
 *
 * Header op verzoek herzien (stond rommelig: beeldmerk + streak-pil +
 * los thema-knopje op één rij, en dan op "Jouw Reis" ook nog een eigen
 * zwevend instellingen-tandwiel bovenop de pagina-inhoud). Nu overal
 * hetzelfde: kind-avatar + naam links (het beeldmerk zelf staat voortaan
 * subtiel gecentreerd in de BottomTabBar, zie daar), en rechts de streak
 * + één instellingen-knop (SettingsMenu, combineert kleurthema +
 * spraakinstellingen — vervangt de losse ThemeSwitcher/JourneySettingsMenu).
 */
export function AppShell({ child, children }: AppShellProps) {
  const {
    setSpeakFirstMode,
    setLenientPronunciationMode,
    setMicrophoneOptIn,
    setAutoplayAudio,
    setPreferredVoicePersona,
    setExperienceLevel,
  } = useAppStore();
  const streakDays = computeStreakDays(child.practiceDatesIso ?? [], todayIso());

  return (
    <BottomBarVisibilityProvider>
      <div className="flex min-h-screen">
        <Sidebar child={child} />
        <div className="flex-1 pb-20 md:pb-0">
          <header className="flex items-center justify-between gap-3 border-b border-border-subtle bg-white px-6 py-3 shadow-sm md:border-none md:bg-transparent md:shadow-none">
            {/* Alleen op mobiel: op desktop staat het kind al in de zijbalk
                (Sidebar.tsx), dat hier nogmaals tonen zou dubbelop zijn. */}
            <div className="flex items-center gap-3 md:hidden">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-100 text-xl"
                aria-hidden="true"
              >
                {child.avatarId}
              </span>
              <span className="font-bold text-forest-600">{child.displayName}</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <StreakPill days={streakDays} />
              <SettingsMenu
                child={child}
                onMicrophoneOptInChange={(enabled) => setMicrophoneOptIn(child.id, enabled)}
                onSpeakFirstModeChange={(enabled) => setSpeakFirstMode(child.id, enabled)}
                onLenientPronunciationModeChange={(enabled) => setLenientPronunciationMode(child.id, enabled)}
                onAutoplayAudioChange={(enabled) => setAutoplayAudio(child.id, enabled)}
                onPreferredVoicePersonaChange={(persona) => setPreferredVoicePersona(child.id, persona)}
                onExperienceLevelChange={(level) => setExperienceLevel(child.id, level)}
              />
            </div>
          </header>
          <div className="px-6 pb-10">{children}</div>
        </div>
        <BottomTabBar child={child} />
      </div>
    </BottomBarVisibilityProvider>
  );
}
