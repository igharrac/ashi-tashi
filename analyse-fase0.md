# Ashi & Tashi — Fase 0: Productfundament

Werktitel: **Ashi & Tashi**. Analyse volgens hoofdstuk 56 van het master build brief.

## 1. Interpretatie van het product

Een audio-first, afbeeldingen-first leerapp (PWA) waarmee kinderen (6–14 jaar) in de diaspora Tashelhit leren via korte, speelse oefeningen, zonder dat lezen een vereiste is. Geen Duolingo-kloon: kleinere, gerichte scope, met menselijke taalreview als hard vereiste voordat content live gaat. De eerste versie is een verticale slice (één thema, volledige flow), niet een brede maar oppervlakkige functieset.

## 2. Belangrijkste aannames

- Eerste leertaal (interfacetaal) is Nederlands; architectuur is vanaf dag 1 meertalig (geen hardcoded NL/Tashelhit-koppeling).
- Alle Tashelhit-content in de MVP is **placeholder** totdat een native speaker reviewt; er wordt niets verzonnen.
- TTS/STT/uitspraakbeoordeling worden als vervangbare providers gemockt in de MVP — geen live API-sleutels nodig om te bouwen of te testen.
- Eén kind kan meerdere ouders/verzorgers hebben; één ouder kan meerdere kinderprofielen beheren (lokaal, geen verplichte cloud-account voor MVP-test).
- Database: lokaal PostgreSQL via Prisma tijdens ontwikkeling; Supabase-koppeling is een latere, aparte stap (vereist accountgegevens van de gebruiker).
- "Af" voor de MVP betekent: technisch werkende, geteste, toegankelijke verticale slice met duidelijk gemarkeerde placeholder-taalcontent — niet: gepubliceerde, taalkundig goedgekeurde content.

## 3. Kernproblemen die het product oplost

Kinderen in de diaspora horen Tashelhit thuis, maar spreken het nauwelijks; bestaande taalapps (Duolingo e.d.) ondersteunen de taal niet en zijn niet ontworpen voor kinderen die nog niet vlot lezen. Ashi & Tashi verlaagt de drempel: horen → herkennen → nazeggen, in korte speelse stappen, met positieve feedback in plaats van schoolse toetsing.

## 4. MVP-afbakening

**Wel in MVP:** ouder-/kindprofiel + avatar, één thema (Dieren, 8–12 items), kernoefentypen (luisteren+koppelen, afbeelding+woord, nazeggen met vriendelijke mock-feedback, herhaling), lesafronding met punten/badge, eenvoudig ouderoverzicht, provider-interfaces met mocks, reviewstatus-veld op elk taalitem.

**Niet in MVP** (hoofdstuk 49): vrije AI-chat, publieke community/ranglijsten, betalingen, native apps, volledig CMS, definitieve uitspraakscore, meerdere dialecten tegelijk.

## 5. Belangrijkste gebruikers

Primair: kind (6–14, drie niveaus A/B/C). Secundair: ouder/verzorger (profielbeheer, voortgang inzien). Later: taalreviewer, audioreviewer, contentmaker — voor MVP alleen als datamodel-rollen voorbereid, niet als UI.

## 6. User stories (selectie)

- Als ouder wil ik snel een kinderprofiel met avatar aanmaken, zodat mijn kind direct kan beginnen zonder lange registratie.
- Als kind wil ik een afbeelding zien en het woord horen, zodat ik de betekenis begrijp zonder te hoeven lezen.
- Als kind wil ik een woord opnieuw of vertraagd kunnen beluisteren, zodat ik het rustig kan leren.
- Als kind wil ik een woord nazeggen en vriendelijke feedback krijgen, zodat ik durf te oefenen zonder bang te zijn voor fouten.
- Als kind wil ik na een les een badge krijgen, zodat het voelt alsof ik iets heb bereikt.
- Als ouder wil ik zien welke woorden mijn kind moeilijk vindt, zodat ik kan helpen oefenen.

