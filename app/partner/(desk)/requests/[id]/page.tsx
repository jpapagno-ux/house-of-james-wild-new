import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplyForm } from "@/components/platform/forms";
import { DataList, Notice, PageHead, Section, StatusPill } from "@/components/platform/ui";
import { requireDesk } from "@/lib/platform/membership";
import { portfolio } from "@/lib/platform/queries";
import { REQUEST_STATUS, REQUEST_TYPE, SUBMISSION_STATUS, niceDate } from "@/lib/platform/labels";
import { isUuid } from "@/lib/platform/validate";

export const metadata = { title: "Request" };

const GUIDE: Record<string, string> = {
  media: "Show what changes at sunrise, not another empty lobby. 8–20 seconds for reels, natural movement, no embedded logo, minimal text and filtering, original resolution, real people when appropriate.",
  editorial: "Plain facts are best: what is there, what has changed, and when. The house writes the words on the website.",
  commercial: "Send the rate sheet as issued to the trade, with inclusions, exclusions, taxes, fees and validity dates.",
};

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const desk = await requireDesk(`/partner/requests/${id}`);
  const { data: r } = await desk.sb.from("content_requests").select("id, reference, property_id, request_type, requested_item, instructions, priority, due_date, status, created_at")
    .eq("id", id).eq("organization_id", desk.org.id).maybeSingle();
  if (!r) notFound();
  const entities = await portfolio(desk);
  const entity = r.property_id ? entities.find((e) => e.id === r.property_id) : null;
  if (r.property_id && !entity) notFound();
  const { data: replies } = await desk.sb.from("submissions").select("id, reference, title, partner_note, documents, status, submitted_at, jw_note, created_at").eq("request_id", r.id).order("created_at", { ascending: false });
  const answerable = ["open", "changes_requested"].includes(r.status) && !!desk.membership;
  return (
    <div>
      <p className="text-[13px] ledger-muted"><Link href="/partner/requests" className="hover:underline underline-offset-2">Requests</Link> / {r.reference}</p>
      <PageHead eyebrow={`${REQUEST_TYPE[r.request_type]} request`} title={r.requested_item} lead={<StatusPill {...REQUEST_STATUS[r.status]} />} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <DataList rows={[
            ["For", entity ? <Link key="e" href={`/partner/portfolio/${entity.legacy_cms_id}`} className="underline underline-offset-2">{entity.name}</Link> : desk.org.name],
            ["Reference", <span key="r" className="font-mono text-[13px]">{r.reference}</span>],
            ["Priority", r.priority === "high" ? "High" : r.priority === "low" ? "Low" : "Normal"],
            ["Due", niceDate(r.due_date)],
            ["Asked", niceDate(r.created_at)],
          ]} />
          {r.instructions && <div className="mt-6"><p className="ledger-eyebrow">From the house</p><p className="mt-2 text-[16px] leading-relaxed whitespace-pre-line">{r.instructions}</p></div>}
          <div className="mt-6"><Notice title="How the house likes it">{GUIDE[r.request_type]}</Notice></div>
        </div>
        <div>
          {answerable ? (
            <div className="bg-paper-card border ledger-border p-5 md:p-6"><p className="ledger-display text-[1.4rem] mb-4">{r.status === "changes_requested" ? "Send what the house asked for" : "Answer this request"}</p><ReplyForm requestId={r.id} defaultTitle={r.requested_item} /></div>
          ) : (
            <Notice>{desk.membership ? "This request has been answered. The house will tell you if anything more is needed." : "Viewing as James Wild & Co. Partners answer requests from here."}</Notice>
          )}
        </div>
      </div>
      {(replies ?? []).length > 0 && (
        <Section title="Your replies">
          <ol className="divide-y divide-ink/10 border-y ledger-border">
            {(replies ?? []).map((s) => (
              <li key={s.id} className="py-3">
                <div className="flex items-start justify-between gap-4"><p className="font-medium">{s.title} <span className="font-mono text-[11.5px] ledger-muted">{s.reference}</span></p><StatusPill {...SUBMISSION_STATUS[s.status]} /></div>
                {s.partner_note && <p className="mt-1 text-[14.5px] whitespace-pre-line">{s.partner_note}</p>}
                {(s.documents as { name: string; url: string }[]).length > 0 && <ul className="mt-1 text-[14px]">{(s.documents as { name: string; url: string }[]).map((d, i) => <li key={i}><a href={d.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{d.name}</a></li>)}</ul>}
                {s.jw_note && <p className="mt-2 border-l-2 ledger-crimson-border pl-3 text-[14px]"><span className="ledger-eyebrow">The house</span><br />{s.jw_note}</p>}
                <p className="text-[12.5px] ledger-muted mt-1">Sent {niceDate(s.submitted_at ?? s.created_at)}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}
