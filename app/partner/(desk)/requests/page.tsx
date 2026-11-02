import Link from "next/link";
import { requireDesk } from "@/lib/platform/membership";
import { portfolio, requests } from "@/lib/platform/queries";
import { REQUEST_STATUS, REQUEST_TYPE, niceDate } from "@/lib/platform/labels";
import { Empty, PageHead, Section, StatusPill } from "@/components/platform/ui";

export const metadata = { title: "Requests" };

export default async function Requests() {
  const desk = await requireDesk("/partner/requests");
  const [all, entities] = await Promise.all([requests(desk), portfolio(desk)]);
  const visible = new Set(entities.map((e) => e.id));
  const list = all.filter((r) => !r.property_id || visible.has(r.property_id));
  const name = new Map(entities.map((e) => [e.id, e.name]));
  const groups = [
    { title: "Waiting for you", rows: list.filter((r) => ["open", "changes_requested"].includes(r.status)) },
    { title: "With the house", rows: list.filter((r) => r.status === "submitted") },
    { title: "Complete", rows: list.filter((r) => ["approved", "closed", "cancelled"].includes(r.status)) },
  ];
  return (
    <div>
      <PageHead eyebrow="Requests" title="What the house has asked for"
        lead="Photography, reels, facts to confirm, next year's rates. Answer each with a note and links; the house reviews what you send." />
      {list.length === 0 && <div className="mt-8"><Empty title="No requests">When the house needs something, it appears here.</Empty></div>}
      {groups.filter((g) => g.rows.length).map((g) => (
        <Section key={g.title} title={g.title} aside={<span className="ledger-muted">{g.rows.length}</span>}>
          <ul className="divide-y divide-ink/10 border-y ledger-border">
            {g.rows.map((r) => (
              <li key={r.id}>
                <Link href={`/partner/requests/${r.id}`} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-center hover:bg-paper-card -mx-3 px-3">
                  <div className="min-w-0">
                    <p className="font-medium">{r.requested_item}{r.priority === "high" && <span className="ml-2 text-[11px] tracking-[0.14em] uppercase text-rust">Priority</span>}</p>
                    <p className="text-[13px] ledger-muted">{REQUEST_TYPE[r.request_type]} · {r.property_id ? name.get(r.property_id) : desk.org.name} · {r.reference}{r.due_date ? ` · due ${niceDate(r.due_date)}` : ""}</p>
                  </div>
                  <StatusPill {...REQUEST_STATUS[r.status]} />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ))}
    </div>
  );
}
