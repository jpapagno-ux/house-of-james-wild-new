import type { ReactNode } from "react";
import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import FaqBlock from "@/components/ledger/FaqBlock";
import { HubShell, HubSection } from "@/components/hub/Hub";
import RouteAtlas, { type AtlasLegend, type AtlasRoute } from "@/components/journey/RouteAtlas";
import { ShipGrid } from "./ShipCard";
import VoyageTiles, { type Tile } from "./VoyageTiles";
import type { ShipCardData } from "@/lib/content/ships/cards";
import { absoluteUrl } from "@/lib/seo";
import { graph } from "@/lib/schema";

// One frame for every Voyages hub, type or waters (voyages plan, Part 2): the search question
// answered first (AEO), the ship cards from the registry, the routes on the chart, a short
// "ships being added" note where a hub is still filling, FAQs (FAQPage), and CollectionPage +
// ItemList schema (the trail's BreadcrumbList comes from the breadcrumbs). Never a made-up ship.

export type HubProps = {
  path: string; name: string; eyebrow: string; title: string; intro: string;
  question: string; answer: string; cards: ShipCardData[]; faqs: { q: string; a: string }[];
  /** Shown when the hub's ships are still being filed. */
  adding?: string;
  atlas?: { routes: AtlasRoute[]; legend: AtlasLegend; dest: string; chart?: object; kicker: string; title: string; line: string };
  related?: { title: string; tiles: Tile[] };
  before?: ReactNode; after?: ReactNode; extraSchema?: Record<string, unknown>[];
};

export default function VoyageHub(h: HubProps) {
  const trail = [{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: h.name, path: h.path }];
  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader />
      <HubShell name={h.name} path={h.path} trail={trail} eyebrow={h.eyebrow} title={h.title} intro={h.intro} answer={h.answer}
        filling="Ships fill from the Ledger as each operator's own material is filed; nothing is listed before it is.">
        {h.before}
        <HubSection eyebrow={`${h.cards.length} ${h.cards.length === 1 ? "ship" : "ships"} filed`} title={h.question} id="ships-h">
          {h.cards.length > 0 ? <ShipGrid cards={h.cards} /> : null}
          {h.adding && <p className="mt-6 border-l-2 border-crimson pl-4 text-[15px] max-w-2xl"><span className="ledger-eyebrow block mb-1">Ships being added</span>{h.adding}</p>}
        </HubSection>
        {h.atlas && h.atlas.routes.length > 0 && (
          <RouteAtlas id={`${h.path.split("/").pop()}-atlas`} kind="voyage" dest={h.atlas.dest} chart={h.atlas.chart} legend={h.atlas.legend} kicker={h.atlas.kicker} eyebrow="The routes" title={h.atlas.title} line={h.atlas.line} routes={h.atlas.routes} />
        )}
        {h.after}
        {h.related && <HubSection eyebrow="Keep looking" title={h.related.title} id="related-h"><VoyageTiles tiles={h.related.tiles} cols={h.related.tiles.length === 5 ? 5 : h.related.tiles.length === 3 ? 3 : 4} /></HubSection>}
        <FaqBlock faqs={h.faqs} title={`What Else Should You Know About ${h.name}?`} />
      </HubShell>
      <JsonLd data={graph(
        { "@type": "CollectionPage", "@id": absoluteUrl(`${h.path}#page`), url: absoluteUrl(h.path), name: h.title, description: h.intro,
          mainEntity: { "@type": "ItemList", name: h.question, numberOfItems: h.cards.length, itemListElement: h.cards.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: absoluteUrl(c.href) })) } },
        ...(h.extraSchema ?? []),
      )} />
    </div>
  );
}
