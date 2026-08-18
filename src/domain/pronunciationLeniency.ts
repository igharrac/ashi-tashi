/**
 * "Coulante uitspraakbeoordeling" (standaard aan, hfst. 22/23: nooit
 * vastlopen op een score). In plaats van te eisen dat een opname (bijna)
 * exact matcht — wat voor een jong kind vaak niet lukt, en voor de twee
 * oefeningen die nu nog via Nederlandse tekstherkenning gaan (Nazeggen,
 * Zelfstandig spreken) sowieso oneerlijk is, omdat het kind het
 * Tashelhit-woord zegt en niet het Nederlandse — telt gewoon het aantal
 * pogingen: na dit aantal pogingen is de oefening altijd klaar, ongeacht
 * of de uitspraak echt overeenkwam. Geen impliciete score, alleen een
 * vriendelijke teller.
 *
 * Zelfde regel voor alle drie de spreekoefeningen (Nazeggen, Zelfstandig
 * spreken, Luisteren en herkennen), zodat het voor het kind consistent is.
 */
export const LENIENT_PRONUNCIATION_ATTEMPTS = 3;

const COUNTED_AGAIN_MESSAGES = ["Goed gezegd!", "Mooi geprobeerd!", "Lekker bezig!"];
const COUNTED_DONE_MESSAGES = ["Top, dat heb je mooi gezegd!", "Goed gedaan, klaar!", "Knap gedaan!"];

function pick(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0]!;
}

/** Aanmoedigende boodschap zolang het aantal pogingen nog niet is gehaald — bewust geen "fout"-oordeel. */
export function leniencyRetryMessage(attemptNumber: number, requiredAttempts: number): string {
  return `${pick(COUNTED_AGAIN_MESSAGES)} (${attemptNumber}/${requiredAttempts})`;
}

/** Boodschap zodra het vereiste aantal pogingen is gehaald — de oefening is klaar. */
export function leniencyDoneMessage(): string {
  return pick(COUNTED_DONE_MESSAGES);
}
