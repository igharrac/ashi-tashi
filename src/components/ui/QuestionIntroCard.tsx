import type { ReactNode } from "react";

interface QuestionIntroCardProps {
  children: ReactNode;
}

/**
 * Decoratieve omlijsting voor het openingsvraag-item van een
 * Oefenen-categorie met `startsWithQuestionScreen` aan (studio-instelbaar,
 * zie practiceSentences.ts / opnames/page.tsx) — bijvoorbeeld "Waar is de
 * bal?" bij Voorzetsels. Alleen een paar decoratieve illustraties uit de
 * reward-asset-set (public/rewards/07-decorative-motion); de solide
 * achtergrondkleur zit op de hele pagina (zie <main> in
 * les/[lessonId]/page.tsx) zodat het geen apart "kaartje" meer is maar
 * één ononderbroken kleurvlak — op verzoek: "Ik zou de hele pagina in 1
 * kleur willen". De grotere tekst zelf regelt RepeatAfterMe's
 * `emphasize`-prop.
 */
export function QuestionIntroCard({ children }: QuestionIntroCardProps) {
  return (
    <div className="relative overflow-visible px-2 py-4">
      <img
        src="/rewards/07-decorative-motion/01-ring.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-4 -top-4 h-16 w-16 opacity-30 sm:h-20 sm:w-20"
      />
      <img
        src="/rewards/07-decorative-motion/04-dots.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 top-2 h-14 w-14 opacity-40 sm:h-16 sm:w-16"
      />
      <img
        src="/rewards/07-decorative-motion/02-squiggle.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 left-1/3 h-12 w-12 opacity-30 sm:h-14 sm:w-14"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
