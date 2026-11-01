import { RecordCard } from "@/components/hub/Hub";
import { PathwayChips } from "@/components/pathways/Pathway";
import type { PathwayStay } from "@/lib/content/pathways";
import type { Pathway } from "@/lib/pathways";
import { REGIONS } from "@/lib/site";
import { altFor } from "@/lib/content/stays";
import { verdictFor } from "@/lib/content/verdicts";
import SafeLink from "@/components/ledger/SafeLink";

// A pathway as a collection, not a list (1 Nov 2026). With the whole Ledger
// classified, a pathway can hold two hundred entries; a flat grid stops being
// editorial. Entries are gathered by region (largest first), then by country
// inside any region with more than a dozen, with the founder's places first
// in each. Every region block carries a one-line answer (how many, where,
// how many with a Field Verdict or giving-back on record) and links to the
// region's own destination page: the pathways cross-link the volumes rather
// than compete with them. The ItemList schema on the page is unchanged.

type Block = { slug: string; label: string; href: string | null; items: PathwayStay[]; countries: { label: string; items: PathwayStay[] }[] };

const FOUNDER = (s: string | null | undefined) => (s ?? "").startsWith("founder") ? 0 : 1;
const byFounderThenName = (a: PathwayStay, b: PathwayStay) => FOUNDER(a.stay.status) - FOUNDER(b.stay.status) || a.stay.name.localeCompare(b.stay.name);

export function collect(items: PathwayStay[], pathwayId: string): Block[] {
  const regions = new Map<string, PathwayStay[]>();
  for (const r of items) {
    const key = r.stay.regionSlug ?? "elsewhere";
    regions.set(key, [...(regions.get(key) ?? []), r]);
  }
  const blocks: Block[] = [];
  for (const [slug, rs] of regions) {
    const meta = REGIONS.find((x) => x.slug === slug);
    // Primary entries before secondary, founder-marked first within each, then by name.
    const sorted = [...rs].sort((a, b) => Number(b.primaryPathway === pathwayId) - Number(a.primaryPathway === pathwayId) || byFounderThenName(a, b));
    const countries = new Map<string, PathwayStay[]>();
    for (const r of sorted) countries.set(r.stay.country ?? "—", [...(countries.get(r.stay.country ?? "—") ?? []), r]);
    blocks.push({
      slug, label: meta?.label ?? "Elsewhere", href: meta?.href ?? null, items: sorted,
      countries: [...countries.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).map(([label, items]) => ({ label, items })),
    });
  }
  return blocks.sort((a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label));
}

/** The one-line answer for a region block: counts a reader (or an answer engine) can quote. */
export function blockAnswer(b: Block, pathway: Pathway): string {
  const n = b.items.length;
  const verdicts = b.items.filter((r) => !!verdictFor(`stay:${r.slug}`)).length;
  const giving = b.items.filter((r) => r.impact.some((s) => !!s.source && (s.status === "verified" || s.status === "partner_reported"))).length;
  const founder = b.items.filter((r) => (r.stay.status ?? "").startsWith("founder")).length;
  const where = b.countries.length === 1 ? b.countries[0].label : `${b.countries.length} countries, led by ${b.countries.slice(0, 3).map((c) => c.label).join(", ")}`;
  const parts = [`${n} ${n === 1 ? "entry" : "entries"} on ${pathway.name} in ${b.label}: ${where}`];
  if (founder) parts.push(`${founder} the founder has stayed at or vetted`);
  if (verdicts) parts.push(`${verdicts} with James's Field Verdict`);
  if (giving) parts.push(`${giving} with what the stay gives back on record`);
  return parts.join("; ") + ".";
}

function Cards({ items, hrefFor }: { items: PathwayStay[]; hrefFor: (p: Pathway) => string }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((r) => (
        <li key={r.slug} className="flex flex-col gap-3">
          <RecordCard name={r.stay.name} id={r.ledgerId ?? r.slug} line={r.stay.tagline ?? r.primary.setting} image={{ url: r.stay.hero ?? "", alt: altFor(r.stay.hero ?? "", r.stay.name, r.stay.country) }} href={r.href} eyebrow={r.stay.country ?? undefined} />
          <PathwayChips primary={r.primary} secondary={r.secondary} hrefFor={hrefFor} />
        </li>
      ))}
    </ul>
  );
}

export default function PathwayCollection({ items, pathway, hrefFor }: { items: PathwayStay[]; pathway: Pathway; hrefFor: (p: Pathway) => string }) {
  const blocks = collect(items, pathway.id);
  return (
    <div className="grid gap-14">
      {blocks.length > 1 && (
        <nav aria-label="Regions on this pathway" className="flex flex-wrap gap-2 -mt-2">
          {blocks.map((b) => <a key={b.slug} href={`#${pathway.key}-${b.slug}`} className="border ledger-border px-3 py-1.5 text-[13px] hover:border-crimson">{b.label} <span className="ledger-muted">{b.items.length}</span></a>)}
        </nav>
      )}
      {blocks.map((b) => (
        <section key={b.slug} id={`${pathway.key}-${b.slug}`} aria-labelledby={`${pathway.key}-${b.slug}-h`} className="scroll-mt-32">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <p className="ledger-eyebrow">{b.label} · {b.items.length}</p>
              <h3 id={`${pathway.key}-${b.slug}-h`} className="ledger-display text-[1.5rem] md:text-[1.9rem] mt-1">{pathway.name} in {b.label}</h3>
              <p className="mt-2 text-[15px] ledger-muted max-w-2xl">{blockAnswer(b, pathway)}</p>
            </div>
            {b.href && <SafeLink href={b.href} className="ledger-btn-ghost self-start md:self-auto">{b.label}, the destination</SafeLink>}
          </div>
          {b.items.length > 12 && b.countries.length > 1 ? (
            <div className="mt-6 grid gap-10">
              {b.countries.map((c) => (
                <div key={c.label}>
                  <h4 className="ledger-eyebrow mb-4">{c.label} · {c.items.length}</h4>
                  <Cards items={c.items} hrefFor={hrefFor} />
                </div>
              ))}
            </div>
          ) : <div className="mt-6"><Cards items={b.items} hrefFor={hrefFor} /></div>}
        </section>
      ))}
    </div>
  );
}
