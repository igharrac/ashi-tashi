"use client";

import { useState } from "react";

interface ZoomableImageProps {
  pictogramUrl?: string | null;
  emoji: string;
  alt: string;
  /** Tailwind-klassen voor de kleine weergave in de oefening zelf, bv. "h-40 w-40 text-7xl". */
  sizeClassName?: string;
}

/**
 * Plaatje/pictogram bij een oefening (hfst. 13), nu aantikbaar om te
 * vergroten (op verzoek: "soms is het plaatje niet duidelijk"). Bundelt ook
 * de bestaande pictogram→emoji-terugval (een extern ARASAAC-plaatje kan
 * ontbreken/niet laden) zodat elke oefening dezelfde, geteste logica
 * hergebruikt i.p.v. hem 4x apart te herhalen.
 */
export function ZoomableImage({ pictogramUrl, emoji, alt, sizeClassName = "h-40 w-40 text-7xl" }: ZoomableImageProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const showImage = Boolean(pictogramUrl) && !imageFailed;

  return (
    <>
      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label={`${alt} — tik om te vergroten`}
        className={`relative flex items-center justify-center rounded-xl2 bg-primary-50 p-2 ${sizeClassName}`}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- extern ARASAAC-plaatje (CC BY-NC-SA), geen lokale kopie, dus geen next/image-optimalisatie mogelijk
          <img
            src={pictogramUrl ?? undefined}
            alt={alt}
            className="h-full w-full object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span aria-hidden="true">{emoji}</span>
        )}
        <span
          aria-hidden="true"
          className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-forest-500/90 text-xs text-white"
        >
          🔍
        </span>
      </button>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6"
        >
          <div className="flex max-h-[80vh] max-w-[80vw] items-center justify-center rounded-xl3 bg-primary-50 p-8">
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- zelfde extern plaatje, nu uitvergroot
              <img src={pictogramUrl ?? undefined} alt={alt} className="max-h-[70vh] max-w-[70vw] object-contain" />
            ) : (
              <span aria-hidden="true" className="text-[9rem] leading-none">
                {emoji}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
