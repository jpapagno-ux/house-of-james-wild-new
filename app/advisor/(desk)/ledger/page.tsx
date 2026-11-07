import Link from "next/link";
import { requireAdvisor } from "@/lib/platform/advisor";
import { ledgerRows } from "@/lib/platform/advisor-ledger-data";
import { PER_PAGE, RATE_LABEL, filterRows, parseQuery, queryHref, rateLine, sortRows } from "@/lib/platform/advisor-ledger";
import { DNA_VOLUMES } from "@/lib/platform/advisor-dna";
import { PATHWAY_LIST } from "@/lib/pathways";
import { DESTINATION_COUNTRIES } from "@/lib/content/destination-countries";
import PathwayChip from "@/components/advisor/PathwayChip";
import { Empty, PageHead, StatusPill } from "@/components/platform/ui";

export const metadata = { title: "The Ledger" };

const field = "mt-1 w-full bg-white border ledger-border px-3 py-2 text-[14.5px]";
const lab = "block text-[12.5px] ledger-muted";

export default async function AdvisorLedger({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const a = await requireAdvisor("/advisor/ledger");
  const f = parseQuery(await searchParams);
  const all = ledgerRows(a.advisor.slug);
  const found = sortRows(filterRows(all, f));
  const pages = Math.max(1, Math.ceil(found.length / PER_PAGE));
  const page = Math.min(f.page, pages);
  const shown = found.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const regions = [...new Map(DESTINATION_COUNTRIES.map((c) => [c.region, c.regionName])).entries()].sort((x, y) => x[1].localeCompare(y[1]));
  const countries = DESTINATION_COUNTRIES.filter((c) => (!f.region || c.region === f.region) && all.some((r) => r.countrySlug === c.slug)).sort((x, y) => x.name.localeCompare(y.name));
  const mine = all.filter((r) => r.mine).length, withOffers = all.filter((r) => r.offers.length).length;
  return (
    <>
      <PageHead eyebrow="Advisor Desk · The Ledger" title="The Ledger"
        lead={`Every stay the house has filed: ${all.length} records, ${withOffers} with an offer running${mine ? `, ${mine} you know yourself` : ""}. Rates are the house's own; the house confirms every price before anything is held or charged.`} />

      <form method="get" action="/advisor/ledger" className="mt-8 bg-white border ledger-border p-4 md:p-5 grid gap-4" role="search" aria-label="Filter the Ledger">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <label className={lab}>Name, country or Ledger ID<input name="q" defaultValue={f.q} className={field} placeholder="Search" /></label>
          <label className={lab}>Volume<select name="volume" defaultValue={f.volume} className={field}><option value="">All</option>{DNA_VOLUMES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className={lab}>Region<select name="region" defaultValue={f.region} className={field}><option value="">All</option>{regions.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className={lab}>Country<select name="country" defaultValue={f.country} className={field}><option value="">All</option>{countries.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
          <label className={lab}>Pathway<select name="pathway" defaultValue={f.pathway} className={field}><option value="">All</option>{PATHWAY_LIST.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="offers" value="1" defaultChecked={f.offers} className="accent-[#2E2B28]" />With an offer</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="priced" value="1" defaultChecked={f.priced} className="accent-[#2E2B28]" />Priced by the house</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="mine" value="1" defaultChecked={f.mine} className="accent-[#2E2B28]" />Places I know</label>
          <button type="submit" className="ledger-btn ledger-btn--solid ml-auto">Show</button>
          {(f.q || f.volume || f.region || f.country || f.pathway || f.offers || f.priced || f.mine) && <Link href="/advisor/ledger" className="text-[13px] underline ledger-muted">Clear</Link>}
        </div>
      </form>

      <p className="mt-6 text-[14px] ledger-muted" aria-live="polite">{found.length} {found.length === 1 ? "record" : "records"}{pages > 1 ? `, page ${page} of ${pages}` : ""}</p>
      {shown.length ? (
        <ul className="mt-3 grid gap-3" aria-label="Ledger records">
          {shown.map((r) => (
            <li key={r.slug}>
              <Link href={`/advisor/ledger/${r.slug}`} className="grid gap-2 bg-white border ledger-border p-4 md:p-5 hover:bg-[#F7F5F2] md:grid-cols-[1fr_auto]">
                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="ledger-display text-[1.3rem] leading-tight">{r.name}</span>
                    <span className="text-[13.5px] ledger-muted">{r.country}</span>
                    {r.ledgerId && <span className="ledger-id text-[12px]">{r.ledgerId}</span>}
                  </span>
                  {r.pathways.length > 0 && <span className="mt-2 flex flex-wrap gap-1.5">{r.pathways.map((p) => <PathwayChip key={p.id} {...p} />)}</span>}
                  {r.offers[0] && <span className="mt-2 block text-[14px]"><span className="font-medium">Offer:</span> {r.offers[0].headline}{r.offers.length > 1 ? ` and ${r.offers.length - 1} more` : ""}. {r.offers[0].travel}</span>}
                </span>
                <span className="flex flex-wrap md:flex-col md:items-end gap-2 text-[13px]">
                  <StatusPill label={RATE_LABEL[r.rate.kind]} tone={r.rate.kind === "request" ? "neutral" : "good"} />
                  {r.rate.kind === "card" && r.rate.fromUsd ? <span className="ledger-muted">{rateLine(r.rate).replace(/ per person per night sharing| per room per night| exclusive use per night/, "")}</span> : null}
                  {r.mine && <StatusPill label={`You: ${r.mine}`} tone="progress" />}
                  {r.founder && <span className="ledger-muted">Founder has been</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : <div className="mt-6"><Empty title="Nothing matches">Loosen a filter or clear the search.</Empty></div>}

      {pages > 1 && (
        <nav aria-label="Pages" className="mt-6 flex flex-wrap items-center gap-3 text-[14px]">
          {page > 1 && <Link className="ledger-btn" href={queryHref(f, { page: page - 1 })}>Previous</Link>}
          <span className="ledger-muted">Page {page} of {pages}</span>
          {page < pages && <Link className="ledger-btn" href={queryHref(f, { page: page + 1 })}>Next</Link>}
        </nav>
      )}
    </>
  );
}
