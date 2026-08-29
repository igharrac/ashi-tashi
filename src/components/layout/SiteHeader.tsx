/** Topnav voor publieke (uitgelogde) pagina's, overgenomen uit het Figma-ontwerp. */
export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-6 sm:px-12">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- lokaal SVG-beeldmerk (public/brand), geen next/image-optimalisatie nodig */}
        <img
          src="/brand/ashi-d-tashi-app-icon.svg"
          alt=""
          aria-hidden="true"
          className="h-14 w-14 rounded-xl2 shadow-sm sm:h-16 sm:w-16"
        />
        <span className="text-2xl text-forest-500">Ashi &amp; Tashi</span>
      </div>
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
