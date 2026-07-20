import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Design tokens overgenomen uit het Ashi & Tashi Figma/Stitch-ontwerp
        // (hfst. 44 design system). Namen blijven generiek (forest/clay/cream)
        // in plaats van "primary/secondary" 1-op-1 te hernoemen, zodat de
        // tokens herbruikbaar blijven als de huisstijl later verfijnd wordt.
        forest: {
          50: "#eef5f2",
          100: "#dcebe5",
          400: "#4d8677",
          500: "#3a675c", // knoppen, primaire koppen
          600: "#2f544b",
          700: "#204e44", // donkere tekst op mint-badges
        },
        // Alias zodat bestaande componenten (Button, Card, etc.) die nog
        // "primary-*" gebruiken automatisch de nieuwe huisstijlkleur krijgen.
        primary: {
          50: "#eef5f2",
          100: "#dcebe5",
          400: "#4d8677",
          500: "#3a675c",
          600: "#2f544b",
        },
        clay: {
          400: "#8a6b4c",
          500: "#74593f", // accent-koppen ("Ashi & Tashi"), links
          600: "#5f4833",
        },
        cream: {
          DEFAULT: "#fbf9f5", // paginabackground
          card: "#ffffff",
        },
        mint: {
          100: "#bcedde", // badge-achtergrond
          200: "#b2e2d4", // decoratieve blob
        },
        sky: {
          200: "#b6ddfb", // decoratieve blob
        },
        peach: {
          100: "#fed9b8", // decoratieve blob / dagelijkse-tip-kaart
          200: "#f3c9a0",
        },
        ink: {
          DEFAULT: "#404846", // lichaamstekst
          muted: "#6b7270",
        },
        border: {
          subtle: "#e4e2de",
        },
        success: { 500: "#22c55e" },
        info: { 500: "#0ea5e9" },
      },
      fontFamily: {
        sans: ["Quicksand", "ui-rounded", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "3rem",
      },
      boxShadow: {
        forest: "0 10px 15px -3px rgba(58,103,92,0.3)",
        soft: "0 20px 25px -5px rgba(58,103,92,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
