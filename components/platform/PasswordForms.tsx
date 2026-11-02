"use client";
import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/booking-live/supabase/browser";

// mode "request": email a reset link. mode "set": choose a new password while signed in
// (after the reset link, or from Account). Supabase Auth enforces strength and, when
// enabled in the dashboard, refuses passwords found in known breaches.
export default function PasswordForms({ mode, after = "/partner" }: { mode: "request" | "set"; after?: string }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [msg, setMsg] = useState("");

  async function request(e: React.FormEvent) {
    e.preventDefault(); setState("busy"); setMsg("");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/partner/reset-password")}`;
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error && error.status === 429) { setState("idle"); setMsg("Too many emails just now. Please wait a while."); return; }
    setState("done"); // same answer whether or not the address exists
  }
  async function set(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) { setMsg("The two passwords don't match."); return; }
    setState("busy"); setMsg("");
    const { error } = await supabaseBrowser().auth.updateUser({ password: pw });
    if (error) { setState("idle"); setMsg(/weak|pwned|breach|known/i.test(error.message) ? "Choose a stronger password: that one appears in known data breaches or is too simple." : "We couldn't save that password. Sign in again and retry."); return; }
    setState("done");
  }

  if (state === "done") {
    return mode === "request"
      ? <div role="status" className="border ledger-rule p-6 max-w-md"><p className="ledger-display text-2xl">Check your inbox</p><p className="mt-2 text-[16px]">If <strong>{email}</strong> has desk access, a reset link is on its way.</p></div>
      : <div role="status" className="border ledger-rule p-6 max-w-md"><p className="ledger-display text-2xl">Password saved</p><p className="mt-2 text-[16px]">Use it next time you sign in.</p><Link href={after} className="ledger-btn mt-4">Continue</Link></div>;
  }
  const input = "mt-1 w-full bg-paper border ledger-border px-3 py-2.5 text-[16px]";
  return mode === "request" ? (
    <form onSubmit={request} className="grid gap-4 max-w-md" noValidate>
      <label className="block"><span className="text-[13px] ledger-muted">Work email</span>
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} /></label>
      {msg && <p role="alert" className="text-[14px] ledger-crimson">{msg}</p>}
      <button type="submit" disabled={state === "busy" || !/.+@.+\..+/.test(email)} className="ledger-btn ledger-btn--solid justify-center disabled:opacity-50">Send the reset link</button>
      <Link href="/partner/login" className="text-[13px] ledger-muted underline underline-offset-2">Back to sign in</Link>
    </form>
  ) : (
    <form onSubmit={set} className="grid gap-4 max-w-md" noValidate>
      <label className="block"><span className="text-[13px] ledger-muted">New password</span>
        <input type="password" required minLength={10} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={input} aria-describedby="pw-help" /></label>
      <label className="block"><span className="text-[13px] ledger-muted">Type it again</span>
        <input type="password" required minLength={10} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={input} /></label>
      <p id="pw-help" className="text-[13px] ledger-muted">At least 10 characters. A short sentence works well.</p>
      {msg && <p role="alert" className="text-[14px] ledger-crimson">{msg}</p>}
      <button type="submit" disabled={state === "busy" || pw.length < 10} className="ledger-btn ledger-btn--solid justify-center disabled:opacity-50">Save password</button>
    </form>
  );
}
