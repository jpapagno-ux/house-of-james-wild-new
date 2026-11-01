import Link from "next/link";
import { notFound } from "next/navigation";
import { PathwayChips } from "@/components/pathways/Pathway";
import { ProposeChange, ReplyForm } from "@/components/platform/forms";
import { CheckLine, DataList, Empty, LedgerId, Notice, PageHead, Panel, Section, StatusPill } from "@/components/platform/ui";
import { requireDesk } from "@/lib/platform/membership";
import { entityByLedger, health, libraryFor, portfolio, requests, roomsFor, submissions, verificationsFor } from "@/lib/platform/queries";
import { ENTITY_TYPE, FIELD_LABEL, PROVENANCE, PUBLICATION, REQUEST_STATUS, REQUEST_TYPE, REVISION_STATUS, SUBMISSION_STATUS, niceDate, showValue } from "@/lib/platform/labels";
import { isLedgerId } from "@/lib/platform/validate";
import { stayBySlug } from "@/lib/content/stays";
import { VOLUME_STYLES, volumeInk } from "@/lib/volumes";

export async function generateMetadata({ params }: { params: Promise<{ ledgerId: string }> }) {
  return { title: (await params).ledgerId };
}

export default async function EntityPage({ params }: { params: Promise<{ ledgerId: string }> }) {
  const { ledgerId } = await params;
  if (!isLedgerId(ledgerId)) notFound();
  const desk = await requireDesk(`/partner/portfolio/${ledgerId}`);
  const e = await entityByLedger(desk, ledgerId);
  if (!e) notFound();
  const all = await portfolio(desk);
  const [h, ownRooms, reqs, subs, verifs, partners] = await Promise.all([
    health(desk, [e]), roomsFor(desk, e.id), requests(desk, { propertyId: e.id }), submissions(desk, { propertyId: e.id, limit: 30 }), verificationsFor(desk, e.id),
    desk.sb.from("entity_partners").select("role, is_primary, organization:organizations(name)").eq("property_id", e.id),
  ]);
  const parent = e.parent_property_id ? all.find((x) => x.id === e.parent_property_id) ?? null : null;
  const children = all.filter((x) => x.parent_property_id === e.id);
  const parentRooms = ownRooms.length === 0 && e.parent_property_id ? await roomsFor(desk, e.parent_property_id) : [];
  const lib = libraryFor(e.legacy_cms_id);
  const checks = h.get(e.id)?.checks ?? [];
  const score = h.get(e.id)?.score ?? 0;
  const pub = PUBLICATION[e.publication_status] ?? PUBLICATION.draft;
  const openReqs = reqs.filter((r) => ["open", "changes_requested"].includes(r.status));
  const canSubmit = !!desk.membership;
  const roles = new Map<string, string[]>();
  for (const p of (partners.data ?? []) as unknown as { role: string; organization: { name: string } | null }[]) {
    const n = p.organization?.name ?? "—"; roles.set(n, [...(roles.get(n) ?? []), p.role.replace(/_/g, " ")]);
  }

  return (
    <div>
      <p className="text-[13px] ledger-muted"><Link href="/partner/portfolio" className="hover:underline underline-offset-2">My Portfolio</Link> / {e.name}</p>
      <PageHead eyebrow={e.volumes.map((v) => `Vol. ${VOLUME_STYLES[v].roman} ${v === "europe" ? "The Other Europe" : VOLUME_STYLES[v].short}`).join(" · ") || "Entry"} title={e.name}
        lead={<span className="flex flex-wrap items-center gap-3"><LedgerId id={e.legacy_cms_id} /><StatusPill {...pub} /><span className="text-[14px]">Health {score}%</span></span>}
        actions={e.publication_status === "published" && stayBySlug(e.slug) ? <Link href={`/stays/${e.slug}`} className="ledger-btn-ghost uppercase" target="_blank" rel="noopener">See it on the website ↗</Link> : undefined} />

      {e.provenance === "PUBLIC_SOURCE" && (
        <div className="mt-6"><Notice tone="attention" title="Drafted from public sources">The house drafted this entry from your own website. It stays off the public site until you confirm the facts; see the open request below.</Notice></div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <DataList rows={[
            ["Ledger ID", <LedgerId key="l" id={e.legacy_cms_id} />],
            ["Volume", <span key="v" className="flex flex-wrap gap-3">{e.volumes.map((v) => <span key={v} style={{ color: volumeInk(v) }}>{v === "europe" ? "The Other Europe" : VOLUME_STYLES[v].label}</span>)}</span>],
            ["Type", [e.entity_type ? ENTITY_TYPE[e.entity_type] : null, e.entity_kind].filter(Boolean).join(" · ") || "—"],
            ["Destination", [e.destination?.name, e.destination?.parent?.name].filter(Boolean).join(", ") || "—"],
            ["Country", e.country ?? "—"],
            ...(parent ? [["Within", <Link key="p" href={`/partner/portfolio/${parent.legacy_cms_id}`} className="underline underline-offset-2">{parent.name}</Link>] as [string, React.ReactNode]] : []),
            ...(children.length ? [["Includes", <span key="c">{children.map((c, i) => <span key={c.id}>{i ? ", " : ""}<Link href={`/partner/portfolio/${c.legacy_cms_id}`} className="underline underline-offset-2">{c.name}</Link></span>)}</span>] as [string, React.ReactNode]] : []),
            ["Connected partners", [...roles.entries()].map(([n, r]) => `${n} (${r.join(", ")})`).join("; ") || "—"],
            ["Source", e.provenance ? PROVENANCE[e.provenance] : "—"],
            ["Last verified", niceDate(e.last_verified_at)],
          ]} />
          <p className="mt-3 text-[12.5px] ledger-muted">The Ledger ID, publication status, Pathway assignments and the website&rsquo;s layout and copy are kept by the house.</p>
        </div>
        <Panel>
          <p className="ledger-eyebrow">Health of this entry</p>
          <ul className="mt-2 divide-y divide-ink/10">{checks.map((c) => <CheckLine key={c.key} state={c.state} label={c.label} detail={c.detail} />)}</ul>
          {verifs.length > 0 && <p className="mt-3 text-[12.5px] ledger-muted">House verifications: {verifs.map((v) => `${v.aspect.replace(/_/g, " ")} ${niceDate(v.verified_at)}`).join(" · ")}</p>}
        </Panel>
      </div>

      <Section title="Pathways">
        {lib.pathways ? (
          <div className="grid gap-2"><PathwayChips primary={lib.pathways.primary} secondary={lib.pathways.secondary} /><p className="text-[13px] ledger-muted">{lib.pathwayStatus === "approved" ? "Approved by the house." : "Draft classification by the house."} Suggesting Pathways arrives with content editing.</p></div>
        ) : <p className="text-[15px] ledger-muted">Not yet classified. The house assigns Pathways; you&rsquo;ll be able to suggest them with content editing.</p>}
      </Section>

      <Section title="Rooms & accommodation" aside={<span className="ledger-muted">Read-only until Stage 2</span>}>
        {ownRooms.length === 0 && parentRooms.length === 0 ? <Empty title="No rooms on file">Send the house your room list in reply to a request, or as an update below.</Empty> : (
          <>
            {ownRooms.length === 0 && <p className="mb-3 text-[13.5px] ledger-muted">Rooms are held on {parent?.name ?? "the reserve"}&rsquo;s record for now; the house will move them to each lodge.</p>}
            <ul className="grid gap-3 sm:grid-cols-2">
              {(ownRooms.length ? ownRooms : parentRooms).map((r) => (
                <li key={r.id} className="border ledger-border p-4">
                  <p className="ledger-display text-[1.15rem] leading-tight">{r.name}</p>
                  <p className="text-[13px] ledger-muted mt-1">{[r.unit_type, r.bed_configuration, r.size_sqm ? `${r.size_sqm} m²` : null, r.max_occupancy ? `sleeps ${r.max_occupancy}` : null].filter(Boolean).join(" · ") || "Details to confirm"}</p>
                  {r.occupancy_status === "unverified" && <p className="text-[12px] text-rust mt-1">Occupancy not yet verified</p>}
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <Section title="Requests for this entry" aside={<Link href="/partner/requests" className="ledger-btn-ghost uppercase">All requests</Link>}>
        {reqs.length === 0 ? <p className="text-[15px] ledger-muted">No requests.</p> : (
          <ul className="divide-y divide-ink/10 border-y ledger-border">
            {reqs.map((r) => (
              <li key={r.id} className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0"><Link href={`/partner/requests/${r.id}`} className="font-medium hover:underline underline-offset-2">{r.requested_item}</Link><p className="text-[13px] ledger-muted">{REQUEST_TYPE[r.request_type]} · {r.reference}{r.due_date ? ` · due ${niceDate(r.due_date)}` : ""}</p></div>
                <StatusPill {...REQUEST_STATUS[r.status]} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {canSubmit && (
        <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
          <Section title="Propose a change">
            <p className="mb-4 text-[14px] ledger-muted">Changes go to the house for approval. Rooms, rates, offers and full content editing arrive in Stage 2.</p>
            <ProposeChange propertyId={e.id} fields={(["name", "category", "country", "region", "timezone"] as const).map((k) => ({ key: k, label: FIELD_LABEL[k], current: (e[k] as string | null) ?? null }))} />
          </Section>
          <Section title="Send the house an update">
            <ReplyForm propertyId={e.id} defaultTitle={`Update for ${e.name}`} />
          </Section>
        </div>
      )}
      {!canSubmit && openReqs.length > 0 && <div className="mt-8"><Notice>You are viewing as James Wild &amp; Co. Partners answer requests; the house reviews them in the review queue.</Notice></div>}

      <Section title="History">
        {subs.length === 0 ? <p className="text-[15px] ledger-muted">No updates yet.</p> : (
          <ol className="divide-y divide-ink/10 border-y ledger-border">
            {subs.map((s) => (
              <li key={s.id} className="py-3">
                <div className="flex items-start justify-between gap-4"><p className="font-medium">{s.title} <span className="font-mono text-[11.5px] ledger-muted">{s.reference}</span></p><StatusPill {...SUBMISSION_STATUS[s.status]} /></div>
                {s.revisions.map((r) => (
                  <p key={r.id} className="text-[13.5px] mt-1"><span className="ledger-muted">{FIELD_LABEL[r.field] ?? r.field}:</span> {showValue(r.current_value)} → <strong className="font-medium">{showValue(r.final_value ?? r.proposed_value)}</strong> <span className="ledger-muted">({REVISION_STATUS[r.status]?.label})</span></p>
                ))}
                <p className="text-[12.5px] ledger-muted mt-1">Sent {niceDate(s.submitted_at ?? s.created_at)}{s.decided_at ? ` · decided ${niceDate(s.decided_at)}` : ""}</p>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </div>
  );
}
