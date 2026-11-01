import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/booking-live/supabase/server";
import { FLAGS } from "@/lib/booking-live/flags";
import { safeNext } from "@/lib/booking-live/validate";
import { PARTNER_DESK } from "@/lib/platform/flags";
import { safePartnerNext } from "@/lib/platform/validate";

// GET /auth/callback — the sign-in link's return. Two ways in:
//
// 1. ?token_hash=…&type=email  (preferred) — the email template links here
//    directly, so the link works on ANY device or browser: open it on your
//    phone even if you asked for it on your laptop.
// 2. ?code=…  (fallback) — Supabase's default PKCE link. Works only in the
//    same browser that requested it, because that browser holds the verifier.
//
// Either way the traveler goes on to a same-site page only (open-redirect safe).
export const dynamic = "force-dynamic";

const OTP_TYPES: EmailOtpType[] = ["email", "magiclink", "signup", "invite", "recovery", "email_change"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("next");
  // Partner Desk links return to /partner or /desk; everything else is Booking Live.
  const desk = !!raw && /^\/(partner|desk)(\/|$|\?)/.test(raw);
  if (desk ? !PARTNER_DESK : !FLAGS.accounts) return new NextResponse("Not found", { status: 404 });
  const next = desk ? safePartnerNext(raw) : safeNext(raw);
  const signIn = desk ? "/partner/login" : "/account/sign-in";
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const sb = await supabaseServer();

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    return NextResponse.redirect(new URL(`${signIn}?error=link`, url.origin));
  }
  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    // Most often: the link was opened in a different browser or device.
    return NextResponse.redirect(new URL(`${signIn}?error=device`, url.origin));
  }
  return NextResponse.redirect(new URL(`${signIn}?error=link`, url.origin));
}
