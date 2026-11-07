"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "@/lib/platform/client";
import { ADV_DOC_KINDS, ADV_MAX_BYTES, ADV_MIME, ENTITY_TYPES, type AdvDocKind, type Details } from "@/lib/platform/advisor-file";

// Advisor Desk · step 3 · the forms of the advisor's file. Each posts to /api/v1/advisor/*; the database
// decides, and its message is shown as written.

const input = "mt-1 w-full bg-white border ledger-border px-3 py-2 text-[15px]";
const lab = "block text-[13px] ledger-muted";
type Msg = { ok: boolean; text: string } | null;
const Note = ({ m }: { m: Msg }) => (m ? <p role={m.ok ? "status" : "alert"} className={`text-[14px] ${m.ok ? "text-[#11705A]" : "ledger-crimson"}`}>{m.text}</p> : null);

export function DetailsForm({ initial, email }: { initial: Partial<Details> | null; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const v = (k: keyof Details) => (initial?.[k] == null ? "" : Array.isArray(initial[k]) ? (initial[k] as string[]).join(", ") : String(initial[k]));
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; // React clears currentTarget once the handler awaits
    setBusy(true); setMsg(null);
    const body = Object.fromEntries(new FormData(form).entries());
    const r = await api("POST", "/api/v1/advisor/details", body);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); if (r.field) (form.elements.namedItem(r.field) as HTMLElement | null)?.focus(); return; }
    setMsg({ ok: true, text: "Saved." });
    router.push("/advisor/file"); router.refresh();
  }
  return (
    <form onSubmit={send} className="bg-white border ledger-border p-5 md:p-6 grid gap-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={lab}>Full legal name<input name="legal_name" required maxLength={160} defaultValue={v("legal_name")} autoComplete="name" className={input} /><span className="block mt-1 text-[12px]">You type this exactly to sign the agreement.</span></label>
        <label className={lab}>Email for notices<input name="notice_email" type="email" required maxLength={254} defaultValue={v("notice_email") || email} autoComplete="email" className={input} /></label>
        <label className={lab}>Business name (if any)<input name="business_name" maxLength={160} defaultValue={v("business_name")} autoComplete="organization" className={input} /></label>
        <label className={lab}>You trade as
          <select name="entity_type" defaultValue={v("entity_type") || "individual"} className={input}>{ENTITY_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </label>
      </div>
      <label className={lab}>Mailing address<textarea name="mailing_address" required rows={3} maxLength={400} defaultValue={v("mailing_address")} autoComplete="street-address" className={input} /></label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={lab}>Mobile<input name="mobile" type="tel" maxLength={40} defaultValue={v("mobile")} autoComplete="tel" className={input} /></label>
        <label className={lab}>State or region<input name="residence_state" maxLength={80} defaultValue={v("residence_state")} autoComplete="address-level1" className={input} /></label>
        <label className={lab}>Country (two letters)<input name="residence_country" required maxLength={2} defaultValue={v("residence_country") || "US"} autoComplete="country" className={`${input} uppercase`} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={lab}>Seller of travel or independent agent registration<input name="sot_registration" maxLength={160} defaultValue={v("sot_registration")} placeholder="State and number, if your state requires one" className={input} /></label>
        <label className={lab}>Memberships (IATA, CLIA, other)<input name="memberships" maxLength={300} defaultValue={v("memberships")} className={input} /></label>
        <label className={lab}>Errors and omissions insurer<input name="eo_insurer" maxLength={160} defaultValue={v("eo_insurer")} className={input} /></label>
        <label className={lab}>Policy number<input name="eo_policy_number" maxLength={80} defaultValue={v("eo_policy_number")} className={input} /></label>
        <label className={lab}>Policy expires<input name="eo_expires_on" type="date" defaultValue={v("eo_expires_on")} className={input} /></label>
        <label className={lab}>Years selling travel<input name="years_selling" inputMode="numeric" maxLength={2} defaultValue={v("years_selling")} className={input} /></label>
      </div>
      <label className={lab}>Languages (separate with commas)<input name="languages" maxLength={300} defaultValue={v("languages")} className={input} /></label>
      <label className={lab}>Specialties and destinations<textarea name="specialties" rows={3} maxLength={1000} defaultValue={v("specialties")} className={input} /></label>
      <p className="text-[13px] ledger-muted">Leave out tax and bank numbers. They go only on your uploaded tax form and the house&rsquo;s secure payment setup.</p>
      <Note m={msg} />
      <div><button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid">{busy ? "Saving…" : "Save my details"}</button></div>
    </form>
  );
}

