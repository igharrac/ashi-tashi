/** Topnav voor publieke (uitgelogde) pagina's, overgenomen uit het Figma-ontwerp. */
export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-6 sm:px-12">
      {/* Definitieve huisstijl (op verzoek): het volledige homepage-logo
          (beeldmerk + woordmerk "Ashi d' Tashi" + tagline) als één beeld
          i.p.v. los icoon + eigen tekst. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- lokaal SVG-logo (public/brand), geen next/image-optimalisatie nodig */}
      <img src="/brand/logo-homepage.svg" alt="Ashi d' Tashi — Samen spelen, leren en praten." className="h-14 w-auto sm:h-16" />
      <nav className="flex items-center gap-6 text-ink" aria-label="Sitenavigatie">
        <a href="#over-ons" className="hover:text-forest-600">
          Over ons
        </a>
        <a href="#ouders" className="hover:text-forest-600">
          Ouders
        </a>
      </nav>
    </header>
  );
}
