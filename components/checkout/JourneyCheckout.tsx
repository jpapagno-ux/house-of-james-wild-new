"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { niceDate, niceWhen } from "@/lib/booking-live/money";
import { METHOD_NAMES, NO_PRICE, READINESS, READINESS_ORDER, readiness, type Readiness, cartTotals, fmtMoney, idempotencyKey, ledgerHandoff, lineStatuses, nightsBetween, paymentOptions, pricedAbroad, validLead, type Lead, type Line, type Method, type Option, type SimResponse, type Traveler } from "@/lib/checkout/journey";
import type { Catalogue, Product } from "@/lib/checkout/pilot";
import { JourneyConfigurator, Label, PriceChip, StayConfigurator, VoyageConfigurator, field, ratedStayPrice, slugify, type CardState, type Draft } from "./Configurators";
import { addDays } from "@/lib/checkout/journey";

// The Journey Cart (Booking & Checkout Studio, Session 03): five steps and a confirmation, from choosing stays and a
// voyage to a confirmation that keeps payment, booking request and supplier confirmation apart.
// Everything here is a preview: prices come only from sources on file, payment is simulated by
// /api/preview/checkout/simulate, and nothing is written to the Travel Ledger.

type AdvisorLite = { slug: string; name: string; role: string; ledgerId: string };
type PayResult = SimResponse | { error: string };
const STEPS = ["Build Your Journey", "Journey Cart", "Review", "Your Details", "Payment", "Confirmation"];
const STORE = "jwc-journey-cart-v1";
const SHORT_NEXT = ["Review cart", "Review prices", "Your details", "Payment", "Run simulation"];
const FILTERS = [["all", "All"], ["stay", "Stays"], ["residence", "Villas & residences"], ["voyage", "Voyages"], ["journey", "Land journeys"]] as const;
const DOT: Record<Readiness, string> = { ready: "bg-emerald-700", priced: "bg-ink", from: "bg-stone", quote: "bg-transparent border border-stone" };
const family = (p: Product) => (p.type === "stay" ? (p.volume.startsWith("Residence") ? "residence" : "stay") : p.type);
const uid = () => Math.random().toString(36).slice(2, 10);
const isPay = (r: PayResult | null | undefined): r is SimResponse => Boolean(r && !("error" in r));

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`border ledger-border bg-paper ${className}`}>{children}</section>;
}
function Head({ n, title, children }: { n: number; title: string; children?: ReactNode }) {
  return (
    <header className="mb-7 md:mb-9">
      <p className="ledger-eyebrow">{n <= 5 ? <><span className="ledger-id">{String(n).padStart(2, "0")}</span> · of 05</> : <span className="ledger-id">Complete</span>}</p>
      <h1 className="ledger-display text-[2.1rem] md:text-[3rem] leading-[1.05] mt-2 outline-none" tabIndex={-1} data-step-title>{title}</h1>
      {children && <div className="mt-3 text-[16px] ledger-muted max-w-2xl">{children}</div>}
    </header>
  );
}
const dates = (l: Line) => (l.start ? `${niceDate(l.start)} to ${niceDate(l.end)}` : "");
const party = (l: Line) => `${l.adults} ${l.kind === "voyage" ? (l.adults === 1 ? "guest" : "guests") : l.kind === "journey" ? (l.adults === 1 ? "traveler" : "travelers") : l.adults === 1 ? "adult" : "adults"}`;
const NO_CARD: CardState = { state: "none", reason: "not_applicable" };