## 7. Informatiearchitectuur

```
App
├─ Ouder-onboarding (profiel aanmaken)
├─ Kindprofiel-selectie / aanmaken (+ avatar, niveau)
├─ Leerroute-overzicht (thema's, hier: Dieren)
│   └─ Les
│       └─ Oefeningen (sequentieel, één taak per scherm)
│           └─ Lesafronding (punten, badge)
└─ Ouderoverzicht (los toegankelijk, evt. met eenvoudige pincode)
```

## 8. Eerste gebruikersflow

Ouder opent app → maakt profiel → maakt kindprofiel → kind kiest avatar → kind ziet leerroute → start thema Dieren → per item: afbeelding zien, woord horen, juiste afbeelding kiezen, optioneel herhalen/vertraagd afspelen, woord nazeggen (microfoon optioneel), vriendelijke feedback → moeilijke woorden worden herhaald → les voltooid → punten + badge → voortgang opgeslagen → ouder bekijkt overzicht.

## 9. UX- en visueel ontwerp — principes

Toegepast: audio-first, afbeeldingen-first, één taak per scherm, grote touch-targets, geen tekst-afhankelijke navigatie voor niveau A, directe positieve feedback, geen strafmechanismen, rustige kleurrijke stijl (niet kinderachtig/betuttelend), WCAG 2.2 AA als basis.

Overgenomen patronen (geanalyseerd, niet gekopieerd): Khan Academy Kids (grote tapbare illustraties, geen leesvereiste), Duolingo (korte lessen, duidelijke voortgangsindicator — maar zonder harde streaks/schuldgevoel), Endless Alphabet (audio+beweging als betekenisdrager).

Bewust vermeden: competitieve ranglijsten (Duolingo), agressieve streak-schuldgevoel-mechanismen, advertenties/lootboxes (veel kids-apps), overdreven mascotte-personage-druk.

## 10. Voorgestelde technische stack

Next.js 14 (App Router) + React + TypeScript strict, Tailwind CSS, Prisma ORM + PostgreSQL, providerinterfaces voor TTS/STT/uitspraak (mock-implementaties in MVP), Vitest voor unit tests, Playwright voor e2e (opgezet, niet uitputtend ingevuld), PWA-manifest voorbereid.

## 11. Technische architectuur (hoofdlijnen)

Gelaagd: UI-componenten (presentatie) → domeinlogica (voortgang, spaced-repetition-stub, badge-regels — puur functies, testbaar) → providerinterfaces (I/O naar externe diensten, vervangbaar) → data-laag (Prisma/Postgres). Geen contentstrings hardcoded in UI; alles via seed data / later CMS. Feature flags voorbereid voor experimentele functies.

## 12. Datamodel — hoofdlijnen (MVP-subset)

Kernentiteiten voor deze slice: `ParentAccount`, `ChildProfile`, `Language`, `Dialect`, `VocabularyItem` (met `reviewStatus`, `latinSpelling`, `translationNl`, `imageAsset`, `audioAsset`), `Theme`/`Lesson`, `Exercise`, `LessonAttempt`, `ExerciseAttempt`, `LearnerProgress`, `Badge`/`EarnedBadge`. Overige ~40 entiteiten uit hoofdstuk 39 (roles, content_reviews, offline_packages, enz.) staan in het schema als toekomstige uitbreiding gedocumenteerd, niet allemaal geïmplementeerd in de MVP-tabellen.

## 13. Voice-architectuur

`TextToSpeechProvider`-interface zoals gespecificeerd in hoofdstuk 18; MVP gebruikt een `MockTtsProvider` die vooraf gegenereerde/placeholder-audiobestanden teruggeeft — geen browser-side API-sleutels, alle aanroepen lopen (conceptueel) via de backend-laag.

## 14. Uitspraakstrategie

