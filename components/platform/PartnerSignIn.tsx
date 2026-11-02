"use client";
import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/booking-live/supabase/browser";

// Partner sign-in: password first (partners work at a desk all day), an emailed
// one-time link as the fallback. Supabase Auth checks the password; the desk never sees it.
export default function PartnerSignIn({ next, notice }: { next: string; notice: string | null }) {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [message, setMessage] = useState(notice ?? "");
  const validEmail = /.+@.+\..+/.test(email.trim());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy"); setMessage("");
    const sb = supabaseBrowser();
    if (mode === "password") {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { setState("idle"); setMessage(error.status === 429 ? "Too many attempts. Wait a minute, then try again." : "That email and password don't match. Try again, or use an email link."); return; }
      window.location.assign(next);
      return;
    }
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirect, shouldCreateUser: false } });
    if (error) { setState("idle"); setMessage(error.status === 429 ? "Too many sign-in emails just now. Please wait and use the newest link." : "We couldn't send a link to that address. Check it, or ask your James Wild & Co contact for an invitation."); return; }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div role="status" className="border ledger-rule p-6 max-w-md">
        <p className="ledger-display text-2xl">Check your inbox</p>
        <p className="mt-2 text-[16px]">If <strong>{email}</strong> has desk access, a sign-in link is on its way. It works once and expires in an hour.</p>
        <button type="button" className="mt-4 ledger-eyebrow hover:opacity-60" onClick={() => setState("idle")}>Back</button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="grid gap-4 max-w-md" noValidate>
      <div role="tablist" aria-label="How to sign in" className="flex gap-6 border-b ledger-border">
        {(["password", "link"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setMessage(""); }}
            className={`ledger-eyebrow py-2 border-b-2 -mb-px ${mode === m ? "ledger-crimson ledger-crimson-border" : "border-transparent hover:opacity-70"}`}>
            {m === "password" ? "Password" : "Email me a link"}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="text-[13px] ledger-muted">Work email</span>
        <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full bg-paper border ledger-border px-3 py-2.5 text-[16px]" aria-describedby={message ? "pd-signin-msg" : undefined} />
      </label>
      {mode === "password" && (
        <label className="block">
          <span className="flex items-baseline justify-between text-[13px] ledger-muted">
            <span>Password</span>
            <Link href="/partner/forgot-password" className="underline underline-offset-2 hover:opacity-70">Forgotten it?</Link>
          </span>
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-paper border ledger-border px-3 py-2.5 text-[16px]" />
        </label>
      )}
      {message && <p id="pd-signin-msg" role="alert" className="text-[14px] ledger-crimson">{message}</p>}
      <button type="submit" disabled={state === "busy" || !validEmail || (mode === "password" && password.length < 8)} className="ledger-btn ledger-btn--solid justify-center disabled:opacity-50">
        {state === "busy" ? "One moment…" : mode === "password" ? "Sign in to the desk" : "Email me a sign-in link"}
      </button>
      <p className="text-[13px] ledger-muted">Desk access is by invitation. New to James Wild &amp; Co? <Link href="/partner/apply" className="underline underline-offset-2">Apply to become a partner</Link>.</p>
    </form>
  );
}
