"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { useAppStore } from "@/lib/store";
import { DEMO_BADGES, DIEREN_THEME } from "@/lib/demoData";
import { DAILY_SENTENCES_LESSON_ID, categorySlugForGenericLessonId, getGenericLessonById } from "@/lib/lessonCatalog";
import { getDailySentenceContent, type DailySentenceContent } from "@/lib/dailySentenceContentClient";
import { getPracticeContent, type PracticeContent } from "@/lib/practiceContentClient";
import { getWordsContent, mergeCategories } from "@/lib/wordsContentClient";
import type { CategoryDefinition } from "@/lib/contentCatalog";
import { getItemIdsWithRecordings } from "@/lib/referenceAudio";
import { ImageAndWord } from "@/components/exercises/ImageAndWord";
import { ListenAndSpeak } from "@/components/exercises/ListenAndSpeak";
import { RepeatAfterMe } from "@/components/exercises/RepeatAfterMe";
import { SpeakFromPicture } from "@/components/exercises/SpeakFromPicture";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AutoplayIndicator } from "@/components/ui/AutoplayIndicator";
import { CategoryCompleteScreen } from "@/components/rewards/CategoryCompleteScreen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { applySpeakFirstMode } from "@/domain/lessonMode";
import type { ExerciseView } from "@/types/domain";

/**
 * Lesscherm: sequentiële oefeningen, één taak per scherm (hfst. 7.3, 55).
 * Moeilijke woorden (2x fout) worden aan het eind van de les herhaald
 * (hfst. 13.13 herhaalles, vereenvoudigd voor de MVP).
 */
