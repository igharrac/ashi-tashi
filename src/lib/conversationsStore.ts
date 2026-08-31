import { promises as fs } from "fs";
import path from "path";
import type { ConversationDefinition, ConversationLine, ConversationStep } from "@/lib/conversations";

/**
 * Server-only opslag voor "Gesprekken" (zie conversations.ts) — zelfde
 * patroon als practiceContentStore.ts: bewerkbaar JSON onder data/, elke
 * mutatie regenereert meteen een statische snapshot onder public/ (nodig
 * voor Vercel's read-only filesystem, zie publicCatalogSnapshot.ts).
 * Draai dit lokaal (`npm run dev`), niet op Vercel.
 */

export interface ConversationsContent {
  conversations: ConversationDefinition[];
}

const CONTENT_PATH = path.join(process.cwd(), "data", "conversations-content.json");
const SNAPSHOT_PATH = path.join(process.cwd(), "public", "conversations-content.json");

const EMPTY_CONTENT: ConversationsContent = { conversations: [] };

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return typeof err === "object" && err !== null && "code" in err;
}

export async function readConversationsContent(): Promise<ConversationsContent> {
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf-8");
    return JSON.parse(raw) as ConversationsContent;
  } catch (err) {
    if (isErrnoException(err) && err.code === "ENOENT") return EMPTY_CONTENT;
    throw err;
  }
}

async function writeConversationsContent(content: ConversationsContent): Promise<void> {
  await fs.mkdir(path.dirname(CONTENT_PATH), { recursive: true });
  await fs.writeFile(CONTENT_PATH, `${JSON.stringify(content, null, 2)}\n`, "utf-8");
}

export async function regeneratePublicConversationsContent(): Promise<void> {
  const content = await readConversationsContent();
  await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
  await fs.writeFile(SNAPSHOT_PATH, `${JSON.stringify(content, null, 2)}\n`, "utf-8");
}

function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface MutationError {
  error: string;
}

function isMutationError(value: unknown): value is MutationError {
  return typeof value === "object" && value !== null && "error" in value;
}

export async function addConversation(input: {
  titleNl: string;
  emoji: string;
  teaser: string;
}): Promise<ConversationDefinition | MutationError> {
  const titleNl = input.titleNl.trim();
  const emoji = input.emoji.trim();
  const teaser = input.teaser.trim();
  if (!titleNl) return { error: "Titel is verplicht." };
  if (!emoji) return { error: "Emoji is verplicht." };

  const content = await readConversationsContent();
  const baseId = "gesprek-" + (slugifyText(titleNl) || Date.now().toString());
  let id = baseId;
  let suffix = 2;
  while (content.conversations.some((c) => c.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  const conversation: ConversationDefinition = { id, titleNl, emoji, teaser, steps: [] };
  content.conversations.push(conversation);
  await writeConversationsContent(content);
  await regeneratePublicConversationsContent();
  return conversation;
}

export async function updateConversationMeta(
  id: string,
  patch: { titleNl?: string; emoji?: string; teaser?: string },
): Promise<ConversationDefinition | null | MutationError> {
  const content = await readConversationsContent();
  const conversation = content.conversations.find((c) => c.id === id);
  if (!conversation) return null;

  if (patch.titleNl !== undefined) {
    const trimmed = patch.titleNl.trim();
    if (!trimmed) return { error: "Titel is verplicht." };
    conversation.titleNl = trimmed;
  }
  if (patch.emoji !== undefined) {
    const trimmed = patch.emoji.trim();
    if (!trimmed) return { error: "Emoji is verplicht." };
    conversation.emoji = trimmed;
  }
  if (patch.teaser !== undefined) {
    conversation.teaser = patch.teaser.trim();
  }

  await writeConversationsContent(content);
  await regeneratePublicConversationsContent();
  return conversation;
}

export async function deleteConversation(id: string): Promise<{ ok: true } | MutationError> {
  const content = await readConversationsContent();
  const next = content.conversations.filter((c) => c.id !== id);
  if (next.length === content.conversations.length) return { error: "Gesprek niet gevonden." };
  content.conversations = next;
  await writeConversationsContent(content);
  await regeneratePublicConversationsContent();
  return { ok: true };
}

/** Input-vorm vanuit de studio-editor: een nieuwe regel/optie heeft nog geen itemId. */
export type ConversationStepInput =
  | { type: "app"; line: { itemId?: string; translationNl: string } }
  | { type: "choice"; options: { itemId?: string; translationNl: string }[] };

/**
 * Vervangt de volledige stappenlijst van een gesprek in één keer (de studio-
 * editor werkt met een lokale kopie van de hele lijst en slaat die als
 * geheel op — eenvoudiger en minder foutgevoelig dan losse endpoints per
 * stap/optie). Bestaande item-id's blijven behouden (nodig zodat eerder
 * opgenomen audio gekoppeld blijft); nieuwe regels krijgen hier een verse,
 * unieke id.
 */
export async function updateConversationSteps(
  id: string,
  stepsInput: ConversationStepInput[],
): Promise<ConversationDefinition | null | MutationError> {
  const content = await readConversationsContent();
  const conversation = content.conversations.find((c) => c.id === id);
  if (!conversation) return null;

  // Alle al bestaande item-id's in ALLE gesprekken, zodat nieuwe regels altijd
  // een unieke id krijgen, ook bij toevallig dezelfde tekst.
  const existingIds = new Set<string>();
  for (const c of content.conversations) {
    for (const step of c.steps) {
      if (step.type === "app") existingIds.add(step.line.itemId);
      else for (const option of step.options) existingIds.add(option.itemId);
    }
  }

  function resolveLine(line: { itemId?: string; translationNl: string }): ConversationLine | MutationError {
    const translationNl = line.translationNl.trim();
    if (!translationNl) return { error: "Tekst is verplicht." };
    if (line.itemId && line.itemId.trim()) {
      return { itemId: line.itemId.trim(), translationNl };
    }
    const base = `item-${id}-${slugifyText(translationNl)}` || `item-${id}-${Date.now()}`;
    let itemId = base;
    let suffix = 2;
    while (existingIds.has(itemId)) {
      itemId = `${base}-${suffix}`;
      suffix += 1;
    }
    existingIds.add(itemId);
    return { itemId, translationNl };
  }

  const steps: ConversationStep[] = [];
  for (const stepInput of stepsInput) {
    if (stepInput.type === "app") {
      const resolved = resolveLine(stepInput.line);
      if (isMutationError(resolved)) return resolved;
      steps.push({ type: "app", line: resolved });
    } else {
      if (stepInput.options.length < 2) return { error: "Een keuzemoment heeft minstens 2 opties nodig." };
      const options: ConversationLine[] = [];
      for (const optionInput of stepInput.options) {
        const resolved = resolveLine(optionInput);
        if (isMutationError(resolved)) return resolved;
        options.push(resolved);
      }
      steps.push({ type: "choice", options });
    }
  }

  conversation.steps = steps;
  await writeConversationsContent(content);
  await regeneratePublicConversationsContent();
  return conversation;
}
