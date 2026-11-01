"use client";
import { useState } from "react";
import { api } from "@/lib/platform/client";

// /partner/apply — asks to join; the house reviews and invites (no self-signup).
export default function ApplyForm() {
  const [f, setF] = useState({ organizationName: "", website: "", contactName: "", email: "", country: "", properties: "", message: "", company: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState<{ field?: string; message: string } | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState("busy"); setErr(null);
    const r = await api("POST", "/api/v1/partner/apply", f);
    if (!r.ok) { setState("idle"); setErr({ field: r.field, message: r.message }); return; }
    setState("done");
  }
  if (state === "done") return <div role="status" className="border ledger-rule p-6 max-w-lg"><p className="ledger-display text-2xl">Thank you</p><p className="mt-2 text-[16px]">The house has your application. If it&rsquo;s a fit, we&rsquo;ll write with an invitation to the desk.</p></div>;

  const input = "mt-1 w-full bg-paper border ledger-border px-3 py-2.5 text-[16px]";
  const field = (k: keyof typeof f, label: string, opts: { type?: string; required?: boolean; area?: boolean; auto?: string } = {}) => (
    <label className="block">
      <span className="text-[13px] ledger-muted">{label}{opts.required ? "" : " (optional)"}</span>
      {opts.area
        ? <textarea rows={4} value={f[k]} onChange={set(k)} className={input} aria-invalid={err?.field === k || undefined} />
        : <input type={opts.type ?? "text"} required={opts.required} autoComplete={opts.auto} value={f[k]} onChange={set(k)} className={input} aria-invalid={err?.field === k || undefined} />}
    </label>
  );
  return (
    <form onSubmit={submit} className="grid gap-4 max-w-lg" noValidate>
      {field("organizationName", "Company or property name", { required: true, auto: "organization" })}
      {field("website", "Website", { type: "url", auto: "url" })}
      <div className="grid sm:grid-cols-2 gap-4">
        {field("contactName", "Your name", { required: true, auto: "name" })}
        {field("email", "Work email", { type: "email", required: true, auto: "email" })}
      </div>
      {field("country", "Country", { auto: "country-name" })}
      {field("properties", "Your properties, camps or vessels", { area: true })}
      {field("message", "Anything the house should know", { area: true })}
      <input type="text" tabIndex={-1} autoComplete="off" value={f.company} onChange={set("company")} className="hidden" aria-hidden="true" />
      {err && <p role="alert" className="text-[14px] ledger-crimson">{err.message}</p>}
      <button type="submit" disabled={state === "busy"} className="ledger-btn ledger-btn--solid justify-center disabled:opacity-50">{state === "busy" ? "Sending…" : "Send to the house"}</button>
    </form>
  );
}
