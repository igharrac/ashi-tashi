/**
 * Getoond door middleware.ts wanneer de algemene toegangsgate actief is
 * (SHARE_LINK_SECRET ingesteld) en de bezoeker geen geldige studio-sessie of
 * geldige/verlopen deel-link heeft. Bewust simpel en zonder AppShell/child-
 * context — dit scherm kan ook getoond worden vóórdat er een profiel is.
 */
export default function NoAccessPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl" aria-hidden="true">
        🔒
      </p>
      <h1 className="text-xl font-bold text-forest-500">Deze link is verlopen of ongeldig</h1>
      <p className="text-sm text-ink-muted">
        Ashi &amp; Tashi is op dit moment alleen toegankelijk via een uitnodigingslink. Vraag een nieuwe link aan bij
        wie de app met je heeft gedeeld.
      </p>
    </main>
  );
}
