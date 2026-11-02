import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import JsonLd from "@/components/ledger/JsonLd";
import ComingHero, { type HeroSlide } from "@/components/coming/ComingHero";
import ComingTicker from "@/components/coming/ComingTicker";
import ComingExplorer, { type ExplorerItem } from "@/components/coming/ComingExplorer";
import { comingHero, comingOn, statusLine, type Coming } from "@/lib/content/whats-coming";
import { countLine, countdown, sortComing, viewStatus, yearOf } from "@/lib/content/coming-view";
import { today } from "@/lib/dates";
import { DEEP_SEA } from "@/lib/palette";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { faqPage, graph, ids } from "@/lib/schema";
import REGIONS from "@/lib/content/regions.json";

const REGION_LIST = (REGIONS as { regions: { slug: string; name: string }[] }).regions.map((r) => ({ slug: r.slug, name: r.name }));

// /whats-coming: lodges announced, opening or being rebuilt, filed before they open (James, 31 Oct
// 2026), redesigned 2 Nov 2026 ("designed in the same style but unique"): a cinematic hero, a
// departures board, search and sort, and a timeline by year. Facts come only from the library export
// (lib/content/whats-coming.json, from the brands' own announcements); nothing here is written in.
const PATH = "/whats-coming";
export const revalidate = 86400; // countdowns re-cut daily (the library sync also rebuilds daily)

const lower = (x: string) => x.charAt(0).toLowerCase() + x.slice(1);
const QUESTION = "What new luxury lodges and hotels open in 2026 and 2027?";

function answerFor(items: Coming[]): string {
  if (!items.length) return "Nothing is pencilled at James Wild & Co right now. New and rebuilt lodges are filed here from the brands' own announcements, pencilled until James has stayed; the house can hold a place before opening.";
  const opening = items.filter((c) => viewStatus(c.status) === "opening");
  const back = items.filter((c) => viewStatus(c.status) === "rebuilding");
  const say = (c: Coming) => `${c.name} in ${c.country ?? "the Ledger"} (${lower(statusLine(c))})`;
  return [
    opening.length ? `Opening: ${opening.map(say).join("; ")}.` : "",
    back.length ? `Being rebuilt or reimagined: ${back.map(say).join("; ")}.` : "",
    "Each is filed by James Wild & Co from the brand's own announcement and pencilled in the Ledger until James has stayed; the house can hold a place before opening.",
  ].filter(Boolean).join(" ");
}

export function generateMetadata() {
  const items = sortComing(comingOn(today()), "soonest");
  return buildMetadata({
    title: "What's Coming: New Luxury Lodges and Hotels, 2026 to 2027",
    description: items.length ? `${countLine(items)}: ${items.slice(0, 3).map((c) => c.name).join(", ")} and more, filed before they open. Search by country, sort by date.` : "New and rebuilt lodges, filed before they open. The house holds a place; James vets on opening.",
    path: PATH, // canonical ignores ?country=&year=&sort=
    image: (() => { const h = items.map(comingHero).find(Boolean); return h ? { url: h.src, alt: h.alt } : undefined; })(),
  });
}

// Deep Sea pairs for the colour fields of entries without a photograph, chosen by the slug.
const FIELDS = [
  { from: DEEP_SEA.navy.fill, to: DEEP_SEA.ocean.fill, glow: DEEP_SEA.cerulean.fill },
  { from: DEEP_SEA.teal.fill, to: DEEP_SEA.navy.fill, glow: DEEP_SEA.aqua.fill },
  { from: DEEP_SEA.aqua.fill, to: DEEP_SEA.navy.fill, glow: DEEP_SEA.turquoise.fill },
  { from: DEEP_SEA.slate.fill, to: DEEP_SEA.navy.fill, glow: DEEP_SEA.cerulean.fill },
];
const fieldFor = (slug: string) => FIELDS[[...slug].reduce((a, ch) => a + ch.charCodeAt(0), 0) % FIELDS.length];

