"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";
import { CLOSED_REASONS, ENQ_STATUSES } from "@/lib/platform/enquiry-inbox";

// The inbox's two forms: set an enquiry's status (advisor or house) and reassign it (house only). Each
// posts to its own API route, shows the server's message as written and refreshes the page.

const input = "mt-1 w-full bg-white border ledger-border px-3 py-2 text-[15px]";
const lab = "block text-[13px] ledger-muted";
type Msg = { ok: boolean; text: string } | null;
const Note = ({ m }: { m: Msg }) => (m ? <p role={m.ok ? "status" : "alert"} className={`text-[14px] ${m.ok ? "text-[#11705A]" : "ledger-crimson"}`}>{m.text}</p> : null);

export function StatusForm({ url, status, closedReason, note }: { url: string; status: string; closedReason: string; note: string }) {
  const router = useRouter();
  const [next, setNext] = useState(status);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true); setMsg(null);
    const r = await api("PATCH", url, { status: next, ...(next === "Closed" ? { closedReason: String(fd.get("closedReason") ?? "") } : {}), note: String(fd.get("note") ?? "") });
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: "Saved." } : { ok: false, text: r.message });
    if (r.ok) router.refresh();
  }
  return (
    <form onSubmit={send} className="grid gap-4 max-w-md">
      <label className={lab}>Status
        <select name="status" value={next} onChange={(e) => setNext(e.target.value)} className={input}>{ENQ_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </label>
      {next === "Closed" && (
        <label className={lab}>Why it is closed
          <select name="closedReason" defaultValue={closedReason || ""} required className={input}><option value="" disabled>Choose a reason</option>{CLOSED_REASONS.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
      )}
      <label className={lab}>Your note, private to the desk
        <textarea name="note" defaultValue={note} rows={4} maxLength={2000} className={input} />
      </label>
      <div className="flex flex-wrap items-center gap-4"><button type="submit" disabled={busy} className="ledger-btn disabled:opacity-60">{busy ? "Saving…" : "Save"}</button><Note m={msg} /></div>
    </form>
  );
}

export function ReassignForm({ url, current, advisors }: { url: string; current: string; advisors: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const advisorSlug = String(new FormData(e.currentTarget).get("advisorSlug") ?? "");
    setBusy(true); setMsg(null);
    const r = await api("PATCH", url, { advisorSlug });
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: "Reassigned. No email is sent: tell the advisor." } : { ok: false, text: r.message });
    if (r.ok) router.refresh();
  }
  return (
    <form onSubmit={send} className="grid gap-4 max-w-md">
      <label className={lab}>Advisor
        <select name="advisorSlug" defaultValue={current} required className={input}><option value="" disabled>Choose an advisor</option>{advisors.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}</select>
      </label>
      <div className="flex flex-wrap items-center gap-4"><button type="submit" disabled={busy} className="ledger-btn disabled:opacity-60">{busy ? "Saving…" : "Reassign"}</button><Note m={msg} /></div>
    </form>
  );
}
