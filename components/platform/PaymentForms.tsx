"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";
import { CURRENCIES, MAX_OTHER_CURRENCIES, POLICY_KINDS, POLICY_LABEL } from "@/lib/platform/commercial";

// Banking & policies (D-26). Forms only offer what this person may do; the database decides.

const input = "mt-1 w-full bg-white border ledger-border px-3 py-2 text-[15px]";
const lab = "block text-[13px] ledger-muted";

function useSend() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function send(method: "POST" | "PATCH", url: string, body: unknown, done: string) {
    setBusy(true); setMsg(null);
    const r = await api(method, url, body);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return false; }
    setMsg({ ok: true, text: done }); router.refresh(); return true;
  }
  return { busy, msg, send };
}
const Msg = ({ m }: { m: { ok: boolean; text: string } | null }) =>
  m ? <p role={m.ok ? "status" : "alert"} className={`text-[14px] ${m.ok ? "text-[#11705A]" : "text-house"}`}>{m.text}</p> : null;

export function CurrencyForm({ primary, others, canEdit }: { primary: string; others: string[]; canEdit: boolean }) {
  const { busy, msg, send } = useSend();
  const [main, setMain] = useState(primary);
  const [more, setMore] = useState<string[]>(others);
  const toggle = (c: string) => setMore((m) => (m.includes(c) ? m.filter((x) => x !== c) : m.length >= MAX_OTHER_CURRENCIES ? m : [...m, c]));
  if (!canEdit) return <p className="text-[15px]">{[primary, ...others].join(" · ")}</p>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); send("PATCH", "/api/v1/partner/company/currencies", { primaryCurrency: main, otherCurrencies: more }, "Saved."); }} className="grid gap-4">
      <label className={`${lab} max-w-sm`}>Main currency (rates and invoices)
        <select value={main} onChange={(e) => { setMain(e.target.value); setMore((m) => m.filter((x) => x !== e.target.value)); }} className={input}>
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.name}</option>)}
        </select>
      </label>
      <fieldset>
        <legend className={lab}>Other currencies you quote or accept (optional, up to {MAX_OTHER_CURRENCIES})</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CURRENCIES.filter((c) => c.code !== main).map((c) => {
            const on = more.includes(c.code);
            return (
              <button key={c.code} type="button" aria-pressed={on} title={c.name} onClick={() => toggle(c.code)}
                className="house-chip">{c.code}</button>
            );
          })}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-4"><button disabled={busy} className="ledger-btn">{busy ? "Saving" : "Save currencies"}</button><Msg m={msg} /></div>
    </form>
  );
}

export function BankAccountForm({ defaultCurrency }: { defaultCurrency: string }) {
  const { busy, msg, send } = useSend();
  const [open, setOpen] = useState(false);
  if (!open) return <div className="flex flex-wrap items-center gap-4"><button type="button" onClick={() => setOpen(true)} className="ledger-btn">Add banking details</button><Msg m={msg} /></div>;
  return (
    <form noValidate onSubmit={async (e) => { e.preventDefault(); const ok = await send("POST", "/api/v1/partner/bank-accounts", Object.fromEntries(new FormData(e.currentTarget).entries()), "Sent to the house for verification."); if (ok) setOpen(false); }}
      className="bg-white border ledger-border p-5 grid gap-4 sm:grid-cols-2">
      <p className="ledger-display text-[1.3rem] sm:col-span-2">Banking details</p>
      <p className="text-[13.5px] ledger-muted sm:col-span-2">Copy these from your bank letter. The house checks every new account with you by phone before paying into it, and you can file the bank letter under Documents.</p>
      <label className={lab}>Currency of the account
        <select name="currency" defaultValue={defaultCurrency} className={input}>{CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.name}</option>)}</select>
      </label>
      <label className={lab}>Bank country (two letters)<input name="bankCountry" maxLength={2} required placeholder="ZA" className={`${input} uppercase`} /></label>
      <label className={lab}>Account holder<input name="accountHolder" required maxLength={160} className={input} /></label>
      <label className={lab}>Bank<input name="bankName" required maxLength={160} className={input} /></label>
      <label className={lab}>Account number<input name="accountNumber" autoComplete="off" maxLength={40} className={input} /></label>
      <label className={lab}>IBAN (if your bank uses one)<input name="iban" autoComplete="off" maxLength={40} className={`${input} uppercase`} /></label>
      <label className={lab}>SWIFT / BIC<input name="swiftBic" autoComplete="off" maxLength={14} className={`${input} uppercase`} /></label>
      <label className={lab}>Routing, branch or sort code<input name="routingCode" autoComplete="off" maxLength={20} className={input} /></label>
      <label className={`${lab} sm:col-span-2`}>Bank address<input name="bankAddress" maxLength={400} className={input} /></label>
      <label className={`${lab} sm:col-span-2`}>Intermediary bank (if needed for US dollar payments)<input name="intermediaryBank" maxLength={400} className={input} /></label>
      <label className={`${lab} sm:col-span-2`}>Note for the house<input name="note" maxLength={500} className={input} placeholder="Payment reference to use, who to call to confirm" /></label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button disabled={busy} className="ledger-btn">{busy ? "Sending" : "Send for verification"}</button>
        <button type="button" onClick={() => setOpen(false)} className="ledger-btn-ghost">Cancel</button><Msg m={msg} />
      </div>
    </form>
  );
}

