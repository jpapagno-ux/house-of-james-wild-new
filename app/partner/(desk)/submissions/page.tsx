import { SubmissionActions } from "@/components/platform/forms";
import { Empty, PageHead, StatusPill } from "@/components/platform/ui";
import { requireDesk } from "@/lib/platform/membership";
import { portfolio, submissions } from "@/lib/platform/queries";
import { FIELD_LABEL, REVISION_STATUS, SUBMISSION_STATUS, niceDate, showValue } from "@/lib/platform/labels";

export const metadata = { title: "Updates & approvals" };

export default async function Submissions() {
  const desk = await requireDesk("/partner/submissions");
  const [subs, entities] = await Promise.all([submissions(desk), portfolio(desk)]);
  const name = new Map(entities.map((e) => [e.id, e.name]));
  return (
    <div>
      <PageHead eyebrow="Updates & approvals" title="Everything you've sent the house"
        lead="Each update is reviewed by James Wild & Co. Approved changes reach the website; anything else comes back to you with a note." />
      {subs.length === 0 && <div className="mt-8"><Empty title="Nothing sent yet">Answer a request, or open an entry in My Portfolio to propose a change.</Empty></div>}
      <ol className="mt-8 grid gap-4">
        {subs.map((s) => (
          <li key={s.id} className="border ledger-border p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="ledger-display text-[1.25rem] leading-tight">{s.title}</p>
                <p className="text-[13px] ledger-muted mt-1">{s.reference} · {s.property_id ? name.get(s.property_id) ?? "—" : desk.org.name} · sent {niceDate(s.submitted_at ?? s.created_at)}{s.decided_at ? ` · decided ${niceDate(s.decided_at)}` : ""}</p>
              </div>
              <StatusPill {...SUBMISSION_STATUS[s.status]} />
            </div>
            {s.revisions.length > 0 && (
              <table className="mt-3 w-full text-[14px] border-t ledger-border">
                <caption className="sr-only">Proposed changes</caption>
                <thead><tr className="text-left text-[12px] ledger-muted"><th className="py-2 font-normal">Field</th><th className="py-2 font-normal">On file</th><th className="py-2 font-normal">Proposed</th><th className="py-2 font-normal hidden sm:table-cell">Outcome</th></tr></thead>
                <tbody>
                  {s.revisions.map((r) => (
                    <tr key={r.id} className="border-t border-ink/10 align-top">
                      <td className="py-2 pr-3">{FIELD_LABEL[r.field] ?? r.field}</td>
                      <td className="py-2 pr-3 ledger-muted">{showValue(r.current_value)}</td>
                      <td className="py-2 pr-3">{showValue(r.proposed_value)}{r.final_value !== null && r.final_value !== undefined && showValue(r.final_value) !== showValue(r.proposed_value) && <span className="block text-[12.5px] text-forest">Published as: {showValue(r.final_value)}</span>}</td>
                      <td className="py-2 hidden sm:table-cell"><StatusPill {...REVISION_STATUS[r.status]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {s.partner_note && <p className="mt-3 text-[14.5px] whitespace-pre-line">{s.partner_note}</p>}
            {s.documents.length > 0 && <ul className="mt-2 text-[14px]">{s.documents.map((d, i) => <li key={i}><a href={d.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{d.name}</a></li>)}</ul>}
            {(s.jw_note || s.revisions.some((r) => r.jw_note)) && (
              <div className="mt-3 border-l-2 ledger-crimson-border pl-3 text-[14px]">
                <p className="ledger-eyebrow">From the house</p>
                {s.jw_note && <p className="mt-1 whitespace-pre-line">{s.jw_note}</p>}
                {s.revisions.filter((r) => r.jw_note).map((r) => <p key={r.id} className="mt-1">{FIELD_LABEL[r.field] ?? r.field}: {r.jw_note}</p>)}
              </div>
            )}
            {desk.membership && <SubmissionActions id={s.id} status={s.status} />}
          </li>
        ))}
      </ol>
    </div>
  );
}