export function AcknowledgePlan({ done }: { done: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function go() {
    setBusy(true); setMsg(null);
    const r = await api("POST", "/api/v1/advisor/plan");
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    router.push("/advisor/file"); router.refresh();
  }
  return (
    <div className="grid gap-3">
      <button type="button" onClick={go} disabled={busy} className="ledger-btn ledger-btn--solid justify-self-start">{busy ? "One moment…" : done ? "Acknowledge again" : "I have read my plan"}</button>
      <Note m={msg} />
    </div>
  );
}

export function SignAgreement({ agreementId, version }: { agreementId: string; version: string }) {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const r = await api("POST", "/api/v1/advisor/agreement", { agreementId, typedName: name, consent });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    router.push("/advisor/file/agreement"); router.refresh();
  }
  return (
    <form onSubmit={send} className="bg-white border-2 border-[#8B2525]/40 p-5 md:p-6 grid gap-4" noValidate>
      <p className="ledger-display text-[1.35rem]">Sign version {version}</p>
      <label className="flex gap-3 items-start text-[15px]">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[#8B2525]" />
        <span>I have read the Independent Marketing Agreement above in full, and I agree to it. I understand that typing my name below is my electronic signature.</span>
      </label>
      <label className={lab}>Your full legal name, exactly as in your details
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={160} autoComplete="name" className={`${input} font-serif text-[20px]`} />
      </label>
      <Note m={msg} />
      <div><button type="submit" disabled={busy || !consent || name.trim().length < 2} className="ledger-btn ledger-btn--solid disabled:opacity-50">{busy ? "Signing…" : "Sign the agreement"}</button></div>
    </form>
  );
}

export function UploadAdvisorDocument({ start }: { start?: AdvDocKind }) {
  const router = useRouter();
  const [kind, setKind] = useState<AdvDocKind>(start ?? "tax_form");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const formRef = useRef<HTMLFormElement>(null);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const f = fd.get("file");
    if (f instanceof File && f.size > ADV_MAX_BYTES) { setMsg({ ok: false, text: "That file is over 20 MB" }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/v1/advisor/documents", { method: "POST", body: fd });
      const j = await r.json().catch(() => null);
      if (!r.ok) { setMsg({ ok: false, text: j?.error?.message ?? "The file did not upload. Try again." }); return; }
      setMsg({ ok: true, text: "Filed. The house will review it." });
      formRef.current?.reset(); router.refresh();
    } catch { setMsg({ ok: false, text: "No connection. Check your network and try again." }); }
    finally { setBusy(false); }
  }
  return (
    <form ref={formRef} onSubmit={send} className="bg-white border ledger-border p-5 md:p-6 grid gap-4" noValidate>
      <p className="ledger-display text-[1.3rem]">File a document</p>
      <fieldset className="grid gap-2">
        <legend className={lab}>What is it?</legend>
        {ADV_DOC_KINDS.map((k) => (
          <label key={k.key} className={`flex gap-3 border px-3 py-2.5 cursor-pointer ${kind === k.key ? "border-[#8B2525] bg-[#F3ECEA]" : "ledger-border"}`}>
            <input type="radio" name="kind" value={k.key} checked={kind === k.key} onChange={() => setKind(k.key)} className="mt-1 accent-[#8B2525]" />
            <span><span className="font-medium">{k.label}{k.required ? " (required)" : ""}</span><span className="block text-[13px] ledger-muted">{k.line}</span></span>
          </label>
        ))}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={lab}>Title (optional)<input name="title" maxLength={160} className={input} /></label>
        <label className={lab}>Expires (if it does)<input type="date" name="expiresOn" className={input} /></label>
      </div>
      <label className={lab}>Note for the house (optional)<textarea name="note" rows={2} maxLength={1000} className={input} /></label>
      <label className={lab}>File (PDF, JPG or PNG, up to 20 MB)
        <input type="file" name="file" required accept={Object.keys(ADV_MIME).join(",")} className="mt-1 block w-full text-[14px]" />
      </label>
      <Note m={msg} />
      <div><button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid">{busy ? "Uploading…" : "File it"}</button></div>
    </form>
  );
}

export function WithdrawDocument({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <span className="inline-flex items-center gap-3">
      <button type="button" disabled={busy} onClick={async () => { setBusy(true); const r = await api("DELETE", `/api/v1/advisor/documents/${id}`); setBusy(false); if (!r.ok) setErr(r.message); else router.refresh(); }}
        className="text-[12.5px] underline ledger-muted hover:text-ink">{busy ? "Withdrawing…" : "Withdraw"}</button>
      {err && <span role="alert" className="text-[12.5px] ledger-crimson">{err}</span>}
    </span>
  );
}
