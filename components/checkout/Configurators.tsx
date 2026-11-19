"use client";

import { useState, type ReactNode } from "react";
import { offersByRoom, type RatePlan } from "@/lib/rates";
import { niceDate } from "@/lib/booking-live/money";
import { NO_PRICE, addDays, fmtMoney, isDate, nightsBetween, priceNights, toUsdMinor, verified, type Fx, type Line, type Price, type SeasonRule } from "@/lib/checkout/journey";
import type { JourneyProduct, StayProduct, VoyageProduct } from "@/lib/checkout/pilot";
import { isEstimateSeason, seasonLabel } from "@/lib/booking-live/estimates";

// Journey Cart: the pieces that choose dates, rooms, cabins and guests, on Build Your Journey and again
// when a line is edited in the cart. A price appears only when its source answers: the booking engine
// (Leeu House), a published contracted card (Ellerman House) or Antarctica21's filed from fare.

export type Card = { version: string; currency: string; effectiveFrom: string; effectiveTo: string; paymentTerms: { depositPercentBp?: number | null; balanceDueDaysBeforeArrival?: number | null } | null; cancellation: { summary?: string } | null; rooms: { key: string; name: string }[]; rules: SeasonRule[]; taxes: { name: string; kind: string; percentBp: number | null; amountMinor: number | null; included: boolean }[] };
export type CardState = { state: "loading" } | { state: "none"; reason: string } | { state: "ok"; card: Card };
export type Draft = { line: Omit<Line, "id">; experiences: string[] };

export const field = "mt-1 w-full bg-paper border ledger-border px-3 py-2.5 text-[16px] text-ink focus:outline-none focus:border-ink";
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function Label({ text, children }: { text: string; children: ReactNode }) {
  return <label className="block min-w-0"><span className="ledger-eyebrow">{text}</span>{children}</label>;
}

const TONE: Record<Price["source"], { word: string; dot: string }> = {
  albie_live: { word: "Live price", dot: "bg-emerald-700" },
  rate_card: { word: "Contracted rate", dot: "bg-ink" },
  published_rate: { word: "Published rate", dot: "bg-ink" },
  published_from: { word: "Published from fare", dot: "bg-stone" },
  none: { word: "No price on file", dot: "bg-transparent border border-stone" },
};

export function PriceChip({ price }: { price: Price }) {
  const t = TONE[price.source];
  return (
    <span className="inline-flex items-center gap-2 border ledger-border bg-paper px-2.5 py-1 text-[12px] tracking-wide text-ink whitespace-nowrap">
      <span className={`w-2 h-2 ${price.estimate ? "bg-stone" : t.dot}`} aria-hidden="true" />{price.estimate ? "Estimated rate · to be confirmed" : t.word}{verified(price) ? "" : price.source === "published_from" ? " · not a quote" : ""}
    </span>
  );
}

