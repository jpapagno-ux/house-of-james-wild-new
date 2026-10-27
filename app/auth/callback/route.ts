import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/booking-live/supabase/server";
import { FLAGS } from "@/lib/booking-live/flags";
import { safeNext } from "@/lib/booking-live/validate";

// GET /auth/callback?code=…&next=/account — the magic-link return. Exchanges
// the one-time code for a session cookie, then sends the traveler on to a
// same-site page only (open-redirect safe).
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!FLAGS.accounts) return new NextResponse("Not found", { status: 404 });
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  if (code) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/account/sign-in?error=link", url.origin));
}
