"use client";

import { useEffect, useState } from "react";
import { EMPTY_TRIP, TRIP_EVENT, readTrip, setTrip, type Trip } from "@/lib/journal-style/bus";

// JWC-STYLE-01. The "just this stay" path. Three small islands share one set of answers (dates, travellers, room),
// kept for the visit, so a traveller never types them twice:
//  • DatesBar, above the rooms: Arrive, Depart, Travellers, Check dates;
//  • PickRoom, on each room ticket: carries that room into the request;
//  • RequestForm, in How to Reserve: those answers plus a name and an email, sent to the house.
// The request goes to the house's existing enquiry endpoint (/api/enquiry), unchanged, in the same shape /plan
// sends: it is a request the house answers with a quote, never a payment or a held room.
function useTrip(slug: string): [Trip, (p: Partial<Trip>) => void] {
  const [t, setT] = useState<Trip>(EMPTY_TRIP);
  useEffect(() => {
    setT(readTrip(slug));
    const on = (e: Event) => setT((e as CustomEvent<Trip>).detail);
    window.addEventListener(TRIP_EVENT, on);
    return () => window.removeEventListener(TRIP_EVENT, on);
  }, [slug]);
  return [t, (p) => setTrip(slug, p)];
}

const FIELD = "h-11 w-full border border-[color:var(--jw-keyline)] bg-white px-3 text-[16px] text-graphite rounded-[2px] focus:border-[color:var(--jw-graphite)] outline-none";
const LABEL = "block font-mono text-[9.5px] tracking-[0.22em] uppercase text-stone-text mb-1.5";
const todayIso = () => new Date().toISOString().slice(0, 10);

