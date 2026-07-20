import type { Metadata, Viewport } from "next";
import { AppStoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ashi & Tashi",
  description: "Interactieve Tashelhit-taalapp voor kinderen (verticale MVP-slice)",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-cream font-sans text-ink antialiased">
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  );
}
