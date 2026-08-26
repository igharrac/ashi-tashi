import { NextResponse } from "next/server";
import { isShareLinkDuration, mintShareToken, SHARE_LINK_DURATIONS, SHARE_TOKEN_QUERY_PARAM } from "@/lib/shareLink";

/**
 * Genereert een nieuwe, tijdelijke deel-link voor de kind-app — zie
 * src/lib/shareLink.ts en src/middleware.ts. Duur is kiesbaar (op verzoek:
 * 1/3/7 dagen i.p.v. altijd vast 1 dag), standaard 1 dag als er niets of iets
 * ongeldigs wordt meegestuurd. Zit achter dezelfde studio-wachtwoordgate als
 * de rest van /api/studio/* (bewaakt door middleware.ts, niet hier opnieuw
 * gecontroleerd).
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

  const body = (await request.json().catch(() => null)) as { duration?: string } | null;
  const duration = isShareLinkDuration(body?.duration) ? body.duration : "1d";

  const { token, expiresAt } = await mintShareToken(secret, SHARE_LINK_DURATIONS[duration]);
  const origin = new URL(request.url).origin;
  const url = `${origin}/?${SHARE_TOKEN_QUERY_PARAM}=${token}`;

  return NextResponse.json({ url, expiresAt });
}
