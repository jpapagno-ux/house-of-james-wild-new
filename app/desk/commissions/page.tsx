import Link from "next/link";
import { notFound } from "next/navigation";
import { requireHouse } from "@/lib/platform/membership";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { commissionLines } from "@/lib/platform/advisor-file-data";
import { LINE_STATUS, month, position, totals, type Line, type LineStatus } from "@/lib/platform/commission-ledger";
import { money } from "@/lib/platform/advisor-requests";
import { niceDate } from "@/lib/platform/labels";
import { StatusPill } from "@/components/platform/ui";

export const metadata = { title: "Commission ledger" };

const STATUSES: LineStatus[] = ["expected", "invoiced", "received", "advisor_paid", "cancelled"];
const sums = (m: Map<string, { sell: number; gross: number; advisor: number; house: number; count: number }> | undefined) =>
  m ? [...m.entries()].map(([c, s]) => `${money(s.gross, c)} commission (${money(s.advisor, c)} advisors, ${money(s.house, c)} house) on ${money(s.sell, c)} sold`).join("; ") : "";

// /desk/commissions: every commission line, what the house is owed and owes, and the reports by brand
// partner, property, advisor and month. House admins, portfolio managers and finance, with the code.
export default async function CommissionLedger({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!ADVISOR_DESK) notFound();
  const desk = await requireHouse("/desk/commissions");
  const f = (await searchParams).status;
  const status = STATUSES.includes(f as LineStatus) ? (f as LineStatus) : null;
  const [all, { data: advisors }, { data: orgs }] = await Promise.all([
    commissionLines(desk.sb), desk.sb.from("advisors").select("id, display_name"), desk.sb.from("organizations").select("id, name").eq("type", "partner"),
  ]);
  const advName = new Map((advisors ?? []).map((a) => [a.id as string, a.display_name as string]));
  const orgName = new Map((orgs ?? []).map((o) => [o.id as string, o.name as string]));
  const shown = status ? all.filter((l) => l.status === status) : all;
  const pos = position(all);
  const group = (title: string, key: (l: Line) => string) => {
    const t = totals(all, key);
    if (!t.size) return null;
    return (
      <div className="bg-white border ledger-border p-4">
        <p className="ledger-eyebrow">{title}</p>
        <ul className="mt-2 grid gap-1.5 text-[14px]">{[...t.entries()].sort((x, y) => x[0].localeCompare(y[0])).map(([k, m]) => <li key={k}><span className="font-medium">{k}</span><span className="block text-[13px] ledger-muted">{sums(m)}</span></li>)}</ul>
      </div>
    );
  };
  return (
    <div>
      <p className="ledger-eyebrow ledger-crimson">House desk</p>
      <h1 className="ledger-display text-[2rem] md:text-[2.6rem] leading-[1.1]">Commission ledger</h1>
      <p className="mt-3 max-w-2xl text-[15.5px] ledger-muted">One line per booking, fixed when it is recorded: the commissionable amount, the partner&rsquo;s rate, the advisor&rsquo;s tier and share. Amounts in different currencies are never added together.</p>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {[...pos.entries()].map(([c, p]) => (
          <div key={c} className="bg-white border ledger-border p-4 md:col-span-3 grid gap-2 sm:grid-cols-3">
            <div><p className="ledger-eyebrow">Owed to the house ({c})</p><p className="ledger-display text-[1.6rem] tabular-nums">{money(p.owedToHouse, c)}</p><p className="text-[12.5px] ledger-muted">Expected or invoiced to partners</p></div>
            <div><p className="ledger-eyebrow">Owed to advisors ({c})</p><p className="ledger-display text-[1.6rem] tabular-nums">{money(p.owedToAdvisors, c)}</p><p className="text-[12.5px] ledger-muted">Not yet paid</p></div>
            <div><p className="ledger-eyebrow">Paid to advisors ({c})</p><p className="ledger-display text-[1.6rem] tabular-nums">{money(p.paidToAdvisors, c)}</p></div>
          </div>
        ))}
        {!pos.size && <p className="md:col-span-3 text-[15px] ledger-muted">No commission recorded yet. Lines are recorded from confirmed advisor quote requests.</p>}
      </div>

      {all.length > 0 && (
        <section aria-label="Reports" className="mt-8 grid gap-3 md:grid-cols-2">
          {group("By partner", (l) => (l.organization_id && orgName.get(l.organization_id)) || "No partner on file")}
          {group("By property", (l) => l.stay_name)}
          {group("By advisor", (l) => (l.advisor_id && advName.get(l.advisor_id)) || "House")}
          {group("By month booked", (l) => month(l.booked_on))}
        </section>
      )}

      <nav aria-label="Filter by status" className="mt-10 flex flex-wrap gap-2 text-[13.5px]">
        <Link href="/desk/commissions" className={`house-chip border px-3 py-1.5 ${!status ? "border-[#2E2B28] bg-[#F4F2EF]" : "ledger-border"}`}>All ({all.length})</Link>
        {STATUSES.map((s) => <Link key={s} href={`/desk/commissions?status=${s}`} className={`house-chip border px-3 py-1.5 ${status === s ? "border-[#2E2B28] bg-[#F4F2EF]" : "ledger-border"}`}>{LINE_STATUS[s].label} ({all.filter((l) => l.status === s).length})</Link>)}
      </nav>
      <ul className="mt-3 border-y ledger-border divide-y ledger-border" aria-label="Commission lines">
        {shown.map((l) => (
          <li key={l.id}>
            <Link href={`/desk/commissions/${l.id}`} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3 group">
              <span className="ledger-id text-[12.5px]">{l.ref}</span>
              <span className="ledger-display text-[1.1rem] group-hover:underline">{l.stay_name}</span>
              <span className="text-[13.5px]">{l.client_name ?? ""} · arrives {niceDate(l.arrival)} · {(l.advisor_id && advName.get(l.advisor_id)) || "House"}</span>
              <span className="ml-auto flex items-center gap-3 text-[14px] tabular-nums"><StatusPill label={LINE_STATUS[l.status].label} tone={LINE_STATUS[l.status].tone} />{money(l.gross_minor, l.currency)}</span>
            </Link>
          </li>
        ))}
        {!shown.length && <li className="py-3 text-[15px] ledger-muted">Nothing here.</li>}
      </ul>
    </div>
  );
}
