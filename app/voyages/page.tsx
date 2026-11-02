import Link from "next/link";
import { Users } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import FaqBlock from "@/components/ledger/FaqBlock";
import { AdvisorScroll } from "@/components/advisor/Desk";
import { HubShell, HubSection } from "@/components/hub/Hub";
import RouteAtlas from "@/components/journey/RouteAtlas";
import ShipCard from "@/components/ships/ShipCard";
import VoyageSearch from "@/components/ships/VoyageSearch";
import { SEARCH_PAGES, searchItems, searchMonths } from "@/lib/content/ships/search";
import VoyageTiles, { type Tile } from "@/components/ships/VoyageTiles";
import { FILMS } from "@/lib/content/films";
import { VOLUMES } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";
import { NILE_CHART } from "@/lib/content/ships/routes";
import { atlasRoutes } from "@/lib/content/ships/atlas";
import { allCards, shipCard, tally, typeCards, watersCards, VOYAGE_TYPES, WATERS_HUBS } from "@/lib/content/ships/cards";
import { registryShip, type VoyageType, type Waters } from "@/lib/content/ships/registry";
import { usd } from "@/lib/pricing";
import { polarTile } from "@/lib/content/ships/hubs";
import { categoryTiles, mergeOffers } from "@/lib/content/ships/categories";
import { hubOffers } from "@/lib/content/offers/hub";
import { POLAR_VOYAGES } from "@/lib/content/polar";

// /voyages: the Voyages landing (voyages plan, Part 2, approved by James 1 Nov 2026), in the
// order people choose: how to sail, which waters, every route on one chart, the ship James has
// sailed, the whole ship, then questions. "Find your voyage" (where, when, who, what, length, budget and a
// typeahead, James 2 Nov 2026) opens the page, ahead of the tiles. Every list reads the ships registry.
// The polar card opens Polar Crossings on this site (/voyages/polar, James, 2 Nov 2026).
const PATH = "/voyages";
const V = VOLUMES.find((v) => v.href === PATH)!;
const TYPES: VoyageType[] = ["river", "sailing", "expedition", "charter"];
const WATERS: Waters[] = ["nile", "amazon", "galapagos", "indonesia"];

const cards = allCards();
const charterNames = cards.filter((c) => c.types.includes("charter") && c.page).map((c) => c.name);
const aliikai = registryShip("aliikai")!;
const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs[0] ?? "");

export const metadata = buildMetadata({
  title: "Small-Ship Voyages and Sailing Yachts",
  description: `${cards.length} small ships and sailing yachts filed by James Wild & Co: Nile riverboats and a dahabiya, Galápagos yachts, Amazon river ships and phinisis in Indonesia.`,
  path: PATH,
  image: { url: FILMS.aliikai.poster, alt: FILMS.aliikai.alt },
});

const FAQS = [
  { q: "What kind of ships does James Wild & Co sell?", a: `Small ships and sailing yachts, never the big ones. Voyages files ${cards.length} today: A&K Sanctuary riverboats and a dahabiya on the Nile, Amazon river ships in Peru, Ecuador and Brazil, Ecoventura and Galaxy Cruises yachts in the Galápagos, and phinisis in Indonesia, Aliikai among them.` },
  { q: "Can we charter a whole ship for our group?", a: `Yes. ${list(charterNames)} can be taken private for one party. Aliikai is ${usd(aliikai.charter!.from!)} a night plus 11% tax for up to 15 guests; the others are priced on enquiry, and James confirms every rate live.` },
  { q: "Do you plan voyages to Antarctica?", a: `Yes. Polar Crossings, the house's polar arm under To the Edges, files all ${POLAR_VOYAGES.length} Antarctica21 itineraries, from air-cruises over the Drake Passage to sea voyages to South Georgia, each with its own page.` },
  { q: "Has James sailed these ships himself?", a: "He sailed Raja Ampat aboard Aliikai in November 2024, and her page says so. The other ships are filed from their operators' own material, and their pages make no claim that he has sailed them." },
  { q: "How are voyage fares shown?", a: "Per person, two sharing, as each operator publishes them: by the cruise for most ships, by the night for Aliikai's cabins. Past departures drop off on their own, and every fare is confirmed live when you ask." },
];

