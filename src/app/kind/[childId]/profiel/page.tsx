"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { SettingsPanelContent } from "@/components/journey/SettingsPanelContent";
import { EXPERIENCE_LEVELS } from "@/lib/experienceLevels";

/**
 * Profiel-pagina — voorheen een uitgeschakelde navigatie-tab ("Binnenkort
 * beschikbaar"), nu geactiveerd. Toont kindprofiel-info bovenaan en
 * daaronder dezelfde instellingen die ook achter het tandwiel-knopje op
 * Leren zitten (zie SettingsPanelContent.tsx) — op verzoek ook hier
 * bereikbaar, niet alleen via Leren. Onderaan een "Account"-blok (op
 * verzoek): terug naar de landingspagina, en uitloggen — daarvoor was
 * eerder nergens een weg terug vanuit een kindprofiel.
 */
export default function ChildProfilePage() {
  const params = useParams<{ childId: string }>();
  const router = useRouter();
  const {
    getChild,
    setSpeakFirstMode,
    setLenientPronunciationMode,
    setMicrophoneOptIn,
    setPreferredVoicePersona,
    setExperienceLevel,
    logout,
    ready,
  } = useAppStore();

  if (!ready) return <p className="pt-12 text-center text-ink-muted">Even laden…</p>;

  const child = getChild(params.childId);
  if (!child) return notFound();

  const levelInfo = EXPERIENCE_LEVELS.find((option) => option.value === child.level);

  return (
    <AppShell child={child}>
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <h1 className="sr-only">Profiel</h1>

        <div className="flex items-center gap-4 rounded-xl2 border border-border-subtle bg-white p-4 shadow-soft">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-100 text-4xl"
            aria-hidden="true"
          >
            {child.avatarId}
          </span>
          <div>
            <p className="text-xl font-bold text-forest-500">{child.displayName}</p>
            <p className="text-sm text-ink-muted">
              {child.points} punten · niveau {levelInfo?.label ?? child.level}
            </p>
          </div>
        </div>

        <div className="rounded-xl2 border border-border-subtle bg-white p-4 shadow-soft">
          <h2 className="mb-3 text-sm font-semibold text-ink">Instellingen</h2>
          <SettingsPanelContent
            child={child}
            onMicrophoneOptInChange={(enabled) => setMicrophoneOptIn(child.id, enabled)}
            onSpeakFirstModeChange={(enabled) => setSpeakFirstMode(child.id, enabled)}
            onLenientPronunciationModeChange={(enabled) => setLenientPronunciationMode(child.id, enabled)}
            onPreferredVoicePersonaChange={(persona) => setPreferredVoicePersona(child.id, persona)}
            onExperienceLevelChange={(level) => setExperienceLevel(child.id, level)}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl2 border border-border-subtle bg-white p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-ink">Account</h2>
          <Link href="/">
            <Button variant="secondary" className="w-full">
              ⟵ Terug naar de landingspagina
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              // Geen echte auth in deze MVP-demo: dit wist alleen de
              // "ingelogd"-vlag (parentEmail) — kindprofielen blijven
              // gewoon bewaard, zie logout() in store.tsx.
              logout();
              router.push("/");
            }}
          >
            Uitloggen
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
