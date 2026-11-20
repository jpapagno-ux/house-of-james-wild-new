import { atlasIndex } from "@/lib/atlas/build";
import { ATLAS_ON } from "@/lib/atlas/flag";

// /atlas/index.json: the Atlas index, built once per deploy from the Ledger files (lib/atlas/build.ts). Public,
// traveller-facing fields only. Served only while the Atlas pilot is on (lib/atlas/flag.ts).
export const dynamic = "force-static";

export function GET() {
  if (!ATLAS_ON) return new Response("Not found", { status: 404 });
  return Response.json({ builtOn: new Date().toISOString().slice(0, 10), records: atlasIndex() }, { headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=86400", "X-Robots-Tag": "noindex" } });
}
