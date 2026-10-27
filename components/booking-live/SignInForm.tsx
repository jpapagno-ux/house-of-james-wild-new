"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/booking-live/supabase/browser";

// Passwordless sign-in: the traveler enters an email, Supabase sends a
// one-time link that returns through /auth/callback to `next`.
export default function SignInForm({ next, linkError }: { next: string; linkError: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState(linkError ? "That sign-in link has expired or was already used. Send a fresh one." : "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirect, shouldCreateUser: true } });
    if (error) { setState("error"); setMessage(error.status === 429 ? "Too many links requested. Wait a minute and try again." : "We couldn't send the link. Check the address and try again."); return; }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div role="status" className="border ledger-rule p-6 max-w-md">
        <p className="ledger-display text-2xl">Check your inbox</p>
        <p className="mt-2 text-[16px]">A sign-in link is on its way to <strong>{email}</strong>. It works once and expires in an hour.</p>
        <button type="button" className="mt-4 ledger-eyebrow hover:opacity-60" onClick={() => setState("idle")}>Use a different email</button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="grid gap-3 max-w-md" noValidate>
      <label className="block">
        <span className="text-[13px] ledger-muted">Email</span>
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full bg-paper border ledger-border px-3 py-2 text-[16px]" aria-describedby={message ? "signin-msg" : undefined} />
      </label>
      {message && <p id="signin-msg" role="alert" className="text-[14px] ledger-crimson">{message}</p>}
      <button type="submit" disabled={state === "sending" || !/.+@.+\..+/.test(email)} className="ledger-btn justify-center disabled:opacity-50">
        {state === "sending" ? "Sending…" : "Email me a sign-in link"}
      </button>
      <p className="text-[13px] ledger-muted">No password to remember. We use your email only for your Folio and the trips you ask us about.</p>
    </form>
  );
}
