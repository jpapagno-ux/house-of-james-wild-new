import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/booking-live/supabase/server";
import { FLAGS } from "@/lib/booking-live/flags";

// POST /auth/sign-out — ends the session and returns home.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = new URL(req.url);
  if (FLAGS.accounts) {
    const sb = await supabaseServer();
    await sb.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", url.origin), { status: 303 });
}
