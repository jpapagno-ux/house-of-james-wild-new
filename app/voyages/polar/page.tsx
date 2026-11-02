import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import FaqBlock from "@/components/ledger/FaqBlock";
import { HubShell, HubSection } from "@/components/hub/Hub";
import RouteAtlas, { type AtlasRoute } from "@/components/journey/RouteAtlas";
import ShipCard from "@/components/ships/ShipCard";
import PolarFinder, { type FinderRow } from "@/components/polar/PolarFinder";
import { HOUSE_CRIMSON } from "@/components/record/Sections";
import { voyageCard } from "@/lib/content/polar/cards";
import { LENGTHS, MONTH_CHIPS, POLAR_CROSSINGS_URL, POLAR_PATH, POLAR_SHIP_NAMES, POLAR_VOYAGES, REGIONS, STYLES, polarRouteId, usd, voyageFrom, voyagePath, type PolarStyle } from "@/lib/content/polar";
import { VOYAGE_TYPES, registryShip } from "@/lib/content/ships/registry";
import { shipCard } from "@/lib/content/ships/cards";
import { volumeInk } from "@/lib/volumes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /voyages/polar: Polar Crossings, the house's polar arm under To the Edges (James, 2 Nov 2026).
// Every Antarctica21 itinerary as a card, filtered by trip style first (fly both ways, fly one
// way, sail both ways), then region, length, month and ship (Antarctica21 categories proposal).
// The long-form polar guide lives at polarcrossings.com; this page stays short and links out.
// The one ship James has sailed in Antarctica is MS Roald Amundsen (HX), in February to March 2020:
// a card with his own photographs and no booking page.

const NAME = "Polar Crossings";
const V = POLAR_VOYAGES;
const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const byStyle = (s: PolarStyle) => V.filter((v) => v.style === s);
const dayRange = (s: PolarStyle) => { const d = byStyle(s).flatMap((v) => [v.days, ...(v.daysText ? v.daysText.match(/\d+/g)!.map(Number) : [])]); return Math.min(...d) === Math.max(...d) ? `${Math.min(...d)} days` : `${Math.min(...d)} to ${Math.max(...d)} days`; };
const lows = V.map(voyageFrom).filter((n): n is number => typeof n === "number");
const from = lows.length ? usd(Math.min(...lows)) : null;

export const metadata = buildMetadata({
  title: "Polar Crossings: Antarctica21 Air-Cruises and Voyages",
  description: `Every Antarctica21 itinerary in one place: ${V.length} voyages on two small Magellan ships, flying the Drake both ways, one way, or sailing both ways to the Falklands, South Georgia and Patagonia.`,
  path: POLAR_PATH,
  image: { url: V[0].hero.url, alt: V[0].hero.alt },
});

const ANSWER = `Polar Crossings is the house's polar arm. Here it files all ${words[V.length] ?? V.length} Antarctica21 itineraries, sailed by two small ships that carry at most 88 guests on an air-cruise. ${words[byStyle("fly-both").length].replace(/^\w/, (c) => c.toUpperCase())} fly over the Drake Passage both ways from Punta Arenas (${dayRange("fly-both")}), ${words[byStyle("fly-one").length]} fly one way and sail the other (${dayRange("fly-one")}), and ${words[byStyle("sail-both").length]} sail both ways to the Falklands, South Georgia and the Chilean fjords (${dayRange("sail-both")}).${from ? ` Fares start from ${from} per person.` : ""} James's full polar platform, with the long-form guides, is polarcrossings.com.`;

const FAQS = [
  { q: "Should I fly or sail across the Drake Passage?", a: "Flying takes about two hours each way between Punta Arenas and King George Island and keeps your days for the ice: the Classic Antarctica and Polar Circle air-cruises fly both ways. Sailing takes about two days each way and brings Cape Horn and the seabirds of the crossing: the Antarctica Express, the Antarctica and South Georgia air-cruise and the Magellan Discoverer inaugural sail one leg, and the sea voyages sail both." },
  { q: "How many guests are on board?", a: "Up to 88 on an air-cruise and up to 96 on a sea voyage, on Magellan Explorer and Magellan Discoverer alike, per Antarctica21." },
  { q: "When do the voyages run?", a: "Antarctica21's air-cruises run from late November through March. The sea voyages sail in September and October, and the Patagonia and Falklands voyages also in April." },
  { q: "Does any voyage cross the Antarctic Circle?", a: "None is promised. Antarctica21's Polar Circle Air-Cruise aims to sail far south toward the Polar Circle, and ice and weather decide how far the ship gets." },
  { q: "Why are there no exact departure dates yet?", a: "Antarctica21 shows exact dates and fares by cabin only in its live booking tool. Each voyage page lists the months, the number of sailings and the fares from that Antarctica21 publishes, and James confirms dates and cabins when you ask." },
  { q: "Has James sailed with Antarctica21?", a: "Not yet. James sailed the Antarctic Peninsula aboard HX's MS Roald Amundsen in February to March 2020. The Antarctica21 pages are filed from Antarctica21's own material." },
  { q: "Where is the full polar guide?", a: "At Polar Crossings, polarcrossings.com, James's full polar platform. This page keeps to the Antarctica21 voyages the house sells." },
];

