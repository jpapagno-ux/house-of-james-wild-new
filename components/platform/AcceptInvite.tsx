"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/booking-live/supabase/browser";
import { api } from "@/lib/platform/client";

// Accepting an invitation. Signed in: one button. Not signed in: an emailed link to the
// invited address brings the person back here signed in (a new account is created for
// a first-time invitee), then they accept and choose a password on Account.
export default function AcceptInvite({ token, signedInAs }: { token: string; signedInAs: string | null }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "done">("idle");
  const [msg, setMsg] = useState("");

  async function accept() {
    setState("busy"); setMsg("");
    const r = await api("POST", "/api/v1/partner/invitations/accept", { token });
    if (!r.ok) { setState("idle"); setMsg(r.message); return; }
    setState("done");
    window.location.assign("/partner/account?welcome=1");
  }
  async function sendLink(e: React.FormEvent) {
    e.preventDefault(); setState("busy"); setMsg("");
    const next = `/partner/invite/${token}`;
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`, shouldCreateUser: true } });
    if (error) { setState("idle"); setMsg(error.status === 429 ? "Too many emails just now. Please wait a while." : "We couldn't send a link to that address."); return; }
    setState("sent");
  }

  if (signedInAs) {
    return (
      <div className="grid gap-4 max-w-md">
        <p className="text-[16px]">Signed in as <strong>{signedInAs}</strong>. The invitation must have been sent to this address.</p>
        {msg && <p role="alert" className="text-[14px] ledger-crimson">{msg}</p>}
        <button type="button" onClick={accept} disabled={state !== "idle"} className="ledger-btn ledger-btn--solid justify-center disabled:opacity-50">{state === "busy" ? "Accepting…" : "Accept and open the desk"}</button>
        <form action="/auth/sign-out?to=partner" method="post"><button type="submit" className="text-[13px] ledger-muted underline underline-offset-2">Not you? Sign out</button></form>
      </div>
    );
  }
  if (state === "sent") {
    return <div role="status" className="border ledger-rule p-6 max-w-md"><p className="ledger-display text-2xl">Check your inbox</p><p className="mt-2 text-[16px]">Open the link we sent to <strong>{email}</strong>; it brings you back here to accept.</p></div>;
  }
  return (
    <form onSubmit={sendLink} className="grid gap-4 max-w-md" noValidate>
      <label className="block"><span className="text-[13px] ledger-muted">The email address the invitation was sent to</span>
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full bg-paper border ledger-border px-3 py-2.5 text-[16px]" /></label>
      {msg && <p role="alert" className="text-[14px] ledger-crimson">{msg}</p>}
      <button type="submit" disabled={state === "busy" || !/.+@.+\..+/.test(email)} className="ledger-btn ledger-btn--solid justify-center disabled:opacity-50">Email me a link to continue</button>
      <p className="text-[13px] ledger-muted">Already have desk access? <a href={`/partner/login?next=${encodeURIComponent(`/partner/invite/${token}`)}`} className="underline underline-offset-2">Sign in with your password</a>.</p>
    </form>
  );
}