export default function LessonPage() {
  const params = useParams<{ childId: string; lessonId: string }>();
  const { getChild, recordExerciseAttempt, completeLesson, setLessonProgress, setAutoplayAudio, ready } = useAppStore();

  // Dieren blijft op zijn handmatig samengestelde thema (met zinnetjes-
  // afsluiting); alle andere categorieën met genoeg opnames krijgen een
  // gegenereerde les (zie src/lib/lessonCatalog.ts). "isDierenLesson"
  // bepaalt of het themabadge ("Dierenkenner") mag worden toegekend — die
  // hoort niet bij een andere categorie (zie completeLesson hieronder).
  const [practiceContent, setPracticeContent] = useState<PracticeContent | null>(null);
  const [dailySentenceContent, setDailySentenceContent] = useState<DailySentenceContent | null>(null);
  const [categories, setCategories] = useState<CategoryDefinition[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getPracticeContent().then((content) => {
      if (!cancelled) setPracticeContent(content);
    });
    getDailySentenceContent().then((content) => {
      if (!cancelled) setDailySentenceContent(content);
    });
    getWordsContent().then((content) => {
      if (!cancelled) setCategories(mergeCategories(content));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const dierenLesson = DIEREN_THEME.lessons.find((l) => l.id === params.lessonId);
  const lesson =
    dierenLesson ??
    (practiceContent && dailySentenceContent && categories
      ? getGenericLessonById(params.lessonId, practiceContent, dailySentenceContent, categories)
      : null);
  const isDierenLesson = Boolean(dierenLesson);
  // Child alvast ophalen (kan nog undefined zijn vóór "ready") zodat de
  // gekozen oefenvorm (hfst. 13.11) direct bij de start van de les geldt.
  const childForInit = getChild(params.childId);

  const [recordedIds, setRecordedIds] = useState<Set<string> | null>(null);
  useEffect(() => {
    let cancelled = false;
    getItemIdsWithRecordings().then((ids) => {
      if (!cancelled) setRecordedIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Alleen oefeningen met een écht ingesproken opname horen thuis in de les
  // — anders zou het kind bij een woord of zin gewoon Nederlandse TTS te
  // horen krijgen (zelfde regel als Ontdekken/het matchspel, zie
  // getItemIdsWithRecordings).
  const lessonExercises = useMemo(() => {
    if (!lesson || !recordedIds) return null;
    return lesson.exercises.filter((exercise) => recordedIds.has(exercise.vocabularyItem.id));
  }, [lesson, recordedIds]);

  const [queue, setQueue] = useState<ExerciseView[] | null>(null);
  const [index, setIndex] = useState(0);

  // Queue/index pas invullen zodra de opnamen bekend zijn (recordedIds) —
  // niet meteen bij mount, anders zit de ongefilterde lijst er al in vóór
  // het filter kan draaien.
  useEffect(() => {
    if (queue !== null || !lessonExercises) return;
    const base = childForInit?.speakFirstMode ? applySpeakFirstMode(lessonExercises) : lessonExercises;
    setQueue(base);
    // Bij een tussentijds afgesloten les: hervat waar het kind gebleven was
    // i.p.v. steeds bij het begin te beginnen (zie setLessonProgress).
    const saved = childForInit?.lessonProgress;
    if (saved && lesson && saved.lessonId === lesson.id) {
      setIndex(Math.min(Math.max(saved.index, 0), Math.max(base.length - 1, 0)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, lessonExercises]);

  const [correctCount, setCorrectCount] = useState(0);
  const [retryQueue, setRetryQueue] = useState<ExerciseView[]>([]);
  const [wrongCounts, setWrongCounts] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState<{ points: number; newBadges: string[] } | null>(null);

  useEffect(() => {
    if (!childForInit || !lesson || finished || queue === null) return;
    setLessonProgress(childForInit.id, { lessonId: lesson.id, index });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, lesson?.id, childForInit?.id, finished, queue]);

  // Pijltjestoetsen op desktop (← vorige, → overslaan) en swipen op mobiel
  // (zelfde acties). "Latest ref"-patroon i.p.v. de handlers rechtstreeks in
  // de dependency-array: goToPrevious/handleSkip worden pas verderop in deze
  // component gedefinieerd (en zijn alleen zinvol als de les echt klaar
  // staat), dus wordt de ref alleen gevuld op het moment dat het lesscherm
  // ook daadwerkelijk interactief getoond wordt (zie verderop) — op elk
  // ander scherm (laden/klaar/leeg) blijft hij null en doet een toets niets.
  const keyboardHandlersRef = useRef<{ onPrevious: () => void; onSkip: () => void } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const handlers = keyboardHandlersRef.current;
      if (!handlers) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "ArrowLeft") handlers.onPrevious();
      else if (event.key === "ArrowRight") handlers.onSkip();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!ready || practiceContent === null || dailySentenceContent === null || categories === null)
    return <p className="text-center text-gray-500">Even laden…</p>;
  const child = getChild(params.childId);
  if (!child || !lesson) return notFound();
  if (!recordedIds || queue === null) return <p className="text-center text-gray-500">Even laden…</p>;

  // Losse, expliciet niet-nullable naam zodat TypeScript de null-check ook
  // binnen de onderstaande geneste functies (goToNext e.d.) kan volgen.
  const currentQueue: ExerciseView[] = queue;
  const currentExercise = currentQueue[index];

  function handleAnswer(exercise: ExerciseView, isCorrect: boolean) {
    recordExerciseAttempt(child!.id, {
      vocabularyItemId: exercise.vocabularyItem.id,
      isCorrect,
      attemptNumber: 1,
      isSpoken:
        exercise.type === "NAZEGGEN" ||
        exercise.type === "ZELFSTANDIG_SPREKEN" ||
        exercise.type === "LUISTEREN_EN_HERKENNEN",
    });

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCounts((prev) => {
        const next = { ...prev, [exercise.vocabularyItem.id]: (prev[exercise.vocabularyItem.id] ?? 0) + 1 };
        return next;
      });
      // Woorden die 2x fout gaan komen aan het eind terug (hfst. 13.13)
      setRetryQueue((prev) => [...prev, exercise]);
    }
    goToNext();
  }

  /** Woord overslaan zonder te scoren — telt niet als goed of fout (hfst. 22: nooit dwingen). */
  function handleSkip() {
    goToNext();
  }

  function goToPrevious() {
    if (index > 0) setIndex((i) => i - 1);
  }

  function goToNext() {
    if (index + 1 < currentQueue.length) {
      setIndex((i) => i + 1);
      return;
    }
    if (retryQueue.length > 0) {
      setQueue(retryQueue);
      setRetryQueue([]);
      setIndex(0);
      return;
    }
    const totalExercises = lessonExercises?.length ?? 0;
    const points = totalExercises; // grove indicatie; exacte score via computeLessonPoints in store
    const newBadges = completeLesson(child!.id, lesson!.id, {
      totalExercises,
      correctExercises: correctCount + 1,
      awardThemeBadge: isDierenLesson,
    });
    setFinished({ points, newBadges });
  }

  // Categorie voor de "Match het geluid"-knop op het afrondingsscherm
  // hieronder — Dieren heeft een eigen (niet-gegenereerd) lessonId, dus
  // die slug ligt al vast; bij de overige lessen wordt hij afgeleid uit
  // het lessonId (zie categorySlugForGenericLessonId). null bij de
  // Dagelijkse zinnen-les, die knop verschijnt dan niet.
  const matchGameCategorySlug = isDierenLesson
    ? DIEREN_THEME.slug
    : lesson
      ? categorySlugForGenericLessonId(lesson.id)
      : null;

  if (finished) {
    // Geen navigatie meer mogelijk (of zinvol) op het afrondingsscherm —
    // anders zou een pijltoets/swipe hier per ongeluk de les nogmaals
    // kunnen "voltooien" via handleSkip -> goToNext.
    keyboardHandlersRef.current = null;
    return (
      <CategoryCompleteScreen title="Les voltooid!" subtitle={`Goed gedaan, ${child.displayName}!`}>
        {finished.newBadges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {finished.newBadges.map((slug) => {
              const badge = DEMO_BADGES[slug];
              if (!badge) return null;
              return (
                <Card key={slug} className="flex w-32 flex-col items-center gap-1">
                  <span className="text-4xl" aria-hidden="true">
                    {badge.emoji}
                  </span>
                  <span className="text-sm font-semibold">{badge.titleNl}</span>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <Link href={`/kind/${child.id}/route`}>
            <Button variant="secondary">Naar leerroute</Button>
          </Link>
          {matchGameCategorySlug && (
            <Link href={`/kind/${child.id}/ontdekken/spel?categorie=${matchGameCategorySlug}`}>
              <Button variant="secondary">🔊 Match het geluid</Button>
            </Link>
          )}
        </div>
      </CategoryCompleteScreen>
    );
  }

  if (!currentExercise) {
    // Kan gebeuren als er (nog) geen enkel woord in deze les een ingesproken
    // opname heeft — het kind mag hier nooit vast komen te zitten (hfst. 22).
    keyboardHandlersRef.current = null;
    return (
      <main className="flex flex-col items-center gap-4 pt-12 text-center">
        <p className="text-4xl" aria-hidden="true">
          🎤
        </p>
        <p className="text-gray-500">Deze les heeft nog geen ingesproken woorden.</p>
        <Link href={`/kind/${child.id}/route`}>
          <Button>Naar leerroute</Button>
        </Link>
      </main>
    );
  }

  // Nu pas vullen: alleen op dit scherm (echte les, geen laad/klaar/leeg-
  // toestand) doen pijltoetsen/swipes ook echt iets.
  keyboardHandlersRef.current = { onPrevious: goToPrevious, onSkip: handleSkip };

  const SWIPE_THRESHOLD_PX = 60;

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    // Duidelijk horizontaal én lang genoeg, anders telt het als scrollen/tikken.
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;
    if (deltaX < 0) handleSkip(); // swipe naar links = volgende/overslaan
    else goToPrevious(); // swipe naar rechts = vorige
  }

  return (
    <main
      className="mx-auto flex w-full max-w-2xl flex-col gap-4 overflow-x-hidden px-4 py-6 sm:px-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Statusbalk: terug, voortgang, en een klein icoon dat toont/omschakelt
          of geluid automatisch afspeelt (rode streep = uit) — puur een
          schakelaar, geen afspeelknop. Nog een keer horen kan via de
          "Afspelen"-knop bij de oefening zelf, zie AudioButton hieronder. */}
      <div className="flex items-center gap-1">
        <Link
          href={`/kind/${child.id}/route`}
          aria-label="Terug naar de leerroute (je voortgang wordt bewaard)"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-ink-muted
            hover:bg-cream focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        >
          <span aria-hidden="true">←</span>
        </Link>

        <div className="flex-1">
          <ProgressBar current={index} total={currentQueue.length} />
        </div>

        <AutoplayIndicator
          enabled={child.autoplayAudio}
          onToggle={(enabled) => setAutoplayAudio(child.id, enabled)}
        />
      </div>

      {currentExercise.vocabularyItem.itemKind === "zin" && lesson.id !== DAILY_SENTENCES_LESSON_ID && (
        <p className="text-center text-xs font-bold uppercase tracking-wide text-clay-500">
          🎉 Bijna klaar — nu in een hele zin!
        </p>
      )}

      {/* Vorige/overslaan-navigatie zit nu ín elke oefening zelf, geflankeerd
          om de foto (of woordtekst) via NavFlankedRow — zo blijven de
          knoppen verticaal gecentreerd op dat vaste element, ongeacht hoe
          hoog de feedback/knoppen eronder wisselend uitvallen. */}
      <div className="min-w-0 flex-1">
        {currentExercise.type === "AFBEELDING_EN_WOORD" && (
          <ImageAndWord
            key={currentExercise.id}
            item={currentExercise.vocabularyItem}
            onDone={() => handleAnswer(currentExercise, true)}
            preferredPersona={child.preferredVoicePersona}
            autoplayAudio={child.autoplayAudio}
            onPrevious={goToPrevious}
            previousDisabled={index === 0}
            onNext={handleSkip}
          />
        )}

        {currentExercise.type === "LUISTEREN_EN_HERKENNEN" && (
          <ListenAndSpeak
            key={currentExercise.id}
            item={currentExercise.vocabularyItem}
            childId={child.id}
            microphoneOptIn={child.microphoneOptIn}
            onDone={(isCorrect) => handleAnswer(currentExercise, isCorrect)}
            preferredPersona={child.preferredVoicePersona}
            lenientPronunciationMode={child.lenientPronunciationMode}
            autoplayAudio={child.autoplayAudio}
            onPrevious={goToPrevious}
            previousDisabled={index === 0}
            onNext={handleSkip}
          />
        )}

        {currentExercise.type === "NAZEGGEN" && (
          <RepeatAfterMe
            key={currentExercise.id}
            item={currentExercise.vocabularyItem}
            microphoneOptIn={child.microphoneOptIn}
            onDone={(isCorrect) => handleAnswer(currentExercise, isCorrect)}
            preferredPersona={child.preferredVoicePersona}
            lenientPronunciationMode={child.lenientPronunciationMode}
            autoplayAudio={child.autoplayAudio}
            onPrevious={goToPrevious}
            previousDisabled={index === 0}
            onNext={handleSkip}
          />
        )}

        {currentExercise.type === "ZELFSTANDIG_SPREKEN" && (
          <SpeakFromPicture
            key={currentExercise.id}
            item={currentExercise.vocabularyItem}
            microphoneOptIn={child.microphoneOptIn}
            onDone={(isCorrect) => handleAnswer(currentExercise, isCorrect)}
            preferredPersona={child.preferredVoicePersona}
            lenientPronunciationMode={child.lenientPronunciationMode}
            autoplayAudio={child.autoplayAudio}
            onPrevious={goToPrevious}
            previousDisabled={index === 0}
            onNext={handleSkip}
          />
        )}
      </div>
    </main>
  );
}
