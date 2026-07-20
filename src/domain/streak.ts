/**
 * Zachte streak-logica (hfst. 16).
 *
 * Expliciete grens uit het brief: "Een gemiste dag mag niet voelen als
 * verlies of falen" en "Overweeg een rustdag of zachte streak." Deze
 * implementatie staat daarom precies één gemiste dag toe binnen een reeks
 * zonder de streak te breken, en toont nooit een waarschuwing of
 * schuldgevoel-boodschap — alleen het aantal dagen.
 *
 * Datums zijn ISO-strings in "YYYY-MM-DD"-vorm (lokale kalenderdag, geen
 * tijdzone-precisie nodig voor dit doel).
 */

export function addDaysIso(iso: string, delta: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

export function todayIso(reference: Date = new Date()): string {
  return reference.toISOString().slice(0, 10);
}

/** Voeg vandaag toe aan de lijst met oefendagen, zonder duplicaten. */
export function recordPracticeDay(practiceDatesIso: string[], today: string): string[] {
  if (practiceDatesIso.includes(today)) return practiceDatesIso;
  return [...practiceDatesIso, today];
}

/**
 * Bereken de huidige streak: opeenvolgende oefendagen tot en met vandaag of
 * gisteren, met precies één toegestane rustdag (gemiste dag) binnen de
 * reeks voordat de telling stopt.
 */
export function computeStreakDays(practiceDatesIso: string[], today: string): number {
  const practiced = new Set(practiceDatesIso);
  let cursor = practiced.has(today) ? today : addDaysIso(today, -1);
  let restDayUsed = false;
  let streak = 0;

  for (let i = 0; i < 400; i += 1) {
    if (practiced.has(cursor)) {
      streak += 1;
      cursor = addDaysIso(cursor, -1);
      continue;
    }
    if (!restDayUsed) {
      restDayUsed = true;
      cursor = addDaysIso(cursor, -1);
      continue;
    }
    break;
  }

  return streak;
}
