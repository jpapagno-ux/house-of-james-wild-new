import Link from "next/link";
import { notFound } from "next/navigation";
import { requireHouse } from "@/lib/platform/membership";
import { Empty, LedgerId, Notice, PageHead, Section } from "@/components/platform/ui";
import { ADVISOR_TIERS, COMMISSION_KEEPER_ROLES, formatBp, formatMoney, resolveTerm, type TermLike } from "@/lib/platform/commission";
import { checkCommission, parseCheckInput } from "@/lib/platform/commission-check";
import { priceStay } from "@/lib/booking-live/rates/price";
import { addDays } from "@/lib/booking-live/pricing/engine";

// Price and commission check (house only; D-25, D-26, D-32). Pick a stay, a room, dates and the
// advisor's tier: the booking engine prices it from the published rate card, and the partner's
// commission (synced from Airtable Partner Brands, D-31) is split into advisor and house shares,
// exactly as the commission ledger will at booking. Nothing is saved.
export const metadata = { title: "Price and commission check", robots: { index: false, follow: false } };

const fmtDate = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const field = "mt-1 w-full bg-white border ledger-border px-2.5 py-2 text-[14.5px]";
const lab = "block text-[12.5px] ledger-muted";

type CardRow = { property_id: string; version_label: string; is_sample: boolean; effective_from: string; effective_to: string; property: { name: string; slug: string; legacy_cms_id: string; brand_id: string | null } | null };

