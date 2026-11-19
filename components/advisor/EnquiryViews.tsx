import Link from "next/link";
import { inboxCounts, inboxOrder, slugName, type Enquiry } from "@/lib/platform/enquiry-inbox";
import { DataList, Empty, StatusPill } from "@/components/platform/ui";

// The enquiry inbox, drawn the same on the Advisor Desk and the house desk (the house also sees who each
// enquiry is addressed to).

const TONE: Record<string, "attention" | "progress" | "good" | "neutral" | "closed"> = { New: "attention", Replied: "progress", Planning: "progress", Quoted: "progress", Booked: "good", Closed: "closed" };
const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "America/New_York" }) : "");

export function InboxList({ enquiries, root, advisorNames }: { enquiries: Enquiry[]; root: string; advisorNames?: Record<string, string> }) {
  if (!enquiries.length) return <div className="mt-8"><Empty title="No enquiries yet">New enquiries from the Plan form and Iggi land here the moment they are sent.</Empty></div>;
  const c = inboxCounts(enquiries);
  return (
    <>
      <dl className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
        {([["New", c.new], ["Open", c.open], ["Waiting over two days", c.unanswered]] as const).map(([label, n]) => (
          <div key={label} className="bg-white border ledger-border p-4"><dt className="ledger-eyebrow">{label}</dt><dd className={`ledger-display text-[2rem] leading-none mt-2 tabular-nums ${label !== "Open" && label !== "New" && n > 0 ? "text-house" : ""}`}>{n}</dd></div>
        ))}
      </dl>
      <ul className="mt-8 divide-y ledger-border border-y ledger-border">
        {inboxOrder(enquiries).map((e) => (
          <li key={e.recordId}>
            <Link href={`${root}/${e.recordId}`} className="grid gap-x-6 gap-y-1 py-4 md:grid-cols-[1.3fr_1.4fr_auto] md:items-baseline hover:bg-[#F7F5F2]">
              <span><span className="font-medium text-[15.5px]">{e.traveller || "Unnamed traveller"}</span><span className="block font-mono text-[12px] tracking-[0.06em] ledger-muted">{e.enquiryId}</span></span>
              <span className="text-[14.5px]">{[e.where, e.when].filter(Boolean).join(" · ") || <span className="ledger-muted">No destination given</span>}{advisorNames && <span className="block text-[13px] ledger-muted">{e.advisorIds.map((id) => advisorNames[id]).filter(Boolean).join(", ") || "No advisor"}</span>}</span>
              <span className="flex flex-wrap items-center gap-x-4 gap-y-1 md:justify-end"><StatusPill label={e.status} tone={TONE[e.status]} />{e.unanswered && <StatusPill label={`Waiting ${e.daysWaiting} days`} tone="attention" />}<span className="text-[13px] ledger-muted tabular-nums">{day(e.received)}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function EnquiryFacts({ e }: { e: Enquiry }) {
  const rows: [string, React.ReactNode][] = ([
    ["Received", day(e.received)], ["Email", e.email && <a href={`mailto:${e.email}`} className="underline underline-offset-4">{e.email}</a>], ["Phone", e.phone],
    ["Reply by", [e.replyBy, e.callTime].filter(Boolean).join(", ")], ["Where", e.where], ["When", e.when], ["Nights", e.nights],
    ["Party", e.adults !== null ? `${e.adults} adult${e.adults === 1 ? "" : "s"}${e.children ? `, ${e.children} child${e.children === 1 ? "" : "ren"}` : ""}` : ""],
    ["Budget", e.budget], ["Interests", e.interests.join(", ")], ["Message", e.message && <span className="whitespace-pre-wrap">{e.message}</span>],
    ["Asked about", e.askedAbout], ["Trip", [e.trip, e.option, e.addons].filter(Boolean).join(" · ")], ["Route", e.route],
    ["Estimate", e.estimate !== null ? e.estimate.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : ""],
    ["Folio", e.folio], ["What Iggi learned", e.iggiLearned && <span className="whitespace-pre-wrap">{e.iggiLearned}</span>], ["Their own advisor", e.ownAdvisor], ["Came from", e.source],
    ["Closed because", e.status === "Closed" ? e.closedReason : ""],
  ] as [string, React.ReactNode][]).filter(([, v]) => v);
  return <DataList rows={rows} />;
}

export const advisorNameMap = (rows: { recordId: string; slug: string }[]) => Object.fromEntries(rows.map((a) => [a.recordId, slugName(a.slug)]));
