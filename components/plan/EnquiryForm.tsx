"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Minus, Plus } from "lucide-react";
import { ADVISORS, DEFAULT_ADVISOR } from "@/lib/content/advisors";
import { BUDGETS, CALL_TIMES, INTERESTS, validateEnquiry, type Enquiry } from "@/lib/enquiry";

// The /plan enquiry. Reads the page context it was sent with (advisor, trip
// and price from the price builder, Iggi, the Compass, a search) and shows it
// back as "Your starting point", so nobody retypes what they've chosen.
// One form covers email replies and call requests.

const FROM_LABEL: Record<string, string> = {
  iggi: "Picking up from your chat with Iggi.",
  compass: "Picking up from your Compass reading.",
  "advisor-application": "Advisor application: tell us who you are, who you serve and where you know best. The desk will reply.",
  partner: "Partner submission: tell us about your place, who makes it special and what a traveller will understand after time with you.",
};

const field = "w-full bg-paper border ledger-border px-3 py-2.5 text-[16px] outline-none focus:border-crimson";
const label = "ledger-eyebrow block mb-1.5";

function Stepper({ id, value, min, onChange, labelText }: { id: string; value: number; min: number; onChange: (n: number) => void; labelText: string }) {
  return (
    <div>
      <span id={id} className={label}>{labelText}</span>
      <div className="inline-flex items-center border ledger-border" role="group" aria-labelledby={id}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-paper-card" aria-label={`Fewer ${labelText.toLowerCase()}`}><Minus className="w-4 h-4" /></button>
        <span className="w-10 text-center ledger-display text-lg" aria-live="polite">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(20, value + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-paper-card" aria-label={`More ${labelText.toLowerCase()}`}><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

export default function EnquiryForm() {
  const sp = useSearchParams();
  const ctx = useMemo(() => {
    const g = (k: string) => sp.get(k) ?? undefined;
    return { advisor: g("advisor"), from: g("from"), trip: g("trip"), option: g("cabin") ?? g("option"), travellers: g("travellers"), addons: g("addons"), estimate: g("estimate"), destination: g("destination"), route: g("route"), q: g("q"), folio: g("folio") && /^FOL-\d{4}-\d{6}$/.test(g("folio") as string) ? g("folio") : undefined };
  }, [sp]);
  const advisor = ADVISORS.find((a) => a.slug === (ctx.advisor ?? DEFAULT_ADVISOR));
  const wantsCall = sp.get("next") === "call";

  const [f, setF] = useState<Enquiry>({
    name: "", email: "", phone: "", where: ctx.destination ? ctx.destination.replace(/-/g, " ") : ctx.q ?? "", when: "", nights: "",
    adults: Math.max(1, Number(ctx.travellers) || 2), children: 0, budget: "", interests: [], contact: wantsCall ? "phone" : "email", callTime: "",
    hasAdvisor: false, advisorDetails: "", message: "", travelNotes: false, context: ctx, website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "preview" | "failed">("idle");
  const set = <K extends keyof Enquiry>(k: K, v: Enquiry[K]) => setF((x) => ({ ...x, [k]: v }));
  const err = (k: string) => errors[k] && <p id={`${k}-err`} className="mt-1 text-[13.5px] text-crimson">{errors[k]}</p>;
  const aria = (k: string) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `${k}-err` } : {});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validateEnquiry({ ...f, context: ctx });
    setErrors(v);
    if (Object.keys(v).length) {
      document.getElementById(Object.keys(v)[0])?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, context: ctx }) });
      const data = await res.json();
      if (!res.ok) { setErrors(data.errors ?? {}); setState("failed"); return; }
      setState(data.live ? "sent" : "preview");
    } catch {
      setState("failed");
    }
  }

  if (state === "sent" || state === "preview") {
    return (
      <div className="ledger-paper p-8 md:p-10" role="status">
        <p className="ledger-eyebrow ledger-crimson">{state === "sent" ? "Received" : "Preview mode"}</p>
        <p className="ledger-display text-[1.9rem] leading-tight mt-2">Thank you, {f.name.split(" ")[0]}.</p>
        <p className="mt-3 text-[17px] leading-relaxed max-w-xl">{state === "sent" ? `${advisor ? advisor.firstName : "James or an advisor"} will reply ${f.contact === "email" ? "by email" : "to arrange your call"}.` : "This is a preview of the site. Enquiries connect to the house inbox at launch, so nothing was sent. To reach James today, call 1.800.419.7000."}</p>
      </div>
    );
  }

  const hasContext = advisor || ctx.trip || ctx.from || ctx.folio;
  return (
    <form onSubmit={submit} noValidate className="space-y-8" aria-label="Plan your journey">
      {hasContext && (
        <div className="bg-coast-mist p-5 flex flex-wrap gap-5 items-start">
          {advisor && (
            <div className="flex items-center gap-3">
              {advisor.portrait ? <span className="relative w-12 h-12 rounded-full overflow-hidden bg-paper"><Image src={advisor.portrait.url} alt="" fill sizes="48px" className="object-cover" /></span> : <span className="w-12 h-12 rounded-full border border-coast-deep/40 flex items-center justify-center ledger-display text-coast-deep">{advisor.firstName[0]}</span>}
              <div><p className="ledger-eyebrow !text-coast-deep">Writing to</p><p className="ledger-display text-lg">{advisor.name}</p></div>
            </div>
          )}
          {ctx.trip && (
            <div className="min-w-0">
              <p className="ledger-eyebrow !text-coast-deep">Your starting point</p>
              <p className="ledger-display text-lg leading-snug">{ctx.trip}</p>
              <p className="text-[14px] ledger-muted">{[ctx.option, ctx.travellers && `${ctx.travellers} travellers`, ctx.addons].filter(Boolean).join(" · ")}</p>
              {ctx.estimate && <p className="text-[14px] mt-0.5">Estimate from the price builder: <strong>US${Number(ctx.estimate).toLocaleString("en-US")}</strong> <span className="ledger-muted">(example prices)</span></p>}
            </div>
          )}
          {ctx.folio && (
            <div className="min-w-0">
              <p className="ledger-eyebrow !text-coast-deep">Your Folio</p>
              <p className="ledger-display text-lg leading-snug">{ctx.folio}</p>
              <p className="text-[14px] ledger-muted">Iggi opened it; {advisor ? advisor.firstName : "the house"} picks it up from here. <Link href={`/folio?fol=${encodeURIComponent(ctx.folio)}`} className="underline underline-offset-4">See it</Link></p>
            </div>
          )}
          {ctx.from && !ctx.trip && <p className="text-[15px]">{FROM_LABEL[ctx.from] ?? "Picking up where you left off."}</p>}
        </div>
      )}

      <fieldset className="grid sm:grid-cols-2 gap-5">
        <legend className="ledger-display text-[1.4rem] mb-4">01 · The trip</legend>
        <div className="sm:col-span-2"><label htmlFor="where" className={label}>Where are you drawn?</label><input id="where" className={field} value={f.where} onChange={(e) => set("where", e.target.value)} placeholder="A country, a region, a stay, or just a feeling" {...aria("where")} />{err("where")}</div>
        <div><label htmlFor="when" className={label}>When</label><input id="when" className={field} value={f.when} onChange={(e) => set("when", e.target.value)} placeholder="Dates, a month, or 'flexible'" /></div>
        <div><label htmlFor="nights" className={label}>How long</label><input id="nights" className={field} value={f.nights} onChange={(e) => set("nights", e.target.value)} placeholder="e.g. 10 nights" /></div>
        <div className="flex gap-6"><Stepper id="adults" labelText="Adults" value={f.adults} min={1} onChange={(n) => set("adults", n)} /><Stepper id="children" labelText="Children" value={f.children} min={0} onChange={(n) => set("children", n)} /></div>
        <div><label htmlFor="budget" className={label}>Comfortable budget <span className="normal-case tracking-normal">(optional)</span></label><select id="budget" className={field} value={f.budget} onChange={(e) => set("budget", e.target.value)}><option value="">Choose one</option>{BUDGETS.map((b) => <option key={b}>{b}</option>)}</select></div>
        <div className="sm:col-span-2">
          <span className={label} id="interests-l">What&rsquo;s on your mind (pick any)</span>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="interests-l">
            {INTERESTS.map((i) => { const on = f.interests.includes(i); return (
              <button type="button" key={i} aria-pressed={on} onClick={() => set("interests", on ? f.interests.filter((x) => x !== i) : [...f.interests, i])} className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[14.5px] transition-colors ${on ? "bg-ink text-paper border-ink" : "ledger-border hover:border-crimson"}`}>{on && <Check className="w-3.5 h-3.5" aria-hidden="true" />}{i}</button>
            ); })}
          </div>
        </div>
        <div className="sm:col-span-2"><label htmlFor="message" className={label}>Anything else James should know?</label><textarea id="message" rows={4} className={field} value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="The whim, the celebration, the thing you'd love to avoid…" {...aria("message")} />{err("message")}</div>
      </fieldset>

      <fieldset className="grid sm:grid-cols-2 gap-5 border-t ledger-rule pt-6">
        <legend className="ledger-display text-[1.4rem] mb-4">02 · You</legend>
        <div><label htmlFor="name" className={label}>Your name</label><input id="name" autoComplete="name" className={field} value={f.name} onChange={(e) => set("name", e.target.value)} {...aria("name")} />{err("name")}</div>
        <div><label htmlFor="email" className={label}>Email</label><input id="email" type="email" autoComplete="email" className={field} value={f.email} onChange={(e) => set("email", e.target.value)} {...aria("email")} />{err("email")}</div>
        <div className="sm:col-span-2">
          <span className={label} id="contact-l">How should we reply?</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="contact-l">
            {([["email", "By email"], ["phone", "Schedule a phone call"], ["video", "Schedule a video call"]] as const).map(([k, l]) => (
              <button type="button" role="radio" aria-checked={f.contact === k} key={k} onClick={() => set("contact", k)} className={`px-3.5 py-2 border text-[15px] ${f.contact === k ? "bg-crimson text-paper border-crimson" : "ledger-border hover:border-crimson"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div><label htmlFor="phone" className={label}>Phone {f.contact === "email" && <span className="normal-case tracking-normal">(optional)</span>}</label><input id="phone" type="tel" autoComplete="tel" className={field} value={f.phone} onChange={(e) => set("phone", e.target.value)} {...aria("phone")} />{err("phone")}</div>
        {f.contact !== "email" && <div><label htmlFor="callTime" className={label}>Best time for the call</label><select id="callTime" className={field} value={f.callTime} onChange={(e) => set("callTime", e.target.value)}><option value="">Any time</option>{CALL_TIMES.map((c) => <option key={c}>{c}</option>)}</select></div>}
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-[15.5px] cursor-pointer"><input type="checkbox" className="mt-1 accent-crimson w-4 h-4" checked={f.hasAdvisor} onChange={(e) => set("hasAdvisor", e.target.checked)} />I already work with a travel advisor, and I&rsquo;d like you to coordinate with them.</label>
          {f.hasAdvisor && <div className="mt-3"><label htmlFor="advisorDetails" className={label}>Your advisor&rsquo;s name and email</label><input id="advisorDetails" className={field} value={f.advisorDetails} onChange={(e) => set("advisorDetails", e.target.value)} {...aria("advisorDetails")} />{err("advisorDetails")}</div>}
        </div>
        <label className="sm:col-span-2 flex items-start gap-3 text-[15.5px] cursor-pointer"><input type="checkbox" className="mt-1 accent-crimson w-4 h-4" checked={f.travelNotes} onChange={(e) => set("travelNotes", e.target.checked)} />Send me Travel Notes: new stays and ships before they&rsquo;re announced, one letter a month.</label>
        <div className="hidden" aria-hidden="true"><label htmlFor="website">Leave empty</label><input id="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} /></div>
      </fieldset>

      <div className="border-t ledger-rule pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <button type="submit" disabled={state === "sending"} className="ledger-btn ledger-btn--solid justify-center disabled:opacity-60">{state === "sending" ? "Sending…" : f.contact === "email" ? `Send to ${advisor ? advisor.firstName : "James"}` : "Request my call"}</button>
        <p className="text-[14px] ledger-muted">Nothing is booked until you&rsquo;ve seen and approved a quote. We use your details only to plan your trip. <Link href="/legal/privacy" className="underline">Privacy</Link></p>
      </div>
      {state === "failed" && <p role="alert" className="text-crimson text-[15px]">Something went wrong sending that. Please check the highlighted fields, or call 1.800.419.7000.</p>}
    </form>
  );
}
