import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/booking-live/supabase/server";
import { FLAGS } from "@/lib/booking-live/flags";
import { PARTNER_DESK } from "@/lib/platform/flags";

// POST /auth/sign-out — ends the session and returns home.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = new URL(req.url);
  if (FLAGS.accounts || PARTNER_DESK) {
    const sb = await supabaseServer();
    await sb.auth.signOut();
  }
  // Partner Desk sign-out returns to its own door.
  const to = url.searchParams.get("to") === "partner" && PARTNER_DESK ? "/partner/login?signed_out=1" : "/";
  return NextResponse.redirect(new URL(to, url.origin), { status: 303 });
}
