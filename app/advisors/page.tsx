import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import JsonLd from "@/components/ledger/JsonLd";
import AdvisorCard from "@/components/advisor/AdvisorCard";
import { PlanClose } from "@/components/about/Parts";
import { ADVISORS, DEFAULT_ADVISOR } from "@/lib/content/advisors";
import { PATHWAYS, type PathwayId } from "@/lib/pathways";
import { COUNTRIES } from "@/lib/content/countries";
import { GREEN_INK } from "@/lib/content/advisor-desk";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /advisors — the advisors of the house, from the Library's Advisor DNA (Stage 4b,
// 2 Nov 2026). The hub page for "who are the advisors at James Wild & Co" and
// "which advisor for Kenya": every real advisor with their ADV number, the
// journeys they plan, the places they know and, once confirmed, their own line.
// Stand-ins never appear here. James first; the house is advisor-led and
// advisor-built, and James is the default on every page while in testing.

export const metadata = buildMetadata({
  title: "The Advisors of James Wild & Co",
  description: "Every advisor of the house with their Advisor ID, the journeys they plan, the places they know first-hand and, in their own words, who they are the right advisor for.",
  path: "/advisors",
});

const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const countryName = (c: string) => COUNTRIES.find((x) => x.slug === c)?.name ?? titleCase(c);

export default function AdvisorsIndex() {
  const real = ADVISORS.filter((a) => !a.sample && a.ledgerId);
  const james = real.find((a) => a.slug === DEFAULT_ADVISOR)!;
  const rest = real.filter((a) => a !== james);
  const ordered = [james, ...rest];
  const path = "/advisors";
  const answer = `James Wild & Co is advisor-led and advisor-built: a named advisor with an Advisor ID (ADV) carries every journey from first call to Folio. The house has ${ordered.length} advisors. ${ordered.map((a) => `${a.name} (${a.ledgerId})${a.dna?.countries.length ? ` knows ${a.dna.countries.slice(0, 4).map(countryName).join(", ")}` : ""}`).join("; ")}. James Papagno, the founder, heads every page while the house is in testing, and the advisor who should plan a journey is named on each stay and country page.`;
  // By country: who knows it, from the Library (real advisors only).
  const byCountry = COUNTRIES.map((c) => ({ c, who: ordered.filter((a) => a.dna?.countries.includes(c.slug)) })).filter((x) => x.who.length);
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Advisors", path }]} /></div>
          <header className="max-w-3xl">
            <p className="ledger-eyebrow ledger-crimson">Advisor-led · Advisor-built</p>
            <h1 className="ledger-display text-[2.3rem] md:text-[3.3rem] leading-[1.08] mt-2">The Advisors of the House</h1>
            <p className="mt-4 text-[18px] md:text-[19px] ledger-muted leading-relaxed">A named person with an Advisor ID carries every journey. James vouches for the place; the advisor vouches for you. Each advisor&rsquo;s DNA below is theirs: the journeys they plan, the places they know, their own line, stated and confirmed by them in the house Ledger.</p>
          </header>

          <div className="mt-10"><AnswerBlock>{answer}</AnswerBlock></div>

          <section className="mt-12" aria-labelledby="roster-heading">
            <h2 id="roster-heading" className="sr-only">The roster</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ordered.map((a, i) => (
                <li key={a.slug} className="flex flex-col gap-3">
                  <AdvisorCard a={a} n={i + 1} />
                  {a.dna && (
                    <div className="px-1 text-[13.5px] leading-relaxed">
                      <p><span className="ledger-id text-[11px]">{a.ledgerId}</span>{a.dna.pathways.length ? <> · {a.dna.pathways.map((p) => PATHWAYS[p as PathwayId]?.name ?? p).join(", ")}</> : null}</p>
                      {a.dna.countries.length > 0 && <p className="ledger-muted mt-0.5">Knows {a.dna.countries.map(countryName).join(", ")}.</p>}
                      {a.dna.matchNote && <p className="mt-1 ledger-display italic text-[15px]" style={{ color: GREEN_INK }}>&ldquo;{a.dna.matchNote}&rdquo;</p>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {byCountry.length > 0 && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="by-country-heading">
              <p className="ledger-eyebrow ledger-crimson">Who plans it</p>
              <h2 id="by-country-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">By Country</h2>
              <p className="mt-3 text-[15.5px] ledger-muted max-w-2xl">The advisors who state they know each country, from the Ledger. James heads every page while the house is in testing; the advisor who should plan a journey is named beside him on the page.</p>
              <dl className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-[15px]">
                {byCountry.map(({ c, who }) => (
                  <div key={c.slug} className="flex flex-wrap gap-x-2 border-b ledger-rule py-2">
                    <dt className="ledger-display text-[16px]"><Link href={`/destinations/${c.region}/${c.slug}`} className="hover:ledger-crimson">{c.name}</Link></dt>
                    <dd className="ledger-muted">{who.map((a, i) => <span key={a.slug}>{i > 0 ? ", " : ""}<Link href={a.profileHref ?? "/about/team#advisors"} className="underline underline-offset-4 hover:ledger-crimson">{a.firstName}</Link></span>)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <PlanClose title="Start with the house." line="Tell us where you're drawn and when. James, or the advisor who knows the place, writes back: a person, not a form." />
        </div>
      </main>
      <JsonLd data={graph(
        { "@type": "CollectionPage", "@id": absoluteUrl(`${path}#page`), url: absoluteUrl(path), name: "The Advisors of James Wild & Co", isPartOf: { "@id": ids.website }, about: { "@id": ids.house }, mainEntity: { "@id": absoluteUrl(`${path}#roster`) } },
        { "@type": "ItemList", "@id": absoluteUrl(`${path}#roster`), name: "Advisors of the house", itemListOrder: "https://schema.org/ItemListOrderAscending", numberOfItems: ordered.length, itemListElement: ordered.map((a, i) => ({ "@type": "ListItem", position: i + 1, item: { "@id": absoluteUrl(`${a.profileHref ?? "/about/team"}#person`) } })) },
        ...ordered.map((a) => ({
          "@type": "Person", "@id": absoluteUrl(`${a.profileHref ?? "/about/team"}#person`), name: a.name, url: absoluteUrl(a.profileHref ?? "/about/team"),
          ...(a.roleApproved ? { jobTitle: a.role } : {}), worksFor: { "@id": ids.house }, ...(a.portrait ? { image: a.portrait.url } : {}),
          identifier: { "@type": "PropertyValue", propertyID: "Advisor ID", value: a.ledgerId },
          ...(a.dna?.matchNote ? { description: a.dna.matchNote } : a.intro ? { description: a.intro } : {}),
          ...(a.dna && (a.dna.countries.length || a.dna.pathways.length) ? { knowsAbout: [...a.dna.countries.map(countryName), ...a.dna.pathways.map((p) => PATHWAYS[p as PathwayId]?.name ?? p)] } : {}),
          ...(a.dna?.languages.length ? { knowsLanguage: a.dna.languages } : {}),
        })),
      )} />
    </>
  );
}
