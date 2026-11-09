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

export function DecideDna({ id }: { id: string }) {
  const router = useRouter();
  const [returning, setReturning] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function decide(status: "approved" | "returned") {
    setBusy(true); setMsg(null);
    const r = await api<{ rebuild: string }>("POST", `/api/v1/desk/advisor-dna/${id}`, { status, note });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    if (status === "approved") setMsg({ ok: true, text: r.data?.rebuild === "requested" ? "Approved. The site is rebuilding; the pages update in a few minutes." : "Approved. The pages update at the next rebuild." });
    router.refresh();
  }
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => decide("approved")} className="ledger-btn ledger-btn--solid">Approve the DNA</button>
        <button type="button" disabled={busy} onClick={() => setReturning((v) => !v)} className="ledger-btn">Return</button>
      </div>
      {returning && (
        <div className="grid gap-2 max-w-xl">
          <label className={lab}>What to change (the advisor sees this)<textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={1000} className={input} /></label>
          <button type="button" disabled={busy || !note.trim()} onClick={() => decide("returned")} className="ledger-btn justify-self-start disabled:opacity-50">Return with this note</button>
        </div>
      )}
      <Note m={msg} />
    </div>
  );
}

// ===== Step 7: add an advisor, invite them, record their portrait
export function AddAdvisor() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    setBusy(true); setMsg(null);
    const r = await api<{ id: string }>("POST", "/api/v1/desk/advisors", { name: f.get("name"), house: f.get("house") === "on" });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    router.push(`/desk/advisors/${r.data.id}`);
  }
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="ledger-btn">Add an advisor</button>;
  return (
    <form onSubmit={send} className="bg-white border ledger-border p-5 grid gap-3 max-w-xl">
      <label className={lab}>Full name, as it should appear on the card<input name="name" required minLength={3} maxLength={120} className={input} /></label>
      <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" name="house" className="accent-[#2E2B28]" /> A house advisor (family or staff of James Wild &amp; Co)</label>
      <p className="text-[13px] ledger-muted">The desk gives them an ADV number. Nothing is sent until you invite them on the next screen.</p>
      <div className="flex gap-3"><button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid">{busy ? "Adding…" : "Add the advisor"}</button>
        <button type="button" onClick={() => setOpen(false)} className="ledger-btn-ghost">Cancel</button></div>
      <Note m={msg} />
    </form>
  );
}

export type InvitationRow = { id: string; email: string; emailed: boolean; expires_at: string; accepted_at: string | null; revoked_at: string | null; created_at: string };
export function InviteAdvisor({ id, open, mailLive }: { id: string; open: InvitationRow | null; mailLive: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  async function send(e: React.FormEvent<HTMLFormElement>, email: boolean) {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    setBusy(true); setMsg(null); setLink(null);
    const r = await api<{ link: string; emailed: boolean }>("POST", `/api/v1/desk/advisors/${id}/invite`, { email: f.get("email"), send: email });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    setLink(r.data.link);
    setMsg({ ok: true, text: r.data.emailed ? "Emailed. The link below is the same one, in case they ask." : email ? "Email is not switched on yet, so nothing was sent. Copy the link below and send it yourself." : "Ready. Copy the link below and send it yourself." });
    router.refresh();
  }
  async function withdraw() {
    if (!open) return;
    setBusy(true); setMsg(null);
    const r = await api("DELETE", `/api/v1/desk/advisor-invitations/${open.id}`);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    router.refresh();
  }
  return (
    <div className="grid gap-4 max-w-xl">
      {open && <div className="text-[15px]">Invited <span className="font-medium">{open.email}</span> on {open.created_at.slice(0, 10)}{open.emailed ? " by email" : " (link passed on by hand)"}; the link expires {open.expires_at.slice(0, 10)}.
        <button type="button" disabled={busy} onClick={withdraw} className="ml-3 text-[13px] underline underline-offset-2 ledger-muted">Withdraw it</button></div>}
      <form onSubmit={(e) => send(e, (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "email")} className="grid gap-3">
        <label className={lab}>{open ? "Send a new invitation (replaces the one above)" : "Their email address (they sign in with it)"}<input name="email" type="email" required defaultValue={open?.email ?? ""} className={input} /></label>
        <div className="flex flex-wrap gap-3">
          <button type="submit" value="email" disabled={busy} className="ledger-btn ledger-btn--solid">{busy ? "Working…" : "Email the invitation"}</button>
          <button type="submit" value="link" disabled={busy} className="ledger-btn">Make a link only</button>
        </div>
        {!mailLive && <p className="text-[13px] ledger-muted">Email from the desk is not switched on yet: you will get a link to send yourself.</p>}
      </form>
      <Note m={msg} />
      {link && <div className="grid gap-2"><code className="block bg-[#F4F2EF] border ledger-border px-3 py-2 text-[12.5px] break-all">{link}</code>
        <button type="button" onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); }} className="ledger-btn justify-self-start">{copied ? "Copied" : "Copy the link"}</button>
        <p className="text-[13px] ledger-muted">Shown once. It works once, only for that address, for 14 days.</p></div>}
    </div>
  );
}

export function SetPortrait({ id, slug, current }: { id: string; slug: string; current: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    setBusy(true); setMsg(null);
    const r = await api("POST", `/api/v1/desk/advisors/${id}/portrait`, { publicId: f.get("publicId") });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    setMsg({ ok: true, text: "Saved. The card shows it after the next rebuild." });
    router.refresh();
  }
  return (
    <form onSubmit={send} className="grid gap-3 max-w-xl">
      <label className={lab}>Cloudinary public ID in the house library<input name="publicId" defaultValue={current ?? ""} placeholder={`jwco/advisors/${slug}/portrait`} className={input} /></label>
      <button type="submit" disabled={busy} className="ledger-btn justify-self-start">{busy ? "Saving…" : "Save the portrait"}</button>
      <Note m={msg} />
    </form>
  );
}
