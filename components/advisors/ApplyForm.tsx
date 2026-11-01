"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { APPLY_HEARD, APPLY_SPECIALTIES, APPLY_STATUS, APPLY_VOLUMES, EMPTY, validateApplication, type Application } from "@/lib/advisors/application";
import { SITE } from "@/lib/site";

// The advisor application (Stage 5, 31 Oct 2026). Who you are, where you know
// first-hand, what you would carry. Posts to /api/advisors/apply.
const field = "w-full bg-paper border ledger-border px-3 py-2.5 text-[16px] outline-none focus:border-crimson";
const label = "ledger-eyebrow block mb-1.5";

export default function ApplyForm() {
  const [f, setF] = useState<Application>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "preview" | "failed">("idle");
  const set = <K extends keyof Application>(k: K, v: Application[K]) => setF((x) => ({ ...x, [k]: v }));
  const toggle = (k: "volumes" | "specialties", v: string) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);
  const err = (k: string) => errors[k] && <p id={`${k}-err`} className="mt-1 text-[13.5px] text-crimson">{errors[k]}</p>;
  const aria = (k: string) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `${k}-err` } : {});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validateApplication(f);
    setErrors(v);
    if (Object.keys(v).length) { document.getElementById(Object.keys(v)[0])?.focus(); return; }
    setState("sending");
    try {
      const res = await fetch("/api/advisors/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = await res.json();
      if (!res.ok) { setErrors(data.errors ?? {}); setState("failed"); return; }
      setState(data.live ? "sent" : "preview");
    } catch { setState("failed"); }
  }

  if (state === "sent" || state === "preview") {
    return (
      <div className="ledger-paper p-8 md:p-10" role="status">
        <p className="ledger-eyebrow ledger-crimson">{state === "sent" ? "Received" : "Preview mode"}</p>
        <p className="ledger-display text-[1.8rem] mt-2 leading-tight">{state === "sent" ? `Thank you, ${f.name.split(" ")[0]}.` : "Nothing was sent yet."}</p>
        <p className="mt-3 text-[17px] leading-relaxed max-w-xl">{state === "sent" ? "Your application is on the house desk. James reads every one himself and replies within a few days; if the fit is there, the next step is a call." : `This is a preview of the site. Applications reach the house desk at launch. To apply today, write to ${SITE.email ?? "hello@jameswildco.com"} or call ${SITE.phone.display}.`}</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link href="/for-advisors" className="ledger-btn">Back to For Advisors</Link><Link href="/the-ledger" className="ledger-btn-ghost">How the Ledger works</Link></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-9" aria-label="Apply to carry the Ledger">
      <fieldset className="space-y-5">
        <legend className="ledger-display text-[1.45rem]">01 · You</legend>
        <div className="grid sm:grid-cols-2 gap-5">
          <div><label htmlFor="name" className={label}>Name</label><input id="name" className={field} value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" {...aria("name")} />{err("name")}</div>
          <div><label htmlFor="email" className={label}>Email</label><input id="email" type="email" className={field} value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" {...aria("email")} />{err("email")}</div>
          <div><label htmlFor="phone" className={label}>Phone <span className="ledger-muted normal-case tracking-normal">(optional)</span></label><input id="phone" type="tel" className={field} value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></div>
          <div><label htmlFor="base" className={label}>Based in</label><input id="base" className={field} value={f.base} onChange={(e) => set("base", e.target.value)} placeholder="City, country" {...aria("base")} />{err("base")}</div>
        </div>
        <div>
          <p className={label} id="status-label">Today you are</p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="status-label">
            {APPLY_STATUS.map((s) => { const on = f.status === s; return <button type="button" key={s} id={on ? "status" : undefined} aria-pressed={on} onClick={() => set("status", s)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[14.5px] transition-colors ${on ? "bg-ink text-paper border-ink" : "ledger-border hover:border-crimson"}`}>{on && <Check className="w-3.5 h-3.5" aria-hidden="true" />}{s}</button>; })}
          </div>
          {err("status")}
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          <div><label htmlFor="agency" className={label}>Agency or host <span className="ledger-muted normal-case tracking-normal">(if any)</span></label><input id="agency" className={field} value={f.agency} onChange={(e) => set("agency", e.target.value)} /></div>
          <div><label htmlFor="years" className={label}>Years advising</label><input id="years" className={field} value={f.years} onChange={(e) => set("years", e.target.value)} placeholder="e.g. 6, or 'new'" /></div>
          <div><label htmlFor="iata" className={label}>IATA / CLIA <span className="ledger-muted normal-case tracking-normal">(optional)</span></label><input id="iata" className={field} value={f.iata} onChange={(e) => set("iata", e.target.value)} /></div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="ledger-display text-[1.45rem]">02 · What you know first-hand</legend>
        <p className="text-[15.5px] ledger-muted -mt-2 max-w-xl">The Ledger is built on places people have slept in, walked or sailed. Yours count the same way.</p>
        <div><label htmlFor="countries" className={label}>Countries and places you have been, as an advisor or a traveller</label><textarea id="countries" rows={3} className={field} value={f.countries} onChange={(e) => set("countries", e.target.value)} placeholder="Botswana (Okavango, 2023), Ireland's west coast, the Galápagos on a small ship…" {...aria("countries")} />{err("countries")}</div>
        <div>
          <p className={label} id="volumes-label">Which volumes would you carry?</p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="volumes-label">
            {APPLY_VOLUMES.map((v, i) => { const on = f.volumes.includes(v); return <button type="button" key={v} id={i === 0 ? "volumes" : undefined} aria-pressed={on} onClick={() => toggle("volumes", v)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[14.5px] transition-colors ${on ? "bg-ink text-paper border-ink" : "ledger-border hover:border-crimson"}`}>{on && <Check className="w-3.5 h-3.5" aria-hidden="true" />}{v}</button>; })}
          </div>
          {err("volumes")}
        </div>
        <div>
          <p className={label} id="spec-label">Specialties <span className="ledger-muted normal-case tracking-normal">(pick any)</span></p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="spec-label">
            {APPLY_SPECIALTIES.map((s) => { const on = f.specialties.includes(s); return <button type="button" key={s} aria-pressed={on} onClick={() => toggle("specialties", s)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[14.5px] transition-colors ${on ? "bg-ink text-paper border-ink" : "ledger-border hover:border-crimson"}`}>{on && <Check className="w-3.5 h-3.5" aria-hidden="true" />}{s}</button>; })}
          </div>
          {err("specialties")}
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="ledger-display text-[1.45rem]">03 · In your own words</legend>
        <div><label htmlFor="line" className={label}>One line that says how you travel <span className="ledger-muted normal-case tracking-normal">(it may go on your page)</span></label><input id="line" className={field} value={f.line} onChange={(e) => set("line", e.target.value)} maxLength={300} placeholder="e.g. I don't send anyone somewhere I wouldn't go back to." {...aria("line")} />{err("line")}</div>
        <div><label htmlFor="message" className={label}>Anything else</label><textarea id="message" rows={4} className={field} value={f.message} onChange={(e) => set("message", e.target.value)} maxLength={2000} placeholder="Who you plan for, what you'd want from the house, questions." {...aria("message")} />{err("message")}</div>
        <div>
          <p className={label} id="heard-label">How you heard of the house</p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="heard-label">
            {APPLY_HEARD.map((h) => { const on = f.heard === h; return <button type="button" key={h} aria-pressed={on} onClick={() => set("heard", on ? "" : h)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[14.5px] transition-colors ${on ? "bg-ink text-paper border-ink" : "ledger-border hover:border-crimson"}`}>{on && <Check className="w-3.5 h-3.5" aria-hidden="true" />}{h}</button>; })}
          </div>
        </div>
        <div className="hidden" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} /></div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button type="submit" disabled={state === "sending"} className="ledger-btn ledger-btn--solid disabled:opacity-60">{state === "sending" ? "Sending…" : "Send the application"}</button>
        <p className="text-[13.5px] ledger-muted max-w-sm">James reads every application himself. Your details go to the house desk only.</p>
        {state === "failed" && <p className="text-[14px] text-crimson w-full">That didn&rsquo;t send. Try again, or write to {SITE.email ?? "hello@jameswildco.com"}.</p>}
      </div>
    </form>
  );
}
