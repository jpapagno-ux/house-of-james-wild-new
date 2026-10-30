import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runSync } from "@/lib/booking-live/rates/sync";

// POST /api/v1/internal/rates/sync — Airtable commercial base → Supabase.
// Server-to-server only: Authorization: Bearer <BOOKING_LIVE_SYNC_SECRET>
// (or Vercel Cron's CRON_SECRET). Never callable from a browser session.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorised(req: Request) {
  const got = req.headers.get("authorization") ?? "";
  return [process.env.BOOKING_LIVE_SYNC_SECRET, process.env.CRON_SECRET].some((secret) => {
    if (!secret || secret.length < 24) return false;
    const want = Buffer.from(`Bearer ${secret}`), have = Buffer.from(got);
    return want.length === have.length && timingSafeEqual(want, have);
  });
}

async function handle(req: Request) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
  if (!authorised(req)) return NextResponse.json({ error: { code: "forbidden", message: "Not allowed" } }, { status: 403, headers });
  const result = await runSync();
  return NextResponse.json({ data: result }, { status: result.ok ? 200 : 502, headers });
}

export const POST = handle;
export const GET = handle; // Vercel Cron calls with GET
