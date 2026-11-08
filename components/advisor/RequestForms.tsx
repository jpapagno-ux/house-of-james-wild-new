"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";

// Advisor Desk · step 5 · quote requests: the advisor's form, withdrawing, copying the words for the client,
// and the house's decision. The database decides; its message is shown as written.

const input = "mt-1 w-full bg-white border ledger-border px-3 py-2 text-[15px]";
const lab = "block text-[13px] ledger-muted";
type Msg = { ok: boolean; text: string } | null;
const Note = ({ m }: { m: Msg }) => (m ? <p role={m.ok ? "status" : "alert"} className={`text-[14px] ${m.ok ? "text-[#11705A]" : "ledger-crimson"}`}>{m.text}</p> : null);

export function NewRequestForm({ stay, stayName, clients, today }: { stay: string; stayName: string; clients: { name: string; email: string | null }[]; today: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [email, setEmail] = useState("");
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true); setMsg(null);
    const body = Object.fromEntries(new FormData(form).entries());
    const r = await api<{ id: string; ref: string }>("POST", "/api/v1/advisor/requests", { ...body, stay });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); if (r.field) (form.elements.namedItem(r.field) as HTMLElement | null)?.focus(); return; }
    router.push(`/advisor/requests/${r.data.id}`); router.refresh();
  }
  return (
    <form onSubmit={send} className="bg-white border ledger-border p-5 md:p-6 grid gap-5" noValidate>
      <p className="ledger-display text-[1.3rem]">{stayName}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={lab}>Client&rsquo;s name
          <input name="client_name" required maxLength={160} list="advisor-clients" autoComplete="off" className={input}
            onChange={(e) => { const c = clients.find((x) => x.name === e.target.value); if (c?.email) setEmail(c.email); }} />
          <datalist id="advisor-clients">{clients.map((c) => <option key={c.name} value={c.name} />)}</datalist>
        </label>
        <label className={lab}>Client&rsquo;s email (optional, kept on the request)<input name="client_email" type="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className={input} /></label>
        <label className={lab}>Arrival<input name="arrival" type="date" required min={today} className={input} /></label>
        <label className={lab}>Departure<input name="departure" type="date" required min={today} className={input} /></label>
        <label className={lab}>Adults<input name="adults" type="number" required min={1} max={20} defaultValue={2} className={input} /></label>
        <label className={lab}>Children&rsquo;s ages (separate with commas)<input name="child_ages" inputMode="numeric" placeholder="e.g. 12, 9" className={input} /></label>
      </div>
      <label className={lab}>Room or camp you have in mind (optional)<input name="room_pref" maxLength={200} className={input} /></label>
      <label className={lab}>Notes for the house (optional)<textarea name="notes" rows={3} maxLength={1000} placeholder="Occasion, flexibility on dates, special requests" className={input} /></label>
      <p className="text-[13px] ledger-muted">The house prices it, checks space with the property and holds it. Nothing is sent to your client; you share the quote yourself once it is held.</p>
      <Note m={msg} />
      <div><button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid">{busy ? "Sending…" : "Send to the house"}</button></div>
    </form>
  );
}

export function WithdrawRequest({ id }: { id: string }) {
  const router = useRouter();
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function go() {
    setBusy(true); setMsg(null);
    const r = await api("POST", `/api/v1/advisor/requests/${id}/withdraw`);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    router.refresh();
  }
  return (
    <div className="grid gap-2">
      {!sure ? <button type="button" onClick={() => setSure(true)} className="ledger-btn-ghost justify-self-start">Withdraw this request</button>
        : <div className="flex flex-wrap items-center gap-3"><span className="text-[14px]">Withdraw it? The house stops work on it.</span><button type="button" disabled={busy} onClick={go} className="ledger-btn">Yes, withdraw</button><button type="button" onClick={() => setSure(false)} className="text-[13px] underline ledger-muted">Keep it</button></div>}
      <Note m={msg} />
    </div>
  );
}

export function CopyShare({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="grid gap-2">
      <pre className="whitespace-pre-wrap bg-[#F4F2EF] border ledger-border p-4 text-[14px] font-sans">{text}</pre>
      <button type="button" className="ledger-btn justify-self-start" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2500); } catch { setDone(false); } }}>
        {done ? "Copied" : "Copy for your client"}
      </button>
    </div>
  );
}

