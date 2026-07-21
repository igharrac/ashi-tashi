# Ashi & Tashi — verticale MVP-slice

Interactieve Tashelhit-taalapp voor kinderen. Dit is de eerste verticale
slice (hoofdstuk 55 van het brief): één thema ("Dieren"), lokale
ouder-/kindprofielen, kernoefentypen, voortgang, badges en een
ouderoverzicht — volledig werkend, getest, met placeholder-taalcontent.

## Belangrijk: taalcontent is placeholder

Alle Tashelhit-woorden in de seeddata (`prisma/seed.ts`, `src/lib/demoData.ts`)
zijn gemarkeerd als `TE_REVIEWEN` met de tekst
`[TASHELHIT_WORD_REVIEW_REQUIRED:...]`. Er is niets verzonnen. Niets hiervan
mag als definitieve leercontent gepubliceerd worden voordat een native
speaker het heeft gereviewd (hoofdstuk 3, 21, 54 van het brief).

## Status van deze stap

- ✅ `npm run typecheck` — slaagt
- ✅ `npm run build` — slaagt (Next.js production build)
- ✅ `npm test` — 14/14 tests slagen
- ⚠️ `npm run db:generate` / `npm run db:migrate` / `npm run db:seed` zijn
  **niet uitgevoerd** in de bouwomgeving: het sandbox-netwerk blokkeerde de
  download van Prisma-engine-binaries (`binaries.prisma.sh`). Draai deze
  commando's op een machine met normale internettoegang voordat je de
  database daadwerkelijk gebruikt. De UI-flow zelf gebruikt in deze stap
  bewust nog geen live database (zie hieronder).

## Hoe deze slice werkt

Om de volledige gebruikersflow te kunnen bouwen én testen zonder een
databaseverbinding of API-sleutels, praat de UI-laag (`src/app/**`) met een
lichte client-side store (`src/lib/store.tsx`) die profielen en voortgang in
`localStorage` bewaart, gevuld met statische seeddata
(`src/lib/demoData.ts`). Dit is een bewuste, tijdelijke keuze — zie
hoofdstuk 11.1: "ouder of begeleider kan een account of lokaal profiel
aanmaken".

Het **Prisma-schema** (`prisma/schema.prisma`) beschrijft het bedoelde
productie-datamodel (hoofdstuk 39-subset) en `prisma/seed.ts` bevat dezelfde
Dieren-content in die vorm. De volgende bouwstap is: API-routes onder
`src/app/api/**` toevoegen die tegen Prisma werken, en `src/lib/store.tsx`
laten praten met die routes in plaats van `localStorage`. De datavormen in
`src/types/domain.ts` zijn daar bewust dicht bij gehouden.

## Provider-abstracties

`src/providers/tts/` en `src/providers/pronunciation/` bevatten de
interfaces uit hoofdstuk 18 en 22, met werkende mock-implementaties. Er is
geen echte TTS/STT-koppeling nodig om deze slice te draaien of te testen.
Zie `.env.example` voor hoe een echte provider later aangesloten wordt
(altijd server-side, nooit een API-sleutel in frontend-code).

## Installatie

```bash
npm install
cp .env.example .env   # pas DATABASE_URL later aan indien je Prisma gebruikt, en zet STUDIO_PASSWORD
npm run dev
```

App draait op http://localhost:3000.

## Opnamestudio (`/studio/opnames`)

Interne, wachtwoord-beveiligde pagina om zelf audio in te spreken voor
woorden en zinnen, per persona (man/vrouw/jongen/meisje — hoofdstuk 19.1).
Volledig technisch ontwerp: [ARCHITECTUUR-OPNAMESTUDIO.md](./ARCHITECTUUR-OPNAMESTUDIO.md).

Kort:
1. Zet `STUDIO_PASSWORD` in `.env` (verplicht — leeg laten houdt de studio dicht).
2. `npm run dev`, ga naar `http://localhost:3000/studio/login`.
3. Per woord/zin en per persona: opnemen, beluisteren, opslaan, en zelf
   goed- of afkeuren (menselijke review, hoofdstuk 21 — niets wordt
   automatisch gepubliceerd).

**Belangrijk:** deze tool schrijft audiobestanden naar de lokale schijf
(`public/audio/recordings/`) en een manifest (`data/recordings-manifest.json`).
Dat werkt alleen als je de app lokaal draait — **niet** op Vercel, waar het
bestandssysteem read-only is. Commit de opnames + het manifest naar git zoals
je gewend bent; op Vercel worden ze dan gewoon als statische bestanden
meegedeployed voor afspelen (alleen opnemen kan daar niet).

## Database (optionele volgende stap)

```bash
# Vereist een lokale PostgreSQL-instance en normale internettoegang
# (voor het downloaden van Prisma-engine-binaries)
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Scripts

| Commando | Omschrijving |
|---|---|
| `npm run dev` | Ontwikkelserver |
| `npm run build` | Productie-build |
| `npm run typecheck` | TypeScript strict check |
| `npm test` | Unit tests (Vitest) |
| `npm run db:generate` | Prisma client genereren |
| `npm run db:migrate` | Database-migratie (lokaal) |
| `npm run db:seed` | Seeddata thema Dieren laden |

## Getest gedrag (hoofdstuk 55, volledige eerste flow)

1. Ouder maakt lokaal profiel (e-mailadres, geen wachtwoord in MVP).
2. Ouder maakt kindprofiel: naam, avatar, beginniveau.
3. Kind opent leerroute, ziet thema Dieren.
4. Kind start de les: luister-en-herken-oefeningen per dier, met
   mogelijkheid tot normaal/vertraagd afspelen.
5. Kind zegt het woord na (microfoon optioneel — werkt ook zonder).
6. Woorden die 2x fout gaan, komen aan het eind van de les terug.
7. Les wordt afgerond: punten + badges (bv. "Eerste woord", "Durft te
   spreken").
8. Voortgang wordt lokaal opgeslagen.
9. Ouder bekijkt overzicht: welke woorden gaan goed, welke vragen extra
   oefening.

## Wat hier bewust nog niet in zit

Conform hoofdstuk 49: geen volwaardig auth-systeem (de opnamestudio heeft
alleen een simpel gedeeld wachtwoord, zie hierboven), geen echte TTS/STT-
koppeling, geen volwaardig CMS met gebruikersbeheer, geen betalingen, geen
native apps. Zie `analyse-fase0.md` (in de projectroot naast deze map) voor
de volledige roadmap en scope-afbakening.

## Privacy & beveiliging — openstaande punten

Deze demo bewaart alles lokaal in de browser van de gebruiker; er wordt geen
audio opgenomen of verzonden (de nazeg-oefening gebruikt een mock-provider
zonder echte opname). Voordat dit live gaat met echte gebruikers:
juridische AVG-toetsing (hoofdstuk 34), een echte consent-flow voor
microfoongebruik, en encryptie-at-rest zodra er wél een backend/database bij
komt.
