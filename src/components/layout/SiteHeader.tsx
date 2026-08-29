/**
 * Topnav voor publieke (uitgelogde) pagina's, overgenomen uit het
 * Figma-ontwerp. Kleuren zijn hier bewust vaste huisstijlkleuren
 * (ashi-navy/ashi-teal, zie tailwind.config.ts) i.p.v. de thema-
 * afhankelijke tokens die de rest van de app gebruikt — de publieke site
 * moet altijd hetzelfde merk tonen, ongeacht welk in-app kleurthema een
 * kind eventueel al gekozen heeft.
 */
export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-6 sm:px-12">
      {/* Definitieve, gecentreerde logo-variant (op verzoek) — beeldmerk +
          woordmerk "Ashi d' Tashi" + tagline. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- lokaal SVG-logo (public/brand), geen next/image-optimalisatie nodig */}
      <img src="/brand/logo-centered.svg" alt="Ashi d' Tashi — Samen spelen, leren en praten." className="h-16 w-auto sm:h-20" />
      <nav className="flex items-center gap-6 font-semibold text-ashi-navy" aria-label="Sitenavigatie">
        <a href="#over-ons" className="hover:text-ashi-teal">
          Over ons
        </a>
        <a href="#ouders" className="hover:text-ashi-teal">
          Ouders
        </a>
      </nav>
    </header>
  );
}
