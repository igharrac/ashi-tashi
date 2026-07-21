"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * Login voor de interne opnamestudio. Simpel gedeeld wachtwoord (zie
 * ARCHITECTUUR-OPNAMESTUDIO.md sectie 5), geen echte gebruikersaccounts.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/studio/opnames";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/studio/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Inloggen mislukt.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-2xl font-bold text-forest-500">Opnamestudio</h1>
      <p className="text-sm text-ink-muted">Interne tool voor contentbeheer — niet voor kinderen.</p>

      <Card className="w-full text-left">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Wachtwoord
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl2 border-2 border-border-subtle px-4 py-3 text-base
                focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm font-medium text-clay-500">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Bezig…" : "Inloggen"}
          </Button>
        </form>
      </Card>
    </main>
  );
}

export default function StudioLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
