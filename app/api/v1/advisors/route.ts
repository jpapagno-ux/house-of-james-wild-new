import { NextResponse } from "next/server";
import { allAdvisorFeeds, whoShouldPlan } from "@/lib/advisors/feed";
import type { Volume } from "@/lib/content/advisor-desk";

// GET /api/v1/advisors — the advisor feed for Iggi and Safari Crux (Contract C3).
// Optional filters: ?country=botswana  ?region=africa  ?volume=safaris  ?ledgerId=STY-…
// With a filter the answer is "who should plan this", default advisor first.
// Public fields only; dynamic so the filters read, cached an hour at the edge.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const country = u.searchParams.get("country"), region = u.searchParams.get("region"), volume = u.searchParams.get("volume") as Volume | null, ledgerId = u.searchParams.get("ledgerId");
  const filtered = country || region || volume || ledgerId;
  const body = filtered ? { ok: true, ...whoShouldPlan({ countrySlug: country, regionSlug: region, volume: volume ?? undefined, ledgerId }) } : { ok: true, advisors: allAdvisorFeeds() };
  return NextResponse.json(body, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", "Access-Control-Allow-Origin": "*" } });
}
