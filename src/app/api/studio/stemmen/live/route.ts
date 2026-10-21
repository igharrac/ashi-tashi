import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

/**
 * Deploy-status: vergelijkt de laatste commit (HEAD) met wat live draait, via
 * het commit-nummer (/api/version).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

async function git(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd: process.cwd() });
  return stdout.trim();
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url") || process.env.STUDIO_LIVE_URL || "";
  let base: URL;
  try {
    base = new URL(raw);
    if (base.protocol !== "https:") throw new Error("alleen https");
  } catch {
    return NextResponse.json({ status: "geen-url" });
  }

  let headSha = "";
  let ahead = 0;
  let headItems: string | null = null;
  try {
    headSha = await git(["rev-parse", "HEAD"]);
    const sb = await git(["status", "-sb", "--porcelain"]);
    ahead = Number(sb.split("\n")[0]?.match(/ahead (\d+)/)?.[1] ?? 0);
    headItems = JSON.stringify(JSON.parse(await git(["show", "HEAD:public/audio-catalog.json"])).items);
  } catch {
    /* geen git */
  }
  if (ahead > 0) return NextResponse.json({ status: "niet-gepusht", ahead });

  // 1) Precies: commit-SHA van de live deploy (/api/version, zie src/app/api/version).
  try {
    const res = await fetch(new URL(`/api/version?t=${Date.now()}`, base), { cache: "no-store" });
    if (res.ok) {
      const json = (await res.json()) as { sha?: string | null };
      if (json.sha) {
        return NextResponse.json({
          status: json.sha === headSha ? "bij" : "achter",
          method: "sha",
          liveSha: json.sha.slice(0, 7),
          headSha: headSha.slice(0, 7),
          checkedAt: new Date().toISOString(),
        });
      }
    }
  } catch {
    /* val terug op de catalogus-vergelijking */
  }

  // 2) Terugval (zolang /api/version nog niet live staat): inhoud van de audiocatalogus.
  //    generatedAt wordt door prebuild op Vercel ververst, dus alleen de items vergelijken.
  try {
    const res = await fetch(new URL(`/audio-catalog.json?t=${Date.now()}`, base), { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const liveItems = JSON.stringify(((await res.json()) as { items?: unknown }).items);
    return NextResponse.json({
      status: headItems !== null && liveItems === headItems ? "bij" : "achter",
      method: "catalogus",
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ status: "onbereikbaar" });
  }
}
