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
import type { AppStateData, ChildProfileData, ExperienceLevel } from "@/types/domain";
import { evaluateEarnedBadges } from "@/domain/badges";
import { computeLessonPoints, computeMastery, type ExerciseAttemptRecord } from "@/domain/progress";

const STORAGE_KEY = "ashi-tashi:mvp-demo-state:v1";

function createEmptyState(): AppStateData {
  return { parentEmail: null, children: [] };
}

function loadState(): AppStateData {
  if (typeof window === "undefined") return createEmptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    return JSON.parse(raw) as AppStateData;
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
  completeLesson: (childId: string, lessonId: string, input: { totalExercises: number; correctExercises: number }) => string[];
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
      microphoneOptIn: false,
      points: 0,
      earnedBadgeSlugs: [],
      itemStats: {},
      completedLessonIds: [],
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
          themeCompleted: true, // demo heeft één les = hele thema
          isFirstCompletedExercise,
        });

        newlyEarned = earnedSlugs.filter((slug) => !child.earnedBadgeSlugs.includes(slug));

        return {
          ...child,
          points: child.points + points,
          completedLessonIds,
          earnedBadgeSlugs: Array.from(new Set([...child.earnedBadgeSlugs, ...earnedSlugs])),
        };
      }),
    }));
    return newlyEarned;
  }, []);

  const value = useMemo<AppStore>(
    () => ({ state, ready, setParentEmail, createChildProfile, getChild, recordExerciseAttempt, completeLesson }),
    [state, ready, setParentEmail, createChildProfile, getChild, recordExerciseAttempt, completeLesson],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore moet binnen AppStoreProvider gebruikt worden");
  return ctx;
}