`PronunciationAssessmentProvider`-interface (hoofdstuk 22) met een `MockPronunciationProvider` die altijd vriendelijke, niet-beschamende feedback geeft zonder schijnprecisie (geen percentagescore). Echte beoordeling is een latere providerkoppeling.

## 15. Privacy- en veiligheidsrisico's

Microfoonaudio van kinderen is gevoelig: MVP verwerkt opnames alleen lokaal/tijdelijk (geen permanente opslag in de mock-flow), microfoon is optioneel en blokkeert de les niet bij weigering. Nog niet gedaan in deze stap: juridische AVG-toetsing, echte consent-flow, encryptie-at-rest — expliciet gemarkeerd als openstaand voor een jurist/latere stap.

## 16. Belangrijkste technische risico's

Provider-lock-in (ondervangen door interfaces), datamodel te vroeg versimpelen tot alleen NL/Tashelhit (ondervangen door taal/dialect als generieke tabellen), schijnzekerheid bij uitspraakbeoordeling (ondervangen door geen scores te tonen), contentkwaliteit (ondervangen door verplicht reviewstatus-veld en placeholders).

## 17. Gefaseerde roadmap

Fase 0 Productfundament (dit document) → Fase 1 Verticale MVP (deze bouwstap) → Fase 2 Contentfundament (CMS, rollen, reviewworkflow) → Fase 3 Slim leren (spaced repetition, adaptief) → Fase 4 Conversaties → Fase 5 Community/familie → Fase 6 Uitbreiding (andere Amazigh-varianten, native apps).

## 18. Backlog eerste verticale slice

1. Projectscaffold (Next.js/TS/Tailwind/Prisma).
2. Prisma-schema MVP-subset + migratie + seed.
3. Provider-interfaces + mocks (TTS, uitspraakbeoordeling).
4. Seeddata thema Dieren (8–12 items, placeholders, reviewStatus).
5. Ouder/kindprofiel-flow (lokaal, geen echte auth in MVP-stap).
6. Leerroute- en lesscherm met oefentypen.
7. Voortgang + badge-logica (puur, testbaar).
8. Ouderoverzicht-scherm.
9. Unit tests kernlogica.
10. README + .env.example.

## 19. Folderstructuur

```
ashi-tashi/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/                     # Next.js App Router routes
│  │  ├─ page.tsx              # ouder-onboarding / profielkeuze
│  │  ├─ profiel/nieuw/
│  │  ├─ kind/[childId]/route/
│  │  ├─ kind/[childId]/les/[lessonId]/
│  │  └─ ouder/overzicht/
│  ├─ components/
│  │  ├─ exercises/            # oefentype-componenten
│  │  └─ ui/                   # herbruikbare basiscomponenten
│  ├─ domain/
│  │  ├─ progress.ts           # voortgang- en badge-logica (puur)
│  │  └─ spacedRepetition.ts   # eenvoudige stub
│  ├─ providers/
│  │  ├─ tts/                  # TextToSpeechProvider + mock
│  │  └─ pronunciation/        # PronunciationAssessmentProvider + mock
│  ├─ lib/                     # prisma client, utils
│  └─ types/
├─ tests/
│  └─ domain/
├─ .env.example
└─ README.md
```

## 20. Eerste implementatiestap — exacte bestanden

`prisma/schema.prisma`, `prisma/seed.ts`, `src/providers/tts/types.ts` + `mockTtsProvider.ts`, `src/providers/pronunciation/types.ts` + `mockPronunciationProvider.ts`, `src/domain/progress.ts`, `src/domain/badges.ts`, `src/components/exercises/ListenAndChoose.tsx`, `src/components/exercises/ImageAndWord.tsx`, `src/components/exercises/RepeatAfterMe.tsx`, `src/app/page.tsx` t/m `ouder/overzicht/page.tsx`, `tests/domain/progress.test.ts`, `tests/domain/badges.test.ts`, `README.md`, `.env.example`.

Deze stap wordt nu gebouwd.
