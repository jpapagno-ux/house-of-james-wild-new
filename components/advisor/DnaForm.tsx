"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { api } from "@/lib/platform/client";
import { DNA_AVAILABILITY, DNA_MARKS, DNA_PARTIES, DNA_VOLUMES, type DnaInput, type DnaMark } from "@/lib/platform/advisor-dna";

// Part five of the advisor's file: their Advisor DNA. Sent to the house; nothing reaches the website until
// the house approves it.

export type DnaOptions = {
  pathways: { id: string; name: string; setting: string }[];
  countries: { slug: string; name: string; region: string; regionName: string }[];
  stays: { ledgerId: string; name: string; countrySlug: string }[];
};
const input = "mt-1 w-full bg-white border ledger-border px-3 py-2 text-[15px]";
const lab = "block text-[13px] ledger-muted";
const chip = (on: boolean) => `house-chip inline-flex items-center gap-2 border px-3 py-2 text-[14px] cursor-pointer ${on ? "border-[#2E2B28] bg-[#F4F2EF] font-medium" : "ledger-border bg-white"}`;

function Toggle({ items, value, onChange, name }: { items: [string, string][]; value: string[]; onChange: (v: string[]) => void; name: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={name}>
      {items.map(([k, l]) => {
        const on = value.includes(k);
        return (
          <label key={k} className={chip(on)}>
            <input type="checkbox" className="sr-only" checked={on} onChange={() => onChange(on ? value.filter((x) => x !== k) : [...value, k])} />
            <span aria-hidden="true">{on ? "✓" : "+"}</span>{l}
          </label>
        );
      })}
    </div>
  );
}

