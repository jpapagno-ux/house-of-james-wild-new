"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";
import { toList } from "@/lib/platform/content";

// Property content (Stage 2 §3.1). Partners edit any field in place and send once; only the
// fields that changed are proposed. The house approves each field before anything is published.

export type EditorField = { key: string; label: string; kind: "line" | "text" | "list"; max: number; help: string; start: string; pending: boolean };

const input = "mt-2 w-full bg-white border ledger-border px-3 py-2 text-[15px] leading-relaxed";
const norm = (kind: EditorField["kind"], v: string) => (kind === "list" ? toList(v).join("\n") : v.replace(/\r\n/g, "\n").trim());

export function ContentEditor({ propertyId, fields }: { propertyId: string; fields: EditorField[] }) {
  const router = useRouter();
  const [vals, setVals] = useState<Record<string, string>>(Object.fromEntries(fields.map((f) => [f.key, f.start])));
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const changed = fields.filter((f) => norm(f.kind, vals[f.key] ?? "") !== norm(f.kind, f.start) && norm(f.kind, vals[f.key] ?? ""));

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!changed.length) { setMsg({ ok: false, text: "Change at least one field before sending." }); return; }
    setBusy(true); setMsg(null);
    const r = await api<{ reference: string }>("POST", "/api/v1/partner/content", { propertyId, changes: Object.fromEntries(changed.map((f) => [f.key, vals[f.key]])), note: note || null });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    setMsg({ ok: true, text: `Sent to the house as ${r.data.reference}. You'll see each field's decision under Updates & approvals.` });
    router.refresh();
  }

  return (
    <form onSubmit={send} className="grid gap-8" noValidate>
      {fields.map((f) => {
        const v = vals[f.key] ?? "", edited = changed.some((c) => c.key === f.key);
        return (
          <div key={f.key} className={`border-l-2 pl-4 ${edited ? "border-[#8B2525]" : "border-transparent"}`}>
            <label className="block">
              <span className="flex flex-wrap items-baseline gap-x-3">
                <span className="ledger-display text-[1.25rem]">{f.label}</span>
                {f.pending && <span className="text-[12px] ledger-muted">A change is already with the house</span>}
                {edited && <span className="text-[12px] text-house">Changed</span>}
              </span>
              <span className="block text-[13.5px] ledger-muted mt-1">{f.help}</span>
              {f.kind === "line"
                ? <input value={v} maxLength={f.max} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} className={input} />
                : <textarea value={v} rows={f.kind === "list" ? Math.min(12, Math.max(4, v.split("\n").length + 1)) : 5}
                    maxLength={f.kind === "text" ? f.max : undefined} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} className={input} />}
            </label>
            {f.kind === "text" && <p className="text-[12px] ledger-muted mt-1 text-right tabular-nums">{v.length} / {f.max}</p>}
          </div>
        );
      })}
      <div className="sticky bottom-0 bg-[#F4F2EF] border-t ledger-border py-4 grid gap-3">
        <label className="block text-[13px] ledger-muted">Note for the house (optional)
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} className={input} placeholder="e.g. Two new River Suites opened in October" />
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <button disabled={busy} className="ledger-btn">{busy ? "Sending" : changed.length ? `Send ${changed.length} change${changed.length === 1 ? "" : "s"} to the house` : "Send changes to the house"}</button>
          {msg && <p role={msg.ok ? "status" : "alert"} className={`text-[14px] ${msg.ok ? "text-[#11705A]" : "text-house"}`}>{msg.text}</p>}
        </div>
      </div>
    </form>
  );
}
