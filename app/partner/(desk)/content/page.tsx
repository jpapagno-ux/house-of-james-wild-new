import Link from "next/link";
import { requireDesk } from "@/lib/platform/membership";
import { portfolio } from "@/lib/platform/queries";
import { CONTENT_FIELDS } from "@/lib/platform/content";
import { Empty, LedgerId, PageHead } from "@/components/platform/ui";

// Content: one line per property, how much the house holds, and the way in to propose changes.
export const dynamic = "force-dynamic";
export const metadata = { title: "Content · Partner Desk", robots: { index: false, follow: false } };

export default async function ContentIndex() {
  const desk = await requireDesk("/partner/content");
  const entities = await portfolio(desk);
  const ids = entities.map((e) => e.id);
  const [{ data: rows }, { data: open }] = await Promise.all([
    ids.length ? desk.sb.from("entity_content").select("*").in("id", ids) : Promise.resolve({ data: [] }),
    ids.length ? desk.sb.from("revisions").select("property_id").eq("target_table", "entity_content").in("status", ["proposed", "asked"]).in("property_id", ids) : Promise.resolve({ data: [] }),
  ]);
  const filled = new Map((rows ?? []).map((r: Record<string, unknown>) => [r.id as string, CONTENT_FIELDS.filter((f) => r[f.key] != null).length]));
  const waiting = new Map<string, number>();
  for (const r of (open ?? []) as { property_id: string }[]) waiting.set(r.property_id, (waiting.get(r.property_id) ?? 0) + 1);
  return (
    <div>
      <PageHead eyebrow="Content" title="Property content" lead="The facts behind each page: getting there, what's included, sustainability, conservation and community. Open a property to bring it up to date." />
      {entities.length === 0 ? <div className="mt-8"><Empty title="No properties yet" /></div> : (
        <ul className="mt-8 divide-y divide-ink/10 border-y ledger-border">
          {entities.map((e) => (
            <li key={e.id}>
              <Link href={`/partner/portfolio/${e.legacy_cms_id}/content`} className="group grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:items-center hover:bg-[#F7F5F2] -mx-3 px-3">
                <span className="flex flex-wrap items-baseline gap-x-3"><span className="ledger-display text-[1.25rem] group-hover:underline underline-offset-4 decoration-1">{e.name}</span><LedgerId id={e.legacy_cms_id} /></span>
                <span className="text-[13px] ledger-muted tabular-nums">{filled.get(e.id) ?? 0} of {CONTENT_FIELDS.length} fields approved{waiting.get(e.id) ? ` · ${waiting.get(e.id)} with the house` : ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
