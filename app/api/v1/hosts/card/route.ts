import { NextResponse } from "next/server";
import { hostCard } from "@/lib/content/host-cards";

// GET /api/v1/hosts/card?key=stay:<slug> — the host card a page should show now, from the Partner Desk
// (approved hosts and the partner's on/off switch), falling back to the site's own list. Public: names and
// titles only, never contact details. Cached at the edge for a minute.
export const dynamic = "force-dynamic";
const KEY = /^(stay|camp|reserve|voyage|trip):[a-z0-9/_-]{1,160}$/;

export async function GET(req: Request) {
  const u = new URL(req.url);
  const key = u.searchParams.get("key") ?? "";
  if (!KEY.test(key)) return NextResponse.json({ error: { message: "key" } }, { status: 400 });
  const data = await hostCard(key, { optional: u.searchParams.get("optional") === "1" });
  return NextResponse.json({ data }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
