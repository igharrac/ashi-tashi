"use client";

/**
 * Lichte client-side state store voor de MVP-demo.
 *
 * Hoofdstuk 11.1 staat toe dat een ouder "een account of lokaal profiel"
 * aanmaakt. Deze demo implementeert het lokale-profielpad met
 * localStorage, zodat de volledige flow (hfst. 55) end-to-end te testen
 * is zonder backend/auth. Voor productie vervang je dit door API-routes
 * die tegen de Prisma-modellen in prisma/schema.prisma werken — de
 * functienamen en datavormen hieronder zijn daar bewust op voorbereid.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppStateData, ChildProfileData, ExperienceLevel, VoicePersona } from "@/types/domain";
import { evaluateEarnedBadges } from "@/domain/badges";
import { computeLessonPoints, computeMastery, type ExerciseAttemptRecord } from "@/domain/progress";
import { recordPracticeDay, todayIso } from "@/domain/streak";

const STORAGE_KEY = "ashi-tashi:mvp-demo-state:v1";

function createEmptyState(): AppStateData {
  return { parentEmail: null, children: [] };
}

function loadState(): AppStateData {
  if (typeof window === "undefined") return createEmptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw) as AppStateData;
    return {
      ...parsed,
      // lenientPronunciationMode is nieuw en staat standaard aan — profielen
      // die al bestonden vóór deze instelling er was, krijgen 'm hier alsnog
      // (anders zou "ontbreekt" ongewild als "uit" gelezen worden).
      children: parsed.children.map((child) => ({
        ...child,
        lenientPronunciationMode: child.lenientPronunciationMode ?? true,
      })),
    };
  } catch {
    return createEmptyState();
  }
}

function saveState(state: AppStateData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

interface AppStore {
  state: AppStateData;
  ready: boolean;
  setParentEmail: (email: string) => void;
  createChildProfile: (input: { displayName: string; avatarId: string; level: ExperienceLevel }) => ChildProfileData;
  getChild: (childId: string) => ChildProfileData | undefined;
  recordExerciseAttempt: (childId: string, attempt: ExerciseAttemptRecord & { isSpoken: boolean }) => void;
  completeLesson: (
    childId: string,
    lessonId: string,
    input: { totalExercises: number; correctExercises: number; awardThemeBadge?: boolean },
  ) => string[];
  setSpeakFirstMode: (childId: string, enabled: boolean) => void;
  setLenientPronunciationMode: (childId: string, enabled: boolean) => void;
  setMicrophoneOptIn: (childId: string, enabled: boolean) => void;
  setLessonProgress: (childId: string, progress: { lessonId: string; index: number } | null) => void;
  setPreferredVoicePersona: (childId: string, persona: VoicePersona | null) => void;
}

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppStateData>(createEmptyState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const setParentEmail = useCallback((email: string) => {
    setState((prev) => ({ ...prev, parentEmail: email }));
  }, []);

  const createChildProfile = useCallback<AppStore["createChildProfile"]>((input) => {
    const child: ChildProfileData = {
      id: `child-${Date.now()}-${Math.round(Math.random() * 10000)}`,
      displayName: input.displayName,
      avatarId: input.avatarId,
      level: input.level,
      // Standaard aan (op verzoek) — de ouder kan 'm alsnog uitzetten via
      // het instellingenmenu op het reispad (hfst. 23, 30: opt-out blijft
      // mogelijk, blokkeert de les nooit).
      microphoneOptIn: true,
      // null = automatisch (bestaande voorkeursvolgorde); de ouder/het kind
      // kan later een vaste stem kiezen via het instellingenmenu.
      preferredVoicePersona: null,
      speakFirstMode: false,
      // Standaard aan (op verzoek): een spreekoefening is klaar na 3x
      // inspreken, ongeacht of het (bijna) exact matchte — zie
      // src/domain/pronunciationLeniency.ts.
      lenientPronunciationMode: true,
      points: 0,
      earnedBadgeSlugs: [],
      itemStats: {},
      completedLessonIds: [],
      practiceDatesIso: [],
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, children: [...prev.children, child] }));
    return child;
  }, []);

  const getChild = useCallback((childId: string) => state.children.find((c) => c.id === childId), [state.children]);

  const recordExerciseAttempt = useCallback<AppStore["recordExerciseAttempt"]>((childId, attempt) => {
    setState((prev) => ({
      ...prev,
      children: prev.children.map((child) => {
        if (child.id !== childId) return child;
        const stats = { ...child.itemStats };
        const current = stats[attempt.vocabularyItemId] ?? { correct: 0, incorrect: 0 };
        stats[attempt.vocabularyItemId] = {
          correct: current.correct + (attempt.isCorrect ? 1 : 0),
          incorrect: current.incorrect + (attempt.isCorrect ? 0 : 1),
        };
        return { ...child, itemStats: stats };
      }),
    }));
  }, []);

  const completeLesson = useCallback<AppStore["completeLesson"]>((childId, lessonId, input) => {
    let newlyEarned: string[] = [];
    setState((prev) => ({
      ...prev,
      children: prev.children.map((child) => {
        if (child.id !== childId) return child;

        const points = computeLessonPoints(input);
        const attempts: ExerciseAttemptRecord[] = Object.entries(child.itemStats).flatMap(([vocabularyItemId, s]) => [
          ...Array(s.correct).fill({ vocabularyItemId, isCorrect: true, attemptNumber: 1 }),
          ...Array(s.incorrect).fill({ vocabularyItemId, isCorrect: false, attemptNumber: 1 }),
        ]);
        const mastery = computeMastery(attempts);
        const totalCorrect = mastery.reduce((sum, m) => sum + m.timesCorrect, 0);

        const isFirstCompletedExercise = child.completedLessonIds.length === 0;
        const alreadyCompleted = child.completedLessonIds.includes(lessonId);
        const completedLessonIds = alreadyCompleted
          ? child.completedLessonIds
          : [...child.completedLessonIds, lessonId];

        const earnedSlugs = evaluateEarnedBadges({
          totalCorrectAnswers: totalCorrect,
          totalSpokenAttempts: 1, // demo: nazegoefening is onderdeel van elke les
          // "Dierenkenner" hoort alleen bij het dieren-thema — bij een
          // gegenereerde les voor een andere categorie (lessonCatalog.ts)
          // wordt dit themabadge dus niet toegekend (input.awardThemeBadge).
          themeCompleted: input.awardThemeBadge ?? true,
          isFirstCompletedExercise,
        });

        newlyEarned = earnedSlugs.filter((slug) => !child.earnedBadgeSlugs.includes(slug));

        return {
          ...child,
          points: child.points + points,
          completedLessonIds,
          earnedBadgeSlugs: Array.from(new Set([...child.earnedBadgeSlugs, ...earnedSlugs])),
          practiceDatesIso: recordPracticeDay(child.practiceDatesIso, todayIso()),
          lessonProgress: null, // les is afgerond, geen hervatpunt meer nodig
        };
      }),
    }));
    return newlyEarned;
  }, []);

  const setSpeakFirstMode = useCallback<AppStore["setSpeakFirstMode"]>((childId, enabled) => {
    setState((prev) => ({
      ...prev,
      children: prev.children.map((child) => (child.id === childId ? { ...child, speakFirstMode: enabled } : child)),
    }));
  }, []);

  const setLenientPronunciationMode = useCallback<AppStore["setLenientPronunciationMode"]>((childId, enabled) => {
    setState((prev) => ({
      ...prev,
      children: prev.children.map((child) =>
        child.id === childId ? { ...child, lenientPronunciationMode: enabled } : child,
      ),
    }));
  }, []);

  // Expliciete ouder-toestemming voor microfoongebruik (hfst. 23, 30) — staat
  // standaard aan bij aanmaken van een profiel; hier kan een ouder 'm uitzetten.
  const setMicrophoneOptIn = useCallback<AppStore["setMicrophoneOptIn"]>((childId, enabled) => {
    setState((prev) => ({
      ...prev,
      children: prev.children.map((child) => (child.id === childId ? { ...child, microphoneOptIn: enabled } : child)),
    }));
  }, []);

  // Onthoudt waar een kind gebleven was in een niet-afgemaakte les (bv. na
  // sluiten van de browser tussendoor), zodat de les hervat kan worden i.p.v.
  // steeds opnieuw te beginnen. Wordt gewist zodra de les wél is afgerond
  // (zie completeLesson) of expliciet overgeslagen naar een andere les.
  const setLessonProgress = useCallback<AppStore["setLessonProgress"]>((childId, progress) => {
    setState((prev) => ({
      ...prev,
      children: prev.children.map((child) => (child.id === childId ? { ...child, lessonProgress: progress } : child)),
    }));
  }, []);

  // Laat de gebruiker zelf kiezen welke opgenomen stem (man/vrouw/jongen/
  // meisje) gebruikt wordt, i.p.v. altijd automatisch de vaste
  // voorkeursvolgorde in referenceAudio.ts — nuttig zodra er voor
  // hetzelfde woord meerdere persona's zijn ingesproken.
  const setPreferredVoicePersona = useCallback<AppStore["setPreferredVoicePersona"]>((childId, persona) => {
    setState((prev) => ({
      ...prev,
      children: prev.children.map((child) =>
        child.id === childId ? { ...child, preferredVoicePersona: persona } : child,
      ),
    }));
  }, []);

  const value = useMemo<AppStore>(
    () => ({
      state,
      ready,
      setParentEmail,
      createChildProfile,
      getChild,
      recordExerciseAttempt,
      completeLesson,
      setSpeakFirstMode,
      setLenientPronunciationMode,
      setMicrophoneOptIn,
      setLessonProgress,
      setPreferredVoicePersona,
    }),
    [
      state,
      ready,
      setParentEmail,
      createChildProfile,
      getChild,
      recordExerciseAttempt,
      completeLesson,
      setSpeakFirstMode,
      setLenientPronunciationMode,
      setMicrophoneOptIn,
      setLessonProgress,
      setPreferredVoicePersona,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore moet binnen AppStoreProvider gebruikt worden");
  return ctx;
}
