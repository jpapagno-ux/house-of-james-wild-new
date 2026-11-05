import Link from "next/link";
import { DecideRevision, DecideSubmission } from "@/components/platform/forms";
import { DecideHost } from "@/components/platform/HostForms";
import { Empty, LedgerId, Notice, PageHead, StatusPill } from "@/components/platform/ui";
import { requireHouse } from "@/lib/platform/membership";
import { FIELD_LABEL, REVISION_STATUS, SUBMISSION_STATUS, niceDate, showValue } from "@/lib/platform/labels";
import { CONTENT_FIELD } from "@/lib/platform/content";
import { ROOM_FIELD } from "@/lib/platform/rooms";
import { siteValue } from "@/lib/platform/content-site";

// Content lists read one per line; everything else as before.
const showLines = (v: unknown) => (Array.isArray(v) ? (v.length ? v.join("\n") : "\u2014") : showValue(v));

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
  // Publish run (D-18 A): approved property content waiting to reach the Library.
  const { data: queued } = await desk.sb.from("revisions").select("target_id, property:properties!property_id(name)")
    .eq("target_table", "entity_content").in("status", ["approved", "edited_approved"]).is("published_at", null).limit(500);
  // Hosts proposed on the desk (James, 4 Nov 2026): the house approves who appears on a page's host card.
  const { data: hostRows } = await desk.sb.from("site_hosts")
    .select("id, page_key, name, card_line, place, partner_note, created_at, organization:organizations(name), page:host_pages(label)")
    .eq("status", "proposed").order("created_at").limit(100);
  const proposedHosts = (hostRows ?? []) as unknown as { id: string; page_key: string; name: string; card_line: string | null; place: string | null; partner_note: string | null; organization: { name: string } | null; page: { label: string } | null }[];
  const queuedStays = [...new Set(((queued ?? []) as unknown as { property: { name: string } | null }[]).map((q) => q.property?.name).filter(Boolean))];
  return (
    <div>
      <PageHead eyebrow="House desk · James Wild & Co" title="Review queue"
        lead="Partners contribute; the house publishes. Decide each proposed change, then the update."
        actions={<>
          <Link href="/desk/review" className={`ledger-btn ${sp.show === "decided" ? "" : "ledger-btn--solid"}`}>Waiting</Link>
          <Link href="/desk/review?show=decided" className={`ledger-btn ${sp.show === "decided" ? "ledger-btn--solid" : ""}`}>Decided</Link>
          <Link href="/desk/commission" className="ledger-btn-ghost uppercase self-center">Commission check</Link>
          <Link href="/partner" className="ledger-btn-ghost uppercase self-center">Partner Desk</Link>
        </>} />
      {proposedHosts.length > 0 && (
        <section className="mt-8 border ledger-border bg-white p-5" aria-label="Hosts to approve">
          <p className="ledger-eyebrow">Hosts to approve · {proposedHosts.length}</p>
          <ul className="mt-3 divide-y divide-ink/10">
            {proposedHosts.map((h) => (
              <li key={h.id} className="py-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="font-medium">{h.name}<span className="ml-2 text-[13.5px] ledger-muted">{h.card_line}</span></p>
                  <p className="text-[13px] ledger-muted">{h.organization?.name} · {h.page?.label ?? h.page_key}{h.place ? ` · ${h.place}` : ""}</p>
                  {h.partner_note && <p className="text-[13.5px] mt-1">{h.partner_note}</p>}
                </div>
                <DecideHost id={h.id} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {queuedStays.length > 0 && (
        <div className="mt-6"><Notice title="Approved, waiting for the publish run">
          Content for {queuedStays.join(", ")} goes to the Library in the next publish run: a pull request James merges, after which the stay pages follow. Room changes are live on the desk as soon as they are approved.
        </Notice></div>
      )}
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
                <div key={r.id} className="mt-4 bg-white border ledger-border p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="ledger-eyebrow">{r.target_table === "entity_content" ? CONTENT_FIELD[r.field]?.label ?? r.field : r.target_table === "room_types" ? ROOM_FIELD[r.field]?.label ?? FIELD_LABEL[r.field] ?? r.field : FIELD_LABEL[r.field] ?? r.field} · {r.target_table === "properties" ? "entry" : r.target_table === "entity_content" ? "content" : "room"}</p><StatusPill {...REVISION_STATUS[r.status]} /></div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 text-[15px]">
                    <div>
                      {(() => {
                        const site = r.target_table === "entity_content" && r.current_value == null && s.property ? siteValue(s.property.legacy_cms_id, r.field) : null;
                        return site
                          ? <><p className="text-[12px] ledger-muted">On the site now</p><p className="whitespace-pre-line">{showLines(site)}</p></>
                          : <><p className="text-[12px] ledger-muted">On file</p><p className="line-through decoration-ink/30 whitespace-pre-line">{showLines(r.current_value)}</p></>;
                      })()}
                    </div>
                    <div><p className="text-[12px] ledger-muted">Proposed</p><p className="font-medium whitespace-pre-line">{showLines(r.proposed_value)}</p></div>
                  </div>
                  {r.partner_note && <p className="mt-2 text-[13.5px] ledger-muted">Partner: {r.partner_note}</p>}
                  {r.jw_note && <p className="mt-1 text-[13.5px]">House: {r.jw_note}</p>}
                  {(r.status === "proposed" || r.status === "asked") && sp.show !== "decided" && <DecideRevision id={r.id} proposed={showLines(r.proposed_value)} />}
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
