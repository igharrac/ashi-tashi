"use client";

interface AutoplayIndicatorProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

/**
 * Klein icoon in de statusbalk dat de kindinstelling child.autoplayAudio
 * toont en direct omschakelt (op verzoek: los van "opnieuw afspelen" — dit
 * icoon speelt zelf NOOIT geluid af, het is puur een schakelaar). Uit staat
 * = luidsprekertje met een rode schuine streep erdoorheen (zelfde visuele
 * taal als de oude AutoplayToggle, nu zonder de bijwerking dat aanzetten
 * ook meteen afspeelt). Voor daadwerkelijk nog een keer horen: zie de
 * "Afspelen"-knop (AudioButton) inline bij de oefening zelf.
 */
export function AutoplayIndicator({ enabled, onToggle, className = "" }: AutoplayIndicatorProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!enabled)}
      aria-pressed={enabled}
      aria-label={
        enabled
          ? "Automatisch afspelen staat aan. Tik om uit te zetten."
          : "Automatisch afspelen staat uit. Tik om aan te zetten."
      }
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-ink-muted
        transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500 ${className}`}
    >
      <span className="relative inline-flex h-[1em] w-[1em] items-center justify-center" aria-hidden="true">
        <span>🔊</span>
        {!enabled && <span className="absolute h-[2px] w-[140%] -rotate-45 rounded-full bg-red-600" />}
      </span>
    </button>
  );
}
