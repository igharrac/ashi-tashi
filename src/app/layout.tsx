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
      <body className="min-h-screen text-gray-900 antialiased">
        <AppStoreProvider>
          <div className="mx-auto max-w-2xl px-4 py-8">{children}</div>
        </AppStoreProvider>
      </body>
    </html>
  );
}