export default function JourneyCheckout({ catalogue, advisors, assignedAdvisor, advisorFromLink, detailDefault, exampleDefault }: { catalogue: Catalogue; advisors: AdvisorLite[]; assignedAdvisor: string; advisorFromLink: boolean; detailDefault: boolean; exampleDefault: boolean }) {
  const [help, setHelp] = useState(false);
  const [detail, setDetail] = useState(detailDefault);
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
  const [offer, setOffer] = useState<"cart" | "undo" | null>(null);
  const [removed, setRemoved] = useState<{ at: number; lines: Line[] } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const top = useRef<HTMLDivElement>(null);

  const product = (l: Line): Product => catalogue.products.find((p) => l.productKey === p.key || l.productKey.startsWith(`${p.key}:`)) as Product;
  const bookable = lines.filter((l) => l.kind !== "experience");
  const totals = useMemo(() => cartTotals(lines), [lines]);
  const adv = advisors.find((a) => a.slug === advisor) ?? advisors[0];
  const partySize = Math.max(1, ...bookable.map((l) => l.adults));

  // The cart (no traveler details) survives a refresh within the tab. Names and email are never stored.
  useEffect(() => {
    if (exampleDefault) { setCartId(uid()); loadExample(); return; }
    try {
      const s = JSON.parse(sessionStorage.getItem(STORE) ?? "null") as { cartId: string; lines: Line[] } | null;
      if (s?.cartId && Array.isArray(s.lines)) { setCartId(s.cartId); setLines(s.lines); if (s.lines.length) setOpen(null); return; }
    } catch { /* storage unavailable */ }
    setCartId(uid());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (cartId !== "pending") { try { sessionStorage.setItem(STORE, JSON.stringify({ cartId, lines })); } catch { /* storage unavailable */ } } }, [cartId, lines]);
  useEffect(() => {
    fetch("/api/preview/checkout/rate-card?slug=ellerman-house").then((r) => r.json()).then((j) => setCard(j.card ? { state: "ok", card: j.card } : { state: "none", reason: j.reason ?? "no_published_card" })).catch(() => setCard({ state: "none", reason: "unreachable" }));
  }, []);
  useEffect(() => { setCompanions((c) => Array.from({ length: partySize - 1 }, (_, i) => c[i] ?? { first: "", last: "" })); }, [partySize]);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCartOpen(false); };
    document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [cartOpen]);

  // A ready-made journey for showing the flow: one of each kind, priced by the same rules as anything picked by hand.
  function exampleLines(): Line[] {
    const out: Line[] = [];
    const stayLine = (key: string, unit: string, start: string, end: string, adults: number) => {
      const p = catalogue.products.find((x) => x.key === key);
      if (!p || p.type !== "stay" || start < catalogue.today) return;
      out.push({ id: uid(), kind: "stay", productKey: p.key, ledgerId: p.ledgerId, name: p.name, supplier: p.supplier, unit, unitKey: slugify(unit), voyage: null, start, end, adults, plan: null, parentId: null, price: ratedStayPrice(p, null, catalogue.fx, unit, start, end, adults) });
    };
    stayLine("ellerman-house", "Deluxe House Room", "2027-02-26", "2027-03-02", 2);
    stayLine("casali-di-casole", "Santa Lucia", "2027-06-12", "2027-06-18", 8);
    const ship = catalogue.products.find((x) => x.type === "voyage");
    if (ship && ship.type === "voyage") {
      const v = ship.voyages[0], sailing = v?.sailings.find((x) => !x.status && x.fromUsd && x.date >= "2027-01-01") ?? v?.sailings.find((x) => !x.status && x.fromUsd);
      const cabin = ship.cabins[ship.cabins.length - 1]?.type ?? "";
      if (v && sailing?.fromUsd) out.push({ id: uid(), kind: "voyage", productKey: `${ship.key}:${v.slug}:${sailing.date}`, ledgerId: ship.ledgerId, name: ship.name, supplier: ship.supplier, unit: cabin, unitKey: slugify(cabin), voyage: { slug: v.slug, name: v.name, code: sailing.code }, start: sailing.date, end: sailing.dateTo ?? addDays(sailing.date, v.nights), adults: 2, plan: null, parentId: null, price: { source: "published_from", usdMinor: sailing.fromUsd * 200, sourceMinor: sailing.fromUsd * 200, sourceCurrency: "USD", fx: null, basis: `From ${fmtMoney(sailing.fromUsd * 100, "USD")} per person in a double cabin × 2. The ship's lowest published fare, not the ${cabin} fare`, provenance: `Antarctica21 published from fare, filed in the house voyage record, checked ${niceDate(v.checked)}`, fetchedAt: null } });
    }
    const land = catalogue.products.find((x) => x.type === "journey" && x.key === "three-generations-at-pioneer");
    if (land && land.type === "journey") out.push({ id: uid(), kind: "journey", productKey: land.key, ledgerId: land.ledgerId, name: land.name, supplier: land.supplier, unit: `${land.nights} nights, ${land.stops.length} stops`, unitKey: "", voyage: null, start: "2027-07-05", end: addDays("2027-07-05", land.nights), adults: 6, plan: null, parentId: null, price: NO_PRICE(`6 travelers, ${land.nights} nights`, "Route prices are not final. The house quotes the journey against your dates.") });
    return out;
  }
  function loadExample() {
    setLines(exampleLines()); setResults({}); setMethods({}); setOpen(null); setHelp(false);
    setLead({ first: "Ada", last: "Example", email: "ada@example.com", phone: "", country: "United States" });
    go(1); setNotice("An example journey is loaded: a room, a residence, a voyage and a land journey. Change anything, or carry on to Review.");
  }

  function go(n: number) {
    setNotice(""); setOffer(null); setCartOpen(false);
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
    setNotice(`${parent.name} added to your journey.`); setOffer("cart");
  }
  function save(id: string, d: Draft) {
    const parent: Line = { ...d.line, id };
    setLines((ls) => { const at = ls.findIndex((l) => l.id === id); const rest = ls.filter((l) => l.id !== id && l.parentId !== id); rest.splice(Math.min(at, rest.length), 0, parent, ...experienceLines(parent, d.experiences)); return rest; });
    setResults({}); setEditing(null);
  }
  function remove(id: string) {
    const at = lines.findIndex((l) => l.id === id), gone = lines.filter((l) => l.id === id || l.parentId === id);
    if (at < 0) return;
    setLines((ls) => ls.filter((l) => l.id !== id && l.parentId !== id)); setResults({}); setEditing(null);
    setRemoved({ at, lines: gone }); setNotice(`${gone[0].name} removed.`); setOffer("undo");
  }
  function undo() {
    if (!removed) return;
    setLines((ls) => { const next = [...ls]; next.splice(Math.min(removed.at, next.length), 0, ...removed.lines); return next; });
    setRemoved(null); setNotice(""); setOffer(null);
  }
  function editLine(id: string) { go(1); setEditing(id); }

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
    if (blocked) setNotice("One or more lines could not be simulated. Review the notes below, or choose another method."); else go(5);
  }

  function next() {
    if (step === 0 || step === 1) { if (!lines.length) { setNotice("Add a stay, a residence, a voyage or a journey first."); setOffer(null); return; } }
    if (step === 3) { const e = validLead(lead); if (e) { setNotice(e); return; } if (!agreed) { setNotice("Please confirm you have read how this preview works."); return; } }
    if (step === 4) { void pay(); return; }
    go(step + 1);
  }
  function restart() { setLines([]); setResults({}); setMethods({}); setCartId(uid()); setLead({ first: "", last: "", email: "", phone: "", country: "" }); setAgreed(false); setOpen(catalogue.products[0]?.key ?? null); go(0); }

  const nextLabel = step === 4 ? (busy ? "Running the simulation" : "Run simulated payments") : step === 0 ? "Review your cart" : `Continue to ${STEPS[step + 1]}`;
  const handoff = step === 5 ? ledgerHandoff({ cartId, lines, lead, party: companions, advisor: adv, externalAdvisor: external, payments: Object.fromEntries(lines.map((l) => [l.id, isPay(results[l.id]) ? (results[l.id] as SimResponse) : null])) }) : null;

  const ready = (l: Line) => readiness(l, product(l).policy);
  // The traveler's wording for each payment method. The supplier-by-supplier reason stays in the house and advisor view.
  const plainReason = (o: Option, l: Line) => {
    const p = product(l);
    if (o.method === "advisor_assisted") return o.reason;
    if (o.available) return o.method === "pay_now" ? (p.type === "stay" && p.pricing === "albie" ? "Pay in full, securely, on the house booking engine." : "Pay in full today.") : o.method === "deposit_now" ? "Pay the deposit today. The balance follows on the supplier's terms." : "Pay at the property, on its own terms.";
    return o.method === "pay_now" ? "Not available online for this chapter yet. Your advisor arranges payment once the price is confirmed." : o.method === "deposit_now" ? "Your advisor confirms the deposit with your quote." : l.kind === "stay" ? "Not offered for this stay yet." : "Does not apply to this chapter.";
  };
  const shortPrice = (l: Line) => (l.price.usdMinor != null ? `${l.price.source === "published_from" ? "from " : ""}${fmtMoney(l.price.usdMinor, "USD").replace(/\.00$/, "")}` : pricedAbroad(l.price) ? fmtMoney(l.price.sourceMinor as number, l.price.sourceCurrency as string).replace(/\.00$/, "") : "House quotes");
  const readyCount = bookable.filter((l) => ready(l) === "ready").length;

  // The cart, grouped by how far along each line is. Shown beside the page on a wide screen and in a sheet on a phone.
  const cartView = (notes: boolean) => (
    <>
      {removed && offer === "undo" && <p role="status" className="mt-2 border-l-2 border-[#8B2525] bg-paper-card px-3 py-2 text-[13.5px]">{removed.lines[0].name} removed. <button type="button" className="underline underline-offset-4" onClick={undo}>Undo</button></p>}
      {!bookable.length && <p className="mt-2 text-[15px] ledger-muted">Nothing added yet. Choose dates on any stay, residence, voyage or journey to begin.</p>}
      {READINESS_ORDER.map((r) => {
        const group = bookable.filter((l) => ready(l) === r);
        if (!group.length) return null;
        return (
          <section key={r} className="mt-4 first:mt-2">
            <h3 title={READINESS[r].note} className="flex items-center gap-2 text-[12.5px] tracking-wide uppercase"><span className={`w-2 h-2 ${DOT[r]}`} aria-hidden="true" />{READINESS[r].label} · {group.length}</h3>
            {notes && <p className="mt-1 text-[12.5px] ledger-muted">{READINESS[r].note}</p>}
            <ul className="mt-1.5 divide-y divide-[#DCD7D0] border-y ledger-border">
              {group.map((l) => (
                <li key={l.id} className="py-2.5">
                  <div className="flex justify-between gap-3 text-[14.5px]"><span className="min-w-0"><span className="block">{l.name}</span><span className="block text-[12.5px] ledger-muted">{[l.unit, l.start ? niceDate(l.start).replace(/^\w+, /, "") : "", party(l)].filter(Boolean).join(" · ")}</span></span><span className="whitespace-nowrap">{shortPrice(l)}</span></div>
                  {step < 5 && <div className="mt-1 flex gap-5 text-[13px]"><button type="button" className="underline underline-offset-4 decoration-[#CFC8BF]" onClick={() => editLine(l.id)}>Edit</button><button type="button" className="underline underline-offset-4 decoration-[#CFC8BF]" onClick={() => remove(l.id)}>Remove</button></div>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <Totals totals={totals} compact className="mt-4" />
      <p className="mt-3 text-[13px] ledger-muted"><span className="ledger-id">{adv.ledgerId}</span> · held by {adv.name}</p>
    </>
  );

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
          {l.kind !== "experience" && <p className="mt-1.5 inline-flex items-center gap-2 text-[12.5px]"><span className={`w-2 h-2 ${DOT[ready(l)]}`} aria-hidden="true" />{READINESS[ready(l)].label}</p>}
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div ref={top} className="max-w-ledger mx-auto px-5 md:px-10 scroll-mt-24">
      <p role="note" className="border border-dashed border-[#8B2525]/60 px-4 py-2.5 text-[13.5px]"><span className="ledger-id">PREVIEW</span> · Simulation only. No card is asked for, no money moves, nothing is sent to a supplier and nothing is written to the Travel Ledger. <button type="button" className="underline underline-offset-4 ml-1" aria-pressed={detail} onClick={() => setDetail(!detail)}>{detail ? "Showing house and advisor detail · switch to traveler view" : "Traveler view · show house and advisor detail"}</button></p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className="house-chip" aria-haspopup="dialog" onClick={() => setHelp(true)}><span aria-hidden="true">?</span> How it works</button>
        {step < 5 && <button type="button" className="house-chip" onClick={loadExample}>Load an example journey</button>}
      </div>

      <div className="mt-4 flex items-end justify-between gap-4 lg:hidden">
        <div className="min-w-0 flex-1 md:hidden">
          <p className="text-[12.5px] tracking-wide uppercase ledger-muted">{step < 5 ? `Step ${step + 1} of 5 · ${STEPS[step]}` : "Complete"}</p>
          <div className="mt-2 h-[3px] bg-[#DCD7D0]" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={Math.min(step + 1, 5)} aria-label="Checkout progress"><div className="h-full bg-ink" style={{ width: `${(Math.min(step + 1, 5) / 5) * 100}%` }} /></div>
        </div>
        <button type="button" className="house-chip house-chip--primary ml-auto whitespace-nowrap" aria-haspopup="dialog" onClick={() => setCartOpen(true)}>Journey cart · {bookable.length}</button>
      </div>

      <nav aria-label="Checkout steps" className="hidden md:block mt-5">
        <ol className="grid grid-cols-6 gap-1.5">
          {STEPS.map((s, i) => {
            const reach = i <= step;
            return (
              <li key={s}>
                <button type="button" disabled={!reach || step === 5} aria-current={i === step ? "step" : undefined} onClick={() => go(i)} className={`w-full text-left border px-3 py-2 text-[12px] leading-tight tracking-wide ${i === step ? "border-ink bg-ink text-white" : i < step ? "border-[#CFC8BF] bg-paper-card text-ink" : "border-[#DCD7D0] bg-paper text-[#6B635A]"} ${reach && step !== 5 ? "cursor-pointer" : "cursor-default"}`}>
                  <span className="block font-mono text-[11px] opacity-80">{String(i + 1).padStart(2, "0")}</span>{s}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-8 md:mt-12 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-10 lg:gap-14 items-start">
        <div className="min-w-0">
          {notice && (
            <div role="status" className="mb-5 border-l-2 border-[#8B2525] bg-paper-card px-4 py-3 text-[15px] flex flex-wrap items-center gap-x-5 gap-y-2">
              <span>{notice}</span>
              {offer === "cart" && <button type="button" className="ledger-btn" onClick={() => go(1)}>View journey cart</button>}
              {offer === "undo" && <button type="button" className="ledger-btn" onClick={undo}>Undo</button>}
            </div>
          )}

          {step === 0 && (
            <>
              <Head n={1} title="Build Your Journey">Choose the chapters of the journey: houses and rooms, whole villas and residences, a voyage south, or a land journey the house has already drawn. Add as many as you like, in any order. A price appears only where its source answers today.</Head>
              <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Show">
                {FILTERS.map(([k, label]) => <button key={k} type="button" aria-pressed={filter === k} className={`house-chip ${filter === k ? "house-chip--primary" : ""}`} onClick={() => setFilter(k)}>{label}</button>)}
              </div>
              <div className="space-y-5">
                {catalogue.products.filter((p) => filter === "all" || family(p) === filter).map((p) => {
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
              <Head n={3} title="Review">Each chapter with its price, what it includes and its terms, in one place. US dollars first, with the supplier&rsquo;s own currency beside it where it differs.</Head>
              <div className="space-y-5">
                {bookable.map((l) => {
                  const p = product(l), v = p.type === "voyage" ? p.voyages.find((x) => x.slug === l.voyage?.slug) : null;
                  const inc = p.type === "voyage" ? (v?.inclusions ?? []) : p.inclusions, exc = p.type === "voyage" ? (v?.exclusions ?? []) : p.exclusions;
                  const kids = lines.filter((x) => x.parentId === l.id);
                  const fees = detail ? p.fees : p.fees.filter((f) => f.state !== "not_applied");
                  const standing = l.price.source === "albie_live" ? "A live price for your dates. The house checks it again before booking."
                    : l.price.source === "rate_card" ? "The contracted rate for your dates. The house checks it again before booking."
                    : l.price.source === "published_rate" ? `${l.supplier}'s published rate for your dates. The house confirms it, with taxes, before anything is paid.`
                    : l.price.source === "published_from" ? `A starting fare, not a quote. ${l.supplier} confirms the fare for your cabin before anything is paid.`
                    : "No price yet. The house prices this for your dates and writes to you.";
                  return (
                    <Panel key={l.id} className="p-5 md:p-6">
                      {lineCard(l)}
                      <p className="mt-3 text-[15px]">{standing}</p>
                      {l.price.sourceCurrency && l.price.sourceCurrency !== "USD" && l.price.sourceMinor != null && l.price.usdMinor != null && <p className="mt-1 text-[14px] ledger-muted">{fmtMoney(l.price.sourceMinor, l.price.sourceCurrency)} at {l.supplier}&rsquo;s own rate. The US dollar figure is a guide; the {l.price.sourceCurrency} figure governs.</p>}
                      {kids.length > 0 && <p className="mt-2 text-[14.5px]">Experiences requested: {kids.map((k) => k.name).join(", ")}. The house quotes each one.</p>}

                      {detail && (
                        <dl className="mt-4 grid sm:grid-cols-[150px_1fr] gap-x-5 gap-y-2 text-[14px] border ledger-border border-dashed p-4">
                          <dt className="ledger-muted">Basis</dt><dd>{l.price.basis}</dd>
                          <dt className="ledger-muted">Source</dt><dd>{l.price.provenance}{l.price.fetchedAt ? ` · asked ${niceWhen(l.price.fetchedAt)}` : ""}</dd>
                          <dt className="ledger-muted">Supplier currency</dt><dd>{l.price.sourceMinor != null && l.price.sourceCurrency ? fmtMoney(l.price.sourceMinor, l.price.sourceCurrency) : "No figure on file"}</dd>
                          <dt className="ledger-muted">Conversion</dt><dd>{l.price.fx ? `${l.price.fx.rate} ${l.price.sourceCurrency} to US$1 · ${l.price.fx.source}` : l.price.sourceCurrency === "USD" ? "None. Quoted in US dollars by the source." : pricedAbroad(l.price) ? `No ${l.price.sourceCurrency} rate is on file.` : "Not applicable"}</dd>
                          <dt className="ledger-muted">Settlement currency</dt><dd>Not stated by the source. Confirmed before any charge.</dd>
                        </dl>
                      )}

                      <div className="mt-5 grid md:grid-cols-2 gap-x-6 gap-y-3 border-t ledger-border pt-4">
                        <details open={inc.length > 0 && inc.length <= 6}>
                          <summary className="cursor-pointer ledger-eyebrow py-1">Included{inc.length ? ` · ${inc.length}` : ""}</summary>
                          {inc.length ? <ul className="mt-2 space-y-1.5 text-[14.5px] list-disc pl-5">{inc.map((x) => <li key={x}>{x}</li>)}</ul> : <p className="mt-2 text-[14.5px] ledger-muted">{detail && p.type === "stay" && p.inclusionsNote ? p.inclusionsNote : "Listed with your quote."}</p>}
                          {l.plan && <p className="mt-2 text-[14.5px]">Rate plan: {l.plan}.</p>}
                          {p.type === "journey" && inc.length > 0 && <p className="mt-2 text-[13.5px] ledger-muted">As drafted for this route. The house confirms each item with your quote.</p>}
                        </details>
                        <details open={exc.length > 0 && exc.length <= 6}>
                          <summary className="cursor-pointer ledger-eyebrow py-1">Not included{exc.length ? ` · ${exc.length}` : ""}</summary>
                          {exc.length ? <ul className="mt-2 space-y-1.5 text-[14.5px] list-disc pl-5">{exc.map((x) => <li key={x}>{x}</li>)}</ul> : <p className="mt-2 text-[14.5px] ledger-muted">Listed with your quote. Until then, treat flights, transfers and anything not named as included as extra.</p>}
                        </details>
                      </div>

                      <h3 className="ledger-eyebrow mt-5">Taxes and charges</h3>
                      <ul className="mt-2 divide-y divide-[#DCD7D0] border-y ledger-border">
                        {fees.map((f) => (
                          <li key={f.name} className={`py-2.5 grid gap-x-4 gap-y-0.5 text-[14.5px] ${detail ? "sm:grid-cols-[200px_150px_1fr]" : "grid-cols-[1fr_auto]"}`}>
                            <span>{f.name}</span>
                            <span className={f.state === "included" ? "" : "ledger-muted"}>{f.state === "included" ? "Included" : f.state === "added" ? "Added" : f.state === "not_applied" ? "Not applied" : detail ? "Not on file" : "Confirmed with your quote"}</span>
                            {detail && <span className="ledger-muted">{f.note}</span>}
                          </li>
                        ))}
                      </ul>

                      <h3 className="ledger-eyebrow mt-5">Deposit and cancellation</h3>
                      {detail ? (
                        <dl className="mt-2 grid sm:grid-cols-[150px_1fr] gap-x-5 gap-y-1.5 text-[14.5px]">
                          <dt className="ledger-muted">Deposit</dt><dd>{p.policy.deposit ? p.policy.deposit.basis : p.policy.depositNote}</dd>
                          <dt className="ledger-muted">Balance</dt><dd>{p.policy.balance}</dd>
                          <dt className="ledger-muted">Cancellation</dt><dd>{p.policy.cancellation}</dd>
                        </dl>
                      ) : (
                        <p className="mt-2 text-[14.5px]">{p.policy.deposit ? p.policy.deposit.basis : "Your advisor confirms the deposit, the balance date and the cancellation terms with your quote, before anything is paid."}{p.policy.travelerNote ? ` ${p.policy.travelerNote}` : ""}</p>
                      )}
                    </Panel>
                  );
                })}
              </div>
              <Totals totals={totals} className="mt-6" />
            </>
          )}

          {step === 3 && (
            <>
              <Head n={4} title="Your Details">Only what the house needs to open the journey: who is traveling and how to reach you. Passports, dates of birth and payment details are never asked for here.</Head>
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

          {step === 4 && (
            <>
              <Head n={5} title="Payment">Each chapter is paid on its own, on its own supplier&rsquo;s terms. Where paying online is not open yet, your advisor completes it with you.</Head>
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
                                <span className="block mt-1.5 text-[13.5px] ledger-muted">{detail ? o.reason : plainReason(o, l)}</span>
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
              {detail && (
              <Panel className="mt-5 p-5 border-dashed">
                <p className="ledger-eyebrow">Tester controls · preview only</p>
                <label className="mt-2 flex items-start gap-2.5 text-[14.5px] cursor-pointer"><input type="checkbox" className="mt-1 w-4 h-4 accent-[#2E2B28]" checked={tester.decline} onChange={(e) => setTester({ ...tester, decline: e.target.checked })} /><span>Make Pay Now come back declined, to see the failure path.</span></label>
                <label className="mt-1.5 flex items-start gap-2.5 text-[14.5px] cursor-pointer"><input type="checkbox" className="mt-1 w-4 h-4 accent-[#2E2B28]" checked={tester.locked} onChange={(e) => setTester({ ...tester, locked: e.target.checked })} /><span>Let me pick a method that is not open, to see it refused.</span></label>
              </Panel>
              )}
              <p className="mt-5 text-[14px] ledger-muted">No card form appears in this preview. In a live build the card is typed on the payment provider&rsquo;s own page and never touches this site.</p>
            </>
          )}

          {step === 5 && handoff && (
            <>
              <Head n={6} title="Confirmation">Thank you, {lead.first.trim() || "traveler"}. Your journey request is recorded in this preview. Three things are tracked for each chapter, and they are never the same thing.</Head>
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
              {detail && (
              <details className="mt-5 border ledger-border">
                <summary className="px-5 py-3.5 cursor-pointer text-[15px]">Ledger and commission hand-off record (for the house · not written in simulation)</summary>
                <pre className="px-5 pb-5 text-[12px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(handoff, null, 2)}</pre>
              </details>
              )}
              <button type="button" className="ledger-btn mt-6" onClick={restart}>Start a new journey</button>
            </>
          )}

          {step < 5 && (
            <div className="hidden md:flex mt-10 items-center gap-8 border-t ledger-border pt-8">
              <button type="button" className="ledger-btn ledger-btn--house" disabled={busy} onClick={next}>{nextLabel}</button>
              {step > 0 && <button type="button" className="ledger-btn" onClick={() => go(step - 1)}>Back</button>}
            </div>
          )}
        </div>

        <aside className="hidden lg:block sticky top-28 max-h-[calc(100vh-8.5rem)] overflow-y-auto" aria-label="Journey cart">
          <Panel className="p-5">
            <p className="ledger-eyebrow">Journey cart{bookable.length ? ` · ${bookable.length}${readyCount ? ` · ${readyCount} ready to book` : ""}` : ""}</p>
            {step < 5 && bookable.length > 0 && <button type="button" className="ledger-btn ledger-btn--house mt-3 mb-1 w-full" disabled={busy} onClick={next}>{step === 4 && busy ? "Running" : SHORT_NEXT[step]}</button>}
            {cartView(false)}
          </Panel>
        </aside>
      </div>

      {step < 5 && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#CFC8BF] bg-paper px-4 pt-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] flex items-stretch gap-2">
          <button type="button" className="min-w-0 flex-1 text-left border border-[#CFC8BF] px-3 py-2" aria-haspopup="dialog" onClick={() => setCartOpen(true)}>
            <span className="block text-[11px] tracking-wide uppercase ledger-muted truncate">Cart · {bookable.length}{readyCount ? ` · ${readyCount} ready` : ""}</span>
            <span className="block ledger-display text-[1.2rem] leading-none mt-0.5 truncate">{fmtMoney(totals.verifiedMinor, "USD").replace(/\.00$/, "")}</span>
          </button>
          {step > 0 && <button type="button" className="border border-[#CFC8BF] px-3 text-[14px]" onClick={() => go(step - 1)}>Back</button>}
          <button type="button" className="bg-ink text-white px-4 text-[14px] font-medium disabled:opacity-50 whitespace-nowrap" disabled={busy} onClick={next}>{step === 4 && busy ? "Running" : SHORT_NEXT[step]} <span aria-hidden="true">→</span></button>
        </div>
      )}

      {help && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label="How it works">
          <button type="button" className="absolute inset-0 bg-ink/50 cursor-default" aria-label="Close" onClick={() => setHelp(false)} />
          <div className="relative w-full md:w-[640px] max-h-[88vh] overflow-y-auto bg-paper border border-[#CFC8BF] p-5 md:p-7 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between gap-4"><h2 className="ledger-display text-[1.8rem] leading-none">How it works</h2><button type="button" className="house-chip" onClick={() => setHelp(false)}>Close</button></div>
            <ol className="mt-4 space-y-3 text-[15px] list-decimal pl-5">
              <li><strong>Build your journey.</strong> Open any stay, residence, voyage or land journey, choose dates and guests, and press Add to journey. Add as many as you like. Use the filters to narrow the list.</li>
              <li><strong>Check the Journey cart.</strong> It is always one tap away: beside the page on a computer, the Journey cart button on a phone. It sorts everything into Ready to book, Priced, From fare and Quoted by the house. Edit or Remove any line there.</li>
              <li><strong>Review.</strong> Each chapter shows its price, what is included and not included, taxes and charges, and deposit and cancellation terms.</li>
              <li><strong>Your details.</strong> The lead traveler&rsquo;s name and email, the names of those traveling, and your advisor. No passport or card details are asked for.</li>
              <li><strong>Payment.</strong> Each chapter is paid on its own. Choose a method where one is open; otherwise your advisor completes it with you. Then press Run simulation.</li>
              <li><strong>Confirmation.</strong> Each chapter shows three separate things: the booking request, the payment, and the supplier&rsquo;s confirmation.</li>
            </ol>
            <p className="mt-4 text-[14px] ledger-muted">This is a preview. No card is taken and nothing is sent to a supplier. For the team: the link at the top switches between the traveler view and the house and advisor detail.</p>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3"><button type="button" className="ledger-btn ledger-btn--house" onClick={loadExample}>Load an example journey</button><button type="button" className="ledger-btn" onClick={() => setHelp(false)}>Start from scratch</button></div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end" role="dialog" aria-modal="true" aria-label="Journey cart">
          <button type="button" className="absolute inset-0 bg-ink/50 cursor-default" aria-label="Close the cart" onClick={() => setCartOpen(false)} />
          <div className="relative w-full md:w-[420px] max-h-[88vh] md:max-h-none overflow-y-auto bg-paper border-t md:border-t-0 md:border-l border-[#CFC8BF] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="ledger-display text-[1.7rem] leading-none">Journey cart</h2>
              <button type="button" className="house-chip" onClick={() => setCartOpen(false)}>Close</button>
            </div>
            {cartView(true)}
            {step < 5 && bookable.length > 0 && <button type="button" className="ledger-btn ledger-btn--house mt-5 w-full" disabled={busy} onClick={() => (step === 0 ? go(1) : setCartOpen(false))}>{step === 0 ? "Review cart" : "Back to checkout"}</button>}
          </div>
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