export function DnaForm({ initial, options, waiting }: { initial: DnaInput; options: DnaOptions; waiting: boolean }) {
  const router = useRouter();
  const [d, setD] = useState<DnaInput>(initial);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = <K extends keyof DnaInput>(k: K, v: DnaInput[K]) => setD((x) => ({ ...x, [k]: v }));
  const countryName = useMemo(() => new Map(options.countries.map((c) => [c.slug, c.name])), [options.countries]);
  const stayName = useMemo(() => new Map(options.stays.map((s) => [s.ledgerId, s.name])), [options.stays]);
  const regions = useMemo(() => {
    const m = new Map<string, { name: string; list: { slug: string; name: string }[] }>();
    for (const c of options.countries) m.set(c.region, { name: c.regionName, list: [...(m.get(c.region)?.list ?? []), c] });
    return [...m.entries()].map(([region, v]) => ({ region, ...v }));
  }, [options.countries]);
  const staysHere = useMemo(() => {
    const t = q.trim().toLowerCase();
    return options.stays.filter((s) => d.countries.includes(s.countrySlug) && (!t || s.name.toLowerCase().includes(t))).slice(0, 40);
  }, [options.stays, d.countries, q]);
  const markOf = (id: string) => d.marks.find((m) => m.ledgerId === id);
  const setMark = (id: string, patch: Partial<DnaMark> | null) =>
    set("marks", patch === null ? d.marks.filter((m) => m.ledgerId !== id) : markOf(id) ? d.marks.map((m) => (m.ledgerId === id ? { ...m, ...patch } : m)) : [...d.marks, { ledgerId: id, mark: "Stayed", when: null, note: null, ...patch }]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const r = await api("POST", "/api/v1/advisor/dna", d);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    setMsg({ ok: true, text: "Sent. The house will review it." });
    router.refresh();
  }

  return (
    <form onSubmit={send} className="grid gap-6" noValidate>
      <fieldset className="bg-white border ledger-border p-5 md:p-6 grid gap-3">
        <legend className="ledger-display text-[1.3rem] px-1">Your Pathways</legend>
        <p className="text-[14px] ledger-muted">The kinds of journey you plan best. Travellers choosing a Pathway on the site are offered the advisors who carry it.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.pathways.map((p) => {
            const on = d.pathways.includes(p.id);
            return (
              <label key={p.id} className={`flex gap-3 border px-3 py-2.5 cursor-pointer ${on ? "border-[#2E2B28] bg-[#F4F2EF]" : "ledger-border"}`}>
                <input type="checkbox" checked={on} onChange={() => set("pathways", on ? d.pathways.filter((x) => x !== p.id) : [...d.pathways, p.id])} className="mt-1 accent-[#2E2B28]" />
                <span><span className="font-medium">{p.name}</span><span className="block text-[13px] ledger-muted">{p.setting}</span></span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="bg-white border ledger-border p-5 md:p-6 grid gap-4">
        <legend className="ledger-display text-[1.3rem] px-1">What you plan, and for whom</legend>
        <div><p className={lab}>Volumes you carry</p><div className="mt-2"><Toggle name="Volumes" items={DNA_VOLUMES} value={d.volumes} onChange={(v) => set("volumes", v)} /></div></div>
        <div><p className={lab}>Who you plan for</p><div className="mt-2"><Toggle name="Who you plan for" items={DNA_PARTIES} value={d.party_types} onChange={(v) => set("party_types", v)} /></div></div>
      </fieldset>

      <fieldset className="bg-white border ledger-border p-5 md:p-6 grid gap-4">
        <legend className="ledger-display text-[1.3rem] px-1">Countries you know first-hand</legend>
        <p className="text-[14px] ledger-muted">Only places you have been. Each one puts your card on that country&rsquo;s page; a place you have stayed ranks above a place you only know.</p>
        {d.countries.length > 0 && <p className="text-[14px]"><span className="font-medium">{d.countries.length} chosen:</span> {d.countries.map((c) => countryName.get(c) ?? c.replace(/-/g, " ").replace(/\b\w/g, (x) => x.toUpperCase())).join(", ")}</p>}
        <div className="grid gap-4">
          {regions.map(({ region, name, list }) => (
            <details key={region} open={list.some((c) => d.countries.includes(c.slug))} className="border-t ledger-border pt-3">
              <summary className="cursor-pointer text-[14px] font-medium">{name} <span className="ledger-muted font-normal">({list.filter((c) => d.countries.includes(c.slug)).length} of {list.length})</span></summary>
              <div className="mt-3"><Toggle name={name} items={list.map((c) => [c.slug, c.name])} value={d.countries} onChange={(v) => set("countries", v)} /></div>
            </details>
          ))}
        </div>
      </fieldset>

      <fieldset className="bg-white border ledger-border p-5 md:p-6 grid gap-4">
        <legend className="ledger-display text-[1.3rem] px-1">Stays you know yourself</legend>
        <p className="text-[14px] ledger-muted">Stays in the countries you chose. Mark only what is true: Stayed (you slept there), Walked It (an inspection), Sailed It (a ship). The house checks each mark before it shows.</p>
        {d.marks.length > 0 && (
          <ul className="grid gap-2">
            {d.marks.map((m) => (
              <li key={m.ledgerId} className="grid gap-2 sm:grid-cols-[1fr_auto_8rem_auto] items-center border ledger-border px-3 py-2">
                <span className="text-[14.5px] font-medium">{stayName.get(m.ledgerId) ?? m.ledgerId}</span>
                <select aria-label={`Mark for ${stayName.get(m.ledgerId) ?? m.ledgerId}`} value={m.mark} onChange={(e) => setMark(m.ledgerId, { mark: e.target.value as DnaMark["mark"] })} className="bg-white border ledger-border px-2 py-1.5 text-[14px]">
                  {DNA_MARKS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <input aria-label="When" placeholder="When, e.g. May 2024" value={m.when ?? ""} maxLength={20} onChange={(e) => setMark(m.ledgerId, { when: e.target.value || null })} className="bg-white border ledger-border px-2 py-1.5 text-[14px]" />
                <button type="button" onClick={() => setMark(m.ledgerId, null)} className="text-[12.5px] underline ledger-muted justify-self-start">Remove</button>
              </li>
            ))}
          </ul>
        )}
        {d.countries.length ? (
          <>
            <label className={lab}>Find a stay<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a name" className={input} /></label>
            <ul className="flex flex-wrap gap-2">
              {staysHere.filter((s) => !markOf(s.ledgerId)).map((s) => (
                <li key={s.ledgerId}><button type="button" onClick={() => setMark(s.ledgerId, {})} className="house-chip border ledger-border bg-white px-3 py-1.5 text-[13.5px]">+ {s.name}</button></li>
              ))}
            </ul>
          </>
        ) : <p className="text-[14px] ledger-muted">Choose your countries first.</p>}
      </fieldset>

      <fieldset className="bg-white border ledger-border p-5 md:p-6 grid gap-4">
        <legend className="ledger-display text-[1.3rem] px-1">In your words</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={lab}>Languages (separate with commas)<input value={d.languages.join(", ")} onChange={(e) => set("languages", e.target.value.split(",").map((x) => x.trimStart()))} className={input} /></label>
          <label className={lab}>Specialties (up to twelve, separate with commas)<input value={d.specialties.join(", ")} onChange={(e) => set("specialties", e.target.value.split(",").map((x) => x.trimStart()))} className={input} /></label>
        </div>
        <label className={lab}>A line in your own words, for your card (under 300 characters)
          <textarea rows={2} maxLength={300} value={d.match_note ?? ""} onChange={(e) => set("match_note", e.target.value || null)} className={input} placeholder="What you love planning, and why" />
        </label>
        <fieldset className="grid gap-2">
          <legend className={lab}>Are you taking new clients?</legend>
          {DNA_AVAILABILITY.map(([k, l, line]) => (
            <label key={k} className={`flex gap-3 border px-3 py-2.5 cursor-pointer ${d.availability === k ? "border-[#2E2B28] bg-[#F4F2EF]" : "ledger-border"}`}>
              <input type="radio" name="availability" checked={d.availability === k} onChange={() => set("availability", k as DnaInput["availability"])} className="mt-1 accent-[#2E2B28]" />
              <span><span className="font-medium">{l}</span><span className="block text-[13px] ledger-muted">{line}</span></span>
            </label>
          ))}
        </fieldset>
      </fieldset>

      {msg && <p role={msg.ok ? "status" : "alert"} className={`text-[14px] ${msg.ok ? "text-[#11705A]" : "ledger-crimson"}`}>{msg.text}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="ledger-btn ledger-btn--solid">{busy ? "Sending…" : waiting ? "Send again (replaces the one waiting)" : "Send to the house"}</button>
        <span className="text-[13px] ledger-muted">Nothing changes on the website until the house approves it.</span>
      </div>
    </form>
  );
}
