import Link from "next/link";
import { notFound } from "next/navigation";
import { requireHouse } from "@/lib/platform/membership";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { advisorRequests } from "@/lib/platform/advisor-file-data";
import { OPEN, REQUEST_STATUS, money, nightsBetween, party } from "@/lib/platform/advisor-requests";
import { niceDate } from "@/lib/platform/labels";
import { StatusPill } from "@/components/platform/ui";

export const metadata = { title: "Advisor quote requests" };

// /desk/advisor-requests: every advisor's quote requests, open ones first. House operations, with the code.
export default async function HouseAdvisorRequests() {
  if (!ADVISOR_DESK) notFound();
  const desk = await requireHouse("/desk/advisor-requests");
  const [rows, { data: advisors }] = await Promise.all([advisorRequests(desk.sb), desk.sb.from("advisors").select("id, display_name, adv_number")]);
  const who = new Map((advisors ?? []).map((x) => [x.id as string, `${x.display_name} (${x.adv_number})`]));
  const open = rows.filter((r) => OPEN.includes(r.status)), closed = rows.filter((r) => !OPEN.includes(r.status));
  const List = ({ items }: { items: typeof rows }) => (
    <ul className="mt-3 border-y ledger-border divide-y ledger-border">
      {items.map((r) => {
        const s = REQUEST_STATUS[r.status];
        return (
          <li key={r.id}>
            <Link href={`/desk/advisor-requests/${r.id}`} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3 group">
              <span className="ledger-id text-[12.5px]">{r.ref}</span>
              <span className="ledger-display text-[1.15rem] group-hover:underline">{r.stay_name}</span>
              <span className="text-[14px]">{r.client_name} · {niceDate(r.arrival)}, {nightsBetween(r.arrival, r.departure)} nights · {party(r.adults, r.child_ages)}</span>
              <span className="text-[13px] ledger-muted">{who.get(r.advisor_id) ?? "Advisor"}</span>
              <span className="ml-auto flex items-center gap-3"><StatusPill label={s.label} tone={s.tone} />{r.price_minor && r.currency ? <span className="tabular-nums text-[14px]">{money(r.price_minor, r.currency)}</span> : null}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
  return (
    <div>
      <p className="ledger-eyebrow ledger-crimson">House desk</p>
      <h1 className="ledger-display text-[2rem] md:text-[2.6rem] leading-[1.1]">Advisor quote requests</h1>
      <p className="mt-3 max-w-2xl text-[15.5px] ledger-muted">Price each request, check space with the property and hold it; the advisor sees every step and shares the quote with their client.</p>
      <h2 className="mt-8 ledger-display text-[1.4rem]">Open ({open.length})</h2>
      {open.length ? <List items={open} /> : <p className="mt-2 text-[15px] ledger-muted">Nothing waiting.</p>}
      {closed.length > 0 && (<><h2 className="mt-10 ledger-display text-[1.4rem]">Closed</h2><List items={closed.slice(0, 50)} /></>)}
    </div>
  );
}
