"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { MascotIllustration } from "@/components/ui/MascotIllustration";

/**
 * Startscherm: ouder-onboarding + profielkeuze (hfst. 55, stap 1-3).
 * Visuele stijl overgenomen uit het Ashi & Tashi Figma/Stitch-ontwerp:
 * crème achtergrond met zachte gekleurde blobs, bosgroene CTA, mascotte-kaart.
 */
export default function HomePage() {
  const { state, ready, setParentEmail } = useAppStore();
  const [email, setEmail] = useState("");

  if (!ready) {
    return <p className="pt-12 text-center text-ink-muted">Even laden…</p>;
  }

  if (!state.parentEmail) {
    return (
      <main className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -left-16 top-24 h-64 w-40 rounded-full bg-mint-200/60 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-72 w-56 rounded-full bg-sky-200/50 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-40 rounded-full bg-peach-100/60 blur-2xl" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 py-16 text-center lg:flex-row lg:text-left">
          <div className="flex flex-1 flex-col items-center gap-6 lg:items-start">
            <Pill tone="mint" icon="👋">
              Hoi! Klaar voor een nieuw avontuur?
            </Pill>
            <h1 className="text-4xl font-bold leading-tight text-forest-500 sm:text-5xl">
              Welkom bij de wereld van
              <br />
              <span className="text-clay-500">Ashi &amp; Tashi!</span>
            </h1>
            <p className="max-w-md text-lg text-ink">
              Stap binnen in een magisch Tashelhit avontuur! Leer spelenderwijs met leuke verhalen, vrolijke
              liedjes en spannende beloningen.
            </p>

            <Card className="w-full max-w-sm text-left">
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setParentEmail(email.trim());
                }}
              >
                <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                  E-mailadres van ouder/verzorger
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="naam@voorbeeld.nl"
                    className="rounded-xl2 border-2 border-border-subtle px-4 py-3 text-base
                      focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
                  />
                </label>
                <Button type="submit">Aan de slag 🚀</Button>
              </form>
            </Card>

            <div className="flex w-full max-w-sm items-start justify-center gap-6 border-t border-border-subtle pt-6 text-sm text-ink lg:justify-start">
              <span>🛡️ 100% Veilig</span>
              <span>🌍 Tashelhit</span>
              <span>😊 Plezier</span>
            </div>
          </div>

          <div className="flex flex-1 justify-center">
            <MascotIllustration variant="cloud" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-4 py-8 pt-8 text-center">
      <h1 className="text-3xl font-bold text-forest-500">Ashi &amp; Tashi</h1>
      <p className="text-ink">Wie gaat er vandaag oefenen?</p>

      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
        {state.children.map((child) => (
          <Link
            key={child.id}
            href={`/kind/${child.id}/route`}
            className="flex flex-col items-center gap-2 rounded-xl2 border-2 border-mint-200/40 bg-white p-4
              transition-colors hover:border-forest-400 focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
          >
            <span className="text-5xl" aria-hidden="true">
              {child.avatarId}
            </span>
            <span className="font-semibold">{child.displayName}</span>
          </Link>
        ))}

        <Link
          href="/profiel/nieuw"
          className="flex flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed
            border-forest-400/50 p-4 text-forest-500 transition-colors hover:bg-mint-100/30
            focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        >
          <span className="text-4xl" aria-hidden="true">
            ➕
          </span>
          <span className="font-semibold">Nieuw kind</span>
        </Link>
      </div>

      <Link href="/ouder/overzicht" className="text-sm font-medium text-clay-500 underline underline-offset-2">
        Naar ouderoverzicht
      </Link>
    </main>
  );
}
