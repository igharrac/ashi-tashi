"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RewardAnimation } from "./RewardAnimation";

interface CategoryCompleteScreenProps {
  title: string;
  subtitle?: string;
  /** Badges/knoppen — verschijnen pas na een korte pauze, zodat het kind het moment even vasthoudt in plaats van meteen door te klikken. */
  children: ReactNode;
}

const CONFETTI_DOTS = [
  "left-8 top-10 bg-accent-400",
  "right-10 top-16 bg-secondary-300",
  "left-12 bottom-24 bg-accent-300",
  "right-14 bottom-28 bg-secondary-400",
  "left-1/2 top-6 bg-accent-500",
  "right-1/3 bottom-12 bg-secondary-300",
];

/**
 * Volledig-scherm "moment vasthouden" voor een afgeronde les/categorie/
 * gesprek — vervangt de eerdere kleine inline RewardAnimation binnen de
 * gewone paginalayout (op verzoek: "het gevoel dat je echt iets hebt
 * bereikt"). Solide, verzadigde `primary-700`-achtergrond — wisselt
 * automatisch mee met het gekozen kleurthema (Berry/Ocean/Atlas, zie
 * globals.css) omdat het gewoon de bestaande Tailwind-kleurtoken is —
 * met confetti in de `accent`/`secondary`-kleuren en witte tekst/knoppen.
 * Bewust "contrasterend" i.p.v. een subtiele wash: na het bekijken van
 * meerdere kleurvarianten was dit de gekozen richting.
 *
 * De knoppen/badges (children) verschijnen pas na ~1,1s — dat korte
 * moment van "niks kunnen doen behalve kijken" is de vasthoud-pauze.
 * Alleen fade/opacity, geen transforms, dus dit blijft ook prima werken
 * met prefers-reduced-motion aan.
 */
export function CategoryCompleteScreen({ title, subtitle, children }: CategoryCompleteScreenProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-5 overflow-hidden bg-primary-700 px-6 py-10 text-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {CONFETTI_DOTS.map((pos, i) => (
          <span
            key={pos}
            className={`absolute h-3 w-3 rounded-sm motion-safe:animate-reward-dots-float ${pos}`}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <RewardAnimation type="CATEGORY_COMPLETE" sizeClassName="h-28 w-28" />

      <h1
        className="text-2xl font-bold text-white motion-safe:animate-reward-fade"
        style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          className="text-white/80 motion-safe:animate-reward-fade"
          style={{ animationDelay: "0.45s", animationFillMode: "backwards" }}
        >
          {subtitle}
        </p>
      )}

      <div
        className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${
          revealed ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {children}
      </div>
    </main>
  );
}
