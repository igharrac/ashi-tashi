import { NextResponse } from "next/server";
import { mintShareToken, SHARE_TOKEN_QUERY_PARAM } from "@/lib/shareLink";

/**
 * Genereert een nieuwe, tijdelijke deel-link (max 1 dag geldig) voor de
 * kind-app — zie src/lib/shareLink.ts en src/middleware.ts. Zit achter
 * dezelfde studio-wachtwoordgate als de rest van /api/studio/* (bewaakt door
 * middleware.ts, niet hier opnieuw gecontroleerd).
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.SHARE_LINK_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        error:
          "SHARE_LINK_SECRET is niet ingesteld op de server. Zet deze env var (een willekeurige lange, geheime string) en deploy opnieuw.",
      },
      { status: 500 },
    );
  }

  const { token, expiresAt } = await mintShareToken(secret);
  const origin = new URL(request.url).origin;
  const url = `${origin}/?${SHARE_TOKEN_QUERY_PARAM}=${token}`;

  return NextResponse.json({ url, expiresAt });
}
