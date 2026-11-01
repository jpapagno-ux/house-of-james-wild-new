// Live rates from the house booking engine (book.wildearthstays.com, built by
// Tag Albie), ported from the Base44 function fetchBookingEngineRates.
// The engine page lists each rate plan ("Length of Stay Discount", "Best
// Available Rate"…) with its rooms; room names sit in <h3> and the first
// $price after each is the TOTAL for the stay. Pure functions, no imports,
// so plain Node can test them.

export const ENGINE_BASE = "https://book.wildearthstays.com/en/property/";
export const PLANS = ["Length of Stay Discount", "Best Available Rate"];

export type RateRoom = { name: string; total: number; display: string };
export type RatePlan = { plan: string; rooms: RateRoom[] };
export type RateQuery = { property: string; checkIn: string; checkOut: string; adults: number; children: number; rooms: number; currency: string };

export function engineUrl(q: RateQuery) {
  return `${ENGINE_BASE}${q.property}?checkIn=${q.checkIn}&checkOut=${q.checkOut}&adults=${q.adults}&children=${q.children}&infants=0&currency=${q.currency}&rooms=${q.rooms}`;
}

export function parseQuery(p: URLSearchParams): RateQuery | string {
  const property = (p.get("property") ?? "").toLowerCase();
  if (!/^[a-z0-9-]{2,80}$/.test(property)) return "Invalid property";
  const checkIn = p.get("checkIn") ?? "", checkOut = p.get("checkOut") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut) || checkOut <= checkIn) return "Dates must be YYYY-MM-DD, check-out after check-in";
  const n = (k: string, d: number, max: number) => Math.min(max, Math.max(0, parseInt(p.get(k) ?? "", 10) || d));
  const currency = (p.get("currency") ?? "USD").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "USD";
  return { property, checkIn, checkOut, adults: Math.max(1, n("adults", 2, 12)), children: n("children", 0, 10), rooms: Math.max(1, n("rooms", 1, 6)), currency };
}

function rooms(section: string): RateRoom[] {
  const out: RateRoom[] = [];
  const seen = new Set<string>();
  const hs = [...section.matchAll(/<h3[^>]*>([^<]{2,80})<\/h3>/g)];
  hs.forEach((m, i) => {
    const name = m[1].trim();
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < hs.length ? hs[i + 1].index ?? section.length : Math.min(start + 6000, section.length);
    const price = section.slice(start, end).match(/\$[\d,]+\.\d{2}/);
    if (price && !seen.has(name)) { seen.add(name); out.push({ name, total: parseFloat(price[0].replace(/[$,]/g, "")), display: price[0] }); }
  });
  return out;
}

// Each rate plan sits under <h2 class="text-xl font-bold">Plan name</h2>, and the
// name differs by property ("Non-Refundable", "Flexible Rate – Kayumanis Nusa
// Dua"…), so plans are read from those headings. PLANS is the fallback for a
// page without them.
const PLAN_H2 = /<h2 class="text-xl font-bold"[^>]*>([^<]{2,120})<\/h2>/g;
const tidy = (n: string) => { const t = n.replace(/\s+/g, " ").trim(); return t === t.toUpperCase() ? t.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : t; };

export function parseEngine(html: string): RatePlan[] {
  const stop = html.indexOf("properties in our collection");
  const end = stop > -1 ? stop : html.length;
  let starts = [...html.matchAll(PLAN_H2)].filter((m) => (m.index ?? 0) < end).map((m) => ({ plan: tidy(m[1]), at: m.index ?? 0 }));
  if (!starts.length) starts = PLANS.map((plan) => ({ plan, at: html.indexOf(plan) })).filter((x) => x.at > -1 && x.at < end).sort((a, b) => a.at - b.at);
  return starts
    .map((s, i) => ({ plan: s.plan, rooms: rooms(html.slice(s.at, i + 1 < starts.length ? starts[i + 1].at : end)) }))
    .filter((p) => p.rooms.length > 0);
}

export const nightsBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
