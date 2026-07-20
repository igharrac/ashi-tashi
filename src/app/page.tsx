"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * Startscherm: ouder-onboarding + profielkeuze (hfst. 55, stap 1-3).
 * Bewust geen lang registratieproces (hfst. 6): alleen een e-mailadres
 * als lokale sleutel, geen wachtwoord/verificatie in de MVP-demo.
 */
export default function HomePage() {
  const { state, ready, setParentEmail } = useAppStore();
  const [email, setEmail] = useState("");

  if (!ready) {
    return <p className="text-center text-gray-500">Even laden…</p>;
  }

  if (!state.parentEmail) {
    return (
      <main className="flex flex-col items-center gap-8 pt-12 text-center">
        <h1 className="text-4xl font-extrabold text-primary-600">Ashi &amp; Tashi</h1>
        <p className="max-w-sm text-gray-600">
          Welkom! Maak een profiel aan zodat je kinderprofielen kunt beheren en hun voortgang kunt volgen.
        </p>
        <Card className="w-full max-w-sm">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) setParentEmail(email.trim());
            }}
          >
            <label className="flex flex-col gap-1 text-left text-sm font-medium text-gray-700">
              E-mailadres
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
                className="rounded-lg border-2 border-primary-100 px-4 py-3 text-base
                  focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
              />
            </label>
            <Button type="submit">Profiel aanmaken</Button>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center gap-8 pt-8 text-center">
      <h1 className="text-3xl font-extrabold text-primary-600">Ashi &amp; Tashi</h1>
      <p className="text-gray-600">Wie gaat er vandaag oefenen?</p>

      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
        {state.children.map((child) => (
          <Link
            key={child.id}
            href={`/kind/${child.id}/route`}
            className="flex flex-col items-center gap-2 rounded-xl2 border-2 border-primary-100 bg-white p-4
              transition-colors hover:border-primary-400 focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
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
            border-primary-300 p-4 text-primary-600 transition-colors hover:bg-primary-50
            focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        >
          <span className="text-4xl" aria-hidden="true">
            ➕
          </span>
          <span className="font-semibold">Nieuw kind</span>
        </Link>
      </div>

      <Link href="/ouder/overzicht" className="text-sm font-medium text-primary-600 underline underline-offset-2">
        Naar ouderoverzicht
      </Link>
    </main>
  );
}
