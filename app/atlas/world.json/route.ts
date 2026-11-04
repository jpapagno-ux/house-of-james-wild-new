import REGION_LIB from "@/lib/charts/regions.json";

// /atlas/world.json: the world chart alone (about 90KB), for pages that put Ledger
// places on the Atlas on demand (Iggi's handoff, board §D item 3). The Compass page
// imports it at build; everything else fetches it only when there is something to show.
export const dynamic = "force-static";

export function GET() {
  return Response.json((REGION_LIB as Record<string, unknown>).world, { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } });
}