export function ReviewButtons({ url, yes, no, yesLabel, noLabel }: { url: string; yes: string; no: string; yesLabel: string; noLabel: string }) {
  const { busy, msg, send } = useSend();
  return (
    <span className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={busy} onClick={() => send("PATCH", url, { status: yes }, "Done.")} className="ledger-btn-ghost">{yesLabel}</button>
      <button type="button" disabled={busy} onClick={() => { const note = window.prompt("Why is it going back? The partner sees this note.") ?? ""; if (note.trim()) send("PATCH", url, { status: no, reviewNote: note }, "Returned."); }} className="ledger-btn-ghost">{noLabel}</button>
      <Msg m={msg} />
    </span>
  );
}

export function PolicyForm({ properties, documents, propertyRequired }: { properties: { id: string; name: string }[]; documents: { id: string; title: string }[]; propertyRequired: boolean }) {
  const { busy, msg, send } = useSend();
  const [open, setOpen] = useState(false);
  if (!open) return <div className="flex flex-wrap items-center gap-4"><button type="button" onClick={() => setOpen(true)} className="ledger-btn">Submit a policy</button><Msg m={msg} /></div>;
  return (
    <form noValidate onSubmit={async (e) => { e.preventDefault(); const ok = await send("POST", "/api/v1/partner/policies", Object.fromEntries(new FormData(e.currentTarget).entries()), "Sent to the house for approval."); if (ok) setOpen(false); }}
      className="bg-white border ledger-border p-5 grid gap-4 sm:grid-cols-2">
      <p className="ledger-display text-[1.3rem] sm:col-span-2">Cancellation or refund policy</p>
      <label className={lab}>Which policy
        <select name="kind" className={input}>{POLICY_KINDS.map((k) => <option key={k} value={k}>{POLICY_LABEL[k]}</option>)}</select>
      </label>
      <label className={lab}>Applies to
        <select name="propertyId" required={propertyRequired} defaultValue="" className={input}>
          {propertyRequired ? <option value="" disabled>Choose a property</option> : <option value="">Every property</option>}
          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <label className={`${lab} sm:col-span-2`}>The policy, as guests and advisors should read it
        <textarea name="body" rows={6} maxLength={8000} className={input} placeholder={"More than 90 days before arrival: deposit refunded in full.\n90 to 60 days: 50% of the stay.\nLess than 60 days: 100% of the stay."} />
      </label>
      <label className={lab}>Or attach the document that sets it out
        <select name="documentId" defaultValue="" className={input}>
          <option value="">No document</option>
          {documents.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>
      </label>
      <label className={lab}>In force from (optional)<input name="effectiveFrom" type="date" className={input} /></label>
      <p className="text-[12.5px] ledger-muted sm:col-span-2">To attach a file, upload it under Documents first. Nothing changes for guests until the house approves it.</p>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button disabled={busy} className="ledger-btn">{busy ? "Sending" : "Send for approval"}</button>
        <button type="button" onClick={() => setOpen(false)} className="ledger-btn-ghost">Cancel</button><Msg m={msg} />
      </div>
    </form>
  );
}
