"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";

// House desk · advisors: decide a document, set the plan, activate. The database checks the role and
// the file; its message is shown as written.

const input = "mt-1 w-full bg-white border ledger-border px-3 py-2 text-[15px]";
const lab = "block text-[13px] ledger-muted";
type Msg = { ok: boolean; text: string } | null;
const Note = ({ m }: { m: Msg }) => (m ? <p role={m.ok ? "status" : "alert"} className={`text-[14px] ${m.ok ? "text-[#11705A]" : "ledger-crimson"}`}>{m.text}</p> : null);

export function DecideDocument({ id }: { id: string }) {
  const router = useRouter();
  const [returning, setReturning] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function decide(status: "accepted" | "returned") {
    setBusy(true); setMsg(null);
    const r = await api("POST", `/api/v1/desk/advisor-documents/${id}`, { status, note });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    router.refresh();
  }
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => decide("accepted")} className="ledger-btn ledger-btn--solid">Accept</button>
        <button type="button" disabled={busy} onClick={() => setReturning((v) => !v)} className="ledger-btn">Return</button>
      </div>
      {returning && (
        <div className="grid gap-2 max-w-xl">
          <label className={lab}>Why it is returned (the advisor sees this)<textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={1000} className={input} /></label>
          <button type="button" disabled={busy || !note.trim()} onClick={() => decide("returned")} className="ledger-btn justify-self-start disabled:opacity-50">Return with this note</button>
        </div>
      )}
      <Note m={msg} />
    </div>
  );
}

export function SetPlan({ id, fee, period, terms, signedIn }: { id: string; fee: number | null; period: string; terms: string | null; signedIn: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const r = await api("POST", `/api/v1/desk/advisors/${id}/plan`, { ...body, tier: body.tier || null, from: body.from || null });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    setMsg({ ok: true, text: "Saved." }); router.refresh();
  }
  return (
    <form onSubmit={send} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={lab}>New tier (leave as is to keep the current one)
          <select name="tier" defaultValue="" disabled={!signedIn} className={input}>
            <option value="">Keep as is</option><option value="tier_1">Tier 1</option><option value="tier_2">Tier 2</option><option value="tier_3">Tier 3</option>
          </select>
          {!signedIn && <span className="block mt-1 text-[12px]">The tier can be set once the advisor has signed in.</span>}
        </label>
        <label className={lab}>From (the new tier applies to bookings from this date)<input type="date" name="from" className={input} /></label>
        <label className={lab}>Program fee, US dollars<input name="feeDollars" inputMode="decimal" defaultValue={fee ? String(fee / 100) : ""} className={input} /></label>
        <label className={lab}>Charged
          <select name="feePeriod" defaultValue={period} className={input}><option value="none">No fee</option><option value="month">Each month</option><option value="year">Each year</option></select>
        </label>
      </div>
      <label className={lab}>Payment terms (the advisor sees these)<textarea name="terms" rows={2} maxLength={600} defaultValue={terms ?? ""} placeholder="For example: paid monthly, by the 15th, for commission received in the month before" className={input} /></label>
      <Note m={msg} />
      <div><button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid">{busy ? "Saving…" : "Save the plan"}</button></div>
    </form>
  );
}

export function Activate({ id, ready }: { id: string; ready: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function go() {
    setBusy(true); setMsg(null);
    const r = await api("POST", `/api/v1/desk/advisors/${id}/activate`);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    router.refresh();
  }
  return (
    <div className="grid gap-2">
      <button type="button" disabled={busy || !ready} onClick={go} className="ledger-btn ledger-btn--house justify-self-start disabled:opacity-50">{busy ? "Opening…" : "Activate and open the desk"}</button>
      <Note m={msg} />
    </div>
  );
}
