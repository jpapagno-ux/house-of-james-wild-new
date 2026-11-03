import Link from "next/link";
import { requireDesk } from "@/lib/platform/membership";
import { documents, orgCurrencies, portfolio } from "@/lib/platform/queries";
import { OFFER_TYPES, cardAlerts, type OfferPayload, type SeasonalPayload } from "@/lib/platform/rate-proposals";
import { Empty, LedgerId, Notice, PageHead, Section, StatusPill } from "@/components/platform/ui";
import { ProposalActions, SendRates } from "@/components/platform/RateForms";
import { today } from "@/lib/dates";

// Rates & offers (Stage 2 §3.3, D-08): what the website prices from today, warnings when rates run
// out, and three ways to send new ones. Every send is a proposal; the house loads it into the
// Airtable rates base and the certified sync prices the site.
export const dynamic = "force-dynamic";
export const metadata = { title: "Rates & offers · Partner Desk", robots: { index: false, follow: false } };

const HOUSE_RATES = ["jw_admin", "jw_editor", "jw_portfolio_manager", "admin", "finance"];
const STATUS: Record<string, { label: string; tone: "progress" | "good" | "attention" | "neutral" }> = {
  submitted: { label: "With the house", tone: "progress" }, loaded: { label: "Loaded", tone: "good" },
  returned: { label: "Returned", tone: "attention" }, withdrawn: { label: "Withdrawn", tone: "neutral" },
};
const KIND = { rate_sheet: "Rate sheet", seasonal: "Seasonal rates", offer: "Offer" } as const;
const money = (minor: number, cur: string) => `${cur} ${(minor / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const nice = (d: string | null) => (d ? new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "");

type Proposal = { id: string; kind: keyof typeof KIND; currency: string | null; valid_from: string | null; valid_to: string | null; payload: unknown; note: string | null; status: string; airtable_card: string | null; review_note: string | null; submitted_by: string | null; created_at: string; document_id: string | null };

export default async function Rates({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const desk = await requireDesk("/partner/rates");
  const entities = await portfolio(desk);
  const sp = await searchParams;
  if (!entities.length) return <><PageHead eyebrow="Rates & offers" title="Rates and offers" /><div className="mt-8"><Empty title="No properties yet" /></div></>;
  const e = entities.find((x) => x.legacy_cms_id === sp.p) ?? entities[0];
  const house = desk.memberships.some((m) => m.status === "active" && m.organization.type === "internal" && HOUSE_RATES.includes(m.role));
  const day = today();

  const [{ data: cards }, { data: rooms }, { data: props }, docs, cur] = await Promise.all([
    desk.sb.from("rate_card_versions").select("id, version_label, currency, effective_from, effective_to, is_sample").eq("property_id", e.id).order("effective_from"),
    desk.sb.from("room_types").select("id, name").eq("property_id", e.id).eq("active", true).order("sort_order", { nullsFirst: false }).order("name"),
    desk.sb.from("rate_proposals").select("id, kind, currency, valid_from, valid_to, payload, note, status, airtable_card, review_note, submitted_by, created_at, document_id").eq("property_id", e.id).order("created_at", { ascending: false }),
    documents(desk),
    orgCurrencies(desk),
  ]);
  const cardIds = (cards ?? []).map((c) => c.id as string);
  const { data: rules } = cardIds.length
    ? await desk.sb.from("seasonal_rate_rules").select("rate_card_version_id, room_type_id, season, stay_start, stay_end, amount_minor, min_nights").in("rate_card_version_id", cardIds).order("stay_start")
    : { data: [] };
  const roomName = new Map((rooms ?? []).map((r) => [r.id as string, r.name as string]));
  const cardOf = new Map((cards ?? []).map((c) => [c.id as string, c]));
  const alert = cardAlerts((cards ?? []).filter((c) => !c.is_sample) as { version_label: string; effective_from: string; effective_to: string }[], day);
  const sheets = docs.filter((d) => d.kind === "commercial" && (!d.property_id || d.property_id === e.id)).map((d) => ({ id: d.id, name: d.title }));
  const docTitle = new Map(docs.map((d) => [d.id, d.title]));

  const describe = (p: Proposal) => {
    if (p.kind === "rate_sheet") return p.document_id ? docTitle.get(p.document_id) ?? "Rate sheet" : "Rate sheet";
    if (p.kind === "seasonal") { const n = (p.payload as SeasonalPayload).rows?.length ?? 0; return `${n} ${n === 1 ? "rate" : "rates"} in ${p.currency}`; }
    const o = p.payload as OfferPayload; return `${o.label} · ${OFFER_TYPES[o.type]}`;
  };

  return (
    <div>
      <PageHead eyebrow="Rates & offers" title={e.name}
        lead={<>What the website prices from, and new rates or offers for the house to load. Nothing you send changes prices until the house has checked it. <LedgerId id={e.legacy_cms_id} /></>} />
      {entities.length > 1 && (
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Property">
          {entities.map((x) => <Link key={x.id} href={`/partner/rates?p=${x.legacy_cms_id}`} aria-current={x.id === e.id ? "page" : undefined} className="house-chip">{x.name}</Link>)}
        </nav>
      )}
      <div className="mt-6">
        <Notice tone={alert.level === "ok" ? "good" : "attention"} title={alert.level === "missing" ? "Rates missing" : alert.level === "expiring" ? "Rates running out" : "Rates on file"}>{alert.text}</Notice>
      </div>

      <Section title="On the website now">
        {(rules ?? []).length ? (
          <div className="overflow-x-auto"><table className="w-full text-[14px] min-w-[560px]">
            <thead><tr className="text-left ledger-muted text-[12px]"><th className="font-normal py-1">Room</th><th className="font-normal">Season</th><th className="font-normal">Dates</th><th className="font-normal text-right">Per night</th><th className="font-normal text-right">Min nights</th></tr></thead>
            <tbody className="divide-y divide-ink/10">
              {(rules ?? []).map((r, i) => { const c = cardOf.get(r.rate_card_version_id as string); return (
                <tr key={i}><td className="py-1.5">{roomName.get(r.room_type_id as string) ?? "A room"}</td><td>{r.season}{c?.is_sample ? <span className="ledger-muted"> · sample</span> : null}</td><td>{nice(r.stay_start as string)} to {nice(r.stay_end as string)}</td><td className="text-right tabular-nums">{money(r.amount_minor as number, (c?.currency as string) ?? "")}</td><td className="text-right">{r.min_nights ?? ""}</td></tr>
              ); })}
            </tbody>
          </table></div>
        ) : <Empty title="No published rates">Send a rate sheet or enter the rates below.</Empty>}
      </Section>

      {desk.membership && (
        <Section title="Send new rates or an offer">
          {(rooms ?? []).length === 0 && <p className="mb-3 text-[14px] ledger-muted">No rooms on file yet: add them under Rooms &amp; Accommodation, or send a rate sheet.</p>}
          <SendRates propertyId={e.id} rooms={(rooms ?? []).map((r) => ({ id: r.id as string, name: r.name as string }))} sheets={sheets} currency={cur.primary} />
        </Section>
      )}

      <Section title="Sent to the house" aside={<span className="ledger-muted">{(props ?? []).length}</span>}>
        {(props ?? []).length ? (
          <ul className="divide-y divide-ink/10 border-y ledger-border">
            {((props ?? []) as Proposal[]).map((p) => (
              <li key={p.id} className="py-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="font-medium">{KIND[p.kind]}<span className="ml-2 text-[13.5px] ledger-muted">{describe(p)}</span></p>
                  <p className="text-[12.5px] ledger-muted">Sent {nice(p.created_at.slice(0, 10))}{p.valid_from ? ` · ${nice(p.valid_from)} to ${nice(p.valid_to)}` : ""}{p.airtable_card ? ` · loaded into ${p.airtable_card}` : ""}</p>
                  {p.note && <p className="text-[13.5px] mt-1">{p.note}</p>}
                  {p.review_note && <p className="text-[13.5px] mt-1">House note: {p.review_note}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <StatusPill {...(STATUS[p.status] ?? STATUS.submitted)} />
                  {p.status === "submitted" && <ProposalActions id={p.id} house={house} mine={p.submitted_by === desk.user.id} />}
                </div>
              </li>
            ))}
          </ul>
        ) : <Empty title="Nothing sent yet" />}
      </Section>
    </div>
  );
}
