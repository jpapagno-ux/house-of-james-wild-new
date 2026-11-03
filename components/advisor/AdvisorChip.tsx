import Link from "next/link";
import { ADVISORS, DEFAULT_ADVISOR, JAMES_HEADS_EVERY_PAGE, advisorsFor, countryOfRecord, whoCarries, type Advisor } from "@/lib/content/advisors";
import { Headshot } from "@/components/advisor/Desk";
import { PATHWAYS, type PathwayId } from "@/lib/pathways";
import { pathwayHref } from "@/lib/content/pathways/flag";
import { COUNTRIES } from "@/lib/content/countries";
import { GREEN_INK, type Volume } from "@/lib/content/advisor-desk";
import { founderOceanForCountry, founderOceanForPathway } from "@/lib/content/founder-ocean";

// AdvisorChip — the advisor's light touch where the traveller is actually reading
// (2 Nov 2026): the country page under the answer, the stay glance, the Pathway
// hub. One compact card: roundel, name + ADV, place + two Pathways, their own line
// once confirmed, one CTA pre-addressed to them. James leads while the house is in
// testing (HANDOFF §1); the matched real advisor is named with him. Stand-ins
// never appear here (A6). Reads the same ranking as "Who plans it" and the feed.

type Where = { countrySlug?: string | null; regionSlug?: string | null; volume?: Volume; ledgerId?: string | null };

const james = () => ADVISORS.find((a) => a.slug === DEFAULT_ADVISOR)!;
const countryName = (slug: string) => COUNTRIES.find((c) => c.slug === slug)?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const pathNames = (a: Advisor, n = 2) => (a.dna?.pathways ?? []).slice(0, n).map((p) => PATHWAYS[p as PathwayId]).filter(Boolean);

/** Who to show for a place: James as lead while testing, plus the first real advisor the ranking puts ahead of him. */
export function chipFor(where: Where): { lead: Advisor; withA: Advisor | null; others: Advisor[] } {
  const { advisors } = advisorsFor(where);
  const j = james();
  const real = advisors.filter((a) => !a.sample);
  const lead = JAMES_HEADS_EVERY_PAGE ? j : real[0] ?? j;
  const firstReal = real.find((a) => a !== j) ?? null;
  const jamesAt = real.indexOf(j);
  const withA = JAMES_HEADS_EVERY_PAGE && firstReal && (jamesAt === -1 || real.indexOf(firstReal) < jamesAt) ? firstReal : null;
  const others = real.filter((a) => a !== lead && a !== withA).slice(0, 3);
  return { lead, withA, others };
}

function Person({ a, place, markLine, compact, credential }: { a: Advisor; place: string; markLine?: string | null; compact?: boolean; credential?: string | null }) {
  const paths = pathNames(a);
  return (
    <div className="flex gap-3 items-start min-w-0">
      <Link href={a.profileHref ?? "/about/team#advisors"} className="shrink-0"><Headshot a={a} size={compact ? 40 : 52} /></Link>
      <div className="min-w-0">
        <p className="leading-tight"><Link href={a.profileHref ?? "/about/team#advisors"} className="ledger-display text-[17px] hover:ledger-crimson">{a.name}</Link> <span className="ledger-id text-[10.5px]">{a.ledgerId}</span></p>
        <p className="text-[12.5px] ledger-muted mt-0.5 sm:truncate">
          {markLine ?? `Knows ${place}`}{paths.length ? <> · {paths.map((p, i) => <span key={p.id}>{i > 0 ? ", " : ""}<Link href={pathwayHref(p.key)} className="hover:ledger-crimson">{p.name}</Link></span>)}</> : null}
        </p>
        {credential && <p className="text-[12.5px] mt-0.5" style={{ color: GREEN_INK }}>{credential}</p>}
        {!compact && a.line && <p className="mt-1 ledger-display italic text-[14.5px] leading-snug" style={{ color: GREEN_INK }}>&ldquo;{a.line}&rdquo;</p>}
      </div>
    </div>
  );
}

