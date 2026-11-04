"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";

// Hosts (James, 4 Nov 2026): the toggle, a proposal, and the house's decision. The database decides who may.
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
  m ? <p role={m.ok ? "status" : "alert"} className={`text-[13.5px] ${m.ok ? "text-[#11705A]" : "text-house"}`}>{m.text}</p> : null;

/** The switch on every page row: on shows the approved host on the website; off hands the call to the house. */
export function HostToggle({ id, on, label, canEdit }: { id: string; on: boolean; label: string; canEdit: boolean }) {
  const { busy, msg, send } = useSend();
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button type="button" role="switch" aria-checked={on} aria-label={`Show the host on the website: ${label}`} disabled={busy || !canEdit}
        onClick={() => send("PATCH", `/api/v1/partner/hosts/${id}`, { showOnSite: !on }, on ? "Off. The house takes the call on this page." : "On. The host card is live on this page.")}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center border transition-colors disabled:opacity-60 ${on ? "bg-[#2E2B28] border-[#2E2B28]" : "bg-white ledger-border"}`}>
        <span className={`block h-5 w-5 transition-transform ${on ? "translate-x-[22px] bg-white" : "translate-x-[3px] bg-[#8C8277]"}`} />
      </button>
      <span className="text-[12px] ledger-muted">{on ? "On the website" : "Off"}</span>
      <Msg m={msg} />
    </span>
  );
}

export function WithdrawHost({ id }: { id: string }) {
  const { busy, msg, send } = useSend();
  return <span className="inline-flex items-center gap-2"><button type="button" disabled={busy} onClick={() => send("PATCH", `/api/v1/partner/hosts/${id}`, { withdraw: true }, "Withdrawn.")} className="ledger-btn-ghost">Withdraw</button><Msg m={msg} /></span>;
}

type Opt = { id: string; name: string; title: string | null };
export function ProposeHost({ pages, contacts, company, initialPage }: { pages: { key: string; label: string }[]; contacts: Opt[]; company: string; initialPage?: string }) {
  const { busy, msg, send } = useSend();
  const [open, setOpen] = useState(!!initialPage);
  const [contact, setContact] = useState("");
  const picked = contacts.find((c) => c.id === contact);
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="ledger-btn">Propose a host</button>;
  return (
    <form className="bg-white border ledger-border p-4 grid gap-3 sm:grid-cols-2" noValidate onSubmit={async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.currentTarget).entries());
      if (await send("POST", "/api/v1/partner/hosts", { ...f, contactId: contact || null }, "Sent to the house. The card changes once it is approved.")) setOpen(false);
    }}>
      <label className={`${lab} sm:col-span-2`}>Page
        <select name="pageKey" defaultValue={initialPage ?? pages[0]?.key} className={input}>{pages.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</select>
      </label>
      {contacts.length > 0 && (
        <label className={`${lab} sm:col-span-2`}>From your contacts (optional)
          <select value={contact} onChange={(e) => setContact(e.target.value)} className={input}>
            <option value="">Someone not in your contacts</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}{c.title ? ` · ${c.title}` : ""}</option>)}
          </select>
        </label>
      )}
      <label className={lab}>Name, as guests will see it<input name="name" key={`n${contact}`} defaultValue={picked?.name ?? ""} maxLength={120} className={input} /></label>
      <label className={lab}>Job title<input name="jobTitle" key={`t${contact}`} defaultValue={picked?.title ?? ""} maxLength={120} className={input} placeholder="Lodge Manager" /></label>
      <label className={lab}>Company<input name="company" defaultValue={company} maxLength={120} className={input} /></label>
      <label className={lab}>Where they are<input name="place" maxLength={120} className={input} placeholder="Johannesburg" /></label>
      <label className={`${lab} sm:col-span-2`}>Note for the house<input name="note" maxLength={1000} className={input} placeholder="Takes calls Monday to Friday, South Africa time" /></label>
      <p className="sm:col-span-2 text-[13px] ledger-muted">Only the name, job title and company appear on the website. A photograph comes through the house; send one by email or in Documents.</p>
      <div className="sm:col-span-2 flex gap-4"><button disabled={busy} className="ledger-btn">{busy ? "Sending" : "Send to the house"}</button><button type="button" onClick={() => setOpen(false)} className="ledger-btn-ghost">Cancel</button></div>
      <div className="sm:col-span-2"><Msg m={msg} /></div>
    </form>
  );
}

export function DecideHost({ id }: { id: string }) {
  const { busy, msg, send } = useSend();
  return (
    <span className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={busy} onClick={() => send("POST", `/api/v1/desk/hosts/${id}`, { action: "approve" }, "Approved. The card follows the partner's switch.")} className="ledger-btn">Approve</button>
      <button type="button" disabled={busy} onClick={() => { const note = window.prompt("Why not? The partner sees this note.") ?? ""; if (note.trim()) send("POST", `/api/v1/desk/hosts/${id}`, { action: "decline", note }, "Declined."); }} className="ledger-btn-ghost">Decline</button>
      <Msg m={msg} />
    </span>
  );
}
