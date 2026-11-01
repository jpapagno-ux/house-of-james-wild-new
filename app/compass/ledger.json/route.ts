import { compassLedger } from "@/lib/compass/ledger";
import { PATHWAYS_ON } from "@/lib/content/pathways/flag";

// /compass/ledger.json: the records the pathway reading answers from. Static
// at build (the Ledger changes only with a library sync and a deploy).
export const dynamic = "force-static";

export function GET() {
  if (!PATHWAYS_ON) return new Response("Not found", { status: 404 });
  const { stays, journeys } = compassLedger();
  return Response.json({ generatedAt: new Date().toISOString(), records: [...stays, ...journeys] }, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
