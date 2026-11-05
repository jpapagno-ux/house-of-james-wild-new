import { requireDesk } from "@/lib/platform/membership";
import { bankAccounts, documents, orgCurrencies, policies, portfolio, type BankAccountRow, type PolicyRow } from "@/lib/platform/queries";
import { CURRENCIES, POLICY_KINDS, POLICY_LABEL, POLICY_STATUS, maskNumber } from "@/lib/platform/commercial";
import { PageHead, Section, Empty, StatusPill, Notice, DataList } from "@/components/platform/ui";
import { BankAccountForm, CurrencyForm, PolicyForm, ReviewButtons } from "@/components/platform/PaymentForms";

// Banking & policies (D-26): currencies, banking details and cancellation/refund policies.
// Banking is seen only by the partner's admins and the house's admins and finance (enforced in the
// database). Policies are seen by the partner team for their properties and by the house.
export const dynamic = "force-dynamic";
export const metadata = { title: "Banking & policies · Partner Desk", robots: { index: false, follow: false } };

const BANK_FINANCE = ["jw_admin", "admin", "finance"];
const BANK_STATUS: Record<BankAccountRow["status"], { label: string; tone: "progress" | "good" | "attention" | "neutral" }> = {
  pending: { label: "Being verified", tone: "progress" }, verified: { label: "Verified", tone: "good" },
  rejected: { label: "Returned", tone: "attention" }, superseded: { label: "Replaced", tone: "neutral" },
};
const name = (code: string) => CURRENCIES.find((c) => c.code === code)?.name ?? code;
const fmtDate = (d: string) => new Date(d.slice(0, 10) + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function Payments() {
  const desk = await requireDesk("/partner/payments");
  const finance = desk.memberships.some((m) => m.status === "active" && m.organization.type === "internal" && BANK_FINANCE.includes(m.role));
  const seesBanking = finance || desk.canAdmin;
  const [cur, accounts, pols, entities, docs] = await Promise.all([
    orgCurrencies(desk), seesBanking ? bankAccounts(desk) : Promise.resolve([]), policies(desk), portfolio(desk), documents(desk),
  ]);
  const propName = new Map(entities.map((e) => [e.id, e.name]));
  const docTitle = new Map(docs.map((d) => [d.id, d.title]));
  const canEditCurrencies = !!desk.membership || desk.houseEditor;

  const account = (a: BankAccountRow) => (
    <li key={a.id} className="py-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="min-w-0">
        <p className="font-medium">{a.bank_name} · {a.currency}<span className="ml-3 text-[13px] ledger-muted">{a.account_holder}</span></p>
        <DataList rows={[
          ["Account", a.iban ? `IBAN ${maskNumber(a.iban)}` : maskNumber(a.account_number)],
          ["SWIFT / BIC", a.swift_bic ?? "—"], ["Routing or branch", a.routing_code ?? "—"], ["Bank country", a.bank_country],
        ]} />
        {a.review_note && <p className="text-[13.5px] mt-2">House note: {a.review_note}</p>}
        <p className="text-[12.5px] ledger-muted mt-1">Sent {fmtDate(a.created_at)}{a.verified_at ? ` · verified ${fmtDate(a.verified_at)}` : ""}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <StatusPill {...BANK_STATUS[a.status]} />
        {finance && a.status === "pending" && <ReviewButtons url={`/api/v1/partner/bank-accounts/${a.id}`} yes="verified" no="rejected" yesLabel="Mark verified" noLabel="Return" />}
      </div>
    </li>
  );

  const policy = (p: PolicyRow) => (
    <li key={p.id} className="py-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="min-w-0">
        <p className="font-medium">{POLICY_LABEL[p.kind]}<span className="ml-3 text-[13px] ledger-muted">{p.property_id ? propName.get(p.property_id) ?? "One property" : "Every property"}</span></p>
        {p.body && <p className="text-[14.5px] mt-2 whitespace-pre-line">{p.body}</p>}
        {p.document_id && <p className="text-[13.5px] mt-2"><a className="ledger-btn-ghost" href={`/api/v1/partner/documents/${p.document_id}/file`}>{docTitle.get(p.document_id) ?? "Attached document"}</a></p>}
        {p.review_note && <p className="text-[13.5px] mt-2">House note: {p.review_note}</p>}
        <p className="text-[12.5px] ledger-muted mt-1">Sent {fmtDate(p.created_at)}{p.effective_from ? ` · in force from ${fmtDate(p.effective_from)}` : ""}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <StatusPill {...(POLICY_STATUS[p.status] ?? POLICY_STATUS.submitted)} />
        {desk.houseEditor && p.status === "submitted" && <ReviewButtons url={`/api/v1/partner/policies/${p.id}`} yes="approved" no="rejected" yesLabel="Approve" noLabel="Return" />}
      </div>
    </li>
  );

  return (
    <>
      <PageHead eyebrow="Banking & policies" title="Currencies, banking and policies"
        lead="The currencies you trade in, where the house pays you, and the cancellation and refund terms guests are given. Banking details are seen only by your admins and the house's finance team." />

      <Section title="Currencies">
        <p className="text-[14px] ledger-muted mb-4">Your main currency is the one your rates and invoices are in. Add any others you quote or accept.</p>
        <CurrencyForm primary={cur.primary} others={cur.others} canEdit={canEditCurrencies} />
        {!canEditCurrencies && <p className="text-[13px] ledger-muted mt-2">{name(cur.primary)} is the main currency.</p>}
      </Section>

      <Section title="Banking details" aside={seesBanking ? <span className="ledger-muted">{accounts.filter((a) => a.status !== "superseded").length}</span> : undefined}>
        {!seesBanking ? <Notice>Banking details are kept with your partner admins.</Notice> : (
          <>
            {desk.canAdmin && <div className="mb-4"><BankAccountForm defaultCurrency={cur.primary} /></div>}
            {accounts.length ? <ul className="divide-y divide-ink/10 border-y ledger-border">{accounts.map(account)}</ul>
              : <Empty title="No banking details yet">{desk.canAdmin ? "Add the account the house pays guest deposits and balances into." : "The partner's admins add these."}</Empty>}
            <p className="text-[12.5px] ledger-muted mt-3">Numbers are never shown in full here. To change an account, send the new details: the old ones stay in use until the house has verified the new.</p>
          </>
        )}
      </Section>

      <Section title="Cancellation and refund policies" aside={<span className="ledger-muted">{pols.filter((p) => p.status === "approved").length} approved</span>}>
        <div className="mb-4">
          <PolicyForm properties={entities.map((e) => ({ id: e.id, name: e.name }))}
            documents={docs.filter((d) => d.kind !== "contract").map((d) => ({ id: d.id, title: d.title }))}
            propertyRequired={!desk.canAdmin && !desk.houseEditor} />
        </div>
        {POLICY_KINDS.map((k) => {
          const list = pols.filter((p) => p.kind === k);
          return (
            <div key={k} className="mt-6">
              <h3 className="ledger-eyebrow mb-1">{POLICY_LABEL[k]}</h3>
              {list.length ? <ul className="divide-y divide-ink/10 border-y ledger-border">{list.map(policy)}</ul>
                : <Empty title="Nothing on file yet">Send yours above, written out or as a document.</Empty>}
            </div>
          );
        })}
      </Section>
    </>
  );
}
