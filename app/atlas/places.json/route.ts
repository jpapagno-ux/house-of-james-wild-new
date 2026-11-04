import { compassLedger } from "@/lib/compass/ledger";

// /atlas/places.json: every Ledger record that has a pin, slimmed to what the Atlas needs
// (slug, Ledger ID, name, country, link, lat, lng). Static at build, like /compass/ledger.json.
// Used to resolve the places Iggi names (by slug or Ledger ID) onto the chart.
export const dynamic = "force-static";

export type AtlasPlace = { slug: string; ledgerId: string | null; name: string; country: string | null; href: string; lat: number; lng: number };

export function GET() {
  const { stays, journeys } = compassLedger();
  const places: AtlasPlace[] = [...stays, ...journeys]
    .filter((r) => r.coords && Number.isFinite(r.coords.lat) && Number.isFinite(r.coords.lng))
    .map((r) => ({ slug: r.slug, ledgerId: r.ledgerId ?? null, name: r.name, country: r.country ?? null, href: r.href, lat: r.coords!.lat, lng: r.coords!.lng }));
  return Response.json({ generatedAt: new Date().toISOString(), places }, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