export default async function CommissionCheck({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const desk = await requireHouse("/desk/commission");
  if (!desk.memberships.some((m) => m.status === "active" && m.organization.type === "internal" && COMMISSION_KEEPER_ROLES.includes(m.role))) notFound();

  const { data: cardRows } = await desk.sb.from("rate_card_versions")
    .select("property_id, version_label, is_sample, effective_from, effective_to, property:properties(name, slug, legacy_cms_id, brand_id)")
    .eq("status", "published").order("effective_from");
  const cards = ((cardRows ?? []) as unknown as CardRow[]).filter((c) => c.property);
  const stays = [...new Map(cards.map((c) => [c.property!.slug, c])).values()];
  if (!stays.length) {
    return <><PageHead eyebrow="House desk · Commission" title="Price and commission check" /><div className="mt-8"><Empty title="No published rate cards">Publish a card in the Airtable rates base and run the rates sync.</Empty></div></>;
  }
  const preferred = stays.find((s) => s.property!.slug === "lion-sands") ?? stays[0];
  const sp = await searchParams;
  const input = parseCheckInput(sp, { slug: preferred.property!.slug, arrival: preferred.effective_from > addDays(new Date().toISOString().slice(0, 10), 30) ? addDays(preferred.effective_from, 130) : addDays(new Date().toISOString().slice(0, 10), 60) });
  const stay = stays.find((s) => s.property!.slug === input.slug) ?? preferred;
  const prop = stay.property!;
  const departure = addDays(input.arrival, input.nights);

  // The rooms the card prices, and the stay priced by the booking engine (server-side, never the browser).
  const priced = await priceStay(desk.sb, { slug: prop.slug, arrival: input.arrival, departure, adults: input.adults, childAges: [], promoCode: null, room: input.room || null, plan: null });
  const roomsOnCard = await priceStay(desk.sb, { slug: prop.slug, arrival: stay.effective_from, departure: addDays(stay.effective_from, 1), adults: 1, childAges: [], promoCode: null, room: null, plan: null });
  const roomOptions = [...new Map((roomsOnCard?.ctx.offerables ?? []).map((o) => [o.room.code, o.room])).values()];
  const option = priced?.options.find((o) => !input.room || o.offerable.room.code === input.room);

  // The partner's commission on the arrival date: property over brand over partner (D-25).
  const { data: links } = await desk.sb.from("entity_partners").select("organization_id, is_primary, organization:organizations(name, partner_code)").eq("property_id", stay.property_id).order("is_primary", { ascending: false });
  const partner = (links ?? [])[0] as unknown as { organization_id: string; organization: { name: string; partner_code: string | null } } | undefined;
  const { data: termRows } = partner
    ? await desk.sb.from("commission_terms").select("id, brand_id, property_id, basis, rate_bp, effective_from, effective_to, status, note, source, synced_at").eq("organization_id", partner.organization_id)
    : { data: [] };
  const resolved = resolveTerm((termRows ?? []) as (TermLike & { note: string | null; source: string; synced_at: string | null })[], { id: stay.property_id, brand_id: prop.brand_id }, input.arrival);
  const term = resolved?.term as (TermLike & { note: string | null; source: string; synced_at: string | null }) | undefined;

  const quote = option?.result.ok ? option.result : null;
  const check = quote && term && term.basis === "commission" && term.rate_bp !== null ? checkCommission(quote, term.rate_bp, input.tier) : null;
  const tierLabel = ADVISOR_TIERS.find((t) => t.key === input.tier)!.label;
  // The card's contract reference is private to the sync; its seasons say when rates are estimates.
  const estimated = stay.is_sample || /estimat|from-rate|verify/i.test(quote?.nights[0]?.season ?? "");
  const money = (c: number) => formatMoney(c, check?.currency ?? quote?.currency ?? "USD");

  return (
    <div>
      <PageHead eyebrow="House desk · Commission" title="Price and commission check"
        lead="Price a stay from its published rate card and see the partner's commission, the advisor's share by tier and what the house keeps. Nothing here is saved or shown to anyone else."
        actions={<Link href="/desk/review" className="ledger-btn-ghost uppercase self-center">Review queue</Link>} />

      <form method="get" className="mt-8 bg-white border ledger-border p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
        <label className={`${lab} lg:col-span-2`}>Stay
          <select name="p" defaultValue={prop.slug} className={field}>
            {stays.map((s) => <option key={s.property!.slug} value={s.property!.slug}>{s.property!.name}{s.is_sample ? " (sample card)" : ""}</option>)}
          </select>
        </label>
        <label className={`${lab} lg:col-span-2`}>Room
          <select name="room" defaultValue={input.room} className={field}>
            <option value="">The best-priced room that fits</option>
            {roomOptions.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
          </select>
        </label>
        <label className={lab}>Arrival<input type="date" name="arrival" defaultValue={input.arrival} min={stay.effective_from} max={stay.effective_to} className={field} /></label>
        <label className={lab}>Nights<input type="number" name="nights" min={1} max={30} defaultValue={input.nights} className={field} /></label>
        <label className={lab}>Adults<input type="number" name="adults" min={1} max={12} defaultValue={input.adults} className={field} /></label>
        <fieldset className="lg:col-span-3"><legend className={lab}>Advisor tier</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {ADVISOR_TIERS.map((t) => (
              <label key={t.key} className="house-chip cursor-pointer has-[:checked]:bg-[#2E2B28] has-[:checked]:text-white">
                <input type="radio" name="tier" value={t.key} defaultChecked={t.key === input.tier} className="sr-only" />{t.label} · {formatBp(t.shareBp)}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="lg:col-span-2 lg:justify-self-end"><button className="ledger-btn ledger-btn--solid">Price it</button></div>
      </form>

      {estimated && (
        <div className="mt-6"><Notice tone="attention" title="Estimated rates">
          {prop.name}&rsquo;s {stay.version_label} card uses estimated prices{quote ? <>: the season reads &ldquo;{quote.nights[0].season}&rdquo;</> : null}. Treat every figure below as an estimate until the partner&rsquo;s contracted 2027 rates replace it.
        </Notice></div>
      )}

      <Section title={`${prop.name} · ${fmtDate(input.arrival)} to ${fmtDate(departure)}`} aside={<LedgerId id={prop.legacy_cms_id} />}>
        {!option ? <Empty title="No price for these dates">The {stay.version_label} card runs {stay.effective_from} to {stay.effective_to}; choose dates inside it.</Empty>
          : !quote ? <Notice tone="attention" title="Not bookable as asked">{option.result.ok ? "" : option.result.message}</Notice>
          : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="font-medium">{option.offerable.room.name} <span className="ledger-muted text-[13.5px]">· {option.offerable.plan.name} · {input.adults} {input.adults === 1 ? "adult" : "adults"} · {quote.nights.length} {quote.nights.length === 1 ? "night" : "nights"}</span></p>
              <dl className="mt-3 text-[14.5px] divide-y divide-ink/10 border-y ledger-border">
                <div className="flex justify-between py-2"><dt>Room, {quote.nights.length} × {money(quote.nights[0].totalMinor)}</dt><dd className="tabular-nums">{money(quote.roomSubtotalMinor)}</dd></div>
                {quote.discounts.map((d) => <div key={d.code} className="flex justify-between py-2"><dt>{d.label}</dt><dd className="tabular-nums">−{money(d.amountMinor)}</dd></div>)}
                {quote.charges.map((c) => <div key={c.id} className="flex justify-between py-2 ledger-muted"><dt>{c.name}{c.included && !/included/i.test(c.name) ? ", within the rate" : ""}</dt><dd className="tabular-nums">{c.included ? "" : "+"}{money(c.amountMinor)}</dd></div>)}
                <div className="flex justify-between py-2 font-medium"><dt>The traveler pays</dt><dd className="tabular-nums">{money(quote.grandTotalMinor)}</dd></div>
              </dl>
              <p className="mt-2 text-[12.5px] ledger-muted">Season: {quote.nights[0].season}. Card {stay.version_label}. {quote.cancellation.summary}</p>
            </div>

            <div>
              {!term ? (
                <Notice tone="attention" title="No commission on file">{partner ? `${partner.organization.name} has no commission term for ${input.arrival}. Add it in Airtable Partner Brands with Partner Code ${partner.organization.partner_code ?? ""}.` : "This stay has no partner on the desk yet."}</Notice>
              ) : term.basis === "net" ? (
                <Notice title="Net rates">This partner sells to the house net; the margin is the sell price less the net price, set when the booking is priced.</Notice>
              ) : check && (
                <>
                  <dl className="grid grid-cols-2 gap-px bg-[#DCD7D0] border ledger-border">
                    {([["Commissionable", check.baseCents], [`Commission ${formatBp(check.rateBp)}`, check.grossCents], [`Advisor, ${tierLabel} (${formatBp(check.advisorShareBp)})`, check.advisorCents], ["House keeps", check.houseCents]] as const).map(([k, v], i) => (
                      <div key={k} className="bg-white p-4"><dt className="text-[12px] uppercase tracking-[0.12em] ledger-muted">{k}</dt><dd className={`ledger-display text-[1.6rem] mt-1 tabular-nums ${i === 3 ? "text-house" : ""}`}>{money(v)}</dd></div>
                    ))}
                  </dl>
                  <p className="mt-3 text-[13px] ledger-muted">
                    {partner?.organization.name}, {resolved!.source === "partner" ? "partner-wide" : resolved!.source} term, {term.status === "confirmed" ? "confirmed" : "to confirm"}{term.source === "airtable" ? ", from Airtable Partner Brands" : ""}.
                    {check.includedTaxCents > 0 && <> Commission is worked on the room rate less the {money(check.includedTaxCents)} VAT inside it (house rule: never on taxes). If the contract pays on the rate including VAT, the commission would be {money(check.grossOnInclusiveRateCents)}.</>}
                  </p>
                  {term.note && <p className="mt-2 text-[12.5px] ledger-muted whitespace-pre-line">{term.note}</p>}
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-[13.5px]">
                      <thead><tr className="text-left ledger-muted text-[12px]"><th className="font-normal py-1">Advisor tier</th><th className="font-normal text-right">Advisor</th><th className="font-normal text-right">House</th></tr></thead>
                      <tbody className="divide-y divide-ink/10">
                        {ADVISOR_TIERS.map((t) => { const c = checkCommission(quote, term.rate_bp!, t.key); return (
                          <tr key={t.key} className={t.key === input.tier ? "font-medium" : ""}><td className="py-1.5">{t.label} · {formatBp(t.shareBp)}</td><td className="text-right tabular-nums">{money(c.advisorCents)}</td><td className="text-right tabular-nums">{money(c.houseCents)}</td></tr>
                        ); })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
