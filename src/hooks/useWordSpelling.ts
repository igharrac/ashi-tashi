"use client";

import { useEffect, useState } from "react";
import { getPhoneticSpellingForItem } from "@/lib/referenceAudio";

/**
 * De door een beheerder ingevoerde fonetische/Latijnse Tashelhit-spelling
 * voor dit woord (opnamestudio), of null zolang die er nog niet is — dan
 * blijft de aanroepende component netjes op het Nederlands terugvallen.
 */
export function useWordSpelling(itemId: string): string | null {
  const [spelling, setSpelling] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSpelling(null);
    getPhoneticSpellingForItem(itemId).then((value) => {
      if (!cancelled) setSpelling(value);
    });
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  return spelling;
}
