/** Topnav voor publieke (uitgelogde) pagina's, overgenomen uit het Figma-ontwerp. */
export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-6 sm:px-12">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-500 text-lg font-bold text-white shadow-forest">
          A&amp;T
        </span>
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
