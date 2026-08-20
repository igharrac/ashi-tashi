/**
 * Zelfondertekende, tijdelijke toegangslinks (max 1 dag geldig) om de app te
 * delen met mensen buiten de studio, zonder dat ze eerst zelf iets hoeven aan
 * te maken. Bewust ZONDER database (er is er nu geen aan de app gekoppeld,
 * zie README): de vervaldatum zit in de token zelf verwerkt en wordt met een
 * HMAC-handtekening geverifieerd. Een link kan hierdoor niet handmatig
 * ingetrokken worden vóór de vervaldatum — dat is de bewuste afruil voor
 * "geen nieuwe infrastructuur nodig, werkt meteen op Vercel".
 *
 * Gebruikt alleen Web Crypto (`crypto.subtle`) zodat dit bestand zowel in
 * middleware.ts (Edge-runtime) als in een gewone API-route (Node-runtime)
 * werkt zonder aparte imports.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export const SHARE_ACCESS_COOKIE = "ashi_tashi_access";
export const SHARE_TOKEN_QUERY_PARAM = "toegang";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signPayload(payloadB64: string, secret: string): Promise<string> {
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  return base64UrlEncode(new Uint8Array(signature));
}

async function verifyPayload(payloadB64: string, signatureB64: string, secret: string): Promise<boolean> {
  const key = await getHmacKey(secret);
  try {
    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signatureB64),
      new TextEncoder().encode(payloadB64),
    );
  } catch {
    return false;
  }
}

export interface ShareTokenResult {
  token: string;
  expiresAt: number;
}

/** Maakt een nieuw, ondertekend token met een vervaldatum (standaard 24 uur vanaf nu). */
export async function mintShareToken(secret: string, ttlMs: number = DAY_MS): Promise<ShareTokenResult> {
  const expiresAt = Date.now() + ttlMs;
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ exp: expiresAt })));
  const signatureB64 = await signPayload(payloadB64, secret);
  return { token: `${payloadB64}.${signatureB64}`, expiresAt };
}

export interface ShareTokenVerification {
  valid: boolean;
  expiresAt?: number;
}

/** Controleert handtekening + vervaldatum. Geeft nooit een fout, alleen `valid: false`. */
export async function verifyShareToken(token: string, secret: string): Promise<ShareTokenVerification> {
  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false };
  const [payloadB64, signatureB64] = parts;
  if (!payloadB64 || !signatureB64) return { valid: false };

  const signatureOk = await verifyPayload(payloadB64, signatureB64, secret);
  if (!signatureOk) return { valid: false };

  try {
    const json = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const parsed = JSON.parse(json) as { exp?: unknown };
    if (typeof parsed.exp !== "number") return { valid: false };
    if (Date.now() > parsed.exp) return { valid: false };
    return { valid: true, expiresAt: parsed.exp };
  } catch {
    return { valid: false };
  }
}
