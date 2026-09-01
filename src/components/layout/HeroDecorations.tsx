/**
 * Decoratieve poster-accenten voor de hero op de publieke landingspagina
 * (src/app/page.tsx). Vervangt de eerdere "4 hoeken"-opzet — op verzoek,
 * die voelde te symmetrisch/gesloten aan ("superlelijk", "geleurde
 * wolkjes storen"). Dit is "Optie A — verspreide poster-accenten" uit het
 * aangeleverde ontwerppakket: organische SVG-blobs (public/brand/accents)
 * losjes verspreid in de witruimte, deels afgesneden door de
 * `overflow-hidden` van de hero, i.p.v. grote vlakken in elke hoek.
 *
 * Drie eigen, losstaande composities per breakpoint (geen desktop-layout
 * die simpelweg verschaald wordt naar tablet/mobiel):
 * - mobiel (< sm): 1 subtiele blob + 1 microaccent.
 * - tablet (sm–lg): max. 2 deels zichtbare blobs + 2 kleine accenten.
 * - desktop (lg+): 2 dominante blobs (teal/geel), navy heel subtiel,
 *   coral als klein accent, en losse ringen/stralen/kronkels verspreid
 *   in de vrije ruimte tussen de tekst- en mascottekolom.
 *
 * Alle elementen zijn `pointer-events-none` en `aria-hidden`, en horen als
 * directe kinderen van de `relative overflow-hidden` <main> van de hero
 * (niet van de tekst- of mascotkolom) zodat de posities kloppen.
 */
export function HeroDecorations() {
  return (
    <>
      {/* Mobiel: 1 subtiele blob linksboven + 1 microaccent rechtsonder */}
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/blob-yellow.svg"
        className="pointer-events-none absolute -left-4 -top-4 w-20 opacity-[0.85] sm:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/ring-yellow.svg"
        className="pointer-events-none absolute bottom-6 right-5 w-7 opacity-70 sm:hidden"
      />

      {/* Tablet: eigen compositie, minder decoratie dan desktop */}
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/blob-teal.svg"
        className="pointer-events-none absolute right-4 top-4 hidden w-32 sm:block lg:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/blob-yellow.svg"
        className="pointer-events-none absolute left-4 top-8 hidden w-20 opacity-90 sm:block lg:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/squiggle-coral.svg"
        className="pointer-events-none absolute bottom-4 left-10 hidden w-[3.25rem] sm:block lg:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/ring-yellow.svg"
        className="pointer-events-none absolute -bottom-2 right-12 hidden w-8 opacity-75 sm:block lg:hidden"
      />

      {/* Desktop: verspreide poster-accenten, asymmetrisch, weg van tekst/kaart/illustratie */}
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/blob-teal.svg"
        className="pointer-events-none absolute hidden lg:right-6 lg:top-6 lg:block lg:w-56"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/blob-yellow.svg"
        className="pointer-events-none absolute hidden opacity-95 lg:left-0 lg:top-1 lg:block lg:w-20"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/blob-navy.svg"
        className="pointer-events-none absolute hidden opacity-70 lg:bottom-8 lg:right-10 lg:block lg:w-[6.5rem]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/squiggle-coral.svg"
        className="pointer-events-none absolute hidden lg:bottom-10 lg:left-[26rem] lg:block lg:w-14"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/ring-yellow.svg"
        className="pointer-events-none absolute hidden opacity-80 lg:right-64 lg:top-2 lg:block lg:w-8"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/rays.svg"
        className="pointer-events-none absolute hidden lg:right-[19rem] lg:top-4 lg:block lg:w-11"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/accents) */}
      <img
        aria-hidden="true"
        src="/brand/accents/squiggle-teal.svg"
        className="pointer-events-none absolute hidden opacity-[0.85] lg:bottom-24 lg:left-4 lg:block lg:w-14"
      />
    </>
  );
}
