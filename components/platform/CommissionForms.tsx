"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";

// Commercial terms (D-25). House finance records and confirms what a partner pays; the database
// decides who may (house admins, portfolio managers, finance). Partner admins only read.

const input = "mt-1 w-full bg-white border ledger-border px-3 py-2 text-[15px]";
const lab = "block text-[13px] ledger-muted";

export function AddTerm({ brands, properties }: { brands: { id: string; name: string }[]; properties: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<"partner" | "brand" | "property">(brands.length ? "brand" : "partner");
  const [basis, setBasis] = useState<"commission" | "net">("commission");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    setBusy(true); setMsg(null);
    const r = await api("POST", "/api/v1/partner/commission-terms", body);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    setMsg({ ok: true, text: "Recorded. It's in the list below." }); setOpen(false); router.refresh();
  }

  if (!open) return (
    <div className="flex flex-wrap items-center gap-4">
      <button type="button" onClick={() => setOpen(true)} className="ledger-btn">Record commission terms</button>
      {msg && <p role="status" className={`text-[14px] ${msg.ok ? "text-[#11705A]" : "text-house"}`}>{msg.text}</p>}
    </div>
  );
  const choices = scope === "brand" ? brands : properties;
  return (
    <form onSubmit={send} className="bg-white border ledger-border p-5 grid gap-4 sm:grid-cols-2" noValidate>
      <p className="ledger-display text-[1.3rem] sm:col-span-2">Record commission terms</p>
      <label className={lab}>Applies to
        <select name="scope" value={scope} onChange={(e) => setScope(e.target.value as typeof scope)} className={input}>
          <option value="partner">The whole partner</option>
          {brands.length > 0 && <option value="brand">One brand</option>}
          <option value="property">One property</option>
        </select>
      </label>
      {scope !== "partner" ? (
        <label className={lab}>{scope === "brand" ? "Brand" : "Property"}
          <select name="scopeId" required className={input} defaultValue="">
            <option value="" disabled>Choose</option>
            {choices.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      ) : <span className="hidden sm:block" />}
      <label className={lab}>Basis
        <select name="basis" value={basis} onChange={(e) => setBasis(e.target.value as typeof basis)} className={input}>
          <option value="commission">Commission on the rate</option>
          <option value="net">Net rates (we mark up)</option>
        </select>
      </label>
      {basis === "commission" ? (
        <label className={lab}>Rate (%)<input name="rate" inputMode="decimal" required placeholder="20" className={input} /></label>
      ) : <span className="hidden sm:block" />}
      <label className={lab}>Starts<input name="effectiveFrom" type="date" required className={input} /></label>
      <label className={lab}>Ends (optional)<input name="effectiveTo" type="date" className={input} /></label>
      <label className={lab}>Status
        <select name="status" defaultValue="to_confirm" className={input}>
          <option value="to_confirm">To confirm against the contract</option>
          <option value="confirmed">Confirmed in the signed contract</option>
        </select>
      </label>
      <label className={`${lab} sm:col-span-2`}>Note<textarea name="note" rows={2} maxLength={1000} className={input} placeholder="Clause 4.1 of the 2026 agreement" /></label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button disabled={busy} className="ledger-btn">{busy ? "Saving" : "Save terms"}</button>
        <button type="button" onClick={() => setOpen(false)} className="ledger-btn-ghost">Cancel</button>
        {msg && <p role="alert" className="text-[14px] text-house">{msg.text}</p>}
      </div>
    </form>
  );
}

export function TermStatus({ id, status }: { id: string; status: "to_confirm" | "confirmed" | "retired" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function set(next: "confirmed" | "retired") {
    setBusy(true); setErr(null);
    const r = await api("PATCH", `/api/v1/partner/commission-terms/${id}`, { status: next });
    setBusy(false);
    if (!r.ok) setErr(r.message); else router.refresh();
  }
  return (
    <span className="flex flex-wrap items-center gap-3">
      {status === "to_confirm" && <button type="button" disabled={busy} onClick={() => set("confirmed")} className="ledger-btn-ghost">Mark confirmed</button>}
      {status !== "retired" && <button type="button" disabled={busy} onClick={() => set("retired")} className="ledger-btn-ghost">Retire</button>}
      {err && <span role="alert" className="text-[13px] text-house">{err}</span>}
    </span>
  );
}
