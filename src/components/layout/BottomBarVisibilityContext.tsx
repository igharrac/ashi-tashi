"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

interface BottomBarVisibilityContextValue {
  hidden: boolean;
  hide: () => void;
  show: () => void;
}

const BottomBarVisibilityContext = createContext<BottomBarVisibilityContextValue | null>(null);

/**
 * Laat schermvullende mobiele overlays (bv. JourneySettingsMenu) de onderste
 * navigatiebalk (BottomTabBar) tijdelijk verbergen. Reden: die balk is
 * `fixed`/altijd zichtbaar op mobiel, en overlay-inhoud die daar precies
 * onder valt was daardoor niet goed scrollbaar/bereikbaar. Zodra de overlay
 * weer dicht gaat, komt de balk vanzelf terug — "altijd toegankelijk zodra
 * je teruggaat", zoals gevraagd.
 *
 * Een teller i.p.v. een simpele boolean, zodat het geen probleem is als er
 * ooit meerdere overlays tegelijk open zouden zijn (elk registreert zijn
 * eigen hide/show, de balk verschijnt pas weer als de laatste dicht gaat).
 */
export function BottomBarVisibilityProvider({ children }: { children: ReactNode }) {
  const [hideCount, setHideCount] = useState(0);
  const hide = useCallback(() => setHideCount((count) => count + 1), []);
  const show = useCallback(() => setHideCount((count) => Math.max(0, count - 1)), []);

  return (
    <BottomBarVisibilityContext.Provider value={{ hidden: hideCount > 0, hide, show }}>
      {children}
    </BottomBarVisibilityContext.Provider>
  );
}

function useBottomBarVisibility(): BottomBarVisibilityContextValue {
  const ctx = useContext(BottomBarVisibilityContext);
  // Buiten AppShell (bv. lesschermen, die bewust geen AppShell gebruiken)
  // bestaat deze context niet — dan is er ook geen onderbalk om te
  // verbergen, dus een onschadelijke no-op teruggeven i.p.v. een crash.
  if (!ctx) return { hidden: false, hide: () => {}, show: () => {} };
  return ctx;
}

/** Verberg de onderste navigatiebalk zolang `open` waar is. */
export function useHideBottomBarWhile(open: boolean): void {
  const { hide, show } = useBottomBarVisibility();
  useEffect(() => {
    if (!open) return;
    hide();
    return () => show();
  }, [open, hide, show]);
}

export function useIsBottomBarHidden(): boolean {
  return useBottomBarVisibility().hidden;
}