export default function WhatsComingPage() {
  const day = today();
  const items = sortComing(comingOn(day), "soonest");
  const answer = answerFor(items);
  const explorer: ExplorerItem[] = items.map((c) => ({
    slug: c.slug, name: c.name, ledgerId: c.ledgerId, country: c.country, countrySlug: c.countrySlug, regionSlug: c.regionSlug,
    status: c.status, date: c.date, tagline: c.tagline, note: c.note, bestMonths: c.bestMonths, airport: c.airport, href: c.href,
    when: statusLine(c), line: statusLine(c), countdown: countdown(c.date, day),
    plan: `/plan?from=whats-coming&trip=${encodeURIComponent(`${c.name}: hold a place`)}${c.countrySlug ? `&destination=${c.countrySlug}` : ""}`,
    hero: comingHero(c), field: fieldFor(c.slug),
  }));
  const slides: HeroSlide[] = items.flatMap((c) => {
    const h = comingHero(c);
    return h ? [{ slug: c.slug, src: h.src, alt: h.alt, credit: h.credit, name: c.name, country: c.country, line: statusLine(c), href: c.href ?? `#${c.slug}` }] : [];
  });
  const years = [...new Set(items.map((c) => yearOf(c.date)).filter(Boolean))].sort();

  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <ComingHero slides={slides} title="What's Coming" line={items.length ? countLine(items) : "Nothing is pencilled right now"}>
          <a href="#the-board" className="ledger-btn !border-white !text-white hover:!bg-white hover:!text-ink self-start md:self-end">See every opening</a>
        </ComingHero>
        <div id="the-board"><ComingTicker items={items} label="What's coming" more={false} /></div>

        {items.length ? <ComingExplorer items={explorer} regions={REGION_LIST} /> : (
          <p className="max-w-[1400px] mx-auto px-5 md:px-10 py-24 ledger-display italic text-[1.8rem]">Nothing is pencilled right now. New openings appear here as the brands announce them.</p>
        )}

        <section className="bg-paper-card mt-10" aria-labelledby="faq-heading">
          <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-16 md:py-24 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "What's coming", path: PATH }]} /></div>
              <p className="font-mono text-[11px] tracking-[0.24em] uppercase ledger-muted">The short answer</p>
              <h2 id="faq-heading" className="ledger-display text-[2rem] md:text-[2.6rem] leading-tight mt-3">{QUESTION}</h2>
            </div>
            <div className="lg:col-span-8">
              <AnswerBlock label={`In short${years.length ? `, ${years.join(" and ")}` : ""}`}>{answer}</AnswerBlock>
              <ol className="mt-10 grid sm:grid-cols-3 gap-6">
                {[["01", "Filed", "A lodge is announced or rebuilt; the house files it from the brand's own site, with a Ledger ID."], ["02", "Held", "Ask James to hold a place for the opening season. Nothing is booked until you approve a quote."], ["03", "Marked", "James stays. The pencil becomes a mark, with the year, or the page is quietly taken down."]].map(([k, t, l]) => (
                  <li key={k} className="border-t-2 pt-3" style={{ borderColor: "var(--jw-action)" }}><span className="font-mono text-[13px]" style={{ color: "var(--jw-action)" }}>{k}</span><h3 className="ledger-display text-[1.35rem] mt-1">{t}</h3><p className="mt-1.5 text-[15px] ledger-muted leading-relaxed">{l}</p></li>
                ))}
              </ol>
              <p className="mt-10 text-[15px] ledger-muted">Looking for places already marked? <Link href="/safaris" className="underline underline-offset-4">The Safaris volume</Link> &middot; <Link href="/stays" className="underline underline-offset-4">The Ledger of stays</Link></p>
            </div>
          </div>
        </section>
      </main>
      <JsonLd data={graph(
        { "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "What's coming", description: answer, publisher: { "@id": ids.house }, mainEntity: { "@id": absoluteUrl(`${PATH}#list`) } },
        {
          "@type": "ItemList", "@id": absoluteUrl(`${PATH}#list`), name: "New and rebuilt luxury lodges and hotels, filed before they open", numberOfItems: items.length,
          itemListElement: items.map((c, i) => {
            const h = comingHero(c);
            return {
              "@type": "ListItem", position: i + 1, url: absoluteUrl(c.href ?? `${PATH}#${c.slug}`),
              item: {
                "@type": "LodgingBusiness", name: c.name, description: [c.note ?? c.tagline, statusLine(c)].filter(Boolean).join(" "),
                ...(c.href ? { url: absoluteUrl(c.href) } : {}),
                ...(c.country ? { address: { "@type": "PostalAddress", addressCountry: c.country } } : {}),
                ...(h && h.src.startsWith("https://res.cloudinary.com") ? { image: h.src } : {}),
                ...(c.ledgerId ? { identifier: { "@type": "PropertyValue", propertyID: "Ledger ID", value: c.ledgerId } } : {}),
              },
            };
          }),
        },
        faqPage([{ q: QUESTION, a: answer }]),
      )} />
    </>
  );
}
