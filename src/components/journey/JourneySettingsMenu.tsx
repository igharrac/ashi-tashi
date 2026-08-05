"use client";

import { useEffect, useRef, useState } from "react";
import { Toggle } from "@/components/ui/Toggle";
import type { ChildProfileData } from "@/types/domain";

interface JourneySettingsMenuProps {
  child: ChildProfileData;
  onMicrophoneOptInChange: (enabled: boolean) => void;
  onSpeakFirstModeChange: (enabled: boolean) => void;
}

/**
 * Instellingen voor spraakoefeningen (microfoon, zelfstandig spreken).
 * Stonden eerst als twee permanent zichtbare kaarten bovenaan het reispad —
 * op verzoek nu ingeklapt achter een klein zwevend knopje, zodat ze
 * beschikbaar blijven zonder de hoofdervaring (het reispad zelf) te
 * verdringen (hfst. 30: ouderinstellingen mogen niet in de weg zitten).
 */
export function JourneySettingsMenu({
  child,
  onMicrophoneOptInChange,
  onSpeakFirstModeChange,
}: JourneySettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="absolute right-0 top-0 z-10">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Instellingen voor spraakoefeningen"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-white text-lg shadow-sm transition-transform hover:scale-105"
      >
        <span aria-hidden="true">⚙️</span>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl2 border border-border-subtle bg-white p-3 text-left shadow-soft sm:w-80">
          <div className="flex flex-col gap-3">
            <Toggle
              checked={child.microphoneOptIn}
              onChange={onMicrophoneOptInChange}
              label="Microfoon gebruiken"
              description={
                child.microphoneOptIn
                  ? "Aan: spraakoefeningen nemen echt op en worden vergeleken/beoordeeld."
                  : "Uit: spraakoefeningen worden overgeslagen met een 'ik heb het gezegd'-knop, ook als de microfoon van dit toestel aanstaat."
              }
            />
            <Toggle
              checked={child.speakFirstMode}
              onChange={onSpeakFirstModeChange}
              label="Zelfstandig spreken"
              description={
                child.speakFirstMode
                  ? "Aan: plaatje zien en zelf inspreken, zonder het woord eerst te horen."
                  : "Uit: eerst het woord horen, dan nazeggen. Geldt vanaf de volgende les."
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
