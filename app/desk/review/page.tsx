import Link from "next/link";
import { DecideRevision, DecideSubmission } from "@/components/platform/forms";
import { Empty, LedgerId, PageHead, StatusPill } from "@/components/platform/ui";
import { requireHouse } from "@/lib/platform/membership";
import { FIELD_LABEL, REVISION_STATUS, SUBMISSION_STATUS, niceDate, showValue } from "@/lib/platform/labels";

export const metadata = { title: "Review queue" };

type Row = {
  id: string; reference: string; kind: string; title: string; partner_note: string | null; documents: { name: string; url: string }[]; status: string;
  submitted_at: string | null; created_at: string; jw_note: string | null;
  organization: { name: string; partner_code: string | null } | null; property: { name: string; legacy_cms_id: string; publication_status: string } | null;
  request: { reference: string; requested_item: string } | null;
  revisions: { id: string; field: string; target_table: string; current_value: unknown; proposed_value: unknown; status: string; partner_note: string | null; jw_note: string | null }[];
};

// The house decides here: Approve, Edit + Approve, Reject or Ask Partner, field by
// field. Only approved values reach the record (public.decide_revision).
export default async function Review({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const desk = await requireHouse("/desk/review");
  const sp = await searchParams;
  const states = sp.show === "decided" ? ["approved", "partially_approved", "rejected", "withdrawn"] : ["submitted", "in_review", "changes_requested"];
  const { data } = await desk.sb.from("submissions")
    .select("id, reference, kind, title, partner_note, documents, status, submitted_at, created_at, jw_note, organization:organizations(name, partner_code), property:properties!property_id(name, legacy_cms_id, publication_status), request:content_requests!request_id(reference, requested_item), revisions(id, field, target_table, current_value, proposed_value, status, partner_note, jw_note)")
    .in("status", states).order("submitted_at", { ascending: true, nullsFirst: false }).limit(100);
  const rows = (data ?? []) as unknown as Row[];
  return (
    <div>
      <PageHead eyebrow="House desk · James Wild & Co" title="Review queue"
        lead="Partners contribute; the house publishes. Decide each proposed change, then the update."
        actions={<>
          <Link href="/desk/review" className={`ledger-btn ${sp.show === "decided" ? "" : "ledger-btn--solid"}`}>Waiting</Link>
          <Link href="/desk/review?show=decided" className={`ledger-btn ${sp.show === "decided" ? "ledger-btn--solid" : ""}`}>Decided</Link>
          <Link href="/partner" className="ledger-btn-ghost uppercase self-center">Partner Desk</Link>
        </>} />
      {rows.length === 0 && <div className="mt-8"><Empty title={sp.show === "decided" ? "Nothing decided yet" : "Nothing waiting"}>Partner updates appear here as they arrive.</Empty></div>}
      <ol className="mt-8 grid gap-5">
        {rows.map((s) => {
          const open = s.revisions.filter((r) => r.status === "proposed" || (r.status === "asked" && s.status === "submitted"));
          return (
            <li key={s.id} className="border ledger-border p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] ledger-muted">{s.organization?.name} {s.organization?.partner_code && <span className="font-mono">{s.organization.partner_code}</span>}{s.property && <> · {s.property.name} <LedgerId id={s.property.legacy_cms_id} /></>}</p>
                  <p className="ledger-display text-[1.35rem] leading-tight mt-1">{s.title}</p>
                  <p className="text-[12.5px] ledger-muted mt-1">{s.reference} · {s.kind.replace(/_/g, " ")}{s.request ? ` · answers ${s.request.reference} "${s.request.requested_item}"` : ""} · sent {niceDate(s.submitted_at ?? s.created_at)}{s.property?.publication_status === "published" ? " · live entry" : " · draft entry"}</p>
                </div>
                <StatusPill {...SUBMISSION_STATUS[s.status]} />
              </div>
              {s.partner_note && <p className="mt-3 text-[15px] whitespace-pre-line border-l-2 border-ink/20 pl-3">{s.partner_note}</p>}
              {s.documents.length > 0 && <ul className="mt-2 text-[14px]">{s.documents.map((d, i) => <li key={i}><a href={d.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{d.name}</a> <span className="ledger-muted text-[12px] break-all">{d.url}</span></li>)}</ul>}
              {s.revisions.map((r) => (
                <div key={r.id} className="mt-4 bg-paper-card border ledger-border p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="ledger-eyebrow">{FIELD_LABEL[r.field] ?? r.field} · {r.target_table === "properties" ? "entry" : "room"}</p><StatusPill {...REVISION_STATUS[r.status]} /></div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 text-[15px]">
                    <div><p className="text-[12px] ledger-muted">On file</p><p className="line-through decoration-ink/30">{showValue(r.current_value)}</p></div>
                    <div><p className="text-[12px] ledger-muted">Proposed</p><p className="font-medium">{showValue(r.proposed_value)}</p></div>
                  </div>
                  {r.partner_note && <p className="mt-2 text-[13.5px] ledger-muted">Partner: {r.partner_note}</p>}
                  {r.jw_note && <p className="mt-1 text-[13.5px]">House: {r.jw_note}</p>}
                  {(r.status === "proposed" || r.status === "asked") && sp.show !== "decided" && <DecideRevision id={r.id} proposed={showValue(r.proposed_value)} />}
                </div>
              ))}
              {s.revisions.length === 0 && sp.show !== "decided" && s.status !== "changes_requested" && <DecideSubmission id={s.id} />}
              {s.revisions.length === 0 && s.status === "changes_requested" && <p className="mt-3 text-[13.5px] ledger-muted">Waiting for the partner&rsquo;s answer{s.jw_note ? `: "${s.jw_note}"` : ""}.</p>}
              {open.length === 0 && s.revisions.length > 0 && s.status === "changes_requested" && <p className="mt-3 text-[13.5px] ledger-muted">Waiting for the partner&rsquo;s answer.</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
