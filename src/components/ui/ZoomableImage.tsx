"use client";

import { useState } from "react";

/** Vergroot-icoon (aangeleverde SVG, vergrootglas met plusje) voor het badge-knopje op elke oefenfoto. */
function ZoomIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6.09375 0.46875C4.07227 0.46875 2.22656 1.55273 1.20117 3.28125C0.205078 5.03906 0.205078 7.17773 1.20117 8.90625C2.22656 10.6641 4.07227 11.7188 6.09375 11.7188C8.08594 11.7188 9.93164 10.6641 10.957 8.90625C11.9531 7.17773 11.9531 5.03906 10.957 3.28125C9.93164 1.55273 8.08594 0.46875 6.09375 0.46875ZM6.09375 12.1875C2.72461 12.1875 0 9.46289 0 6.09375C0 2.75391 2.72461 0 6.09375 0C9.43359 0 12.1875 2.75391 12.1875 6.09375C12.1875 7.70508 11.5723 9.16992 10.5469 10.2539L14.9121 14.6191C15 14.707 15 14.8535 14.9121 14.9414C14.8242 15.0293 14.6777 15.0293 14.5898 14.9414L10.2246 10.5762C9.14062 11.5723 7.67578 12.1875 6.09375 12.1875ZM5.85938 8.90625V6.32812H3.28125C3.13477 6.32812 3.04688 6.24023 3.04688 6.09375C3.04688 5.97656 3.13477 5.85938 3.28125 5.85938H5.85938V3.28125C5.85938 3.16406 5.94727 3.04688 6.09375 3.04688C6.21094 3.04688 6.32812 3.16406 6.32812 3.28125V5.85938H8.90625C9.02344 5.85938 9.14062 5.97656 9.14062 6.09375C9.14062 6.24023 9.02344 6.32812 8.90625 6.32812H6.32812V8.90625C6.32812 9.05273 6.21094 9.14062 6.09375 9.14062C5.94727 9.14062 5.85938 9.05273 5.85938 8.90625Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
          className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-forest-500 bg-white text-forest-500 shadow-sm"
        >
          <ZoomIcon className="h-3.5 w-3.5" />
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
