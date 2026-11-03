"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "@/lib/platform/client";
import { ALLOWED_MIME, DOC_KIND_LABEL, DOC_KIND_LINE, MAX_BYTES, type DocKind } from "@/lib/platform/documents";

// Documents and contracts (D-23). The upload posts a multipart form to /api/v1/partner/documents;
// the database decides who may file which kind (only the house files a contract). These forms only
// offer what this person may do, and show the server's message as written.

const input = "mt-1 w-full bg-white border ledger-border px-3 py-2 text-[15px]";
const lab = "block text-[13px] ledger-muted";

export function UploadDocument({ kinds, properties, propertyRequired }: { kinds: DocKind[]; properties: { id: string; name: string }[]; propertyRequired: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<DocKind>(kinds.includes("supporting") ? "supporting" : kinds[0]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const f = fd.get("file");
    if (f instanceof File && f.size > MAX_BYTES) { setMsg({ ok: false, text: "That file is over 20 MB" }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/v1/partner/documents", { method: "POST", body: fd });
      const j = await r.json().catch(() => null);
      if (!r.ok) { setMsg({ ok: false, text: j?.error?.message ?? "The file did not upload. Try again." }); return; }
      setMsg({ ok: true, text: "Filed. It's in the list below." });
      formRef.current?.reset(); setOpen(false); router.refresh();
    } catch { setMsg({ ok: false, text: "No connection. Check your network and try again." }); }
    finally { setBusy(false); }
  }

  if (!open) return (
    <div className="flex flex-wrap items-center gap-4">
      <button type="button" onClick={() => setOpen(true)} className="ledger-btn">Upload a document</button>
      {msg && <p role="status" className={`text-[14px] ${msg.ok ? "text-[#11705A]" : "ledger-crimson"}`}>{msg.text}</p>}
    </div>
  );
  return (
    <form ref={formRef} onSubmit={send} className="bg-white border ledger-border p-5 grid gap-4" noValidate>
      <p className="ledger-display text-[1.3rem]">Upload a document</p>
      <fieldset className="grid gap-2">
        <legend className={lab}>What is it?</legend>
        {kinds.map((k) => (
          <label key={k} className={`flex gap-3 border px-3 py-2.5 cursor-pointer ${kind === k ? "border-[#8B2525] bg-[#F3ECEA]" : "ledger-border"}`}>
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="mt-1 accent-[#8B2525]" />
            <span><span className="font-medium">{DOC_KIND_LABEL[k]}</span><span className="block text-[13px] ledger-muted">{DOC_KIND_LINE[k]}</span></span>
          </label>
        ))}
      </fieldset>
      <label className={lab}>Title<input name="title" required maxLength={160} className={input} placeholder={kind === "contract" ? "Agency agreement 2027" : kind === "commercial" ? "2027 STO rate sheet" : "Fact sheet"} /></label>
      <label className={lab}>Property{propertyRequired ? "" : " (leave empty if it covers the whole company)"}
        <select name="propertyId" required={propertyRequired} className={input} defaultValue="">
          {!propertyRequired && <option value="">Whole company</option>}
          {propertyRequired && <option value="" disabled>Choose a property</option>}
          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={lab}>Valid from (optional)<input type="date" name="effectiveFrom" className={input} /></label>
        <label className={lab}>Expires (optional)<input type="date" name="expiresOn" className={input} /></label>
      </div>
      <label className={lab}>Note for the house (optional)<textarea name="note" rows={2} maxLength={1000} className={input} /></label>
      <label className={lab}>File (PDF, Word, Excel, JPG or PNG, up to 20 MB)
        <input type="file" name="file" required accept={Object.keys(ALLOWED_MIME).join(",")} className="mt-1 block w-full text-[14px]" />
      </label>
      {msg && <p role="alert" className="text-[14px] ledger-crimson">{msg.text}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid">{busy ? "Uploading…" : "File it"}</button>
        <button type="button" onClick={() => { setOpen(false); setMsg(null); }} className="ledger-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

export function ArchiveDocument({ id, archived }: { id: string; archived: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function go() {
    setBusy(true); setErr(null);
    const r = await api("PATCH", `/api/v1/partner/documents/${id}`, { status: archived ? "active" : "archived" });
    setBusy(false);
    if (!r.ok) { setErr(r.message); return; }
    router.refresh();
  }
  return (
    <span className="inline-flex items-center gap-3">
      <button type="button" disabled={busy} onClick={go} className="ledger-btn-ghost">{archived ? "Restore" : "Archive"}</button>
      {err && <span role="alert" className="text-[13px] ledger-crimson">{err}</span>}
    </span>
  );
}
