import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { verifyWorkflow } from "@/lib/platform/github-oidc";
import { batchName, buildBatch, checkBatch, type PendingRow } from "@/lib/platform/publish-run";
import { today } from "@/lib/dates";

// The publish run (D-18 A), the site's half. Only this repository's GitHub workflows may call it
// (GitHub Actions OIDC, lib/platform/github-oidc.ts); never a browser.
//   GET  /api/v1/internal/publish-run   the pending batch: what editors approved and the Library has not taken
//   POST /api/v1/internal/publish-run   { batch, revisionIds } after the Library reports ok: stamp them published
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const fail = (status: number, message: string) => NextResponse.json({ error: { message } }, { status, headers });

export async function GET(req: Request) {
  const who = await verifyWorkflow(req, { mainOnly: false });
  if (!who.ok) return fail(who.status, who.error);
  const sb = supabaseAdmin();
  if (!sb) return fail(503, "Publishing is not configured");
  const { data, error } = await sb.rpc("publish_run_pending");
  if (error) return fail(502, error.message);
  const batch = buildBatch((data ?? []) as PendingRow[], "James Wild & Co publish run (approved on the Partner Desk)", batchName(new Date()), today());
  const problems = checkBatch(batch);
  if (problems.length) return fail(422, problems.join("; "));
  return NextResponse.json(batch, { headers });
}

export async function POST(req: Request) {
  const who = await verifyWorkflow(req, { mainOnly: true });
  if (!who.ok) return fail(who.status, who.error);
  const sb = supabaseAdmin();
  if (!sb) return fail(503, "Publishing is not configured");
  let body: { batch?: unknown; revisionIds?: unknown };
  try { body = await req.json(); } catch { return fail(400, "Bad JSON"); }
  const ids = Array.isArray(body.revisionIds) ? body.revisionIds.filter((x): x is string => typeof x === "string" && /^[0-9a-f-]{36}$/i.test(x)) : [];
  if (typeof body.batch !== "string" || !/^[a-z0-9-]{3,80}$/.test(body.batch) || !ids.length) return fail(400, "batch and revisionIds");
  const { data, error } = await sb.rpc("publish_run_mark", { p_revisions: ids, p_batch: body.batch });
  if (error) return fail(502, error.message);
  return NextResponse.json({ ok: true, stamped: data, run: who.run }, { headers });
}
