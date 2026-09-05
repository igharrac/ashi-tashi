import type { Config } from "tailwindcss";

/**
 * Kleurthema-systeem (3 selecteerbare thema's: Berry/Ocean/Atlas — zie
 * src/lib/theme.ts en src/app/globals.css). De daadwerkelijke hex-waarden
 * per thema staan als CSS-variabelen in globals.css onder [data-theme="..."]
 * — hier wordt alleen omschreven HOE Tailwind-klassen die variabelen
 * opzoeken, zodat wisselen van thema geen enkel component hoeft te raken.
 *
 * `rgb(var(--x) / <alpha-value>)` is het standaardpatroon voor
 * CSS-variabele-kleuren in Tailwind v3: het houdt opacity-modifiers
 * (bv. bg-mint-100/40) werkend, ook al is de basiswaarde nu een variabele
 * in plaats van een vaste hex.
 *
 * Nieuw thema toevoegen: alleen een extra [data-theme="..."]-blok in
 * globals.css + een entry in src/lib/theme.ts — deze config hoeft niet
 * aangepast te worden.
 */
function themeColor(name: string) {
  return {
    50: `rgb(var(--color-${name}-50) / <alpha-value>)`,
    100: `rgb(var(--color-${name}-100) / <alpha-value>)`,
    200: `rgb(var(--color-${name}-200) / <alpha-value>)`,
    300: `rgb(var(--color-${name}-300) / <alpha-value>)`,
    400: `rgb(var(--color-${name}-400) / <alpha-value>)`,
    500: `rgb(var(--color-${name}-500) / <alpha-value>)`,
    600: `rgb(var(--color-${name}-600) / <alpha-value>)`,
    700: `rgb(var(--color-${name}-700) / <alpha-value>)`,
    800: `rgb(var(--color-${name}-800) / <alpha-value>)`,
    900: `rgb(var(--color-${name}-900) / <alpha-value>)`,
  };
}