const JAMES = [
  { id: "iceberg-arch", alt: "A great iceberg with a sculpted arch floats in calm water among brash ice, snowy mountains behind" },
  { id: "zodiac-between-giant-icebergs", alt: "A Zodiac full of guests in red parkas passes between two massive icebergs under streaked cloud" },
  { id: "penguin-landing-misty-massif", alt: "A penguin stands on smooth rock as guests in red parkas explore the snow below a cloud wrapped mountain massif" },
].map((x) => ({ ...x, url: `https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/wildco/guides/antarctic-peninsula/destination/${x.id}` }));
const JAMES_CREDIT = "James Papagno, February to March 2020";

export default function PolarPage() {
  const ink = volumeInk("voyages");
  const trail = [{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: VOYAGE_TYPES.expedition.name, path: VOYAGE_TYPES.expedition.path }, { name: NAME, path: POLAR_PATH }];
  const rows: FinderRow[] = [
    { key: "style", label: "Trip style", options: (Object.keys(STYLES) as PolarStyle[]).map((k) => ({ key: k, label: STYLES[k].name })) },
    { key: "region", label: "Region", options: Object.entries(REGIONS).map(([key, label]) => ({ key, label })) },
    { key: "length", label: "Length", options: Object.entries(LENGTHS).map(([key, label]) => ({ key, label })) },
    { key: "month", label: "Month", options: Object.entries(MONTH_CHIPS).map(([key, label]) => ({ key, label })) },
    { key: "ship", label: "Ship", options: Object.entries(POLAR_SHIP_NAMES).map(([key, label]) => ({ key, label })) },
  ];
  const items = V.map((v) => ({ slug: v.slug, keys: { style: [v.style], region: v.regions, length: [v.length], month: v.monthChips, ship: v.ships }, node: <ShipCard c={voyageCard(v)} /> }));
  const fleet = Object.keys(POLAR_SHIP_NAMES).map((slug) => shipCard(registryShip(slug)!)).filter((c): c is NonNullable<typeof c> => !!c);
  const atlas: AtlasRoute[] = V.map((v) => ({
    id: polarRouteId(v), label: `${v.short} · ${v.nights} nights`, href: voyagePath(v.slug), where: v.route, group: STYLES[v.style].name, groupHref: `${POLAR_PATH}#finder-h`,
    members: byStyle(v.style).map((x) => ({ name: x.name, href: voyagePath(x.slug) })),
  }));
  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader />
      <HubShell name={NAME} path={POLAR_PATH} trail={trail} eyebrow={`Volume 04 · Voyages · ${VOYAGE_TYPES.expedition.name} · ${NAME}`}
        title="Polar Crossings: Antarctica by Small Ship"
        intro="The house's polar arm. Antarctica21's air-cruises and sea voyages, from the Peninsula to South Georgia, the Falklands and the Chilean fjords."
        answer={ANSWER}
        filling="Exact departure dates and fares by cabin are added as Antarctica21 confirms them; until then each voyage shows its months, sailings and fares from.">
        <HubSection eyebrow={`${V.length} itineraries · Antarctica21`} title="Which Polar Voyage Fits Your Trip?" id="finder-h">
          <PolarFinder rows={rows} items={items} />
          <p className="mt-3 text-[12px] ledger-muted">Photographs: Antarctica21. &ldquo;From&rdquo; is the lowest fare per person, double cabin, that Antarctica21 shows for the voyage.</p>
        </HubSection>

        <RouteAtlas id="polar-atlas" kind="voyage" dest="polar" legend="sea" kicker="POLAR CROSSINGS · BY AIR AND SEA" eyebrow="The routes" title="Where Do the Voyages Go?"
          line="Every Antarctica21 route on one chart, grouped by trip style. Pick one and the globe flies to it, then sails it day by day." routes={atlas} />

        <HubSection eyebrow="The fleet · Antarctica21" title="Which Ships Sail Them?" id="fleet-h">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{fleet.map((c) => <li key={c.slug}><ShipCard c={c} /></li>)}</ul>
          <p className="mt-3 text-[12px] ledger-muted">Photographs: Antarctica21. Up to 88 guests on an air-cruise and 96 on a sea voyage, on either ship.</p>
        </HubSection>

        <HubSection eyebrow="Sailed by the founder" title="Which Polar Ship Has James Sailed?" id="sailed-h">
          <article className="grid md:grid-cols-[1.4fr_1fr] gap-6 md:gap-8 ledger-paper border ledger-border p-4 md:p-6" style={{ borderTopColor: ink, borderTopWidth: 3 }}>
            <div className="grid grid-cols-3 gap-2">
              {JAMES.map((p, i) => (
                <div key={p.id} className={`relative bg-paper-card overflow-hidden ${i === 0 ? "col-span-3 aspect-[16/10]" : "aspect-[4/3]"}`}>
                  <Image src={p.url} alt={p.alt} fill sizes={i === 0 ? "(min-width: 768px) 55vw, 90vw" : "(min-width: 768px) 18vw, 30vw"} className="object-cover" />
                </div>
              ))}
              <p className="col-span-3 text-[12px] ledger-muted">Photographs: {JAMES_CREDIT}.</p>
            </div>
            <div className="flex flex-col">
              <p className="ledger-eyebrow" style={{ color: ink }}>Expedition ship · HX</p>
              <h3 className="ledger-display text-[26px] leading-tight mt-1">MS Roald Amundsen</h3>
              <p className="mt-3 text-[16px] leading-relaxed">James sailed the Antarctic Peninsula aboard her in February to March 2020. The photographs here are his.</p>
              <p className="mt-2 text-[14.5px] ledger-muted leading-relaxed">She is not booked through this page. Ask James about sailing with HX, or about how she compares with the Antarctica21 ships above.</p>
              <Link href={`/plan?trip=${encodeURIComponent("Antarctica, MS Roald Amundsen (HX)")}`} className="mt-5 self-start ledger-btn ledger-btn--solid inline-flex items-center min-h-[44px]" style={{ background: HOUSE_CRIMSON, borderColor: HOUSE_CRIMSON }}>Plan with James</Link>
            </div>
          </article>
        </HubSection>

        <section className="mt-12 md:mt-16" aria-labelledby="pc-h">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 md:gap-10 items-center ledger-paper border ledger-border p-6 md:p-8">
            <div>
              <p className="ledger-eyebrow" style={{ color: ink }}>Another house site</p>
              <h2 id="pc-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Want the Full Polar Guide?</h2>
              <p className="mt-3 text-[16px] leading-relaxed">Polar Crossings has its own home at polarcrossings.com: James&rsquo;s full polar platform, with the long-form guides to the ice, the wildlife and the season.</p>
            </div>
            <a href={POLAR_CROSSINGS_URL} target="_blank" rel="noopener" className="md:justify-self-end ledger-btn ledger-btn--solid inline-flex items-center gap-2 min-h-[48px]">Visit polarcrossings.com<ArrowUpRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></a>
          </div>
          <p className="mt-4 text-[15px]"><Link href="/partners/antarctica21" className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline" style={{ color: ink }}>Who are Antarctica21, and why the house works with them<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link></p>
        </section>

        <FaqBlock faqs={FAQS} title="What Should You Know Before You Go South?" />
      </HubShell>
      <JsonLd data={graph({
        "@type": "CollectionPage", "@id": absoluteUrl(`${POLAR_PATH}#page`), url: absoluteUrl(POLAR_PATH), name: "Polar Crossings: Antarctica by Small Ship", description: ANSWER,
        mainEntity: { "@type": "ItemList", name: "Antarctica21 itineraries", numberOfItems: V.length, itemListElement: V.map((v, i) => ({ "@type": "ListItem", position: i + 1, name: v.name, url: absoluteUrl(voyagePath(v.slug)) })) },
      })} />
    </div>
  );
}
