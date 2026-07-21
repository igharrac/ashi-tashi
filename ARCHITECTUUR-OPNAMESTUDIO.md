# Opnamestudio — technisch ontwerp

Dit document beschrijft hoe de interne "opnamestudio" werkt: de tool waarmee jij
zelf audio inspreekt voor woorden en zinnen (hfst. 19–21 van het brief: echte
opnames, met menselijke review, per persona man/vrouw/jongen/meisje).

## 1. Doel en scope

Eén interne, wachtwoord-beveiligde pagina (`/studio/opnames`) waar je:

- per woord/zin uit de contentbibliotheek een opname maakt via je browser-microfoon,
- de opname meteen beluistert en zo nodig opnieuw inspreekt,
- aangeeft voor welke persona de opname bedoeld is (man, vrouw, jongen, meisje),
- opnames zelf kunt goed- of afkeuren (menselijke review, hfst. 21) — nooit
  automatisch gepubliceerd.

Dit is bewust géén volwaardig CMS met gebruikersbeheer, versiebeheer of workflow-
stappen. Het is het kleinste werkende ding dat het handmatige inspreekproces
mogelijk maakt, gebouwd zodat het straks 1-op-1 kan doorgroeien naar het
Prisma-datamodel (`AudioAsset`) zodra de database live is.

## 2. Belangrijke beperking: waar dit moet draaien

**De opnamestudio schrijft audiobestanden naar de schijf van de server die hem
draait.** Dat werkt perfect wanneer je de app lokaal draait (`npm run dev` of
`npm run start` op je eigen Mac) — de bestanden komen dan gewoon in je eigen
`public/audio/recordings/`-map terecht, die met git meegecommit wordt.

**Op Vercel werkt dit niet voor opnemen.** Vercel's serverless functies hebben
een read-only bestandssysteem (op `/tmp` na, wat tijdelijk is en verdwijnt na
elke request). Opnames die je via de live Vercel-URL zou maken, gaan dus
verloren.

Praktisch betekent dit: **gebruik de opnamestudio lokaal** (`npm run dev`,
dan naar `http://localhost:3000/studio/opnames`). Commit de resulterende
bestanden + het manifest naar git en push zoals gewoonlijk — daarna staan ze
ook op Vercel (als statische `public/`-bestanden, read-only, wat prima is voor
afspelen in de app).

Wil je dit later wél op de live omgeving kunnen doen (bv. onderweg opnemen),
dan is de vervolgstap om audio naar object storage te sturen (Vercel Blob of
S3) in plaats van naar de lokale schijf — zie sectie 6.

## 3. Opslagmodel (huidige fase)

```
public/audio/recordings/
  item-hond__man.webm
  item-hond__vrouw.webm
  item-hond__jongen.webm
  item-hond__meisje.webm
  zin-hond__man.webm
  ...

data/recordings-manifest.json   ← buiten public/, niet browseable
```

Bestandsnaam: `${vocabularyItemId}__${persona}.${extensie}`. De extensie volgt
het mime-type dat de browser levert (meestal `webm`, Safari geeft vaak `mp4`).

Het manifest is één JSON-bestand met een record per opname:

```json
{
  "item-hond__man": {
    "itemId": "item-hond",
    "persona": "man",
    "fileName": "item-hond__man.webm",
    "mimeType": "audio/webm",
    "reviewStatus": "TE_REVIEWEN",
    "recordedAt": "2026-07-21T10:03:00.000Z"
  }
}
```

`reviewStatus` gebruikt dezelfde waarden als het Prisma-schema
(`CONCEPT | TE_REVIEWEN | AFGEKEURD | GOEDGEKEURD | GEPUBLICEERD | GEARCHIVEERD`),
zodat de latere overstap naar de database geen nieuwe status-taal nodig heeft.

Waarom een los JSON-bestand in plaats van meteen de Prisma-database? Simpel:
de database is nog niet aangesloten in deze fase (hfst. 55/README). Een
bestand is de kleinste stap die vandaag al echt werkt, zonder dat we een
databaseverbinding hoeven te forceren om te kunnen opnemen.

## 4. Databronnen: welke items kun je opnemen

`src/lib/recordableItems.ts` haalt alle unieke woorden/zinnen uit de
demo-contentbron (`src/lib/demoData.ts`) — nu alleen het thema "Dieren", omdat
dat het enige thema is met echte (placeholder-)content. Zodra een nieuw thema
content krijgt, verschijnt het automatisch in de studio: er is geen aparte
lijst die je handmatig moet bijhouden.

## 5. Bescherming: wachtwoord-gate

`/studio/*` is afgeschermd door `middleware.ts`. Bij bezoek zonder geldige
sessie-cookie word je naar `/studio/login` gestuurd. Na het juiste wachtwoord
(env var `STUDIO_PASSWORD`) wordt een `httpOnly` cookie gezet die 30 dagen
geldig is.

Dit is bewust simpel gehouden (jouw keuze: "eenvoudige wachtwoord-gate die
later geavanceerd kan"). Het is **geen** productie-grade authenticatie:
- één gedeeld wachtwoord, geen aparte gebruikers,
- geen rate-limiting op login-pogingen,
- het wachtwoord staat als leesbare env var op de server.

Voor een interne tool die alleen jij gebruikt is dat een redelijke afweging nu.
Zodra er meerdere content-invoerders komen, is de logische vervolgstap
NextAuth (of vergelijkbaar) met echte accounts — zie sectie 6.

## 6. Pad naar productie-rijp (niet nu bouwen, wel alvast vastgelegd)

| Nu (deze fase) | Later |
|---|---|
| JSON-manifest op schijf | `AudioAsset`-tabel in Postgres via Prisma |
| Bestanden in `public/audio/recordings/` | Object storage (Vercel Blob / S3) + CDN-URL in `AudioAsset.url` |
| Eén gedeeld wachtwoord | Echte accounts (NextAuth), rollen (content-editor vs. ouder) |
| Handmatige goed-/afkeur-knop | Volledige reviewworkflow met reviewer-toewijzing, geschiedenis (hfst. 21) |
| Alleen jouw bronstem opnemen | Voice-conversion stap (RVC/OpenVoice/ElevenLabs) die één bronopname omzet naar de overige persona's, met de geconverteerde output ook door dezelfde review-stap |

De manifest-structuur en de `AudioAsset`-velden in `prisma/schema.prisma` zijn
bewust op elkaar afgestemd, zodat de overstap een migratiescript is
("lees manifest.json, schrijf naar Postgres, upload bestanden naar blob
storage") en geen herontwerp.

## 7. Wat dit niet oplost

Deze studio lost het **opname-en-review-proces** op. Het lost niet op hoe je
aan sprekers voor vrouw/jongen/meisje komt als je die zelf niet native kunt
naspreken — dat blijft de eerdere sparsessie: native speakers werven (Awal/
Common Voice-gemeenschap) en/of jouw eigen opnames via voice-conversion
ombouwen. De persona-keuze in de studio is er nu al wél, zodat je vandaag kunt
beginnen met opnemen (ook al is het voorlopig steeds jouw eigen stem getagd
als bv. "man"), en zodra een conversie-stap er is, vervang je simpelweg het
bestand achter dezelfde manifest-sleutel.
