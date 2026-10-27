"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./client";

// Small client islands used across /account. Each calls one /api/v1 route and
// refreshes the server-rendered page on success.

const input = "mt-1 w-full bg-paper border ledger-border px-3 py-2 text-[16px]";
const label = "text-[13px] ledger-muted";

function Msg({ text }: { text: string }) {
  return text ? <p role="alert" className="text-[14px] ledger-crimson">{text}</p> : null;
}

export function RemoveButton({ path, label: l = "Remove", confirm }: { path: string; label?: string; confirm?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" disabled={busy} className="ledger-eyebrow hover:ledger-crimson disabled:opacity-50"
        onClick={async () => {
          if (confirm && !window.confirm(confirm)) return;
          setBusy(true);
          const r = await api(path, "DELETE");
          setBusy(false);
          if (r.ok) router.refresh(); else setErr(r.message);
        }}>{busy ? "…" : l}</button>
      <Msg text={err} />
    </span>
  );
}

export function NewFolioForm() {
  const router = useRouter();
  const [f, setF] = useState({ title: "", destinationSummary: "", startDate: "", endDate: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form className="grid gap-3 md:grid-cols-2 border ledger-rule p-5" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setErr("");
      const r = await api<{ id: string }>("/api/v1/me/folios", "POST", {
        title: f.title, destinationSummary: f.destinationSummary || undefined, startDate: f.startDate || null, endDate: f.endDate || null,
      });
      setBusy(false);
      if (r.ok) router.push(`/account/folios/${r.data.id}`); else setErr(r.message);
    }}>
      <p className="ledger-eyebrow md:col-span-2">Start a journey</p>
      <label className="block md:col-span-2"><span className={label}>Title</span>
        <input required maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={input} placeholder="Botswana in green season" /></label>
      <label className="block md:col-span-2"><span className={label}>Where, in a line (optional)</span>
        <input maxLength={400} value={f.destinationSummary} onChange={(e) => setF({ ...f, destinationSummary: e.target.value })} className={input} /></label>
      <label className="block"><span className={label}>From (optional)</span>
        <input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} className={input} /></label>
      <label className="block"><span className={label}>To (optional)</span>
        <input type="date" min={f.startDate || undefined} value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} className={input} /></label>
      <div className="md:col-span-2 flex items-center gap-4">
        <button type="submit" disabled={busy || !f.title.trim()} className="ledger-btn disabled:opacity-50">{busy ? "Creating…" : "Create journey"}</button>
        <Msg text={err} />
      </div>
    </form>
  );
}

export function AddNoteForm({ folioId }: { folioId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  return (
    <form className="grid gap-2" onSubmit={async (e) => {
      e.preventDefault(); setErr("");
      const r = await api(`/api/v1/me/folios/${folioId}/items`, "POST", { type: "note", notes });
      if (r.ok) { setNotes(""); router.refresh(); } else setErr(r.message);
    }}>
      <label className="block"><span className={label}>Add a note to this journey</span>
        <textarea rows={2} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} className={input} /></label>
      <div className="flex items-center gap-4"><button type="submit" disabled={!notes.trim()} className="ledger-btn disabled:opacity-50">Add note</button><Msg text={err} /></div>
    </form>
  );
}

export function AddSavedStay({ folioId, options }: { folioId: string; options: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [err, setErr] = useState("");
  if (!options.length) return null;
  return (
    <form className="flex flex-wrap items-end gap-3" onSubmit={async (e) => {
      e.preventDefault(); setErr("");
      const r = await api(`/api/v1/me/folios/${folioId}/items`, "POST", { property: slug });
      if (r.ok) { setSlug(""); router.refresh(); } else setErr(r.message);
    }}>
      <label className="block grow"><span className={label}>Add one of your saved stays</span>
        <select value={slug} onChange={(e) => setSlug(e.target.value)} className={input}>
          <option value="">Choose a stay…</option>
          {options.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}
        </select></label>
      <button type="submit" disabled={!slug} className="ledger-btn disabled:opacity-50">Add</button>
      <Msg text={err} />
    </form>
  );
}

export function InviteForm({ folioId }: { folioId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [link, setLink] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="grid gap-3">
      <form className="flex flex-wrap items-end gap-3" onSubmit={async (e) => {
        e.preventDefault(); setErr(""); setLink("");
        const r = await api<{ link: string }>(`/api/v1/me/folios/${folioId}/invitations`, "POST", { email, role });
        if (r.ok) { setLink(r.data.link); setEmail(""); } else setErr(r.message);
      }}>
        <label className="block grow"><span className={label}>Their email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} /></label>
        <label className="block"><span className={label}>They can</span>
          <select value={role} onChange={(e) => setRole(e.target.value as "viewer" | "editor")} className={input}>
            <option value="viewer">View</option><option value="editor">Add &amp; edit</option>
          </select></label>
        <button type="submit" className="ledger-btn">Create invite link</button>
      </form>
      <Msg text={err} />
      {link && (
        <div role="status" className="border ledger-rule p-4 text-[14px]">
          <p>Send this link to them. It works once, only for that email, and expires in 14 days.</p>
          <div className="mt-2 flex gap-2">
            <input readOnly value={link} className={`${input} !mt-0 text-[13px]`} onFocus={(e) => e.currentTarget.select()} aria-label="Invite link" />
            <button type="button" className="ledger-btn" onClick={() => navigator.clipboard?.writeText(link)}>Copy</button>
          </div>
        </div>
      )}
    </div>
  );
}

const CURRENCIES = ["USD", "EUR", "GBP", "ZAR", "CAD", "AUD", "BWP", "KES", "CRC"];

export function ProfileForm({ initial }: { initial: { firstName: string; lastName: string; phone: string; preferredCurrency: string; timezone: string } }) {
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  return (
    <form className="grid gap-3 md:grid-cols-2 max-w-2xl" onSubmit={async (e) => {
      e.preventDefault(); setMsg(""); setErr("");
      const r = await api("/api/v1/me/profile", "PATCH", f);
      if (r.ok) setMsg("Saved."); else setErr(r.message);
    }}>
      <label className="block"><span className={label}>First name</span><input autoComplete="given-name" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} className={input} /></label>
      <label className="block"><span className={label}>Last name</span><input autoComplete="family-name" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} className={input} /></label>
      <label className="block"><span className={label}>Phone (optional)</span><input type="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={input} /></label>
      <label className="block"><span className={label}>Preferred currency</span>
        <select value={f.preferredCurrency} onChange={(e) => setF({ ...f, preferredCurrency: e.target.value })} className={input}>
          {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
        </select></label>
      <label className="block md:col-span-2"><span className={label}>Time zone</span><input value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })} className={input} /></label>
      <div className="md:col-span-2 flex items-center gap-4">
        <button type="submit" className="ledger-btn">Save</button>
        {msg && <p role="status" className="text-[14px]">{msg}</p>}<Msg text={err} />
      </div>
    </form>
  );
}

export function AcceptInvite({ token }: { token: string }) {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid gap-3 max-w-md">
      <button type="button" disabled={busy} className="ledger-btn justify-center disabled:opacity-50" onClick={async () => {
        setBusy(true); setErr("");
        const r = await api<{ folioId: string }>("/api/v1/me/invitations/accept", "POST", { token });
        setBusy(false);
        if (r.ok) router.push(`/account/folios/${r.data.folioId}`); else setErr(r.message);
      }}>{busy ? "Joining…" : "Join this journey"}</button>
      <Msg text={err} />
    </div>
  );
}
