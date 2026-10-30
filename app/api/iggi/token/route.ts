import { NextResponse } from "next/server";
import { isApprovedEmbedHost, signEmbedToken, IGGI_TOKEN_TTL_SECONDS } from "@/lib/iggi/embed-token";

// GET /api/iggi/token — mints the Contract C3 embed token for the Iggi iframe.
// Same-origin only: the requesting page's Origin (or the Referer's origin) must be
// an approved embed host, and it must match the host serving this route. Answers
// 503 in preview mode until IGGI_EMBED_SECRET is set in Vercel, so the embed can
// run without a token while the Core is not yet enforcing one.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.IGGI_EMBED_SECRET;
  if (!secret) return NextResponse.json({ ok: false, live: false, error: "Embed token not configured" }, { status: 503 });

  let origin = req.headers.get("origin");
  if (!origin) {
    const ref = req.headers.get("referer");
    try { origin = ref ? new URL(ref).origin : null; } catch { origin = null; }
  }
  if (!isApprovedEmbedHost(origin)) return NextResponse.json({ ok: false, error: "Origin not approved" }, { status: 403 });

  const self = new URL(req.url).origin.toLowerCase();
  if (self !== origin!.toLowerCase()) return NextResponse.json({ ok: false, error: "Cross-origin token requests are not allowed" }, { status: 403 });

  const token = signEmbedToken(origin!, secret);
  return NextResponse.json(
    { ok: true, token, ttl: IGGI_TOKEN_TTL_SECONDS },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
