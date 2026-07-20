"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AVATARS } from "@/lib/demoData";
import { Button } from "@/components/ui/Button";
import type { ExperienceLevel } from "@/types/domain";

const LEVELS: { value: ExperienceLevel; label: string; hint: string }[] = [
  { value: "A_ONTDEKKEN", label: "Ontdekken", hint: "6-8 jaar — veel audio, weinig tekst" },
  { value: "B_OEFENEN", label: "Oefenen", hint: "9-11 jaar — woorden en korte zinnen" },
  { value: "C_SPREKEN", label: "Spreken", hint: "12-14 jaar — langere zinnen en dialogen" },
];

/** Kindprofiel aanmaken: avatar en niveau kiezen (hfst. 5.1, 11.1, 55). */
export default function NewChildProfilePage() {
  const router = useRouter();
  const { createChildProfile } = useAppStore();
  const [displayName, setDisplayName] = useState("");
  const [avatarId, setAvatarId] = useState(AVATARS[0]);
  const [level, setLevel] = useState<ExperienceLevel>("A_ONTDEKKEN");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    const child = createChildProfile({ displayName: displayName.trim(), avatarId: avatarId ?? "🦊", level });
    router.push(`/kind/${child.id}/route`);
  }

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-primary-600">Nieuw kindprofiel</h1>

      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Naam
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-lg border-2 border-primary-100 px-4 py-3 text-base
              focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
          />
        </label>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">Kies een avatar</legend>
          <div className="grid grid-cols-6 gap-3" role="group">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => setAvatarId(avatar)}
                aria-pressed={avatarId === avatar}
                aria-label={`Avatar ${avatar}`}
                className={`flex h-14 w-14 items-center justify-center rounded-xl2 border-4 text-3xl
                  focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                  ${avatarId === avatar ? "border-primary-500 bg-primary-50" : "border-transparent bg-primary-100/50"}`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">Beginniveau (hfst. 5.1)</legend>
          <div className="flex flex-col gap-2">
            {LEVELS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col rounded-xl2 border-2 p-3
                  ${level === option.value ? "border-primary-500 bg-primary-50" : "border-primary-100"}`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="level"
                    value={option.value}
                    checked={level === option.value}
                    onChange={() => setLevel(option.value)}
                  />
                  <span className="font-semibold">{option.label}</span>
                </span>
                <span className="pl-6 text-sm text-gray-500">{option.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Button type="submit">Profiel aanmaken</Button>
      </form>
    </main>
  );
}
