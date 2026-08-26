"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ShareLinkDuration } from "@/lib/shareLink";

const DURATION_OPTIONS: { value: ShareLinkDuration; label: string }[] = [
  { value: "1d", label: "1 dag" },
  { value: "3d", label: "3 dagen" },
  { value: "7d", label: "1 week" },
];

/**
 * Genereert een tijdelijke link waarmee iemand de kind-app kan proberen
 * zonder zelf iets aan te maken — zie src/lib/shareLink.ts en
 * src/middleware.ts. Duur is kiesbaar (1/3/7 dagen, op verzoek). Zit achter
 * dezelfde studio-wachtwoordgate als de rest van /studio/* (middleware.ts).
 */
export default function ShareLinkPage() {
  const [duration, setDuration] = useState<ShareLinkDuration>("1d");
  const [url, setUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setCopied(false);

    const response = await fetch("/api/studio/share-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration }),
    });
    const data = (await response.json().catch(() => ({}))) as { url?: string; expiresAt?: number; error?: string };

    setLoading(false);

    if (!response.ok || !data.url) {
      setError(data.error ?? "Genereren van de link is mislukt.");
      return;
    }

    setUrl(data.url);
    setExpiresAt(data.expiresAt ?? null);
  }

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Klembord kan geweigerd worden — de link staat sowieso al zichtbaar in het tekstveld.
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-forest-500">Deel-link genereren</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Maak een link waarmee iemand de app kan proberen — kies hoe lang die geldig blijft, daarna vanzelf verlopen.
        </p>
      </div>

      <Card className="w-full text-left">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Geldig voor</span>
            <div className="inline-flex w-fit gap-0.5 rounded-xl2 bg-primary-50 p-1">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDuration(option.value)}
                  className={`rounded-lg px-3.5 py-1.5 text-sm transition-colors
                    focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                    ${
                      option.value === duration
                        ? "bg-white font-medium text-ink shadow-sm"
                        : "text-ink-muted hover:text-ink"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Bezig…" : "Genereer nieuwe link"}
          </Button>

          {error && (
            <p role="alert" className="text-sm font-medium text-clay-500">
              {error}
            </p>
          )}

          {url && (
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Link
                <input
                  type="text"
                  readOnly
                  value={url}
                  onFocus={(event) => event.target.select()}
                  className="rounded-xl2 border-2 border-border-subtle px-4 py-3 text-sm
                    focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                />
              </label>
              <Button variant="secondary" onClick={handleCopy}>
                {copied ? "Gekopieerd!" : "Kopieer link"}
              </Button>
              {expiresAt && (
                <p className="text-xs text-ink-muted">
                  Verloopt op {new Date(expiresAt).toLocaleString("nl-NL")}.
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      <Link href="/studio/opnames" className="text-sm font-medium text-clay-500 underline underline-offset-2">
        ← Terug naar de opnamestudio
      </Link>
    </main>
  );
}
