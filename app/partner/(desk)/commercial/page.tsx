import { requireDesk } from "@/lib/platform/membership";
import { commissionTerms, documents, orgBrands, portfolio, type CommissionTermRow } from "@/lib/platform/queries";
import { COMMISSION_KEEPER_ROLES, TERM_STATUS_LABEL, calculateCommission, formatBp, formatMoney } from "@/lib/platform/commission";
import { PageHead, Section, Empty, StatusPill, Notice } from "@/components/platform/ui";
import { AddTerm, LinkContract, TermStatus } from "@/components/platform/CommissionForms";

// Commercial terms (D-25): what this partner pays the house, by partner, brand or property.
// The database shows these only to house finance and the partner's own admins.
export const dynamic = "force-dynamic";
export const metadata = { title: "Commercial terms · Partner Desk", robots: { index: false, follow: false } };

const fmtDate = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function Commercial() {
  const desk = await requireDesk("/partner/commercial");
  const keeper = desk.memberships.some((m) => m.status === "active" && m.organization.type === "internal" && COMMISSION_KEEPER_ROLES.includes(m.role));
  if (!keeper && !desk.canAdmin) {
    return (
      <>
        <PageHead eyebrow="Commercial terms" title="Commercial terms" lead="Your commission terms with James Wild & Co." />
        <div className="mt-8"><Notice>Commercial terms are kept with your partner admins.</Notice></div>
      </>
    );
  }
  const [terms, brands, entities, docs] = await Promise.all([commissionTerms(desk), orgBrands(desk), portfolio(desk), documents(desk)]);
  // Contracts come back only to those allowed to see them (partner admins; house admins and portfolio managers).
  const contracts = docs.filter((d) => d.kind === "contract").map((d) => ({ id: d.id, title: d.title }));
  const contractTitle = new Map(contracts.map((c) => [c.id, c.title]));
  const brandName = new Map(brands.map((b) => [b.id, b.name]));
  const propName = new Map(entities.map((e) => [e.id, e.name]));
  const scopeOf = (t: CommissionTermRow) =>
    t.property_id ? propName.get(t.property_id) ?? "One property" : t.brand_id ? brandName.get(t.brand_id) ?? "One brand" : `All of ${desk.org.name}`;
  const live = terms.filter((t) => t.status !== "retired");
  const retired = terms.filter((t) => t.status === "retired");
  // A worked example on the main term, so the arithmetic is visible (house view only).
  const main = live.find((t) => t.basis === "commission" && t.rate_bp !== null);
  const example = main ? calculateCommission({ basis: "commission", lines: [{ kind: "accommodation", cents: 1_000_000 }], rateBp: main.rate_bp! }) : null;

  const row = (t: CommissionTermRow) => (
    <li key={t.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <p className="font-medium"><span className="ledger-display text-[1.35rem] mr-3">{t.basis === "net" ? "Net" : formatBp(t.rate_bp)}</span>{scopeOf(t)}</p>
        <p className="text-[13px] ledger-muted">
          {t.basis === "net" ? "Net rates, the house sets the sell price" : "Commission on the room, land or vessel rate after offers; never on taxes or fees"}
          {" · "}from {fmtDate(t.effective_from)}{t.effective_to && <> to {fmtDate(t.effective_to)}</>}
        </p>
        {t.contract_document_id && contractTitle.has(t.contract_document_id) && (
          <p className="text-[13.5px] mt-1">Signed contract: <a className="ledger-btn-ghost" href={`/api/v1/partner/documents/${t.contract_document_id}/file`}>{contractTitle.get(t.contract_document_id)}</a></p>
        )}
        {keeper && t.note && <p className="text-[13.5px] ledger-muted mt-1 whitespace-pre-line">{t.note}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <StatusPill label={TERM_STATUS_LABEL[t.status]} tone={t.status === "confirmed" ? "good" : t.status === "to_confirm" ? "attention" : "neutral"} />
        {keeper && <TermStatus id={t.id} status={t.status} />}
        {keeper && !t.contract_document_id && t.status !== "retired" && <LinkContract id={t.id} contracts={contracts} />}
      </div>
    </li>
  );

  return (
    <>
      <PageHead eyebrow="Commercial terms" title="Commission terms"
        lead={keeper ? "What this partner pays the house. The most specific term wins: a property over its brand, a brand over the whole partner. Advisors' shares and house earnings are worked out from these at booking." : "Your commission terms with James Wild & Co, as set out in your agreement. If anything here looks wrong, tell us through Support."} />
      {keeper && <div className="mt-8"><AddTerm brands={brands} properties={entities.map((e) => ({ id: e.id, name: e.name }))} contracts={contracts} /></div>}
      <Section title="In force" aside={<span className="ledger-muted">{live.length}</span>}>
        {live.length ? <ul className="divide-y divide-ink/10 border-y ledger-border">{live.map(row)}</ul>
          : <Empty title="No terms recorded yet">{keeper ? "Record the rate from the signed agreement above." : "The house will record your terms here."}</Empty>}
      </Section>
      {keeper && example && main && (
        <Section title="How it adds up">
          <p className="text-[14px] ledger-muted mb-3">A US$10,000 stay at {formatBp(main.rate_bp)}, with the advisor on the standard 70% of the commission.</p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#DCD7D0] border ledger-border">
            {[["Commissionable", example.baseCents], ["Gross commission", example.grossCents], ["Advisor (70%)", example.advisorCents], ["House (30%)", example.houseCents]].map(([k, v]) => (
              <div key={k as string} className="bg-white p-4"><dt className="text-[12px] uppercase tracking-[0.12em] ledger-muted">{k}</dt><dd className="ledger-display text-[1.5rem] mt-1">{formatMoney(v as number)}</dd></div>
            ))}
          </dl>
          <p className="text-[13px] ledger-muted mt-3">Taxes, fees and Florida sales tax are never commissionable. Earnings by booking and by advisor arrive with bookings.</p>
        </Section>
      )}
      {retired.length > 0 && (
        <Section title="Retired" aside={<span className="ledger-muted">{retired.length}</span>}>
          <ul className="divide-y divide-ink/10 border-y ledger-border">{retired.map(row)}</ul>
        </Section>
      )}
    </>
  );
}
