"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";
import { CONTACT_ROLES, CONTACT_ROLE_LABEL } from "@/lib/platform/validate";

// The desk's forms. Each posts to /api/v1/partner/* (or /desk/*), shows the server's
// message as written, and refreshes the page on success. The database is the guard;
// these only make the right thing easy.

const input = "mt-1 w-full bg-paper border ledger-border px-3 py-2 text-[15px]";
const lab = "block text-[13px] ledger-muted";

function useSubmit() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ field?: string; message: string } | null>(null);
  const [done, setDone] = useState<string | null>(null);
  async function run<T>(method: "POST" | "PATCH" | "DELETE", url: string, body: unknown, success: string, after?: (d: T) => void) {
    setBusy(true); setErr(null); setDone(null);
    const r = await api<T>(method, url, body);
    setBusy(false);
    if (!r.ok) { setErr({ field: r.field, message: r.message }); return false; }
    setDone(success); after?.(r.data); router.refresh();
    return true;
  }
  return { busy, err, done, run, setErr };
}
const Msg = ({ err, done }: { err: { message: string } | null; done: string | null }) =>
  err ? <p role="alert" className="text-[14px] ledger-crimson">{err.message}</p> : done ? <p role="status" className="text-[14px] text-forest">{done}</p> : null;

// ===== Contacts
export type ContactDraft = {
  id?: string; firstName: string; lastName: string; title: string; email: string; mobile: string; whatsapp: string; country: string; timezone: string;
  territory: string; languages: string; roles: string[]; preferredCommunication: string; newsletterOptIn: boolean; tradeOptIn: boolean; notes: string; entities: string[];
};
export const blankContact: ContactDraft = { firstName: "", lastName: "", title: "", email: "", mobile: "", whatsapp: "", country: "", timezone: "", territory: "", languages: "", roles: [], preferredCommunication: "", newsletterOptIn: false, tradeOptIn: false, notes: "", entities: [] };

