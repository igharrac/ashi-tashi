# Werkwijze met Claude (Cowork) — Ashi & Tashi

Dit document is bedoeld om aan Claude te geven aan het begin van een nieuwe
chat, zodat de manier van werken niet opnieuw uitgelegd hoeft te worden.
Plak dit (of verwijs naar dit bestand) aan het begin van een nieuwe
sessie.

## Project in het kort

Tashelhit/Tamazight taal-leerapp voor kinderen. Next.js 14 (App Router),
TypeScript strict, Tailwind, client-side state via localStorage
(`src/lib/store.tsx`). Deployed op Vercel — **let op: read-only filesystem
in productie**, dus alles wat schrijft naar disk (opnamestudio, manifest)
moet lokaal draaien (`npm run dev`), nooit op Vercel.

- Lokale echte repo: `~/Documents/ashi-tashi`
- Remote: `https://github.com/igharrac/ashi-tashi.git`
- Architectuur van de opnamestudio: zie `ARCHITECTUUR-OPNAMESTUDIO.md` in de repo.

## Werkomgeving van Claude (sandbox vs. echte repo)

Claude werkt in een sandbox-scratchpad (tijdelijke `outputs`-map), NIET
direct in `~/Documents/ashi-tashi`. Standaard patroon per wijziging:

1. Bewerk bestanden in de scratchpad.
2. Verifieer: `npx tsc --noEmit`, en waar relevant `npx next build`.
3. Kopieer **expliciet per bestand** (nooit bulk-rsync) naar
   `~/Documents/ashi-tashi/...`.
4. `diff -q` tussen scratchpad en Documents om te bevestigen dat de sync
   klopt.
5. `git status --porcelain` in de echte repo, gefilterd op
   `grep -v '^?? data/child-attempts'` (zie hieronder waarom).

### Git: code vs. audio-content

- **Codewijzigingen** (`.tsx`, `.ts`, etc.): Claude toont een kant-en-klaar
  copy-pasteable bash-blok met git-commando's (incl. `rm -f
  .git/index.lock`) — de gebruiker voert dit zelf uit. Claude commit/pusht
  dit **niet** zelf.
- **Audio/opname-content** (`.webm`-bestanden,
  `data/recordings-manifest.json`, `public/audio-catalog.json`): Claude
  commit + pusht dit **wel zelf direct**, zonder te vragen — staande regel,
  meerdere keren toegepast (vrouw/jongen/meisje-stemmen, man-vervanging).

### Bekende sandbox-eigenaardigheden

- `npx next build` faalt in de sandbox **altijd** op de laatste stap met
  `EPERM: operation not permitted, unlink '.../.next/export/404.html'` —
  dit gebeurt NA een schone compile + alle statische pagina's gegenereerd.
  Geaccepteerde non-issue, geen echte bug. Workaround vooraf: `mv .next
  .next-stale-$(date +%s) 2>/dev/null`.
- De sandbox kan geen Hugging Face / model-hosting sites bereiken, en heeft
  geen toegang tot `~/Downloads` — alleen `~/Documents` (via de
  gekoppelde map). Scripts die modellen downloaden (bv.
  `anonymize_voices.py`) draait de gebruiker **lokaal op zijn eigen Mac**.
- `data/child-attempts/` mag **nooit** in git-geschiedenis terechtkomen —
  altijd uitfilteren bij `git status`-checks.
- Bestanden in `~/Documents` kunnen niet verwijderd/hernoemd worden zonder
  expliciete tool-toestemming (`allow_cowork_file_delete`). Tijdelijke
  `_incoming-*`-mapjes die Claude zelf aanmaakt zijn in de praktijk wel
  gewoon met `rm -rf` te verwijderen.

## Stemmen-pijplijn (voice-anonymize)

Vier persona's: `man` (origineel, primaire uitspraakreferentie),
`vrouw`, `jongen`, `meisje` (alle drie via stemconversie afgeleid van de
man-opnames, FreeVC/VCTK-model). Script: `anonymize_voices.py`, draait
lokaal op de Mac van de gebruiker (niet in de sandbox).

- Huidige gekozen VCTK-sprekers: vrouw = p225, jongen = p226, man
  (zelf-vervanging) = p256, meisje = p297 (+ `--pitch-shift 1.15`).
- `--target-speaker` override bestaat om snel te wisselen tussen
  kandidaat-stemmen zonder het script te bewerken.
- Incrementeel: per persona wordt bijgehouden welke items al gedaan zijn
  (manifest-key `{itemId}__{persona}`), zodat een her-run alleen nieuwe
  woorden verwerkt. Voor `man` specifiek via het `voiceConverted: true`
  veld (niet key-existence, want elk item heeft altijd een `__man`-entry).
- Bij het vervangen van `man` zelf: **altijd eerst een aparte backup-commit**
  (`backups/man-originals-<datum>/`) vóór de destructieve overwrite-commit.
- `public/audio-catalog.json` wordt **niet automatisch** herberekend —
  moet handmatig (Python-equivalent van `regeneratePublicCatalog()` in
  `src/lib/publicCatalogSnapshot.ts`) na elke `--auto-approve`-batch.

## Algemene voorkeuren / stijl

- Nooit echte Tashelhit-vertalingen verzinnen.
- Nooit harde/numerieke uitspraakscores aan een kind tonen.
- Geen inline `#`-commentaar op commando-regels die de gebruiker in zsh
  moet plakken (zsh interpreteert dit anders dan bash — leidde eerder tot
  een `pip install` fout).
- Gebruiker communiceert in het Nederlands; code-comments in de repo zijn
  ook in het Nederlands (bestaande conventie, aanhouden).
- Bij ambiguë/risicovolle architectuurkeuzes: `AskUserQuestion` gebruiken
  i.p.v. aannames doen.

## Huidige stand van zaken (laatste commit hierboven te checken met `git log`)

Voor de actuele stand: `git log --oneline -15` in de repo geeft de
recentste features. Lees dit bestand + de laatste paar commit-messages aan
het begin van een nieuwe sessie in plaats van te vragen wat er speelt.
