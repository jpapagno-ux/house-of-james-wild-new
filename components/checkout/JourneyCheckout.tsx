"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { niceDate, niceWhen } from "@/lib/booking-live/money";
import { METHOD_NAMES, NO_PRICE, cartTotals, fmtMoney, idempotencyKey, ledgerHandoff, lineStatuses, nightsBetween, paymentOptions, pricedAbroad, validLead, verified, type Lead, type Line, type Method, type SimResponse, type Traveler } from "@/lib/checkout/journey";
import type { Catalogue, Product } from "@/lib/checkout/pilot";
import { JourneyConfigurator, Label, PriceChip, StayConfigurator, VoyageConfigurator, field, slugify, type CardState, type Draft } from "./Configurators";

// The Journey Cart (Booking & Checkout Studio, Session 03): seven screens from choosing stays and a
// voyage to a confirmation that keeps payment, booking request and supplier confirmation apart.
// Everything here is a preview: prices come only from sources on file, payment is simulated by
// /api/preview/checkout/simulate, and nothing is written to the Travel Ledger.

type AdvisorLite = { slug: string; name: string; role: string; ledgerId: string };
type PayResult = SimResponse | { error: string };
const STEPS = ["Build Your Journey", "Journey Cart", "Pricing Review", "Fees & Inclusions", "Traveler Registration", "Payment Selection", "Journey Confirmation"];
const STORE = "jwc-journey-cart-v1";
const uid = () => Math.random().toString(36).slice(2, 10);
const isPay = (r: PayResult | null | undefined): r is SimResponse => Boolean(r && !("error" in r));

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`border ledger-border bg-paper ${className}`}>{children}</section>;
}
function Head({ n, title, children }: { n: number; title: string; children?: ReactNode }) {
  return (
    <header className="mb-7 md:mb-9">
      <p className="ledger-eyebrow"><span className="ledger-id">{String(n).padStart(2, "0")}</span> · of 07</p>
      <h1 className="ledger-display text-[2.1rem] md:text-[3rem] leading-[1.05] mt-2 outline-none" tabIndex={-1} data-step-title>{title}</h1>
      {children && <div className="mt-3 text-[16px] ledger-muted max-w-2xl">{children}</div>}
    </header>
  );
}
const dates = (l: Line) => (l.start ? `${niceDate(l.start)} to ${niceDate(l.end)}` : "");
const party = (l: Line) => `${l.adults} ${l.kind === "voyage" ? (l.adults === 1 ? "guest" : "guests") : l.kind === "journey" ? (l.adults === 1 ? "traveler" : "travelers") : l.adults === 1 ? "adult" : "adults"}`;
const NO_CARD: CardState = { state: "none", reason: "not_applicable" };

