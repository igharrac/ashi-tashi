"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { MascotIllustration } from "@/components/ui/MascotIllustration";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Startscherm: ouder-onboarding + profielkeuze (hfst. 55, stap 1-3).
 * Visuele stijl overgenomen uit het Ashi & Tashi Figma/Stitch-ontwerp,
 * met de definitieve "Ashi d' Tashi"-huisstijlkleuren (ashi-navy/teal/
 * coral/yellow, zie tailwind.config.ts) en de organische poster-elementen
 * (public/brand/poster) i.p.v. de eerdere vage kleurblobs — op verzoek,
 * zodat de landingspagina aansluit bij het definitieve merkpakket.
 */
export default function HomePage() {
  const { state, ready, setParentEmail } = useAppStore();
  const [email, setEmail] = useState("");

  if (!ready) {
    return <p className="pt-12 text-center text-ink-muted">Even laden…</p>;
  }

  if (!state.parentEmail) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />

        {/* Poster-hoeken (public/brand/poster) — gebonden aan <main> zelf
            i.p.v. de hele pagina, zodat de footer eronder helder leesbaar
            blijft en niet met een gekleurde hoek overlapt. */}
        <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-10 overflow-hidden px-6 py-16 text-center lg:flex-row lg:text-left">
          {/* Poster-hoeken: bewust pas vanaf sm zichtbaar en klein gehouden
              — op mobiel is er te weinig ruimte tussen de hoek en de tekst
              (getest), dus daar liever helemaal geen decoratie dan een die
              over de kop/pil heen valt (hfst. 9: minder drukte op kleine
              schermen, zelfde principe als de vertrouwensrij hieronder). */}
          {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/poster) */}
          <img
            aria-hidden="true"
            src="/brand/poster/cloud-corner-yellow-top-left.svg"
            className="pointer-events-none absolute -left-2 -top-2 hidden w-28 sm:block lg:w-36"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/poster) */}
          <img
            aria-hidden="true"
            src="/brand/poster/cloud-corner-teal-top-right.svg"
            className="pointer-events-none absolute -right-2 -top-2 hidden w-32 sm:block lg:w-40"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/poster) */}
          <img
            aria-hidden="true"
            src="/brand/poster/cloud-corner-coral-bottom-left.svg"
            className="pointer-events-none absolute -bottom-2 -left-2 hidden w-32 sm:block lg:w-44"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- lokale decoratieve SVG's (public/brand/poster) */}
          <img
            aria-hidden="true"
            src="/brand/poster/cloud-corner-navy-bottom-right.svg"
            className="pointer-events-none absolute -bottom-2 -right-2 hidden w-32 sm:block lg:w-44"
          />

          <div className="relative order-2 flex flex-1 flex-col items-center gap-6 lg:order-1 lg:items-start">
            <Pill icon="👋" className="!bg-ashi-yellow/25 !text-ashi-navy">
              Hoi! Klaar voor een nieuw avontuur?
            </Pill>
            <h1 className="text-4xl font-bold leading-tight text-ashi-navy sm:text-5xl">
              Welkom bij de wereld van
              <br />
              <span className="text-ashi-coral">Ashi &amp; Tashi!</span>
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
                <Button type="submit" className="!bg-ashi-teal hover:!bg-ashi-teal/90 !shadow-none">
                  Aan de slag 🚀
                </Button>
              </form>
            </Card>

            {/* Verborgen op mobiel: het Figma mobile-frame (node 2:229) toont deze
                rij niet — minder tekst/drukte op kleine schermen (hfst. 9). */}
            <div className="hidden w-full max-w-sm items-start justify-center gap-6 border-t border-border-subtle pt-6 text-sm text-ashi-navy/70 lg:flex lg:justify-start">
              <span>🛡️ 100% Veilig</span>
              <span>🌍 Tashelhit</span>
              <span>😊 Plezier</span>
            </div>
          </div>

          <div className="relative order-1 flex flex-1 justify-center lg:order-2">
            <MascotIllustration variant="cloud" />

            {/* Decoratieve micro-interacties, overgenomen uit het Figma-ontwerp,
                nu in de vaste huisstijlkleuren i.p.v. de thema-afhankelijke tinten. */}
            <span
              aria-hidden="true"
              className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-ashi-yellow/70 text-lg shadow-sm"
            >
              ⭐
            </span>
            <span aria-hidden="true" className="absolute -left-6 top-1/3 text-2xl text-ashi-coral">
              ✨
            </span>
            <div className="absolute -bottom-4 right-6 flex items-center gap-2 rounded-full bg-ashi-teal/15 px-4 py-2 text-sm font-bold text-ashi-teal shadow-sm">
              <span aria-hidden="true">🎵</span> Tashelhit liedjes!
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-4 py-8 pt-8 text-center">
      <h1 className="text-3xl font-bold text-ashi-navy">Ashi &amp; Tashi</h1>
      <p className="text-ink">Wie gaat er vandaag oefenen?</p>

      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
        {state.children.map((child) => (
          <Link
            key={child.id}
            href={`/kind/${child.id}/route`}
            className="flex flex-col items-center gap-2 rounded-xl2 border-2 border-mint-200/40 bg-white p-4
              transition-colors hover:border-ashi-teal focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
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
            border-ashi-teal/50 p-4 text-ashi-teal transition-colors hover:bg-ashi-teal/10
            focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        >
          <span className="text-4xl" aria-hidden="true">
            ➕
          </span>
          <span className="font-semibold">Nieuw kind</span>
        </Link>
      </div>

      <Link href="/ouder/overzicht" className="text-sm font-medium text-ashi-teal underline underline-offset-2">
        Naar ouderoverzicht
      </Link>
    </main>
  );
}