function Count({ id, label, value, min, onChange }: { id: string; label: string; value: number; min: number; onChange: (n: number) => void }) {
  return (
    <div>
      <span id={id} className={LABEL}>{label}</span>
      <div role="group" aria-labelledby={id} className="inline-flex h-11 items-center border border-[color:var(--jw-keyline)] rounded-[2px]">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Fewer ${label.toLowerCase()}`} className="h-full w-10 text-[18px] text-graphite">−</button>
        <span aria-live="polite" className="w-8 text-center font-display text-[19px]">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(12, value + 1))} aria-label={`More ${label.toLowerCase()}`} className="h-full w-10 text-[18px] text-graphite">+</button>
      </div>
    </div>
  );
}

export function DatesBar({ slug, reserveHref }: { slug: string; reserveHref: string }) {
  const [t, set] = useTrip(slug);
  return (
    <form aria-label="Your dates" onSubmit={(e) => { e.preventDefault(); window.location.hash = reserveHref.replace(/^#/, ""); }}
      className="mt-8 grid grid-cols-2 md:grid-cols-[1fr_1fr_auto_auto] items-end gap-3 md:gap-4 border border-[color:var(--jw-hairline)] border-t-2 border-t-[color:var(--jw-stone)] bg-white px-4 py-4 md:px-5">
      <label><span className={LABEL}>Arrive</span><input type="date" className={FIELD} min={todayIso()} value={t.arrive} onChange={(e) => set({ arrive: e.target.value, ...(t.depart && e.target.value >= t.depart ? { depart: "" } : {}) })} /></label>
      <label><span className={LABEL}>Depart</span><input type="date" className={FIELD} min={t.arrive || todayIso()} value={t.depart} onChange={(e) => set({ depart: e.target.value })} /></label>
      <Count id={`${slug}-bar-adults`} label="Travellers" value={t.adults + t.children} min={1} onChange={(n) => set({ adults: Math.max(1, n - t.children) })} />
      <button type="submit" className="col-span-2 md:col-span-1 ledger-btn ledger-btn--house ledger-btn--compact justify-center">Check dates</button>
    </form>
  );
}

export function PickRoom({ slug, room, reserveHref }: { slug: string; room: string; reserveHref: string }) {
  return <a href={reserveHref} onClick={() => setTrip(slug, { room })} className="house-chip house-chip--primary !px-4 !py-2.5 font-semibold !text-[10.5px] tracking-[0.2em] uppercase">Check dates</a>;
}

const nights = (a: string, b: string) => (a && b ? Math.round((Date.parse(b) - Date.parse(a)) / 86400000) : 0);
const say = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1]} ${y}`; };

export function RequestForm({ slug, name, path, rooms }: { slug: string; name: string; path: string; rooms: string[] }) {
  const [t, set] = useTrip(slug);
  const [who, setWho] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "preview" | "failed">("idle");
  const n = nights(t.arrive, t.depart);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!t.arrive || !t.depart || n < 1) err.dates = "Choose the day you arrive and the day you leave.";
    if (who.name.trim().length < 2) err.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(who.email.trim())) err.email = "Please enter an email address we can reply to.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setState("sending");
    try {
      const res = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: who.name.trim(), email: who.email.trim(), where: name, when: `${say(t.arrive)} to ${say(t.depart)}`, nights: String(n), adults: t.adults, children: t.children,
        interests: [], contact: "email", hasAdvisor: false, travelNotes: false, website: "",
        message: `Request these dates at ${name}${t.room ? `, ${t.room}` : ""}: ${say(t.arrive)} to ${say(t.depart)} (${n} ${n === 1 ? "night" : "nights"}), ${t.adults + t.children} ${t.adults + t.children === 1 ? "traveller" : "travellers"}.`,
        context: { trip: name, option: t.room || undefined, travellers: String(t.adults + t.children), from: path },
      }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErrors(data.errors ?? {}); setState("failed"); return; }
      setState(data.live ? "sent" : "preview");
    } catch { setState("failed"); }
  }

  if (state === "sent" || state === "preview") {
    return (
      <div role="status" className="border border-[color:var(--jw-hairline)] border-t-2 border-t-[color:var(--jw-crimson)] bg-white px-5 py-6 md:px-7">
        <p className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-house">Request received</p>
        <p className="font-display text-[26px] leading-tight text-graphite mt-2">{name}, {say(t.arrive)} to {say(t.depart)}</p>
        <p className="mt-3 text-[14.5px] leading-relaxed text-stone-text">{state === "sent" ? "The house confirms with the property and writes back with the rate, the taxes and what is included. Nothing is charged and no room is held yet." : "This preview does not send email yet. To reach the house now, call 1.800.419.7000."}</p>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate aria-label={`Request these dates at ${name}`} className="border border-[color:var(--jw-hairline)] border-t-2 border-t-[color:var(--jw-crimson)] bg-white px-5 py-6 md:px-7">
      <p className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-house">Request these dates</p>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
        <label><span className={LABEL}>Arrive</span><input type="date" className={FIELD} min={todayIso()} value={t.arrive} aria-invalid={!!errors.dates} onChange={(e) => set({ arrive: e.target.value })} /></label>
        <label><span className={LABEL}>Depart</span><input type="date" className={FIELD} min={t.arrive || todayIso()} value={t.depart} aria-invalid={!!errors.dates} onChange={(e) => set({ depart: e.target.value })} /></label>
        {errors.dates && <p className="col-span-2 -mt-2 text-[13px] text-house">{errors.dates}</p>}
        <Count id={`${slug}-adults`} label="Adults" value={t.adults} min={1} onChange={(v) => set({ adults: v })} />
        <Count id={`${slug}-children`} label="Children" value={t.children} min={0} onChange={(v) => set({ children: v })} />
        {rooms.length > 0 && (
          <label className="col-span-2"><span className={LABEL}>Room</span>
            <select className={FIELD} value={t.room} onChange={(e) => set({ room: e.target.value })}><option value="">Any room: the house suggests one</option>{rooms.map((r) => <option key={r} value={r}>{r}</option>)}</select>
          </label>
        )}
        <label className="col-span-2 sm:col-span-1"><span className={LABEL}>Your name</span><input className={FIELD} autoComplete="name" value={who.name} aria-invalid={!!errors.name} onChange={(e) => setWho({ ...who, name: e.target.value })} />{errors.name && <span className="mt-1 block text-[13px] text-house">{errors.name}</span>}</label>
        <label className="col-span-2 sm:col-span-1"><span className={LABEL}>Email</span><input type="email" className={FIELD} autoComplete="email" inputMode="email" value={who.email} aria-invalid={!!errors.email} onChange={(e) => setWho({ ...who, email: e.target.value })} />{errors.email && <span className="mt-1 block text-[13px] text-house">{errors.email}</span>}</label>
      </div>
      <button type="submit" disabled={state === "sending"} className="mt-6 w-full justify-center ledger-btn ledger-btn--house disabled:opacity-60">{state === "sending" ? "Sending" : n > 0 ? `Request these ${n} ${n === 1 ? "night" : "nights"}` : "Request these dates"}</button>
      {state === "failed" && <p role="alert" className="mt-3 text-[13.5px] text-house">That did not go through. Please try again, or call the house on 1.800.419.7000.</p>}
      <p className="mt-4 text-[12.5px] leading-relaxed text-stone-text">A request, not a payment. The house confirms with {name} and writes back with the rate for your dates. Nothing is charged and no room is held until you say yes to the quote.</p>
    </form>
  );
}
