import { promises as fs } from "fs";
import path from "path";

/**
 * Server-only opslag voor de fonetische/Latijnse Tashelhit-spelling per
 * woord (los van de audio-opnames zelf — hetzelfde woord kan door meerdere
 * persona's ingesproken zijn, maar heeft altijd dezelfde spelling). Ingevuld
 * vanuit de opnamestudio (/studio/opnames). Zie ARCHITECTUUR-OPNAMESTUDIO.md.
 *
 * Zolang een woord hier geen spelling heeft, blijft de rest van de app
 * netjes terugvallen op de Nederlandse vertaling (hfst. 3: nooit een
 * Tashelhit-vertaling verzinnen).
 */

export type WordSpellings = Record<string, string>;

const SPELLINGS_PATH = path.join(process.cwd(), "data", "word-spellings.json");

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return typeof err === "object" && err !== null && "code" in err;
}

export async function readSpellings(): Promise<WordSpellings> {
  try {
    const raw = await fs.readFile(SPELLINGS_PATH, "utf-8");
    return JSON.parse(raw) as WordSpellings;
  } catch (err) {
    if (isErrnoException(err) && err.code === "ENOENT") return {};
    throw err;
  }
}

async function writeSpellings(spellings: WordSpellings): Promise<void> {
  await fs.mkdir(path.dirname(SPELLINGS_PATH), { recursive: true });
  await fs.writeFile(SPELLINGS_PATH, `${JSON.stringify(spellings, null, 2)}\n`, "utf-8");
}

/** Lege string verwijdert de spelling weer (terug naar "nog niet ingevuld"). */
export async function setSpelling(itemId: string, phoneticSpelling: string): Promise<WordSpellings> {
  const spellings = await readSpellings();
  const trimmed = phoneticSpelling.trim();
  if (trimmed) {
    spellings[itemId] = trimmed;
  } else {
    delete spellings[itemId];
  }
  await writeSpellings(spellings);
  return spellings;
}
