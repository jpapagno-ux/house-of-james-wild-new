"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/booking-live/supabase/browser";

// The second sign-in step for house accounts (D-11). Enrol: show the QR code (and the key, for typing in),
// then check a first code. Verify: one code. Supabase Auth holds the secret and checks the code.
export default function HouseCode({ mode, next }: { mode: "enroll" | "verify"; next: string }) {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      const sb = supabaseBrowser();
      const { data: list } = await sb.auth.mfa.listFactors();
      const verified = list?.totp?.find((f) => f.status === "verified");
      if (verified) { if (live) setFactorId(verified.id); return; }
      // Clear a half-finished setup (unverified factor) so a fresh QR code can be made.
      for (const f of list?.all ?? []) if (f.status !== "verified") await sb.auth.mfa.unenroll({ factorId: f.id });
      const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: "James Wild & Co" });
      if (!live) return;
      if (error || !data) { setMessage("We couldn't start the set-up. Refresh the page to try again."); return; }
      // Supabase returns the QR as raw SVG after a data: prefix; encode it so every browser draws it.
      const raw = data.totp.qr_code, at = raw.indexOf(",");
      setFactorId(data.id); setSecret(data.totp.secret);
      setQr(raw.startsWith("data:image/svg+xml") ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(raw.slice(at + 1))}` : raw);
    })();
    return () => { live = false; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true); setMessage("");
    const { error } = await supabaseBrowser().auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
    if (error) { setBusy(false); setMessage(error.status === 429 ? "Too many attempts. Wait a minute, then try again." : "That code didn't match. Codes change every 30 seconds; try the newest one."); return; }
    window.location.assign(next);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 max-w-md" noValidate>
      {mode === "enroll" && qr && (
        <div className="grid gap-3">
          <p className="text-[15px]">1. In your authenticator app (Google Authenticator, 1Password, Authy or similar), add an account and scan this code.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code for your authenticator app" width={180} height={180} className="border ledger-border bg-paper p-2" />
          {secret && <p className="text-[13px] ledger-muted">Can&rsquo;t scan? Type this key instead: <code className="select-all break-all">{secret}</code></p>}
          <p className="text-[15px]">2. Enter the six-digit code the app shows.</p>
        </div>
      )}
      <label className="block">
        <span className="text-[13px] ledger-muted">Six-digit code</span>
        <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="mt-1 w-full bg-paper border ledger-border px-3 py-2.5 text-[20px] tracking-[0.3em]" aria-describedby={message ? "pd-code-msg" : undefined} />
      </label>
      {message && <p id="pd-code-msg" role="alert" className="text-[14px] ledger-crimson">{message}</p>}
      <button type="submit" disabled={busy || !factorId || code.length !== 6} className="ledger-btn ledger-btn--solid justify-center disabled:opacity-50">
        {busy ? "One moment…" : mode === "enroll" ? "Turn on the code" : "Continue to the desk"}
      </button>
      <p className="text-[13px] ledger-muted">Lost your phone? Ask James to reset the code for your account.</p>
    </form>
  );
}
