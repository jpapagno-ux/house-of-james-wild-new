import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDesk } from "@/lib/platform/membership";
import { entityByLedger } from "@/lib/platform/queries";
import { isLedgerId } from "@/lib/platform/validate";
import { CONTENT_FIELDS } from "@/lib/platform/content";
import { siteValue } from "@/lib/platform/content-site";
import { LedgerId, Notice, PageHead } from "@/components/platform/ui";
import { ContentEditor, type EditorField } from "@/components/platform/ContentEditor";

// Property content (Stage 2 §3.1): what the house holds, what the site shows, and a place to
// propose changes. Partners propose; editors approve each field; the publish run takes it live.
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ ledgerId: string }> }) {
  return { title: `Content · ${(await params).ledgerId}`, robots: { index: false, follow: false } };
}

const asText = (v: unknown) => (Array.isArray(v) ? v.join("\n") : typeof v === "string" ? v : "");

export default async function ContentPage({ params }: { params: Promise<{ ledgerId: string }> }) {
  const { ledgerId } = await params;
  if (!isLedgerId(ledgerId)) notFound();
  const desk = await requireDesk(`/partner/portfolio/${ledgerId}/content`);
  const e = await entityByLedger(desk, ledgerId);
  if (!e) notFound();
  const [{ data: stored }, { data: open }] = await Promise.all([
    desk.sb.from("entity_content").select("*").eq("id", e.id).maybeSingle(),
    desk.sb.from("revisions").select("field").eq("property_id", e.id).eq("target_table", "entity_content").in("status", ["proposed", "asked"]),
  ]);
  const pending = new Set((open ?? []).map((r) => r.field as string));
  const fields: EditorField[] = CONTENT_FIELDS.map((f) => {
    const own = stored ? (stored as Record<string, unknown>)[f.key] : null;
    return { key: f.key, label: f.label, kind: f.kind, max: f.max, help: f.help, start: asText(own ?? siteValue(ledgerId, f.key)), pending: pending.has(f.key) };
  });
  const canPropose = !!desk.membership;

  return (
    <div>
      <PageHead eyebrow="Content" title={e.name}
        lead={<>The facts the house writes from. Change what&rsquo;s out of date and send it: each field is checked by an editor before it reaches the website. <LedgerId id={e.legacy_cms_id} /></>}
        actions={<Link href={`/partner/portfolio/${ledgerId}`} className="ledger-btn-ghost">Back to the entry</Link>} />
      <div className="mt-6"><Notice>The house writes the story and the headline in its own voice. What you give us here is what&rsquo;s true: the road in, what&rsquo;s included, what you do for the land and the people.</Notice></div>
      <div className="mt-8 max-w-3xl">
        {canPropose ? <ContentEditor propertyId={e.id} fields={fields} /> : (
          <>
            <Notice>You&rsquo;re viewing as the house. Partners propose changes here; you decide them in the review queue.</Notice>
            <dl className="mt-6 grid gap-6">
              {fields.map((f) => (
                <div key={f.key}><dt className="ledger-display text-[1.2rem]">{f.label}{f.pending ? <span className="ml-3 text-[12px] ledger-muted">change waiting</span> : null}</dt>
                  <dd className="mt-1 text-[15px] whitespace-pre-line">{f.start || <span className="ledger-muted">Nothing on file</span>}</dd></div>
              ))}
            </dl>
          </>
        )}
      </div>
    </div>
  );
}
