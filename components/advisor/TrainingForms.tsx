"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";
import { TRAINING_NOTE_MAX } from "@/lib/platform/advisor-training";

// Register for the advisor training program, or withdraw. Posts to /api/v1/advisor/training; the
// database decides, and its message is shown as written.

type Msg = { ok: boolean; text: string } | null;
const Note = ({ m }: { m: Msg }) => (m ? <p role={m.ok ? "status" : "alert"} className={`text-[14px] ${m.ok ? "text-[#11705A]" : "ledger-crimson"}`}>{m.text}</p> : null);

export function RegisterTraining({ registered, note }: { registered: boolean; note: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const n = String(new FormData(e.currentTarget).get("note") ?? "");
    setBusy(true); setMsg(null);
    const r = await api("POST", "/api/v1/advisor/training", { note: n });
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: registered ? "Saved." : "You are registered. The house will write to you first." } : { ok: false, text: r.message });
    if (r.ok) router.refresh();
  }
  async function withdraw() {
    setBusy(true); setMsg(null);
    const r = await api("DELETE", "/api/v1/advisor/training");
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: "Your registration is withdrawn." } : { ok: false, text: r.message });
    if (r.ok) router.refresh();
  }
  return (
    <form onSubmit={register} className="grid gap-3 max-w-lg">
      <label className="block text-[13px] ledger-muted">What would you most like to learn? (optional)
        <textarea name="note" defaultValue={note} rows={3} maxLength={TRAINING_NOTE_MAX} className="mt-1 w-full bg-white border ledger-border px-3 py-2 text-[15px]" />
      </label>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid disabled:opacity-60">{busy ? "One moment…" : registered ? "Save my note" : "Register for training"}</button>
        {registered && <button type="button" onClick={withdraw} disabled={busy} className="text-[13.5px] ledger-muted underline underline-offset-4 hover:text-ink">Withdraw</button>}
        <Note m={msg} />
      </div>
    </form>
  );
}
