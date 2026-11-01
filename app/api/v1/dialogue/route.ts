import { NextResponse } from "next/server";
import { DIALOGUE } from "@/lib/content/dialogue-register";
import { publicLines, type Audience, type CharacterId, type Intent } from "@/lib/content/dialogue";

// GET /api/v1/dialogue — the James & Iggi dialogue register, approved lines only
// (Wild Pathways 2F-ii, 1 Nov 2026; Iggi handoff contract §6.3). Iggi Core reads
// this so the embed says exactly what the page bubbles say: the decline, the
// advisor handoff, the safari-desk handoff, the nudges. Filters: ?character=iggi
// &page=stay&audience=traveler&intent=handoff. Static: the register changes
// only with a deploy.
export const dynamic = "force-dynamic"; // filters read the query string; the response is cacheable for an hour

export function GET(req: Request) {
  const u = new URL(req.url);
  const f = {
    character: (u.searchParams.get("character") as CharacterId) || undefined,
    page: u.searchParams.get("page") || undefined,
    audience: (u.searchParams.get("audience") as Audience) || undefined,
    intent: (u.searchParams.get("intent") as Intent) || undefined,
  };
  const lines = publicLines(DIALOGUE, f);
  return NextResponse.json(
    { ok: true, count: lines.length, rules: { approvedOnly: true, iggiNeverClaimsFieldExperience: true, originLabelAlways: true, source: "docs/wild-pathways/DIALOGUE.md" }, lines },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
