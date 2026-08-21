import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AppStoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { DEFAULT_THEME_ID, THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ashi & Tashi",
  description: "Interactieve Tashelhit-taalapp voor kinderen (verticale MVP-slice)",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Zet data-theme al vóór React hydrateert (leest dezelfde localStorage-key
// als ThemeProvider), zodat de pagina nooit eerst in het verkeerde thema
// flitst en daarna pas omschakelt. Puur DOM-manipulatie, geen React nodig
// — vandaar een gewoon <script>-tag i.p.v. een client component.
const noFlashThemeScript = `
(function () {
  try {
    var stored = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var valid = ${JSON.stringify(["berry", "ocean", "atlas"])};
    if (stored && valid.indexOf(stored) !== -1) {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" data-theme={DEFAULT_THEME_ID}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="min-h-screen bg-cream font-sans text-ink antialiased">
        <ThemeProvider>
          <AppStoreProvider>{children}</AppStoreProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