export function DecideRequest({ id, status, price, currency }: { id: string; status: string; price: string; currency: string }) {
  const router = useRouter();
  const [next, setNext] = useState(status === "sent" ? "pricing" : status === "pricing" ? "held" : "confirmed");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const r = await api("POST", `/api/v1/desk/advisor-requests/${id}`, { ...body, status: next });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    setMsg({ ok: true, text: "Saved. The advisor sees it now." }); router.refresh();
  }
  const priced = next === "held" || next === "confirmed";
  return (
    <form onSubmit={send} className="bg-white border ledger-border p-5 grid gap-4" noValidate>
      <fieldset className="flex flex-wrap gap-2">
        <legend className={lab}>Next</legend>
        {[["pricing", "Being priced"], ["held", "Priced and held"], ["confirmed", "Confirmed"], ["declined", "Not available"]].map(([k, l]) => (
          <label key={k} className={`house-chip border px-3 py-2 text-[14px] cursor-pointer ${next === k ? "border-[#2E2B28] bg-[#F4F2EF] font-medium" : "ledger-border"}`}>
            <input type="radio" name="next" className="sr-only" checked={next === k} onChange={() => setNext(k)} />{l}
          </label>
        ))}
      </fieldset>
      {priced && (
        <div className="grid gap-4 sm:grid-cols-4">
          <label className={`${lab} sm:col-span-2`}>Total price for the stay<input name="price" inputMode="decimal" defaultValue={price} placeholder="18,400" className={input} /></label>
          <label className={lab}>Currency<select name="currency" defaultValue={currency || "USD"} className={input}>{["USD", "ZAR", "EUR", "GBP", "IDR", "CRC"].map((c) => <option key={c}>{c}</option>)}</select></label>
          {next === "held" && <label className={lab}>Held until<input name="holdUntil" type="date" className={input} /></label>}
          <label className={lab}>Price valid until (optional)<input name="validUntil" type="date" className={input} /></label>
        </div>
      )}
      <label className={lab}>{next === "declined" ? "Why (the advisor sees this)" : "Note for the advisor (optional)"}<textarea name="note" rows={2} maxLength={1000} className={input} /></label>
      <Note m={msg} />
      <div><button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid">{busy ? "Saving…" : "Save"}</button></div>
    </form>
  );
}

export function RecordCommission({ id, price, currency, termRate }: { id: string; price: string; currency: string; termRate: string | null }) {
  const router = useRouter();
  const [override, setOverride] = useState(!termRate);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const r = await api<{ ref: string }>("POST", `/api/v1/desk/advisor-requests/${id}/commission`, override ? body : { base: body.base });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    setMsg({ ok: true, text: `Recorded as ${r.data.ref}.` }); router.refresh();
  }
  return (
    <form onSubmit={send} className="bg-white border ledger-border p-5 grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={lab}>Commissionable amount ({currency}): room, land or vessel after offers; never taxes or fees
          <input name="base" inputMode="decimal" defaultValue={price} className={input} />
        </label>
        <div className={lab}>Partner&rsquo;s rate
          <p className="mt-2 text-[15px] text-[#2E2B28]">{termRate ? `${termRate}, from the terms on file` : "No term on file for this stay"}</p>
          {termRate && <button type="button" onClick={() => setOverride((v) => !v)} className="mt-1 text-[12.5px] underline">{override ? "Use the terms on file" : "Use a different rate"}</button>}
        </div>
      </div>
      {override && (
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <label className={lab}>Rate (%)<input name="rate" inputMode="decimal" placeholder="20" className={input} /></label>
          <label className={lab}>Why, and where the rate comes from (kept on the line)<input name="note" maxLength={1000} className={input} /></label>
        </div>
      )}
      <p className="text-[13px] ledger-muted">The advisor&rsquo;s tier and share are taken today and fixed on the line; later changes to rates or tiers never rewrite it.</p>
      <Note m={msg} />
      <div><button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid">{busy ? "Recording…" : "Record the commission"}</button></div>
    </form>
  );
}

export function LineStep({ id, to, action, refLabel }: { id: string; to: string; action: string; refLabel: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [cancel, setCancel] = useState(false);
  async function send(status: string, form?: HTMLFormElement) {
    setBusy(true); setMsg(null);
    const body = form ? Object.fromEntries(new FormData(form).entries()) : {};
    const r = await api("POST", `/api/v1/desk/commissions/${id}`, { ...body, status });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    router.refresh();
  }
  return (
    <div className="grid gap-3">
      {to && (
        <form onSubmit={(e) => { e.preventDefault(); send(to, e.currentTarget); }} className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] items-end">
          <label className={lab}>Date<input type="date" name="on" defaultValue={new Date().toISOString().slice(0, 10)} className={input} /></label>
          <label className={lab}>{refLabel} (optional)<input name="reference" maxLength={120} className={input} /></label>
          <button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid">{action}</button>
        </form>
      )}
      {!cancel ? <button type="button" onClick={() => setCancel(true)} className="text-[12.5px] underline ledger-muted justify-self-start">Cancel this line</button>
        : <div className="flex flex-wrap items-center gap-3 text-[14px]">Cancel it? It drops out of every total.<button type="button" disabled={busy} onClick={() => send("cancelled")} className="ledger-btn">Yes, cancel</button><button type="button" onClick={() => setCancel(false)} className="text-[13px] underline ledger-muted">Keep it</button></div>}
      <Note m={msg} />
    </div>
  );
}
