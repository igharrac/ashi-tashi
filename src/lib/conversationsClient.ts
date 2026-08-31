import type { ConversationDefinition } from "@/lib/conversations";

/**
 * Client-side cache rond /conversations-content.json — zelfde patroon als
 * practiceContentClient.ts: statisch bestand onder public/, module-level
 * cachePromise-singleton om dubbele fetches te voorkomen.
 */

export interface ConversationsContent {
  conversations: ConversationDefinition[];
}

const EMPTY_CONTENT: ConversationsContent = { conversations: [] };

let cachePromise: Promise<ConversationsContent> | null = null;

async function loadContent(): Promise<ConversationsContent> {
  const response = await fetch("/conversations-content.json", { cache: "no-store" });
  if (!response.ok) return EMPTY_CONTENT;
  return (await response.json()) as ConversationsContent;
}

export function getConversationsContent(): Promise<ConversationsContent> {
  if (!cachePromise) cachePromise = loadContent();
  return cachePromise;
}

export async function getConversations(): Promise<ConversationDefinition[]> {
  const content = await getConversationsContent();
  return content.conversations;
}

export async function getConversationById(id: string): Promise<ConversationDefinition | undefined> {
  const content = await getConversationsContent();
  return content.conversations.find((c) => c.id === id);
}

export function resetConversationsContentCache(): void {
  cachePromise = null;
}