export default function VoyagesHub() {
  // The Whole Ship's "from" is a charter rate (the whole yacht, a night), never a per-person fare.
  const typeTiles: Tile[] = TYPES.map((t) => { const x = tally(typeCards(t)); return { key: t, name: VOYAGE_TYPES[t].name, href: VOYAGE_TYPES[t].path, line: VOYAGE_TYPES[t].line, count: x.count, from: t === "charter" ? `${usd(aliikai.charter!.from!)} a night` : x.from }; });
  const watersTiles: Tile[] = [
    ...WATERS.map((w) => { const x = tally(watersCards(w)); return { key: w, name: WATERS_HUBS[w].name, href: WATERS_HUBS[w].path, line: WATERS_HUBS[w].countries.join(", "), count: x.count, from: x.from }; }),
    polarTile,
  ];
  const sailed = [shipCard(aliikai)!];
  const search = searchItems();
  const voyageOffers = mergeOffers(hubOffers().filter((o) => o.volumeKey === "voyages"));
  const charters = cards.filter((c) => c.types.includes("charter"));
  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader />
      <HubShell name="Voyages" path={PATH} eyebrow="Volume 04 · Voyages" title="Small-Ship Voyages and Sailing Yachts" intro={V.intro}
        film={{ poster: FILMS.aliikai.poster, alt: FILMS.aliikai.alt, eyebrow: "The film", title: "Aboard Aliikai in Komodo", credit: FILMS.aliikai.credit, href: `https://www.youtube.com/watch?v=${FILMS.aliikai.id}` }}
        answer={`James Wild & Co's Voyages volume files ${cards.length} small ships and sailing yachts. Choose by how you want to sail (by river, under sail, to the edges, or the whole ship to yourselves) or by the waters: the Nile, the Amazon, the Galápagos, Indonesia and, in Polar Crossings, Antarctica. Each ship page lists her cabins, her day by day and every published fare; James, sailing since 1989, sailed Raja Ampat aboard Aliikai in November 2024.`}
        filling="Ship pages, cabin by cabin, fill from the Ledger as each operator's material is filed; vessels marked “ship page to follow” open their Ledger record until then.">
        <HubSection eyebrow="Search every filed ship" title="Find Your Voyage" id="finder-h">
          <VoyageSearch items={search} months={searchMonths(search)} pages={SEARCH_PAGES} />
        </HubSection>
        <HubSection eyebrow="Four ways to sail" title="How Do You Want to Sail?" id="types-h"><VoyageTiles tiles={typeTiles} /></HubSection>
        <HubSection eyebrow="The waters" title="Which Waters?" id="waters-h"><VoyageTiles tiles={watersTiles} cols={5} /></HubSection>
        <HubSection eyebrow="Who is sailing" title="Who Is the Voyage For?" id="who-h"><VoyageTiles tiles={categoryTiles()} cols={3} /></HubSection>
        <RouteAtlas id="voyages-atlas" kind="voyage" dest="nile" chart={NILE_CHART} legend="river-sea" kicker="THE VOYAGES · BY RIVER AND SEA" eyebrow="The voyage atlas" title="Where Do the Ships Sail?"
          line="Every route in Voyages on one chart. Pick a route above the chart and the globe flies to it, then sails it day by day."
          routes={atlasRoutes()} />
        <HubSection eyebrow="Sailed by the founder" title="Which Ships Has James Sailed?" id="sailed-h">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{sailed.map((c) => <li key={c.slug}><ShipCard c={c} /></li>)}</ul>
          <p className="mt-3 text-[14px] ledger-muted max-w-2xl">James sailed Raja Ampat aboard Aliikai in November 2024, ten days from Sorong to the Wayag karsts and back.</p>
        </HubSection>
        <section className="mt-12 md:mt-16" aria-labelledby="charter-h">
          <div className="grid md:grid-cols-[1.3fr_1fr] gap-6 md:gap-10 items-center ledger-paper border ledger-border p-6 md:p-8">
            <div>
              <p className="ledger-eyebrow ledger-crimson flex items-center gap-2"><Users className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />The Whole Ship</p>
              <h2 id="charter-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Would You Rather Take the Whole Ship?</h2>
              <p className="mt-3 text-[16px] leading-relaxed">{charters.length} ships can be chartered whole for one party: {list(charters.map((c) => c.name))}.</p>
              <Link href={VOYAGE_TYPES.charter.path} className="mt-5 ledger-btn ledger-btn--solid">See every charter</Link>
            </div>
            <p className="md:text-right"><span className="ledger-eyebrow block">Aliikai, the whole yacht</span><span className="ledger-display text-5xl ledger-crimson">{usd(aliikai.charter!.from!)}</span><span className="block text-[13px] ledger-muted">per night · up to 15 guests · + 11% tax</span></p>
          </div>
        </section>
        <section className="mt-12 md:mt-16" aria-labelledby="horizon-h">
          <div className="grid md:grid-cols-[1.3fr_1fr] gap-6 md:gap-10 items-center ledger-paper border ledger-border p-6 md:p-8">
            <div>
              <p className="ledger-eyebrow ledger-crimson">On the Horizon</p>
              <h2 id="horizon-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Which Voyage Offers Are On Now?</h2>
              <p className="mt-3 text-[16px] leading-relaxed">{voyageOffers.length ? `${voyageOffers.length} voyage ${voyageOffers.length === 1 ? "offer is" : "offers are"} filed: ${list(voyageOffers.map((o) => o.headline.replace(/^Honeymoon: /, "honeymoon, ")))}.` : "No voyage offers are filed right now."} Every one sits beside its real terms.</p>
              <Link href="/offers#voyages" className="mt-5 ledger-btn ledger-btn--solid">See every offer</Link>
            </div>
          </div>
        </section>
        <AdvisorScroll volume="voyages" title="Who sails with the small ships" unlinked={["gatherings"]} />
        <FaqBlock faqs={FAQS} title="What Should You Know Before You Sail?" />
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Voyages", mainEntity: { "@type": "ItemList", numberOfItems: cards.length, itemListElement: cards.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: absoluteUrl(c.href) })) } })} />
    </div>
  );
}
