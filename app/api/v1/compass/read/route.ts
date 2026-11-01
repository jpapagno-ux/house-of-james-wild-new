import { NextResponse } from "next/server";
import { readPathways, PATHWAY_NAMES } from "@/lib/compass/pathway-adapter";
import { toReading } from "@/lib/compass/reading";
import { compassLedger } from "@/lib/compass/ledger";
import { PATHWAYS_ON } from "@/lib/content/pathways/flag";
import { absoluteUrl } from "@/lib/seo";

// GET/POST /api/v1/compass/read — the one Compass engine, behind an API (Stage 4, D24).
//
// The site Compass calls readPathways() directly; Iggi (the Core) calls this. Same
// function, same records (/compass/ledger.json), same reasons in the same words,
// so a reading answers identically in chat and on the page. Public fields only;
// the engine is deterministic and the Ledger changes only with a deploy, so the
// answer is cacheable per reading. noindex by nature (JSON).
//
// Reading (query string or JSON body):
//   party=family  settings=rainforest,ocean  season=green  pace=unhurried
//   privacy=private_house  interests=surfing,birding  conservation=1  culture=1  limit=5
export const dynamic = "force-dynamic";

async function handle(raw: Record<string, unknown>) {
  if (!PATHWAYS_ON) return NextResponse.json({ ok: false, error: "Compass is not open yet" }, { status: 404 });
  const { reading, ignored } = toReading(raw);
  const limit = Math.min(Math.max(Number(raw.limit) || 5, 1), 8);
  const { stays, journeys } = compassLedger();
  const records = [...stays, ...journeys];
  const byId = new Map(records.map((r) => [r.slug, r]));
  const out = readPathways(reading, records, { limit });
  return NextResponse.json({
    ok: true,
    reading,
    ignored,
    explain: out.explain,
    handoff: out.handoff ? { ...out.handoff, href: absoluteUrl(out.handoff.href) } : null,
    fits: out.fits.map((f) => {
      const r = byId.get(f.slug);
      return {
        ledgerId: f.ledgerId, slug: f.slug, name: r?.name ?? f.slug, kind: r?.kind ?? "stay", country: r?.country ?? null,
        href: r?.href ? absoluteUrl(r.href) : null, hero: r?.hero ?? null, bestMonths: r?.bestMonths ?? null,
        primaryPathway: f.primaryPathway, pathways: f.pathways.map((p) => ({ id: p, name: PATHWAY_NAMES[p] })), volumes: f.volumes,
        score: Math.round(f.score * 100) / 100, reasons: f.reasons.map((x) => x.text), fieldVerdict: f.fieldVerdict, impactDocumented: f.impactDocumented,
        verdictLine: r?.verdictLine ?? null, statusLine: r?.statusLine ?? null,
      };
    }),
    counts: { records: records.length, stays: stays.length, journeys: journeys.length },
  }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", "Access-Control-Allow-Origin": "*" } });
}

export async function GET(req: Request) {
  return handle(Object.fromEntries(new URL(req.url).searchParams.entries()));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return handle(body && typeof body === "object" ? (body as Record<string, unknown>) : {});
}
