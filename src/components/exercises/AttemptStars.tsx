interface AttemptStarsProps {
  attempts: number;
  total: number;
}

/**
 * Visuele voortgang tijdens de "coulante" spreekoefeningen (hfst. 22, zie
 * pronunciationLeniency.ts): een ster per poging, zodat direct zichtbaar is
 * hoever het kind is — i.p.v. alleen een tekstteller. Accentkleur (sterren)
 * is in het kleurthema-systeem al gereserveerd voor beloningen/highlights,
 * dus dit sluit aan bij de rest van de app.
 */
export function AttemptStars({ attempts, total }: AttemptStarsProps) {
  const filled = Math.min(attempts, total);
  return (
    <div
      role="img"
      aria-label={`${filled} van ${total} keer ingesproken`}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`text-3xl transition-transform duration-300 ${
            index < filled ? "scale-110" : "scale-100 text-ink-muted/30"
          }`}
        >
          {index < filled ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
}