const primary = themeColor("primary");
const secondary = themeColor("secondary");
const accent = themeColor("accent");

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // De 3 kern-tokens uit de themabrief: gebruik deze namen voor
        // nieuwe componenten. primary = navigatie/primaire acties,
        // secondary = illustraties/cards/ondersteunende UI, accent =
        // beloningen/sterren/streaks/highlights/positieve feedback.
        primary,
        secondary,
        accent,
        background: `rgb(var(--color-background) / <alpha-value>)`,

        // --- Onderstaande namen zijn de bestaande design tokens (hfst. 44)
        // waar alle huidige componenten al naar verwijzen. In plaats van
        // tientallen bestanden te herschrijven, wijzen ze nu naar dezelfde
        // CSS-variabelen als hierboven (of een specifieke, op contrast
        // gekozen shade daarvan) — dus ze wisselen automatisch mee met het
        // thema zonder dat een component ooit hoeft te veranderen. ---

        // forest = alias van primary (was al identiek gedefinieerd).
        forest: primary,

        // clay = secondary, maar per gebruikte shade bewust een net iets
        // donkerdere stap gekozen dan de "brand"-kleur zelf: clay-500/600
        // worden gebruikt als LEESBARE tekst (koppen, "bijna goed"-feedback)
        // en moeten dus voldoende contrast houden tegen de lichte
        // achtergrond, ook in thema's met een lichte/felle secondary-kleur
        // (bv. Berry's roze). clay-400 wordt gebruikt als GEVULDE knop met
        // witte tekst (matchspel) en is daarom juist weer een net iets
        // donkerdere secondary-shade dan de lichtste, voor voldoende
        // contrast tegen wit. Zie ARCHITECTUUR-OPNAMESTUDIO.md-achtige
        // toelichting: dit is bewust NIET simpelweg "= secondary", maar een
        // per-thema doorgerekende (WCAG-contrast) keuze.
        clay: {
          400: `rgb(var(--color-clay-400) / <alpha-value>)`,
          500: `rgb(var(--color-clay-500) / <alpha-value>)`,
          600: `rgb(var(--color-clay-600) / <alpha-value>)`,
        },

        // cream = background-token; het paginabackground wisselt per
        // thema, de witte kaart-ondergrond (cream-card) blijft bewust wit
        // in alle thema's — dat geeft de beste, thema-onafhankelijke
        // leesbaarheid voor tekst op kaarten.
        cream: {
          DEFAULT: `rgb(var(--color-background) / <alpha-value>)`,
          card: "#ffffff",
        },

        // mint/sky/peach zijn de bestaande decoratieve kleuren (blobs,
        // badge-achtergronden) — nu lichte tinten van resp. primary/
        // secondary/accent, zodat ook de decoratie duidelijk meewisselt
        // met het thema.
        mint: {
          100: `rgb(var(--color-primary-100) / <alpha-value>)`,
          200: `rgb(var(--color-primary-200) / <alpha-value>)`,
        },
        sky: {
          200: `rgb(var(--color-secondary-200) / <alpha-value>)`,
        },
        peach: {
          100: `rgb(var(--color-accent-100) / <alpha-value>)`,
          200: `rgb(var(--color-accent-200) / <alpha-value>)`,
        },

        // ink/border/info wisselen BEWUST NIET per thema (toegankelijkheid,
        // hfst. 22): lichaamstekst, randen en de focus-ring blijven overal
        // exact even goed leesbaar, ongeacht welk thema gekozen is.
        ink: {
          DEFAULT: "#404846",
          muted: "#6b7270",
        },
        border: {
          subtle: "#e4e2de",
        },
        // success wordt gebruikt voor leesbare "goed gedaan"-tekst én de
        // voortgangsbalk-vulling — daarom een donkerdere, contrastveilige
        // stap uit de accent-ramp per thema, net als clay hierboven.
        success: {
          500: `rgb(var(--color-success-500) / <alpha-value>)`,
        },
        info: { 500: "#0ea5e9" },

        // Vaste "Ashi d' Tashi"-huisstijlkleuren (definitief merkpakket) —
        // BEWUST NIET thema-afhankelijk zoals primary/secondary/accent
        // hierboven. Alleen gebruikt op de publieke landingspagina
        // (SiteHeader/SiteFooter/page.tsx-hero): die moet de merkidentiteit
        // altijd hetzelfde tonen, ongeacht welk in-app kleurthema een kind
        // eventueel al gekozen heeft (dat thema geldt pas ná inloggen).
        ashi: {
          navy: "#0F2D5B",
          teal: "#1BB3A8",
          coral: "#FF6B57",
          yellow: "#FFC53D",
          cream: "#F3F1EB",
        },
      },
      fontFamily: {
        sans: ["Quicksand", "ui-rounded", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "3rem",
      },
      boxShadow: {
        // Hergebruikt --color-primary-700 (bestaat al hierboven) zodat de
        // schaduw onder de primaire knop altijd bij het gekozen thema past
        // in plaats van een vast (voorheen forest-groen) tintje te houden.
        forest: "0 10px 15px -3px rgb(var(--color-primary-700) / 0.3)",
        soft: "0 20px 25px -5px rgb(var(--color-primary-700) / 0.1)",
      },
      // Motion voor de reward-animatiebibliotheek (RewardAnimation.tsx,
      // zie ook public/rewards/README.md) — timing/curves rechtstreeks
      // overgenomen uit de aangeleverde reward-library-spec. `motion-safe:`/
      // `motion-reduce:` (Tailwind-kernvarianten, geen extra config nodig)
      // schakelen per klasse tussen de volle animatie en een kale fade.
      keyframes: {
        "reward-pop": {
          "0%": { opacity: "0", transform: "scale(.75) rotate(-4deg)" },
          "60%": { opacity: "1", transform: "scale(1.08) rotate(3deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "reward-unlock": {
          "0%": { opacity: "0", transform: "scale(.6) translateY(16px)" },
          "55%": { opacity: "1", transform: "scale(1.1) translateY(-8px)" },
          "78%": { transform: "scale(.95) translateY(3px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "reward-fade": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "reward-ray-rotate": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "reward-blob-breathe": {
          "0%, 100%": { transform: "scale(.92) rotate(0deg)" },
          "50%": { transform: "scale(1.08) rotate(6deg)" },
        },
        "reward-ring-pulse": {
          "0%, 100%": { transform: "scale(.85)", opacity: ".55" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
        },
        "reward-squiggle-wave": {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-6px) rotate(2deg)" },
        },
        "reward-dots-float": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-8px) scale(1.12)" },
        },
        "reward-rain-fade": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "35%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
      },
      animation: {
        "reward-pop": "reward-pop 0.6s ease-out",
        "reward-unlock": "reward-unlock 0.7s cubic-bezier(.34,1.56,.64,1)",
        "reward-fade": "reward-fade 0.5s ease-out",
        "reward-ray-rotate": "reward-ray-rotate 2.2s linear infinite",
        "reward-blob-breathe": "reward-blob-breathe 2.6s ease-in-out infinite",
        "reward-ring-pulse": "reward-ring-pulse 1.6s ease-in-out infinite",
        "reward-squiggle-wave": "reward-squiggle-wave 1.8s ease-in-out infinite",
        "reward-dots-float": "reward-dots-float 1.4s ease-in-out infinite",
        "reward-rain-fade": "reward-rain-fade 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
