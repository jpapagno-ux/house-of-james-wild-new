"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";

// Partner set-up (James, 19 Nov 2026): skip a step that does not apply, and finish set-up.
export function SetupStepActions({ org, step, skipped }: { org: string; step: string; skipped: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function go() {
    setBusy(true); setErr("");
    const r = await api("POST", "/api/v1/partner/setup", { org, step, skip: !skipped });
    setBusy(false);
    if (!r.ok) { setErr(r.message); return; }
    router.refresh();
  }
  return (
    <span className="text-[13.5px]">
      <button type="button" disabled={busy} onClick={go} className="underline underline-offset-2 ledger-muted">{skipped ? "Undo skip" : "Not for us, skip"}</button>
      {err && <span role="alert" className="ml-2 ledger-crimson">{err}</span>}
    </span>
  );
}

export function FinishSetup({ org, finished, ready }: { org: string; finished: boolean; ready: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (finished) return <p className="text-[15px]">Set-up is finished. The house has been told; keep the record current from the Overview.</p>;
  async function go() {
    setBusy(true); setErr("");
    const r = await api("POST", "/api/v1/partner/setup", { org, finish: true });
    setBusy(false);
    if (!r.ok) { setErr(r.message); return; }
    router.push("/partner"); router.refresh();
  }
  return (
    <div className="grid gap-2 max-w-xl">
      <button type="button" disabled={busy || !ready} onClick={go} className="ledger-btn ledger-btn--solid justify-self-start disabled:opacity-50">Finish set-up</button>
      <p className="text-[13px] ledger-muted">{ready ? "Everything is in or skipped. Finishing tells the house your desk is ready for review." : "Finish each step, or skip the ones that do not apply, to finish set-up."}</p>
      {err && <p role="alert" className="text-[14px] ledger-crimson">{err}</p>}
    </div>
  );
}
