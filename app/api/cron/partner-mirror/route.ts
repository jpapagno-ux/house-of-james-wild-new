import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { push, type Snapshot } from "@/lib/platform/partner-mirror";

// GET /api/cron/partner-mirror: the daily Airtable copy of the Partner Desk (D-07). One way, desk to
// Airtable base "James Wild & Co · Partner Network"; matched on Desk ID; rows that leave the desk are
// ticked "Removed from desk", never deleted. A line goes to that base's Sync Log each run.
//
// Off unless PARTNER_MIRROR=on. Called by Vercel Cron with "Authorization: Bearer $CRON_SECRET".
// Needs SUPABASE_SERVICE_ROLE_KEY, AIRTABLE_MIRROR_TOKEN (write access to that base only) and
// AIRTABLE_PARTNER_BASE_ID. ?dry=1 counts what would be copied without writing.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  if (process.env.PARTNER_MIRROR !== "on") return NextResponse.json({ ok: true, off: true });
  const sb = supabaseAdmin(), token = process.env.AIRTABLE_MIRROR_TOKEN, base = process.env.AIRTABLE_PARTNER_BASE_ID;
  if (!sb || !token || !base) return NextResponse.json({ ok: false, message: "Mirror is not configured" }, { status: 503 });
  const { data, error } = await sb.rpc("partner_mirror_snapshot");
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const r = await push(data as Snapshot, { token, base, now: new Date().toISOString(), dry });
  return NextResponse.json({ dry, ...r }, { status: r.ok ? 200 : 502 });
}