export default function JourneyCheckout({ catalogue, advisors, assignedAdvisor, advisorFromLink }: { catalogue: Catalogue; advisors: AdvisorLite[]; assignedAdvisor: string; advisorFromLink: boolean }) {
  const [step, setStep] = useState(0);
  const [cartId, setCartId] = useState("pending");
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState<string | null>(catalogue.products[0]?.key ?? null);
  const [editing, setEditing] = useState<string | null>(null);
  const [card, setCard] = useState<CardState>({ state: "loading" });
  const [lead, setLead] = useState<Lead>({ first: "", last: "", email: "", phone: "", country: "" });
  const [companions, setCompanions] = useState<Traveler[]>([]);
  const [advisor, setAdvisor] = useState(assignedAdvisor);
  const [external, setExternal] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [methods, setMethods] = useState<Record<string, Method>>({});
  const [results, setResults] = useState<Record<string, PayResult | null>>({});
  const [tester, setTester] = useState({ locked: false, decline: false });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const top = useRef<HTMLDivElement>(null);

  const product = (l: Line): Product => catalogue.products.find((p) => l.productKey === p.key || l.productKey.startsWith(`${p.key}:`)) as Product;
  const bookable = lines.filter((l) => l.kind !== "experience");
  const totals = useMemo(() => cartTotals(lines), [lines]);
  const adv = advisors.find((a) => a.slug === advisor) ?? advisors[0];
  const partySize = Math.max(1, ...bookable.map((l) => l.adults));

  // The cart (no traveler details) survives a refresh within the tab. Names and email are never stored.
  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(STORE) ?? "null") as { cartId: string; lines: Line[] } | null;
      if (s?.cartId && Array.isArray(s.lines)) { setCartId(s.cartId); setLines(s.lines); if (s.lines.length) setOpen(null); return; }
    } catch { /* storage unavailable */ }
    setCartId(uid());
  }, []);
  useEffect(() => { if (cartId !== "pending") { try { sessionStorage.setItem(STORE, JSON.stringify({ cartId, lines })); } catch { /* storage unavailable */ } } }, [cartId, lines]);
  useEffect(() => {
    fetch("/api/preview/checkout/rate-card?slug=ellerman-house").then((r) => r.json()).then((j) => setCard(j.card ? { state: "ok", card: j.card } : { state: "none", reason: j.reason ?? "no_published_card" })).catch(() => setCard({ state: "none", reason: "unreachable" }));
  }, []);
  useEffect(() => { setCompanions((c) => Array.from({ length: partySize - 1 }, (_, i) => c[i] ?? { first: "", last: "" })); }, [partySize]);

  function go(n: number) {
    setNotice("");
    setStep(n);
    requestAnimationFrame(() => { top.current?.scrollIntoView({ block: "start" }); top.current?.querySelector<HTMLElement>("[data-step-title]")?.focus({ preventScroll: true }); });
  }

  function experienceLines(parent: Line, names: string[]): Line[] {
    return names.map((name) => ({ id: uid(), kind: "experience", productKey: parent.productKey, ledgerId: parent.ledgerId, name, supplier: parent.supplier, unit: "", unitKey: slugify(name), voyage: parent.voyage ?? null, start: "", end: "", adults: parent.adults, plan: null, parentId: parent.id, price: NO_PRICE("On request", `No price on file. The house asks ${parent.supplier} and quotes it.`) }));
  }
  function add(d: Draft) {
    const parent: Line = { ...d.line, id: uid() };
    setLines((ls) => [...ls, parent, ...experienceLines(parent, d.experiences)]);
    setResults({}); setOpen(null);
    setNotice(`${parent.name} added to your journey.`);
  }
  function save(id: string, d: Draft) {
    const parent: Line = { ...d.line, id };
    setLines((ls) => { const at = ls.findIndex((l) => l.id === id); const rest = ls.filter((l) => l.id !== id && l.parentId !== id); rest.splice(Math.min(at, rest.length), 0, parent, ...experienceLines(parent, d.experiences)); return rest; });
    setResults({}); setEditing(null);
  }
  const remove = (id: string) => { setLines((ls) => ls.filter((l) => l.id !== id && l.parentId !== id)); setResults({}); };

  const options = (l: Line) => paymentOptions(l, product(l).policy);
  const methodFor = (l: Line): Method => methods[l.id] ?? (options(l).find((o) => o.available && o.method !== "advisor_assisted")?.method ?? "advisor_assisted");

  async function pay() {
    setBusy(true); setNotice("");
    const out: Record<string, PayResult | null> = {};
    for (const l of bookable) {
      const m = methodFor(l);
      const o = options(l).find((x) => x.method === m)!;
      if (!o.available) { out[l.id] = { error: `${METHOD_NAMES[m]} is not open for ${l.name}: ${o.reason} Nothing was simulated.` }; continue; }
      try {
        const r = await fetch("/api/preview/checkout/simulate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idempotencyKey: idempotencyKey(cartId, l.id, m, o.amountMinor), method: m, amountMinor: o.amountMinor, currency: "USD", lineId: l.id, outcome: tester.decline && m === "pay_now" ? "decline" : null }) });
        out[l.id] = (await r.json()) as PayResult;
      } catch { out[l.id] = { error: "The simulator could not be reached. Nothing was charged." }; }
    }
    setResults(out); setBusy(false);
    const blocked = Object.values(out).some((r) => r && ("error" in r || r.status === "declined"));
    if (blocked) setNotice("One or more lines could not be simulated. Review the notes below, or choose another method."); else go(6);
  }

  function next() {
    if (step === 0 || step === 1) { if (!lines.length) { setNotice("Add a stay or a voyage first."); return; } }
    if (step === 4) { const e = validLead(lead); if (e) { setNotice(e); return; } if (!agreed) { setNotice("Please confirm you have read how this preview works."); return; } }
    if (step === 5) { void pay(); return; }
    go(step + 1);
  }
  function restart() { setLines([]); setResults({}); setMethods({}); setCartId(uid()); setLead({ first: "", last: "", email: "", phone: "", country: "" }); setAgreed(false); setOpen(catalogue.products[0]?.key ?? null); go(0); }

  const nextLabel = step === 5 ? (busy ? "Running the simulation" : "Run simulated payments") : step === 0 ? "Review your cart" : `Continue to ${STEPS[step + 1]}`;
  const handoff = step === 6 ? ledgerHandoff({ cartId, lines, lead, party: companions, advisor: adv, externalAdvisor: external, payments: Object.fromEntries(lines.map((l) => [l.id, isPay(results[l.id]) ? (results[l.id] as SimResponse) : null])) }) : null;

  const lineCard = (l: Line, children?: ReactNode) => (
    <div key={l.id} className={l.kind === "experience" ? "pl-4 md:pl-8 border-l-2 border-[#DCD7D0] ml-1" : ""}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          {l.kind !== "experience" && <p className="ledger-eyebrow"><span className="ledger-id">{l.ledgerId}</span> · {product(l).volume} · {l.supplier}</p>}
          <p className={`ledger-display leading-tight ${l.kind === "experience" ? "text-[1.15rem]" : "text-[1.55rem] mt-1"}`}>{l.kind === "experience" ? `Experience · ${l.name}` : l.name}</p>
          {l.kind !== "experience" && <p className="mt-1 text-[15px]">{l.voyage ? `${l.voyage.name} · ` : ""}{l.unit || "Room to be chosen"} · {party(l)}</p>}
          {l.start && <p className="text-[14px] ledger-muted">{dates(l)}{l.kind === "stay" ? ` · ${nightsBetween(l.start, l.end)} nights` : ""}{l.voyage?.code ? ` · ${l.voyage.code}` : ""}</p>}
        </div>
        <div className="text-right">
          {l.price.usdMinor != null ? <p className="ledger-display text-[1.45rem] leading-none">{l.price.source === "published_from" ? "from " : ""}{fmtMoney(l.price.usdMinor, "USD")}</p> : pricedAbroad(l.price) ? <p className="ledger-display text-[1.45rem] leading-none">{fmtMoney(l.price.sourceMinor as number, l.price.sourceCurrency as string)}</p> : <p className="text-[15px]">{l.kind === "experience" ? "On request" : "Priced by the house"}</p>}
          <p className="mt-1.5"><PriceChip price={l.price} /></p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div ref={top} className="max-w-ledger mx-auto px-5 md:px-10 scroll-mt-24">
      <p role="note" className="border border-dashed border-[#8B2525]/60 px-4 py-2.5 text-[13.5px]"><span className="ledger-id">PREVIEW</span> · Simulation only. No card is asked for, no money moves, nothing is sent to a supplier and nothing is written to the Travel Ledger.</p>

      <nav aria-label="Checkout steps" className="mt-5 -mx-5 px-5 md:mx-0 md:px-0 overflow-x-auto">
        <ol className="flex gap-1.5 min-w-max md:min-w-0 md:grid md:grid-cols-7">
          {STEPS.map((s, i) => {
            const reach = i <= step;
            return (
              <li key={s}>
                <button type="button" disabled={!reach || step === 6} aria-current={i === step ? "step" : undefined} onClick={() => go(i)} className={`w-full text-left border px-3 py-2 text-[12px] leading-tight tracking-wide whitespace-nowrap md:whitespace-normal ${i === step ? "border-ink bg-ink text-white" : i < step ? "border-[#CFC8BF] bg-paper-card text-ink" : "border-[#DCD7D0] bg-paper text-[#6B635A]"} ${reach && step !== 6 ? "cursor-pointer" : "cursor-default"}`}>
                  <span className="block font-mono text-[11px] opacity-80">{String(i + 1).padStart(2, "0")}</span>{s}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-8 md:mt-12 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-10 lg:gap-14 items-start">
        <div className="min-w-0">
          {notice && <p role="status" className="mb-5 border-l-2 border-[#8B2525] bg-paper-card px-4 py-3 text-[15px]">{notice}</p>}

          {step === 0 && (
            <>
              <Head n={1} title="Build Your Journey">Choose the chapters of the journey: houses and rooms, whole villas and residences, a voyage south, or a land journey the house has already drawn. Add as many as you like, in any order. A price appears only where its source answers today.</Head>
              <div className="space-y-5">
                {catalogue.products.map((p) => {
                  const inCart = lines.filter((l) => l.kind !== "experience" && product(l).key === p.key).length;
                  return (
                    <Panel key={p.key}>
                      <div className="grid md:grid-cols-[240px_1fr]">
                        {p.hero ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={p.hero} alt={p.alt} loading="lazy" className="w-full h-44 md:h-full object-cover" />
                        ) : (
                          <div className="bg-paper-card h-28 md:h-full flex items-end p-5"><p className="ledger-display text-[1.4rem] leading-tight">{p.type === "journey" ? `${p.nights} nights · ${p.stops.length} stops` : p.name}</p></div>
                        )}
                        <div className="p-5 md:p-6">
                          <p className="ledger-eyebrow"><span className="ledger-id">{p.ledgerId}</span> · {p.volume} · {p.place}</p>
                          <h2 className="ledger-display text-[1.9rem] leading-tight mt-1.5">{p.name}</h2>
                          <p className="mt-1.5 text-[15px] ledger-muted">{p.line}</p>
                          <p className="mt-3 text-[13.5px]">{p.type === "voyage" ? "Fixed departures · published from fares per person" : p.type === "journey" ? "Quoted by the house against your dates" : p.pricing === "albie" ? "Live price from the house booking engine" : `Published seasonal rates in ${p.currency}, per ${p.unitWord.toLowerCase().replace(" category", "")} a night`}{inCart > 0 && <span className="ml-2 ledger-id">· {inCart} in your journey</span>}</p>
                          <button type="button" className="ledger-btn mt-4" aria-expanded={open === p.key} onClick={() => setOpen(open === p.key ? null : p.key)}>{open === p.key ? "Close" : inCart ? "Add another" : p.type === "voyage" ? "Choose a departure" : "Choose dates"}</button>
                        </div>
                      </div>
                      {open === p.key && (
                        <div className="border-t ledger-border bg-paper-card/50 p-5 md:p-6">
                          {p.type === "stay" ? <StayConfigurator product={p} today={catalogue.today} cardState={p.key === "ellerman-house" ? card : NO_CARD} fx={catalogue.fx} submitLabel="Add to journey" onSubmit={add} /> : p.type === "voyage" ? <VoyageConfigurator product={p} submitLabel="Add to journey" onSubmit={add} /> : <JourneyConfigurator product={p} today={catalogue.today} submitLabel="Add to journey" onSubmit={add} />}
                        </div>
                      )}
                    </Panel>
                  );
                })}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Head n={2} title="Journey Cart">Everything in the journey, in the order you added it. Change dates, rooms, cabins or guests, and the price is asked for again from its source.</Head>
              {!lines.length && <Panel className="p-6"><p className="text-[16px]">Your journey is empty.</p><button type="button" className="ledger-btn mt-3" onClick={() => go(0)}>Build your journey</button></Panel>}
              <div className="space-y-5">
                {bookable.map((l) => {
                  const p = product(l), kids = lines.filter((x) => x.parentId === l.id);
                  return (
                    <Panel key={l.id} className="p-5 md:p-6">
                      {lineCard(l)}
                      {kids.length > 0 && <div className="mt-4 space-y-3">{kids.map((k) => lineCard(k))}</div>}
                      <div className="mt-4 flex gap-6">
                        <button type="button" className="ledger-btn" aria-expanded={editing === l.id} onClick={() => setEditing(editing === l.id ? null : l.id)}>{editing === l.id ? "Close" : "Edit"}</button>
                        <button type="button" className="ledger-btn" onClick={() => remove(l.id)}>Remove</button>
                      </div>
                      {editing === l.id && (
                        <div className="mt-5 border-t ledger-border pt-5">
                          {p.type === "stay" ? <StayConfigurator product={p} today={catalogue.today} cardState={p.key === "ellerman-house" ? card : NO_CARD} fx={catalogue.fx} initial={{ line: l, experiences: kids.map((k) => k.name) }} submitLabel="Save changes" onSubmit={(d) => save(l.id, d)} /> : p.type === "voyage" ? <VoyageConfigurator product={p} initial={{ line: l, experiences: kids.map((k) => k.name) }} submitLabel="Save changes" onSubmit={(d) => save(l.id, d)} /> : <JourneyConfigurator product={p} today={catalogue.today} initial={{ line: l, experiences: [] }} submitLabel="Save changes" onSubmit={(d) => save(l.id, d)} />}
                        </div>
                      )}
                    </Panel>
                  );
                })}
              </div>
              {lines.length > 0 && <button type="button" className="ledger-btn mt-6" onClick={() => go(0)}>Add another stay or voyage</button>}
            </>
          )}

          {step === 2 && (
            <>
              <Head n={3} title="Pricing Review">Each figure with its source. US dollars first, with the supplier&rsquo;s own currency kept beside it. A live price, a contracted rate or a supplier&rsquo;s own published rate counts toward the total; a from fare never does.</Head>
              <div className="space-y-5">
                {lines.map((l) => (
                  <Panel key={l.id} className="p-5 md:p-6">
                    {lineCard(l)}
                    <dl className="mt-4 grid sm:grid-cols-[150px_1fr] gap-x-5 gap-y-2 text-[14.5px] border-t ledger-border pt-4">
                      <dt className="ledger-muted">Basis</dt><dd>{l.price.basis}</dd>
                      <dt className="ledger-muted">Source</dt><dd>{l.price.provenance}{l.price.fetchedAt ? ` · asked ${niceWhen(l.price.fetchedAt)}` : ""}</dd>
                      <dt className="ledger-muted">Supplier currency</dt><dd>{l.price.sourceMinor != null && l.price.sourceCurrency ? fmtMoney(l.price.sourceMinor, l.price.sourceCurrency) : "No figure on file"}</dd>
                      <dt className="ledger-muted">Conversion</dt><dd>{l.price.fx ? `${l.price.fx.rate} ${l.price.sourceCurrency} to US$1 · ${l.price.fx.source} · display only, the ${l.price.sourceCurrency} figure governs` : l.price.sourceCurrency === "USD" ? "None. Quoted in US dollars by the source." : pricedAbroad(l.price) ? `No ${l.price.sourceCurrency} rate is on file, so no US dollar figure is shown.` : "Not applicable"}</dd>
                      <dt className="ledger-muted">Settlement currency</dt><dd>{l.kind === "experience" ? "Set when quoted" : "Not stated by the source. Confirmed before any charge."}</dd>
                      <dt className="ledger-muted">Standing</dt><dd>{l.price.source === "published_rate" ? "The supplier's own published rate. The house confirms it, and its tax treatment, before a request goes out. Not proof of availability." : verified(l.price) ? "Verified at the time shown. The house re-checks it before a request goes to the supplier. Not proof of availability." : l.price.source === "published_from" ? "Indicative. A published from fare is not a quote and is left out of the total." : "No figure. Nothing is estimated."}</dd>
                    </dl>
                  </Panel>
                ))}
              </div>
              <Totals totals={totals} className="mt-6" />
            </>
          )}

          {step === 3 && (
            <>
              <Head n={4} title="Fees & Inclusions">Taxes, levies and mandatory charges for each chapter, and what the rate does and does not include. Where the supplier&rsquo;s breakdown is not on file, this page says so.</Head>
              <div className="space-y-5">
                {bookable.map((l) => {
                  const p = product(l), v = p.type === "voyage" ? p.voyages.find((x) => x.slug === l.voyage?.slug) : null;
                  const inc = p.type === "voyage" ? (v?.inclusions ?? []) : p.inclusions, exc = p.type === "voyage" ? (v?.exclusions ?? []) : p.exclusions;
                  const incNote = p.type === "stay" ? p.inclusionsNote : p.type === "journey" ? "As drafted for this route; the house confirms each item with the quote." : "";
                  return (
                    <Panel key={l.id} className="p-5 md:p-6">
                      <p className="ledger-eyebrow"><span className="ledger-id">{l.ledgerId}</span> · {l.supplier}</p>
                      <h2 className="ledger-display text-[1.6rem] mt-1">{l.name}{l.voyage ? ` · ${l.voyage.name}` : ""}</h2>
                      <h3 className="ledger-eyebrow mt-5">Taxes, levies and mandatory charges</h3>
                      <ul className="mt-2 divide-y divide-[#DCD7D0] border-y ledger-border">
                        {p.fees.map((f) => (
                          <li key={f.name} className="py-2.5 grid sm:grid-cols-[200px_130px_1fr] gap-x-4 gap-y-0.5 text-[14.5px]">
                            <span>{f.name}</span>
                            <span className={f.state === "included" ? "" : "ledger-muted"}>{f.state === "included" ? "Included" : f.state === "added" ? "Added" : f.state === "not_applied" ? "Not applied" : "Not on file"}</span>
                            <span className="ledger-muted">{f.note}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 grid md:grid-cols-2 gap-6">
                        <div><h3 className="ledger-eyebrow">Included</h3>{inc.length ? <ul className="mt-2 space-y-1.5 text-[14.5px] list-disc pl-5">{inc.map((x) => <li key={x}>{x}</li>)}</ul> : <p className="mt-2 text-[14.5px] ledger-muted">{incNote || "Not on file."}</p>}{inc.length > 0 && p.type === "journey" && <p className="mt-2 text-[13.5px] ledger-muted">{incNote}</p>}{l.plan && <p className="mt-2 text-[14.5px]">Rate plan priced: {l.plan}.</p>}</div>
                        <div><h3 className="ledger-eyebrow">Not included</h3>{exc.length ? <ul className="mt-2 space-y-1.5 text-[14.5px] list-disc pl-5">{exc.map((x) => <li key={x}>{x}</li>)}</ul> : <p className="mt-2 text-[14.5px] ledger-muted">Not on file. Flights, transfers and anything not named as included should be assumed extra until the house confirms.</p>}</div>
                      </div>
                      <h3 className="ledger-eyebrow mt-5">Deposit, balance and cancellation</h3>
                      <dl className="mt-2 grid sm:grid-cols-[150px_1fr] gap-x-5 gap-y-1.5 text-[14.5px]">
                        <dt className="ledger-muted">Deposit</dt><dd>{p.policy.deposit ? p.policy.deposit.basis : p.policy.depositNote}</dd>
                        <dt className="ledger-muted">Balance</dt><dd>{p.policy.balance}</dd>
                        <dt className="ledger-muted">Cancellation</dt><dd>{p.policy.cancellation}</dd>
                      </dl>
                    </Panel>
                  );
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <Head n={5} title="Traveler Registration">Only what the house needs to open the journey: who is traveling and how to reach you. Passports, dates of birth and payment details are never asked for here.</Head>
              <Panel className="p-5 md:p-6">
                <h2 className="ledger-display text-[1.5rem]">Lead traveler</h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <Label text="First name"><input className={field} autoComplete="given-name" value={lead.first} onChange={(e) => setLead({ ...lead, first: e.target.value })} /></Label>
                  <Label text="Last name"><input className={field} autoComplete="family-name" value={lead.last} onChange={(e) => setLead({ ...lead, last: e.target.value })} /></Label>
                  <Label text="Email"><input type="email" className={field} autoComplete="email" inputMode="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} /></Label>
                  <Label text="Phone (optional)"><input type="tel" className={field} autoComplete="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} /></Label>
                  <Label text="Country of residence (optional)"><input className={field} autoComplete="country-name" value={lead.country} onChange={(e) => setLead({ ...lead, country: e.target.value })} /></Label>
                </div>
                {companions.length > 0 && (
                  <>
                    <h2 className="ledger-display text-[1.5rem] mt-8">Traveling with you</h2>
                    <p className="text-[14px] ledger-muted mt-1">Names as they will appear on the booking. You can add them later.</p>
                    {companions.map((c, i) => (
                      <div key={i} className="mt-3 grid sm:grid-cols-2 gap-4">
                        <Label text={`Traveler ${i + 2} · first name`}><input className={field} value={c.first} onChange={(e) => setCompanions(companions.map((x, j) => (j === i ? { ...x, first: e.target.value } : x)))} /></Label>
                        <Label text={`Traveler ${i + 2} · last name`}><input className={field} value={c.last} onChange={(e) => setCompanions(companions.map((x, j) => (j === i ? { ...x, last: e.target.value } : x)))} /></Label>
                      </div>
                    ))}
                  </>
                )}
              </Panel>
              <Panel className="p-5 md:p-6 mt-5">
                <h2 className="ledger-display text-[1.5rem]">Your advisor</h2>
                <p className="text-[14px] ledger-muted mt-1">{advisorFromLink ? "You arrived through this advisor's link, so the journey stays with them." : "The advisor who holds this journey. It stays attached to every booking in it."}</p>
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <Label text="House advisor"><select className={field} value={advisor} disabled={advisorFromLink} onChange={(e) => setAdvisor(e.target.value)}>{advisors.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}</select></Label>
                  <Label text="Your own travel advisor or agency (optional)"><input className={field} placeholder="Name, agency, IATA or CLIA if known" value={external} onChange={(e) => setExternal(e.target.value)} /></Label>
                </div>
                <p className="mt-3 text-[14px]"><span className="ledger-id">{adv.ledgerId}</span> · {adv.name}{adv.role ? ` · ${adv.role}` : ""}</p>
              </Panel>
              <label className="mt-5 flex items-start gap-3 text-[15px] cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 accent-[#2E2B28]" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>I understand this is a preview: a price shown is re-checked by the house, a payment is not a confirmed booking, and a booking is confirmed only when the supplier confirms it.</span>
              </label>
            </>
          )}

          {step === 5 && (
            <>
              <Head n={6} title="Payment Selection">Each chapter is its own transaction, on its own supplier&rsquo;s terms. A method is open only where that supplier&rsquo;s policy and a verified price are both on file.</Head>
              <div className="space-y-5">
                {bookable.map((l) => {
                  const chosen = methodFor(l), res = results[l.id];
                  return (
                    <Panel key={l.id} className="p-5 md:p-6">
                      {lineCard(l)}
                      <fieldset className="mt-4 border-t ledger-border pt-4">
                        <legend className="sr-only">Payment method for {l.name}</legend>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {options(l).map((o) => {
                            const can = o.available || tester.locked;
                            return (
                              <label key={o.method} className={`block border p-3.5 ${chosen === o.method ? "border-ink bg-paper-card" : "border-[#DCD7D0] bg-paper"} ${can ? "cursor-pointer" : "opacity-70 cursor-not-allowed"}`}>
                                <span className="flex items-center gap-2.5">
                                  <input type="radio" name={`pay-${l.id}`} className="w-4 h-4 accent-[#2E2B28]" disabled={!can} checked={chosen === o.method} onChange={() => setMethods({ ...methods, [l.id]: o.method })} />
                                  <span className="ledger-display text-[1.2rem]">{METHOD_NAMES[o.method]}</span>
                                  <span className="ml-auto text-[12px] tracking-wide whitespace-nowrap">{o.available ? (o.amountMinor ? fmtMoney(o.amountMinor, "USD") : "Open") : "Not open"}</span>
                                </span>
                                <span className="block mt-1.5 text-[13.5px] ledger-muted">{o.reason}</span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                      {res && "error" in res && <p role="alert" className="mt-3 border-l-2 border-[#8B2525] pl-3 text-[14.5px]">{res.error}</p>}
                      {isPay(res) && res.status === "declined" && <p role="alert" className="mt-3 border-l-2 border-[#8B2525] pl-3 text-[14.5px]">{res.message}</p>}
                    </Panel>
                  );
                })}
              </div>
              <Panel className="mt-5 p-5 border-dashed">
                <p className="ledger-eyebrow">Tester controls · preview only</p>
                <label className="mt-2 flex items-start gap-2.5 text-[14.5px] cursor-pointer"><input type="checkbox" className="mt-1 w-4 h-4 accent-[#2E2B28]" checked={tester.decline} onChange={(e) => setTester({ ...tester, decline: e.target.checked })} /><span>Make Pay Now come back declined, to see the failure path.</span></label>
                <label className="mt-1.5 flex items-start gap-2.5 text-[14.5px] cursor-pointer"><input type="checkbox" className="mt-1 w-4 h-4 accent-[#2E2B28]" checked={tester.locked} onChange={(e) => setTester({ ...tester, locked: e.target.checked })} /><span>Let me pick a method that is not open, to see it refused.</span></label>
              </Panel>
              <p className="mt-5 text-[14px] ledger-muted">No card form appears in this preview. In a live build the card is typed on the payment provider&rsquo;s own page and never touches this site.</p>
            </>
          )}

          {step === 6 && handoff && (
            <>
              <Head n={7} title="Journey Confirmation">Thank you, {lead.first.trim() || "traveler"}. Your journey request is recorded in this preview. Three things are tracked for each chapter, and they are never the same thing.</Head>
              <Panel className="p-5 md:p-6 bg-paper-card">
                <p className="ledger-eyebrow">Reference</p>
                <p className="ledger-id text-[1.05rem] mt-1">{handoff.journey.reference}</p>
                <p className="mt-2 text-[14.5px]">{adv.name} holds this journey{external.trim() ? `, with ${external.trim()} noted as your own advisor` : ""}. A simulated reference, not a Ledger ID.</p>
              </Panel>
              <div className="mt-5 space-y-5">
                {bookable.map((l) => {
                  const s = lineStatuses(l, isPay(results[l.id]) ? (results[l.id] as SimResponse) : null);
                  const kids = lines.filter((x) => x.parentId === l.id);
                  return (
                    <Panel key={l.id} className="p-5 md:p-6">
                      {lineCard(l)}
                      <ol className="mt-4 grid md:grid-cols-3 gap-px bg-[#DCD7D0] border ledger-border">
                        {([["Booking request", s.request], ["Payment", s.payment], ["Supplier confirmation", s.supplier]] as const).map(([k, v]) => (
                          <li key={k} className="bg-paper p-4"><p className="ledger-eyebrow">{k}</p><p className="mt-1.5 text-[15.5px] font-medium">{v.label}</p><p className="mt-1 text-[13.5px] ledger-muted">{v.note}</p></li>
                        ))}
                      </ol>
                      {kids.length > 0 && <p className="mt-3 text-[14.5px]">Experiences requested with this chapter: {kids.map((k) => k.name).join(", ")}. Each is quoted by the house; none is booked.</p>}
                    </Panel>
                  );
                })}
              </div>
              <Panel className="mt-5 p-5 md:p-6">
                <h2 className="ledger-display text-[1.5rem]">What happens next</h2>
                <ol className="mt-3 space-y-2 text-[15px] list-decimal pl-5">
                  <li>The house re-checks every price against its source and prices anything shown as priced by the house.</li>
                  <li>Each supplier is asked to confirm space. Until it does, nothing is held.</li>
                  <li>Your advisor writes with each confirmation, the supplier&rsquo;s terms and anything still to pay.</li>
                  <li>Confirmed chapters are filed in your Folio.</li>
                </ol>
              </Panel>
              <details className="mt-5 border ledger-border">
                <summary className="px-5 py-3.5 cursor-pointer text-[15px]">Ledger and commission hand-off record (for the house · not written in simulation)</summary>
                <pre className="px-5 pb-5 text-[12px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(handoff, null, 2)}</pre>
              </details>
              <button type="button" className="ledger-btn mt-6" onClick={restart}>Start a new journey</button>
            </>
          )}

          {step < 6 && (
            <div className="hidden md:flex mt-10 items-center gap-8">
              <button type="button" className="ledger-btn ledger-btn--house" disabled={busy} onClick={next}>{nextLabel}</button>
              {step > 0 && <button type="button" className="ledger-btn" onClick={() => go(step - 1)}>Back</button>}
            </div>
          )}
        </div>

        <aside className="hidden lg:block sticky top-28" aria-label="Journey summary">
          <Panel className="p-5">
            <p className="ledger-eyebrow">Your journey</p>
            {!bookable.length && <p className="mt-2 text-[15px] ledger-muted">Nothing added yet.</p>}
            <ul className="mt-2 divide-y divide-[#DCD7D0]">
              {bookable.map((l) => (
                <li key={l.id} className="py-2.5 text-[14.5px] flex justify-between gap-3"><span className="min-w-0"><span className="block truncate">{l.name}</span><span className="block text-[12.5px] ledger-muted truncate">{l.unit}{l.start ? ` · ${niceDate(l.start).replace(/^\w+, /, "")}` : ""}</span></span><span className="whitespace-nowrap">{l.price.usdMinor != null ? `${l.price.source === "published_from" ? "from " : ""}${fmtMoney(l.price.usdMinor, "USD").replace(/\.00$/, "")}` : pricedAbroad(l.price) ? fmtMoney(l.price.sourceMinor as number, l.price.sourceCurrency as string).replace(/\.00$/, "") : "House"}</span></li>
              ))}
            </ul>
            <Totals totals={totals} compact className="mt-3" />
            <p className="mt-4 text-[13px] ledger-muted"><span className="ledger-id">{adv.ledgerId}</span><br />Held by {adv.name}</p>
          </Panel>
        </aside>
      </div>

      {step < 6 && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#CFC8BF] bg-paper px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-3">
          <div className="min-w-0 flex-1"><p className="text-[11px] tracking-wide uppercase ledger-muted">Priced today</p><p className="ledger-display text-[1.35rem] leading-none mt-0.5">{fmtMoney(totals.verifiedMinor, "USD")}</p></div>
          {step > 0 && <button type="button" className="border border-[#CFC8BF] px-3.5 py-3 text-[14px]" onClick={() => go(step - 1)}>Back</button>}
          <button type="button" className="bg-ink text-white px-4 py-3 text-[14px] disabled:opacity-50" disabled={busy} onClick={next}>{step === 5 ? (busy ? "Running" : "Run simulation") : "Continue"}</button>
        </div>
      )}
    </div>
  );
}

function Totals({ totals: t, compact, className = "" }: { totals: ReturnType<typeof cartTotals>; compact?: boolean; className?: string }) {
  return (
    <dl className={`${compact ? "text-[14px]" : "border ledger-border bg-paper-card p-5 md:p-6 text-[15.5px]"} ${className}`}>
      <div className="flex justify-between gap-4 border-t border-ink pt-2.5"><dt>Priced today{t.verifiedCount ? ` · ${t.verifiedCount} ${t.verifiedCount === 1 ? "line" : "lines"}` : ""}</dt><dd className={compact ? "font-medium" : "ledger-display text-[1.7rem] leading-none"}>{fmtMoney(t.verifiedMinor, "USD")}</dd></div>
      {t.abroad.map((a) => <div key={a.currency} className="flex justify-between gap-4 mt-2"><dt>Priced in {a.currency} · no US dollar rate on file</dt><dd className="whitespace-nowrap">{fmtMoney(a.minor, a.currency)}</dd></div>)}
      {t.fromCount > 0 && <div className="flex justify-between gap-4 mt-2 ledger-muted"><dt>Published from fares · not in the total</dt><dd className="whitespace-nowrap">from {fmtMoney(t.fromMinor, "USD")}</dd></div>}
      {t.awaitingCount > 0 && <div className="flex justify-between gap-4 mt-2 ledger-muted"><dt>Awaiting a price from the house</dt><dd>{t.awaitingCount} {t.awaitingCount === 1 ? "line" : "lines"}</dd></div>}
      {!compact && <p className="mt-4 text-[13.5px] ledger-muted">No tax has been added by the house, and no Florida sales tax applies. Supplier taxes and levies are on the next screen. A price shown is not proof of availability.</p>}
    </dl>
  );
}
