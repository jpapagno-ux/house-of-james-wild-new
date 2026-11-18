import Link from "next/link";
import { notFound } from "next/navigation";
import { requireHouse } from "@/lib/platform/membership";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { loadTradeAccounts } from "@/lib/platform/trade-accounts-data";
import { Notice, PageHead } from "@/components/platform/ui";
import TradeAccounts from "@/components/advisor/TradeAccounts";

export const metadata = { title: "Trade accounts" };

// /desk/trade-accounts: the house's view of every trade account marked Show on Desk, with who each is
// open to, so James can check a card before opening it to advisors. Edited in Airtable, never here.
export default async function HouseTradeAccounts() {
  if (!ADVISOR_DESK) notFound();
  await requireHouse("/desk/trade-accounts");
  const res = await loadTradeAccounts();
  return (
    <>
      <p className="mb-4 text-[13px]"><Link href="/desk" className="ledger-btn-ghost uppercase">The desk</Link></p>
      <PageHead eyebrow="House desk · Trade accounts" title="Trade accounts" lead="Every supplier account marked Show on Desk, as advisors will read it. Each card shows who it is open to. Edit the rows in the Trade Accounts table in Airtable; changes show here on the next page load." />
      {res.ok ? <TradeAccounts accounts={res.accounts} house /> : <div className="mt-8"><Notice tone="attention" title={res.reason === "not-configured" ? "Airtable is not connected on this build" : "Trade accounts could not be loaded"}>{res.reason === "not-configured" ? "AIRTABLE_ENQUIRIES_TOKEN and AIRTABLE_ENQUIRIES_BASE_ID are not set." : "Airtable did not answer. Check that the token can read the Trade Accounts table."}</Notice></div>}
    </>
  );
}