export function ContactEditor({ initial, entities, onClose }: { initial: ContactDraft; entities: { id: string; name: string }[]; onClose?: () => void }) {
  const [c, setC] = useState<ContactDraft>(initial);
  const { busy, err, done, run } = useSubmit();
  const set = (k: keyof ContactDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setC({ ...c, [k]: e.target.value });
  const toggle = (k: "roles" | "entities", v: string) => setC({ ...c, [k]: c[k].includes(v) ? c[k].filter((x) => x !== v) : [...c[k], v] });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { id, languages, ...rest } = c;
    const body = { ...rest, languages: languages.split(",").map((s) => s.trim()).filter(Boolean) };
    const ok = await run(id ? "PATCH" : "POST", id ? `/api/v1/partner/contacts/${id}` : "/api/v1/partner/contacts", body, id ? "Contact saved." : "Contact added.");
    if (ok && !id) { setC(blankContact); onClose?.(); }
  }
  const f = (k: keyof ContactDraft, label: string, type = "text", auto?: string) => (
    <label className={lab}>{label}<input type={type} autoComplete={auto} value={c[k] as string} onChange={set(k)} className={input} aria-invalid={err?.field === k || undefined} /></label>
  );
  return (
    <form onSubmit={save} className="grid gap-4" noValidate>
      <div className="grid sm:grid-cols-3 gap-4">{f("firstName", "First name", "text", "off")}{f("lastName", "Last name", "text", "off")}{f("title", "Title", "text", "off")}</div>
      <div className="grid sm:grid-cols-3 gap-4">{f("email", "Email", "email", "off")}{f("mobile", "Mobile", "tel", "off")}{f("whatsapp", "WhatsApp", "tel", "off")}</div>
      <div className="grid sm:grid-cols-4 gap-4">
        <label className={lab}>Country (2 letters)<input value={c.country} maxLength={2} onChange={(e) => setC({ ...c, country: e.target.value.toUpperCase() })} className={input} aria-invalid={err?.field === "country" || undefined} /></label>
        {f("timezone", "Time zone")}{f("territory", "Territory")}{f("languages", "Languages (comma-separated)")}
      </div>
      <fieldset>
        <legend className={lab}>Roles</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CONTACT_ROLES.map((r) => (
            <label key={r} className={`cursor-pointer border px-2.5 py-1 text-[13px] ${c.roles.includes(r) ? "ledger-crimson-border ledger-crimson bg-paper" : "ledger-border bg-paper"}`}>
              <input type="checkbox" className="sr-only" checked={c.roles.includes(r)} onChange={() => toggle("roles", r)} />{CONTACT_ROLE_LABEL[r]}
            </label>
          ))}
        </div>
      </fieldset>
      {entities.length > 1 && (
        <fieldset>
          <legend className={lab}>Looks after (leave blank for every property)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {entities.map((p) => (
              <label key={p.id} className={`cursor-pointer border px-2.5 py-1 text-[13px] ${c.entities.includes(p.id) ? "ledger-crimson-border ledger-crimson bg-paper" : "ledger-border bg-paper"}`}>
                <input type="checkbox" className="sr-only" checked={c.entities.includes(p.id)} onChange={() => toggle("entities", p.id)} />{p.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="grid sm:grid-cols-3 gap-4 items-end">
        <label className={lab}>Preferred contact
          <select value={c.preferredCommunication} onChange={set("preferredCommunication")} className={input}>
            <option value="">—</option><option value="email">Email</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option><option value="video">Video call</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={c.tradeOptIn} onChange={(e) => setC({ ...c, tradeOptIn: e.target.checked })} /> Trade updates</label>
        <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={c.newsletterOptIn} onChange={(e) => setC({ ...c, newsletterOptIn: e.target.checked })} /> Partner Dispatch</label>
      </div>
      <label className={lab}>Notes<textarea rows={2} value={c.notes} onChange={set("notes")} className={input} /></label>
      <Msg err={err} done={done} />
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid disabled:opacity-50">{busy ? "Saving…" : c.id ? "Save contact" : "Add contact"}</button>
        {onClose && <button type="button" onClick={onClose} className="ledger-btn-ghost uppercase">Cancel</button>}
      </div>
    </form>
  );
}

export function ContactCardActions({ contact, entities, canRemove = true }: { contact: ContactDraft & { id: string }; entities: { id: string; name: string }[]; canRemove?: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { busy, err, run } = useSubmit();
  if (open) return <div className="mt-4 border-t ledger-border pt-4"><ContactEditor initial={contact} entities={entities} onClose={() => setOpen(false)} /></div>;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-4">
      <button type="button" onClick={() => setOpen(true)} className="ledger-btn-ghost uppercase">Edit</button>
      {!canRemove ? null : confirming
        ? <span className="inline-flex items-center gap-3 text-[13px]">Remove this contact?
            <button type="button" disabled={busy} onClick={() => run("DELETE", `/api/v1/partner/contacts/${contact.id}`, undefined, "Removed.")} className="ledger-btn-ghost uppercase">Yes, remove</button>
            <button type="button" onClick={() => setConfirming(false)} className="ledger-btn-ghost uppercase">Keep</button></span>
        : <button type="button" onClick={() => setConfirming(true)} className="ledger-btn-ghost uppercase">Remove</button>}
      {err && <span role="alert" className="text-[13px] ledger-crimson">{err.message}</span>}
    </div>
  );
}

export function AddContact({ entities }: { entities: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  return open
    ? <div className="bg-paper-card border ledger-border p-5"><p className="ledger-display text-[1.3rem] mb-4">New contact</p><ContactEditor initial={blankContact} entities={entities} onClose={() => setOpen(false)} /></div>
    : <button type="button" onClick={() => setOpen(true)} className="ledger-btn">Add a contact</button>;
}

// ===== Replies and updates
export function ReplyForm({ requestId, propertyId, defaultTitle, cta = "Send to the house" }: { requestId?: string; propertyId?: string | null; defaultTitle: string; cta?: string }) {
  const [title, setTitle] = useState(defaultTitle);
  const [note, setNote] = useState("");
  const [docs, setDocs] = useState<{ name: string; url: string }[]>([]);
  const { busy, err, done, run } = useSubmit();
  async function send(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run("POST", "/api/v1/partner/submissions", { requestId: requestId ?? null, propertyId: propertyId ?? null, title, note, documents: docs.filter((d) => d.name || d.url) }, "Sent. The house will review it; you'll see the status under Updates & approvals.");
    if (ok) { setNote(""); setDocs([]); }
  }
  return (
    <form onSubmit={send} className="grid gap-4" noValidate>
      <label className={lab}>Title<input value={title} onChange={(e) => setTitle(e.target.value)} className={input} maxLength={160} /></label>
      <label className={lab}>Your note<textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} className={input} placeholder="What changed, what you're sending, anything the house should know." aria-invalid={err?.field === "note" || undefined} /></label>
      <fieldset>
        <legend className={lab}>Links to files (Dropbox, Google Drive, WeTransfer, your media kit)</legend>
        <div className="grid gap-2 mt-2">
          {docs.map((d, i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_2fr_auto] gap-2">
              <input aria-label="File name" placeholder="e.g. 2027 rate sheet" value={d.name} onChange={(e) => setDocs(docs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className={input.replace("mt-1 ", "")} />
              <input aria-label="Link" placeholder="https://" value={d.url} onChange={(e) => setDocs(docs.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} className={input.replace("mt-1 ", "")} />
              <button type="button" onClick={() => setDocs(docs.filter((_, j) => j !== i))} className="ledger-btn-ghost uppercase self-center">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setDocs([...docs, { name: "", url: "" }])} className="ledger-btn-ghost uppercase justify-self-start">Add a link</button>
        </div>
        <p className="mt-2 text-[12.5px] ledger-muted">Uploads straight to the desk arrive with the Media Library. Original resolution, please; no logos on images.</p>
      </fieldset>
      <Msg err={err} done={done} />
      <button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid justify-self-start disabled:opacity-50">{busy ? "Sending…" : cta}</button>
    </form>
  );
}

export function ProposeChange({ propertyId, fields }: { propertyId: string; fields: { key: string; label: string; current: string | null }[] }) {
  const [field, setField] = useState(fields[0]?.key ?? "name");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const { busy, err, done, run } = useSubmit();
  const cur = fields.find((f) => f.key === field)?.current ?? null;
  async function send(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run("POST", "/api/v1/partner/revisions", { propertyId, field, value, note }, "Proposed. The house will review it before anything changes on the website.");
    if (ok) { setValue(""); setNote(""); }
  }
  return (
    <form onSubmit={send} className="grid gap-4" noValidate>
      <div className="grid sm:grid-cols-[180px_1fr] gap-4">
        <label className={lab}>Field<select value={field} onChange={(e) => setField(e.target.value)} className={input}>{fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}</select></label>
        <label className={lab}>New value<input value={value} onChange={(e) => setValue(e.target.value)} className={input} maxLength={160} aria-invalid={err?.field === "value" || undefined} /></label>
      </div>
      <p className="text-[13px] ledger-muted">On file now: <span className="text-ink">{cur ?? "—"}</span></p>
      <label className={lab}>Why (helps the house approve quickly)<textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={input} placeholder="e.g. Two new River Suites opened October 2026." /></label>
      <Msg err={err} done={done} />
      <button type="submit" disabled={busy || !value.trim()} className="ledger-btn justify-self-start disabled:opacity-50">{busy ? "Sending…" : "Propose this change"}</button>
    </form>
  );
}

export function SubmissionActions({ id, status }: { id: string; status: string }) {
  const [answer, setAnswer] = useState("");
  const { busy, err, done, run } = useSubmit();
  if (status === "changes_requested") {
    return (
      <form onSubmit={(e) => { e.preventDefault(); run("PATCH", `/api/v1/partner/submissions/${id}`, { action: "resubmit", note: answer }, "Sent back to the house."); }} className="mt-3 grid gap-2">
        <label className={lab}>Your answer<textarea rows={2} value={answer} onChange={(e) => setAnswer(e.target.value)} className={input} /></label>
        <Msg err={err} done={done} />
        <div className="flex gap-4"><button type="submit" disabled={busy || !answer.trim()} className="ledger-btn disabled:opacity-50">Reply and resubmit</button>
          <button type="button" disabled={busy} onClick={() => run("PATCH", `/api/v1/partner/submissions/${id}`, { action: "withdraw" }, "Withdrawn.")} className="ledger-btn-ghost uppercase">Withdraw</button></div>
      </form>
    );
  }
  if (status === "submitted" || status === "draft") {
    return <div className="mt-3 flex items-center gap-4"><button type="button" disabled={busy} onClick={() => run("PATCH", `/api/v1/partner/submissions/${id}`, { action: "withdraw" }, "Withdrawn.")} className="ledger-btn-ghost uppercase">Withdraw</button><Msg err={err} done={done} /></div>;
  }
  return null;
}

// ===== Team
export function InviteForm({ entities }: { entities: { id: string; name: string }[] }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"partner_contributor" | "partner_admin">("partner_contributor");
  const [narrow, setNarrow] = useState<string[]>([]);
  const [link, setLink] = useState<{ url: string; emailed: boolean } | null>(null);
  const { busy, err, done, run } = useSubmit();
  async function send(e: React.FormEvent) {
    e.preventDefault(); setLink(null);
    await run<{ link: string; emailed: boolean }>("POST", "/api/v1/partner/invitations", { email, role, entities: role === "partner_contributor" ? narrow : [] }, "Invitation created.", (d) => { setLink({ url: d.link, emailed: d.emailed }); setEmail(""); setNarrow([]); });
  }
  return (
    <form onSubmit={send} className="grid gap-4" noValidate>
      <div className="grid sm:grid-cols-[1fr_200px] gap-4">
        <label className={lab}>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} autoComplete="off" /></label>
        <label className={lab}>Role<select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className={input}><option value="partner_contributor">Contributor</option><option value="partner_admin">Partner admin</option></select></label>
      </div>
      {role === "partner_contributor" && entities.length > 1 && (
        <fieldset>
          <legend className={lab}>Limit to (leave blank for every property)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {entities.map((p) => (
              <label key={p.id} className={`cursor-pointer border px-2.5 py-1 text-[13px] ${narrow.includes(p.id) ? "ledger-crimson-border ledger-crimson" : "ledger-border"} bg-paper`}>
                <input type="checkbox" className="sr-only" checked={narrow.includes(p.id)} onChange={() => setNarrow(narrow.includes(p.id) ? narrow.filter((x) => x !== p.id) : [...narrow, p.id])} />{p.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <Msg err={err} done={done} />
      {link && (
        <div className="border ledger-border bg-paper p-3 text-[13.5px]">
          <p>{link.emailed ? "We've emailed the invitation. You can also pass on this link:" : "Email isn't sent from previews or to .test addresses. Pass on this link yourself; it works once and expires in 14 days:"}</p>
          <p className="mt-2 font-mono text-[12px] break-all select-all">{link.url}</p>
        </div>
      )}
      <button type="submit" disabled={busy || !/.+@.+\..+/.test(email)} className="ledger-btn ledger-btn--solid justify-self-start disabled:opacity-50">{busy ? "Creating…" : "Invite"}</button>
    </form>
  );
}

export function TeamRowActions({ membershipId, role }: { membershipId: string; role: string }) {
  const { busy, err, run } = useSubmit();
  const other = role === "partner_admin" || role === "partner_manager" ? "partner_contributor" : "partner_admin";
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button type="button" disabled={busy} onClick={() => run("PATCH", `/api/v1/partner/team/${membershipId}`, { role: other, status: "active" }, "Role changed.")} className="ledger-btn-ghost uppercase">
        Make {other === "partner_admin" ? "admin" : "contributor"}
      </button>
      <button type="button" disabled={busy} onClick={() => run("PATCH", `/api/v1/partner/team/${membershipId}`, { role: role === "partner_admin" ? "partner_admin" : "partner_contributor", status: "revoked" }, "Access removed.")} className="ledger-btn-ghost uppercase">Remove access</button>
      {err && <span role="alert" className="text-[13px] ledger-crimson">{err.message}</span>}
    </div>
  );
}

export function RevokeInvite({ id }: { id: string }) {
  const { busy, err, run } = useSubmit();
  return <span className="inline-flex items-center gap-3"><button type="button" disabled={busy} onClick={() => run("DELETE", `/api/v1/partner/invitations/${id}`, undefined, "Revoked.")} className="ledger-btn-ghost uppercase">Revoke</button>{err && <span role="alert" className="text-[13px] ledger-crimson">{err.message}</span>}</span>;
}

// ===== Account
export function ProfileForm({ initial }: { initial: { firstName: string; lastName: string; phone: string } }) {
  const [p, setP] = useState(initial);
  const { busy, err, done, run } = useSubmit();
  return (
    <form onSubmit={(e) => { e.preventDefault(); run("PATCH", "/api/v1/partner/profile", p, "Saved."); }} className="grid gap-4 max-w-lg" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className={lab}>First name<input value={p.firstName} onChange={(e) => setP({ ...p, firstName: e.target.value })} className={input} autoComplete="given-name" /></label>
        <label className={lab}>Last name<input value={p.lastName} onChange={(e) => setP({ ...p, lastName: e.target.value })} className={input} autoComplete="family-name" /></label>
      </div>
      <label className={lab}>Phone<input type="tel" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} className={input} autoComplete="tel" /></label>
      <Msg err={err} done={done} />
      <button type="submit" disabled={busy} className="ledger-btn justify-self-start disabled:opacity-50">Save</button>
    </form>
  );
}

export function CompanyForm({ initial }: { initial: { website: string; phone: string; generalEmail: string; address: string; preferredCommunication: string; mediaKitUrl: string } }) {
  const [c, setC] = useState(initial);
  const { busy, err, done, run } = useSubmit();
  const f = (k: keyof typeof c, label: string, type = "text") => <label className={lab}>{label}<input type={type} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} className={input} aria-invalid={err?.field === k || undefined} /></label>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); run("PATCH", "/api/v1/partner/company", c, "Company details saved."); }} className="grid gap-4" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">{f("website", "Website", "url")}{f("mediaKitUrl", "Media kit link", "url")}</div>
      <div className="grid sm:grid-cols-2 gap-4">{f("generalEmail", "General email", "email")}{f("phone", "Main phone", "tel")}</div>
      <label className={lab}>Address<textarea rows={2} value={c.address} onChange={(e) => setC({ ...c, address: e.target.value })} className={input} /></label>
      <label className={lab}>Preferred way to reach you
        <select value={c.preferredCommunication} onChange={(e) => setC({ ...c, preferredCommunication: e.target.value })} className={input}>
          <option value="">—</option><option value="email">Email</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option><option value="video">Video call</option>
        </select>
      </label>
      <Msg err={err} done={done} />
      <button type="submit" disabled={busy} className="ledger-btn justify-self-start disabled:opacity-50">Save company details</button>
    </form>
  );
}

// ===== House decisions
export function DecideRevision({ id, proposed }: { id: string; proposed: string }) {
  const [mode, setMode] = useState<"" | "edit_approve" | "reject" | "ask">("");
  const [value, setValue] = useState(proposed);
  const [note, setNote] = useState("");
  const { busy, err, done, run } = useSubmit();
  const go = (action: string) => run("POST", `/api/v1/desk/revisions/${id}`, { action, finalValue: action === "edit_approve" ? value : null, note: note || null }, "Decided.");
  return (
    <div className="mt-3 grid gap-3">
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => go("approve")} className="ledger-btn ledger-btn--solid disabled:opacity-50">Approve</button>
        <button type="button" disabled={busy} onClick={() => setMode("edit_approve")} className="ledger-btn">Edit + approve</button>
        <button type="button" disabled={busy} onClick={() => setMode("ask")} className="ledger-btn">Ask partner</button>
        <button type="button" disabled={busy} onClick={() => setMode("reject")} className="ledger-btn">Reject</button>
      </div>
      {mode && (
        <div className="grid gap-3 border-l-2 ledger-crimson-border pl-4">
          {mode === "edit_approve" && <label className={lab}>Value to publish<input value={value} onChange={(e) => setValue(e.target.value)} className={input} /></label>}
          <label className={lab}>{mode === "edit_approve" ? "Note to the partner (optional)" : "Note to the partner"}<textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={input} /></label>
          <div className="flex gap-3"><button type="button" disabled={busy} onClick={() => go(mode)} className="ledger-btn ledger-btn--solid disabled:opacity-50">Confirm</button><button type="button" onClick={() => setMode("")} className="ledger-btn-ghost uppercase">Cancel</button></div>
        </div>
      )}
      <Msg err={err} done={done} />
    </div>
  );
}

export function DecideSubmission({ id }: { id: string }) {
  const [note, setNote] = useState("");
  const { busy, err, done, run } = useSubmit();
  const go = (action: string) => run("POST", `/api/v1/desk/submissions/${id}`, { action, note: note || null }, "Decided.");
  return (
    <div className="mt-3 grid gap-3">
      <label className={lab}>Note to the partner (needed to ask or reject)<textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={input} /></label>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => go("approve")} className="ledger-btn ledger-btn--solid disabled:opacity-50">Approve</button>
        <button type="button" disabled={busy} onClick={() => go("in_review")} className="ledger-btn">Mark in review</button>
        <button type="button" disabled={busy} onClick={() => go("ask")} className="ledger-btn">Ask partner</button>
        <button type="button" disabled={busy} onClick={() => go("reject")} className="ledger-btn">Reject</button>
      </div>
      <Msg err={err} done={done} />
    </div>
  );
}
