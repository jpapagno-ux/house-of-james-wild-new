import { notFound } from "next/navigation";
import { requireAdvisor } from "@/lib/platform/advisor";
import { advisorRecordIdFor, loadTradeAccounts } from "@/lib/platform/trade-accounts-data";
import { visibleToAdvisor } from "@/lib/platform/trade-accounts";
import { Notice, PageHead } from "@/components/platform/ui";
import TradeAccounts from "@/components/advisor/TradeAccounts";

export const metadata = { title: "Trade accounts" };

// /advisor/accounts: supplier accounts the house holds that are booked off the site (James, 18 Nov 2026).
// Active advisors only; each sees the rows opened to all advisors or to them by name.
export default async function AdvisorTradeAccounts() {
  const a = await requireAdvisor("/advisor/accounts");
  if (a.advisor.status !== "active") notFound();
  const [res, recordId] = await Promise.all([loadTradeAccounts(), advisorRecordIdFor(a.advisor.slug)]);
  return (
    <>
      <PageHead eyebrow="Advisor Desk · Trade accounts" title="Trade accounts" lead="Supplier accounts the house holds beyond the stays and voyages in the Ledger. You book these on the supplier's own agent site, not through the house's checkout. Quote the house agency ID on every booking so the commission is tracked to the house." />
      {res.ok ? <TradeAccounts accounts={visibleToAdvisor(res.accounts, recordId)} /> : <div className="mt-8"><Notice tone="attention" title="Trade accounts could not be loaded">Please try again shortly, or ask the house.</Notice></div>}
    </>
  );
}
