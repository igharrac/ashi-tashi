import type { ReactNode } from "react";

interface QuestionIntroCardProps {
  children: ReactNode;
}

/**
 * Visuele omlijsting voor het openingsvraag-item van een Oefenen-categorie
 * met `startsWithQuestionScreen` aan (studio-instelbaar, zie
 * practiceSentences.ts / opnames/page.tsx) — bijvoorbeeld "Waar is de bal?"
 * bij Voorzetsels. Solide achtergrondkleur + een paar decoratieve
 * illustraties uit de reward-asset-set (public/rewards/07-decorative-motion)
 * zodat de openingsvraag duidelijk als zodanig voelt i.p.v. als een gewone
 * oefening. De grotere tekst zelf regelt RepeatAfterMe's `emphasize`-prop.
 */
export function QuestionIntroCard({ children }: QuestionIntroCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl3 bg-secondary-100 px-6 py-10">
      <img
        src="/rewards/07-decorative-motion/01-ring.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 opacity-40"
      />
      <img
        src="/rewards/07-decorative-motion/04-dots.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 top-6 h-16 w-16 opacity-50"
      />
      <img
        src="/rewards/07-decorative-motion/02-squiggle.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 left-1/3 h-14 w-14 opacity-40"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
