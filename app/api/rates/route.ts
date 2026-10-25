import { NextResponse } from "next/server";
import { engineUrl, nightsBetween, parseEngine, parseQuery } from "@/lib/rates";

// GET /api/rates?property=leeu-estates-resorts&checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&adults=2
// Reads the house booking engine for one property and dates, returns the
// rate plans and room totals. Cached 15 minutes (fetch cache + CDN), so page
// visits never hammer the engine. Public data only.
export async function GET(req: Request) {
  const q = parseQuery(new URL(req.url).searchParams);
  if (typeof q === "string") return NextResponse.json({ error: q }, { status: 400 });
  const url = engineUrl(q);
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; JamesWildCo/1.0)" }, next: { revalidate: 900 }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) return NextResponse.json({ error: `Engine returned ${res.status}`, engineUrl: url }, { status: 502 });
    const plans = parseEngine(await res.text());
    const body = { property: q.property, checkIn: q.checkIn, checkOut: q.checkOut, nights: nightsBetween(q.checkIn, q.checkOut), adults: q.adults, children: q.children, currency: q.currency, engineUrl: url, plans, available: plans.length > 0, fetchedAt: new Date().toISOString() };
    return NextResponse.json(body, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ error: "The booking engine didn't answer in time", engineUrl: url }, { status: 504 });
  }
}