/** The chip for a place (country or stay). `place` is the name shown; where carries the slugs. */
export default function AdvisorChip({ where, place, compact = false, className = "" }: { where: Where; place: string; compact?: boolean; className?: string }) {
  const { lead, withA, others } = chipFor(where);
  const founder = lead.slug === DEFAULT_ADVISOR;
  const shown = withA ?? lead;
  // The matched advisor's own mark here, if any: "Sailed It, Nov 2024" beats "Knows Indonesia".
  const mark = (shown.dna?.marks ?? []).find((m) => (where.ledgerId ? m.ledgerId === where.ledgerId : where.countrySlug ? countryOfRecord(m.ledgerId) === where.countrySlug : false));
  const markLine = mark ? `${mark.mark}${mark.when ? `, ${mark.when}` : ""}` : null;
  const knows = where.countrySlug ? countryName(where.countrySlug) : place; // "Knows Costa Rica", never "Knows Arenas del Mar"
  const plan = `/plan?advisor=${shown.slug}&destination=${encodeURIComponent(where.countrySlug ?? where.regionSlug ?? "")}${where.ledgerId ? `&trip=${encodeURIComponent(place)}` : ""}`;
  return (
    <aside className={`border ledger-border bg-paper p-4 md:p-5 ${className}`} aria-label={`Who plans ${place}`}>
      <p className="ledger-eyebrow" style={{ color: GREEN_INK }}>Who plans {place}</p>
      <div className={`mt-3 grid gap-4 ${withA ? "md:grid-cols-2" : ""}`}>
        <Person a={lead} place={knows} markLine={founder ? `Plans ${place} himself` : null} compact={compact} credential={founder ? founderOceanForCountry(where.countrySlug) : null} />
        {withA && <Person a={withA} place={knows} markLine={markLine} compact={compact} />}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href={plan} className="ledger-btn ledger-btn--solid !py-2 !px-4 text-[13px]">Plan {place} with {withA ? `${withA.firstName} and James` : lead.firstName}</Link>
        {others.length > 0 && <span className="text-[12.5px] ledger-muted">Also knows {knows}: {others.map((o, i) => <span key={o.slug}>{i > 0 ? ", " : ""}<Link href={o.profileHref ?? "/about/team#advisors"} className="underline underline-offset-4 hover:ledger-crimson">{o.firstName}</Link></span>)}</span>}
      </div>
    </aside>
  );
}

/** The chip row for a Wild Pathway hub: the real advisors who carry it, from the Library. */
export function PathwayAdvisors({ pathwayId, className = "" }: { pathwayId: PathwayId; className?: string }) {
  const who = whoCarries(pathwayId);
  if (!who.length) return null;
  const p = PATHWAYS[pathwayId];
  const names = who.map((a) => a.firstName);
  const line = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return (
    <section className={className} aria-labelledby="carries-heading">
      <p className="ledger-eyebrow" style={{ color: GREEN_INK }}>Who carries this pathway</p>
      <h2 id="carries-heading" className="ledger-display text-[1.5rem] md:text-3xl mt-2">{p.name} is carried by {line}.</h2>
      <p className="mt-2 text-[15px] ledger-muted max-w-2xl">The advisors of the house who state {p.name.toLowerCase()} as one of the journeys they plan, in the Ledger, in their own words. James heads every page while the house is in testing.</p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {who.map((a) => {
          const places = (a.dna?.countries ?? []).slice(0, 4).map(countryName);
          return (
            <li key={a.slug} className="border ledger-border bg-paper p-4">
              <div className="flex gap-3 items-start">
                <Link href={a.profileHref ?? "/about/team#advisors"} className="shrink-0"><Headshot a={a} size={48} /></Link>
                <div className="min-w-0">
                  <p className="leading-tight"><Link href={a.profileHref ?? "/about/team#advisors"} className="ledger-display text-[17px] hover:ledger-crimson">{a.name}</Link> <span className="ledger-id text-[10.5px]">{a.ledgerId}</span></p>
                  {places.length > 0 && <p className="text-[12.5px] ledger-muted mt-0.5">{places.join(" · ")}</p>}
                  {a.slug === DEFAULT_ADVISOR && founderOceanForPathway(pathwayId) && <p className="text-[12.5px] mt-0.5" style={{ color: GREEN_INK }}>{founderOceanForPathway(pathwayId)}</p>}
                  {a.line && <p className="mt-1.5 ledger-display italic text-[14px] leading-snug" style={{ color: GREEN_INK }}>&ldquo;{a.line}&rdquo;</p>}
                </div>
              </div>
              <Link href={`/plan?advisor=${a.slug}&q=${encodeURIComponent(p.name)}`} className="mt-3 inline-block text-[13px] underline underline-offset-4 hover:ledger-crimson">Plan {p.name.toLowerCase()} with {a.firstName} →</Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
