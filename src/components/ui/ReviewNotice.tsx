/**
 * Zichtbare markering voor niet-gereviewde taalcontent (hfst. 3, 54).
 * Placeholders mogen nooit stilzwijgend als echte leercontent gepresenteerd
 * worden — deze banner maakt dat in de admin/beheerweergave altijd duidelijk.
 * (In de kind-gerichte schermen tonen we bewust geen technisch jargon; daar
 * blijft het placeholder-woord zelf zichtbaar maar zonder deze banner.)
 */
export function ReviewNotice({ note }: { note: string }) {
  return (
    <p className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900">
      ⚠️ {note}
    </p>
  );
}