export function Experiences({ options: all, supplier, picked, onChange }: { options: string[]; supplier: string; picked: string[]; onChange: (v: string[]) => void }) {
  if (!all.length) return null;
  return (
    <fieldset className="mt-5">
      <legend className="ledger-eyebrow">Experiences to request</legend>
      <p className="mt-1 text-[13.5px] ledger-muted">No price is on file for these. The house asks {supplier} and quotes each one.</p>
      <div className="mt-2 grid sm:grid-cols-2 gap-x-5 gap-y-1.5">
        {all.map((e) => (
          <label key={e} className="flex items-start gap-2.5 text-[15px] py-1 cursor-pointer">
            <input type="checkbox" className="mt-1 w-4 h-4 accent-[#2E2B28]" checked={picked.includes(e)} onChange={(ev) => onChange(ev.target.checked ? [...picked, e] : picked.filter((x) => x !== e))} />
            <span>{e}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A stay priced night by night from its contracted card, or failing that its published rates. Shared by the picker and the example journey. */
export function ratedStayPrice(product: StayProduct, card: Card | null, fx: Record<string, Fx>, chosen: string, start: string, end: string, adults: number): Price {
  const n = nightsBetween(start, end);
  const party = `${adults} ${adults === 1 ? "adult" : "adults"}`;
    const r = card?.rooms.find((x) => x.name === chosen);
    const u = product.units.find((x) => x.name === chosen);
    const cur = card ? card.currency : product.currency;
    const p = card && r ? priceNights(card.rules, r.key, start, end, adults) : !card && u ? priceNights(product.rules, u.key, start, end, adults) : null;
    if (!p) return NO_PRICE(`${n} nights, ${chosen}, ${party}`, card ? "The contracted card does not cover every night or this party. The house prices it." : u && !product.rules.some((x) => x.roomKey === u.key) ? `No rate is published for ${chosen}. The house prices it with ${product.supplier}.` : `The published rates on file do not cover every night of these dates, or this party. The house prices it with ${product.supplier}.`);
    const f = cur === "USD" ? null : (fx[cur] ?? null);
    const estimate = Boolean(card) && p.seasons.some((s) => isEstimateSeason(s.season));
    return { source: card ? "rate_card" : "published_rate", ...(estimate ? { estimate } : {}), usdMinor: toUsdMinor(p.totalMinor, cur, f), sourceMinor: p.totalMinor, sourceCurrency: cur, fx: f, basis: `${p.seasons.map((s) => `${s.nights} × ${seasonLabel(s.season)} at ${fmtMoney(s.amountMinor, cur)}`).join(", ")}; ${chosen}, ${party}`, provenance: card ? `Contracted card ${card.version}` : product.rateSource, fetchedAt: null };
}

type Engine = { state: "idle" } | { state: "loading" } | { state: "error"; message: string } | { state: "ok"; key: string; nights: number; fetchedAt: string; plans: RatePlan[] };

export function StayConfigurator({ product, today, cardState, fx, initial, submitLabel, onSubmit }: { product: StayProduct; today: string; cardState: CardState; fx: Record<string, Fx>; initial?: Draft; submitLabel: string; onSubmit: (d: Draft) => void }) {
  const [start, setStart] = useState(initial?.line.start ?? "");
  const [end, setEnd] = useState(initial?.line.end ?? "");
  const [adults, setAdults] = useState(initial?.line.adults ?? 2);
  const [room, setRoom] = useState(initial?.line.unit ?? product.pilotRoom ?? "");
  const [exp, setExp] = useState<string[]>(initial?.experiences ?? []);
  const [engine, setEngine] = useState<Engine>({ state: "idle" });

  const datesOk = isDate(start) && isDate(end) && end > start && start >= today && nightsBetween(start, end) <= 30;
  const key = `${start}|${end}|${adults}`;
  const offers = engine.state === "ok" && engine.key === key ? offersByRoom(engine.plans) : null;
  const card = cardState.state === "ok" ? cardState.card : null;
  const rooms = product.pricing === "albie" ? (offers?.map((o) => o.name) ?? []) : card ? card.rooms.map((r) => r.name) : product.units.map((u) => u.name);
  const unit = product.units.find((u) => u.name === room);
  const chosen = rooms.includes(room) ? room : product.pricing === "albie" ? (rooms.find((r) => r === product.pilotRoom) ?? rooms[0] ?? "") : (rooms[0] ?? "");

  async function ask() {
    if (!product.engineProperty || !datesOk) return;
    setEngine({ state: "loading" });
    try {
      const qs = new URLSearchParams({ property: product.engineProperty, checkIn: start, checkOut: end, adults: String(adults) });
      const r = await fetch(`/api/rates?${qs}`);
      const j = await r.json();
      if (!r.ok) { setEngine({ state: "error", message: "The booking engine did not answer just now. No price is shown, and none is guessed. You can still add the stay and the house will price it." }); return; }
      setEngine({ state: "ok", key, nights: j.nights, fetchedAt: j.fetchedAt, plans: j.plans ?? [] });
    } catch { setEngine({ state: "error", message: "The booking engine could not be reached. No price is shown, and none is guessed." }); }
  }

  function price(): Price {
    const n = nightsBetween(start, end);
    const party = `${adults} ${adults === 1 ? "adult" : "adults"}`;
    if (product.pricing === "albie") {
      const o = offers?.find((x) => x.name === chosen);
      if (!o || engine.state !== "ok") return NO_PRICE(`${n} nights, ${chosen || "room to be chosen"}, ${party}`, "No live price was returned by the booking engine for these dates.");
      const best = o.options[0];
      const minor = Math.round(best.total * 100);
      return { source: "albie_live", usdMinor: minor, sourceMinor: minor, sourceCurrency: "USD", fx: null, basis: `Total for ${n} nights, ${o.name}, ${party}, ${best.plan}`, provenance: `House booking engine (ALBIE by TAG), property ${product.engineProperty}, quoted in USD`, fetchedAt: engine.fetchedAt };
    }
    return ratedStayPrice(product, card, fx, chosen, start, end, adults);
  }

  const p = datesOk && chosen ? price() : null;
  const canAdd = datesOk && Boolean(chosen || product.pricing === "albie");

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_.7fr] gap-4">
        <Label text="Arrive"><input type="date" className={field} value={start} min={today} onChange={(e) => { setStart(e.target.value); if (!end || end <= e.target.value) setEnd(isDate(e.target.value) ? addDays(e.target.value, 3) : ""); }} /></Label>
        <Label text="Depart"><input type="date" className={field} value={end} min={start || today} onChange={(e) => setEnd(e.target.value)} /></Label>
        <Label text="Adults"><select className={field} value={adults} onChange={(e) => setAdults(Number(e.target.value))}>{Array.from({ length: product.maxAdults }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}</select></Label>
      </div>

      {product.pricing === "albie" ? (
        <div className="mt-4">
          <button type="button" className="ledger-btn" disabled={!datesOk || engine.state === "loading"} onClick={ask}>{engine.state === "loading" ? "Asking the booking engine" : offers ? "Ask again" : "Check live price and rooms"}</button>
          <div aria-live="polite" className="mt-3">
            {engine.state === "error" && <p className="text-[14.5px]">{engine.message}</p>}
            {offers && offers.length === 0 && <p className="text-[14.5px]">The booking engine has nothing open for those dates and that party. Try other dates, or add the stay unpriced and the house will ask.</p>}
            {offers && offers.length > 0 && engine.state === "ok" && (
              <fieldset>
                <legend className="ledger-eyebrow">Open on your dates · {engine.nights} {engine.nights === 1 ? "night" : "nights"}</legend>
                <div className="mt-2 border ledger-border divide-y divide-[#DCD7D0]">
                  {offers.map((o) => (
                    <label key={o.name} className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer ${chosen === o.name ? "bg-paper-card" : "bg-paper"}`}>
                      <input type="radio" name={`room-${product.key}`} className="w-4 h-4 accent-[#2E2B28]" checked={chosen === o.name} onChange={() => setRoom(o.name)} />
                      <span className="flex-1 min-w-0"><span className="block ledger-display text-[1.2rem] leading-tight">{o.name}{o.name === product.pilotRoom && <span className="ml-2 ledger-eyebrow align-middle">Pilot room</span>}</span><span className="block text-[13px] ledger-muted">{o.options[0].plan}</span></span>
                      <span className="text-right whitespace-nowrap"><span className="block text-[16px]">{fmtMoney(Math.round(o.options[0].total * 100), "USD")}</span><span className="block text-[12px] ledger-muted">for the stay</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Label text={product.unitWord}><select className={field} value={chosen} onChange={(e) => setRoom(e.target.value)}>{rooms.map((r) => <option key={r}>{r}</option>)}</select></Label>
          {unit && !card && <p className="mt-2 text-[14px]">{unit.facts}{unit.note ? ` · ${unit.note}` : ""}</p>}
          <p className="mt-2 text-[14.5px] ledger-muted">
            {card ? `Priced night by night from contracted card ${card.version}, in ${card.currency}${card.currency === "USD" ? "" : ", shown in US dollars first"}.${card.rules.some((x) => isEstimateSeason(x.season)) ? " These rates are estimates while the new rates are finalised: the house confirms the exact price before anything is held or charged." : ""}` : `Priced night by night from ${product.rateSource}, in ${product.currency}${fx[product.currency] || product.currency === "USD" ? ", shown in US dollars first" : `. No ${product.currency} conversion rate is on file, so the figure stays in ${product.currency}`}. The house confirms the rate before anything is charged.`}
          </p>
        </div>
      )}

      {p && (
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5" aria-live="polite">
          <PriceChip price={p} />
          {p.usdMinor != null && <span className="ledger-display text-[1.5rem]">{p.estimate ? "est. " : ""}{fmtMoney(p.usdMinor, "USD")}</span>}
          {p.usdMinor == null && p.sourceMinor != null && p.sourceCurrency && <span className="ledger-display text-[1.5rem]">{fmtMoney(p.sourceMinor, p.sourceCurrency)}</span>}
          {p.usdMinor != null && p.sourceCurrency && p.sourceCurrency !== "USD" && p.sourceMinor != null && <span className="text-[13.5px] ledger-muted">{p.source === "rate_card" ? "contracted" : "published"} at {fmtMoney(p.sourceMinor, p.sourceCurrency)}</span>}
          {p.source === "none" && <span className="text-[14px] ledger-muted">{p.provenance}</span>}
        </p>
      )}

      <Experiences options={product.experiences} supplier={product.supplier} picked={exp} onChange={setExp} />

      <div className="mt-6">
        <button type="button" className="ledger-btn ledger-btn--house" disabled={!canAdd} onClick={() => onSubmit({ experiences: exp, line: { kind: "stay", productKey: product.key, ledgerId: product.ledgerId, name: product.name, supplier: product.supplier, unit: chosen, unitKey: slugify(chosen), voyage: null, start, end, adults, plan: product.pricing === "albie" ? (offers?.find((x) => x.name === chosen)?.options[0].plan ?? null) : null, parentId: null, price: price() } })}>{submitLabel}</button>
        {!datesOk && (start || end) && <p className="mt-2 text-[13.5px] ledger-muted">Choose an arrival from today and a departure after it, up to 30 nights.</p>}
      </div>
    </div>
  );
}

export function VoyageConfigurator({ product, initial, submitLabel, onSubmit }: { product: VoyageProduct; initial?: Draft; submitLabel: string; onSubmit: (d: Draft) => void }) {
  const [slug, setSlug] = useState(initial?.line.voyage?.slug ?? product.voyages[0]?.slug ?? "");
  const voyage = product.voyages.find((v) => v.slug === slug) ?? product.voyages[0];
  const open = voyage?.sailings.filter((s) => !s.status) ?? [];
  const [date, setDate] = useState(initial?.line.start ?? "");
  const [cabin, setCabin] = useState(initial?.line.unit ?? product.cabins[product.cabins.length - 1]?.type ?? "");
  const [guests, setGuests] = useState(initial?.line.adults ?? 2);
  const [exp, setExp] = useState<string[]>(initial?.experiences ?? []);
  if (!voyage) return <p className="text-[15px]">No dated departures are on file for {product.name}.</p>;
  const sailing = voyage.sailings.find((s) => s.date === date && !s.status) ?? open[0];

  function price(): Price {
    const basis = `${guests} ${guests === 1 ? "guest" : "guests"}, ${cabin}, ${voyage.name}`;
    if (!sailing?.fromUsd) return NO_PRICE(basis, "No fare is on file for this departure.");
    const minor = sailing.fromUsd * guests * 100;
    return { source: "published_from", usdMinor: minor, sourceMinor: minor, sourceCurrency: "USD", fx: null, basis: `From ${fmtMoney(sailing.fromUsd * 100, "USD")} per person in a double cabin × ${guests}. The ship's lowest published fare, not the ${cabin} fare`, provenance: `Antarctica21 published from fare, filed in the house voyage record, checked ${niceDate(voyage.checked)}`, fetchedAt: null };
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-4">
        <Label text="Voyage"><select className={field} value={voyage.slug} onChange={(e) => { setSlug(e.target.value); setDate(""); }}>{product.voyages.map((v) => <option key={v.slug} value={v.slug}>{v.name} · {v.nights} nights</option>)}</select></Label>
        <Label text="Departure"><select className={field} value={sailing?.date ?? ""} onChange={(e) => setDate(e.target.value)}>
          {voyage.sailings.map((s) => <option key={s.date} value={s.date} disabled={Boolean(s.status)}>{niceDate(s.date)}{s.status ? ` · ${s.status}` : s.fromUsd ? ` · from ${fmtMoney(s.fromUsd * 100, "USD").replace(".00", "")} pp` : ""}</option>)}
        </select></Label>
        <Label text="Cabin category"><select className={field} value={cabin} onChange={(e) => setCabin(e.target.value)}>{product.cabins.map((c) => <option key={c.type} value={c.type}>{c.type}{c.size ? ` · ${c.size}` : ""}</option>)}</select></Label>
        <Label text="Guests"><select className={field} value={guests} onChange={(e) => setGuests(Number(e.target.value))}>{[1, 2, 3].map((n) => <option key={n}>{n}</option>)}</select></Label>
      </div>
      <p className="mt-3 text-[14.5px] ledger-muted">{voyage.route}{sailing?.dateTo ? ` · ${niceDate(sailing.date)} to ${niceDate(sailing.dateTo)}` : ""}. Fares by cabin are not on file: Antarctica21 confirms the {cabin} fare and whether a cabin is open.{sailing?.code ? ` Departure ${sailing.code}.` : ""}</p>
      {sailing && (
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5" aria-live="polite">
          <PriceChip price={price()} />
          {sailing.fromUsd && <span className="ledger-display text-[1.5rem]">from {fmtMoney(sailing.fromUsd * guests * 100, "USD")}</span>}
        </p>
      )}
      <Experiences options={voyage.optional} supplier={product.supplier} picked={exp.filter((e) => voyage.optional.includes(e))} onChange={setExp} />
      <div className="mt-6">
        <button type="button" className="ledger-btn ledger-btn--house" disabled={!sailing} onClick={() => sailing && onSubmit({ experiences: exp.filter((e) => voyage.optional.includes(e)), line: { kind: "voyage", productKey: `${product.key}:${voyage.slug}:${sailing.date}`, ledgerId: product.ledgerId, name: product.name, supplier: product.supplier, unit: cabin, unitKey: slugify(cabin), voyage: { slug: voyage.slug, name: voyage.name, code: sailing.code }, start: sailing.date, end: sailing.dateTo ?? addDays(sailing.date, voyage.nights), adults: guests, plan: null, parentId: null, price: price() } })}>{submitLabel}</button>
      </div>
    </div>
  );
}

export function JourneyConfigurator({ product, today, initial, submitLabel, onSubmit }: { product: JourneyProduct; today: string; initial?: Draft; submitLabel: string; onSubmit: (d: Draft) => void }) {
  const [start, setStart] = useState(initial?.line.start ?? "");
  const [travelers, setTravelers] = useState(initial?.line.adults ?? 2);
  const ok = isDate(start) && start >= today;
  const end = ok ? addDays(start, product.nights) : "";
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <Label text="Start date"><input type="date" className={field} value={start} min={today} onChange={(e) => setStart(e.target.value)} /></Label>
        <Label text="Travelers"><select className={field} value={travelers} onChange={(e) => setTravelers(Number(e.target.value))}>{Array.from({ length: product.maxTravelers }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}</select></Label>
      </div>
      <ol className="mt-4 border ledger-border divide-y divide-[#DCD7D0] bg-paper">
        {product.stops.map((s) => <li key={s.name} className="px-3.5 py-2.5"><span className="block ledger-display text-[1.15rem] leading-tight">{s.name}</span><span className="block text-[13px] ledger-muted">{s.line}</span></li>)}
      </ol>
      <p className="mt-3 text-[14.5px] ledger-muted">{product.nights} nights{ok ? ` · ${niceDate(start)} to ${niceDate(end)}` : ""}. Prices for this route are not final, so no figure is shown. The house quotes it against your dates and the terms of each lodge.</p>
      <div className="mt-6">
        <button type="button" className="ledger-btn ledger-btn--house" disabled={!ok} onClick={() => onSubmit({ experiences: [], line: { kind: "journey", productKey: product.key, ledgerId: product.ledgerId, name: product.name, supplier: product.supplier, unit: `${product.nights} nights, ${product.stops.length} stops`, unitKey: "", voyage: null, start, end, adults: travelers, plan: null, parentId: null, price: NO_PRICE(`${travelers} ${travelers === 1 ? "traveler" : "travelers"}, ${product.nights} nights`, "Route prices are not final. The house quotes the journey against your dates.") } })}>{submitLabel}</button>
      </div>
    </div>
  );
}
