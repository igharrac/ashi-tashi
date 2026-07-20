const TIPS = [
  'Zeg "Salam" om iemand te begroeten!',
  "Herhaling helpt: luister een woord gerust nog een keer.",
  "Fouten maken mag — daar leer je juist van!",
];

/** Dagelijkse-tip-kaart in de zijbalk, zoals in het Ashi & Tashi-ontwerp. */
export function DailyTipCard() {
  // Simpele, uitlegbare keuze op basis van de dag van het jaar (geen AI nodig).
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  const tip = TIPS[dayOfYear % TIPS.length];

  return (
    <div className="rounded-xl3 bg-peach-100 p-4 text-left">
      <p className="text-xs font-bold uppercase tracking-wide text-clay-600">Dagelijkse Tip:</p>
      <p className="mt-1 text-sm text-clay-600">{tip}</p>
    </div>
  );
}
