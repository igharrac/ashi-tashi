/**
 * Footer voor publieke (uitgelogde) pagina's, overgenomen uit het
 * Figma-ontwerp. Vaste huisstijlkleur (ashi-navy) i.p.v. het thema-
 * afhankelijke "ink" token — zie SiteHeader.tsx voor de reden.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle px-6 py-8 sm:px-12">
      <div className="flex flex-col items-center justify-between gap-4 text-sm text-ashi-navy/60 sm:flex-row">
        <p>© {new Date().getFullYear()} Ashi &amp; Tashi Adventure. Alle rechten voorbehouden.</p>
        <div className="flex gap-8">
          <a href="#privacy" className="hover:text-ashi-navy">
            Privacy
          </a>
          <a href="#voorwaarden" className="hover:text-ashi-navy">
            Voorwaarden
          </a>
        </div>
      </div>
    </footer>
  );
}
