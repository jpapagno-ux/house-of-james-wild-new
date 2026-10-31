import Image from "next/image";
import Link from "next/link";
import { ADVISORS, DEFAULT_ADVISOR, advisorsFor, initials, type Advisor } from "@/lib/content/advisors";
import { GREEN_INK, VOLUME_LABEL, type DeskEntry, type Volume } from "@/lib/content/advisor-desk";
import { absoluteUrl } from "@/lib/seo";
import { ids } from "@/lib/schema";

// "Who plans this" — the roster's answer for a place, rendered on the page
// (31 Oct 2026). The same answer Iggi gives from /api/v1/advisors, as text a
// reader (or a crawler) can see: the advisor who should plan it first, with
// their marks on records in this place, then the others who know it. Keeps
// the house default (James) when nobody has an entry here.

export type Where = { countrySlug?: string | null; regionSlug?: string | null; volume?: Volume; ledgerId?: string | null };

function pick(where: Where): { lead: Advisor; others: Advisor[]; entries: DeskEntry[] } {
  const { advisors } = advisorsFor(where);
  const fallback = ADVISORS.find((a) => a.slug === DEFAULT_ADVISOR)!;
  const lead = advisors[0] ?? fallback;
  const match = (e: DeskEntry) =>
    (where.ledgerId ? e.ledgerId === where.ledgerId : true) && (where.countrySlug ? e.countrySlug === where.countrySlug : true) && (where.regionSlug ? e.regionSlug === where.regionSlug : true) && (where.volume ? e.volume === where.volume : true);
  const entries = (lead.desk?.entries ?? []).filter(match).slice(0, 3);
  return { lead, others: advisors.slice(1, 4), entries };
}

export default function WhoPlans({ where, place }: { where: Where; place: string }) {
  const { lead, others, entries } = pick(where);
  const founder = lead.slug === DEFAULT_ADVISOR;
  const plan = `/plan?advisor=${lead.slug}&destination=${encodeURIComponent(where.countrySlug ?? where.regionSlug ?? "")}`;
  return (
    <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="who-plans-heading">
      <p className="ledger-eyebrow" style={{ color: GREEN_INK }}>Who plans this</p>
      <h2 id="who-plans-heading" className="ledger-h2 mt-2">{founder ? `James plans ${place} himself.` : `${lead.firstName} plans ${place}.`}</h2>
      <div className="mt-6 grid md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-start">
        <Link href={lead.profileHref ?? "/about/team#advisors"} className="relative block w-28 h-36 md:w-36 md:h-44 bg-paper-card overflow-hidden shrink-0">
          {lead.portrait ? <Image src={lead.portrait.url} alt={lead.portrait.alt} fill sizes="144px" className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center ledger-display text-3xl text-coast-deep">{initials(lead.name)}</span>}
        </Link>
        <div className="min-w-0">
          <p className="ledger-display text-[1.5rem] leading-tight"><Link href={lead.profileHref ?? "/about/team#advisors"} className="hover:ledger-crimson">{lead.name}</Link></p>
          <p className="ledger-eyebrow !text-[9.5px] mt-1" style={{ color: founder ? undefined : GREEN_INK }}>{lead.role}{lead.desk ? <span className="ledger-crimson"> · {lead.desk.adv}</span> : null}</p>
          {(lead.line ?? lead.desk?.line) && <p className="mt-3 ledger-display italic text-[1.1rem] leading-snug max-w-xl">&ldquo;{lead.line ?? lead.desk?.line}&rdquo;</p>}
          {entries.length > 0 && (
            <ul className="mt-4 grid gap-1.5 text-[15px]">
              {entries.map((e) => (
                <li key={e.ledgerId} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="font-mono text-[11px] ledger-crimson tabular-nums">{e.ledgerId}</span>
                  <span>{e.href ? <Link href={e.href} className="underline underline-offset-4 hover:ledger-crimson">{e.name}</Link> : e.name}</span>
                  <span className="text-[13px]" style={{ color: founder ? "var(--jw-accent-hex)" : GREEN_INK }}>{e.theirs ? `${e.theirs.mark}${e.theirs.when ? `, ${e.theirs.when}` : ""}` : `${e.james.mark}${e.james.year ? ` ${e.james.year}` : ""}`}</span>
                  <span className="text-[12.5px] ledger-muted">{VOLUME_LABEL[e.volume]}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={plan} className="ledger-btn ledger-btn--solid">Plan with {founder ? "James" : lead.firstName}</Link>
            {lead.profileHref && <Link href={lead.profileHref} className="ledger-btn">{founder ? "Meet James" : "Their desk"}</Link>}
          </div>
          {others.length > 0 && (
            <p className="mt-5 text-[14px] ledger-muted">
              Also knows {place}: {others.map((a, i) => (
                <span key={a.slug}>{i > 0 ? ", " : ""}<Link href={a.profileHref ?? "/about/team#advisors"} className="underline underline-offset-4 hover:ledger-crimson">{a.name}</Link>{a.desk ? ` (${a.desk.adv})` : ""}</span>
              ))}.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/** Schema for the page's graph: the advisor who plans this place as a Person the crawler can resolve, plus the others. */
export function whoPlansSchema(where: Where) {
  const { lead, others } = pick(where);
  const person = (a: Advisor) => ({
    "@type": "Person",
    "@id": absoluteUrl(`${a.profileHref ?? "/about/team"}#person`),
    name: a.name,
    ...(a.roleApproved ? { jobTitle: a.role } : {}),
    worksFor: { "@id": ids.house },
    url: absoluteUrl(a.profileHref ?? "/about/team"),
    ...(a.desk ? { identifier: { "@type": "PropertyValue", propertyID: "Advisor ID", value: a.desk.adv } } : {}),
  });
  return { provider: person(lead), ...(others.length ? { mentions: others.map(person) } : {}) };
}
