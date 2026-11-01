import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import { HubShell, HubSection } from "@/components/hub/Hub";
import NileShipCards from "@/components/ships/NileShipCards";
import RouteAtlas from "@/components/journey/RouteAtlas";
import Link from "next/link";
import { NILE_CHART, shipRouteId } from "@/lib/content/ships/routes";
import { shipPath, shipsOn, WATERS } from "@/lib/content/ships";
import { factOf, fromPrice, nightsLabel, priceLine, routeOf, undash } from "@/lib/content/ships/types";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /voyages/nile: the Nile waters hub (Egypt). Lists the A&K Sanctuary ships,
// and answers "which one?" from the ships' own data only.
const W = WATERS.nile!;
const PATH = W.path;
const ships = shipsOn("nile");
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const low = Math.min(...ships.map((s) => fromPrice(s) ?? Infinity));

export const metadata = buildMetadata({
  title: "Nile Cruises in Egypt: A&K Sanctuary Ships Compared",
  description: `${ships.length} A&K Sanctuary ships on the Nile, Luxor to Aswan and on to Abu Simbel, compared by nights, guests and cabins${Number.isFinite(low) ? `, with cruise fares from ${usd(low)} per person` : ""}. Plan your Egypt river voyage with James Wild & Co.`,
  path: PATH,
  image: ships[0] ? { url: ships[0].hero.url, alt: ships[0].hero.alt } : undefined,
});

function answer() {
  const parts = ships.map((s) => {
    const g = factOf(s, /guest/i);
    return `${s.name} (${s.type === "dahabiya" ? "a dahabiya" : "a riverboat"}${g ? ` for ${g} guests` : ""}, ${nightsLabel(s)}${s.status !== "sailing" ? `, ${s.status}` : ""}${s.suits[0] ? `; best for ${s.suits[0].who.toLowerCase()}` : ""})`;
  });
  return `Abercrombie & Kent sails ${ships.length} A&K Sanctuary ships on the Nile: ${parts.join(". ")}. Each ship below lists its cabins, deck plan, day by day and published fares${Number.isFinite(low) ? `; cruise-only fares start at ${usd(low)} per person` : ""}.`;
}

export default function NileHub() {
  const trail = [{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: W.name, path: PATH }];
  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader />
      <HubShell name={W.name} path={PATH} trail={trail} eyebrow="Volume 04 · Voyages · Egypt" title="Nile Cruises Aboard the A&K Sanctuary Ships"
        intro="Riverboats and a dahabiya between Luxor and Aswan, each one filed with its cabins, deck plan, day by day and every published date."
        answer={answer()}
        filling="More Nile dates, and the voyages James sails himself, fill from the Ledger as they are filed.">
        <HubSection eyebrow="The A&K Sanctuary fleet" title="Which Nile Cruise Should You Choose?" id="nile-ships">
          <NileShipCards ships={ships} />
        </HubSection>
        <RouteAtlas id="nile-atlas" kind="voyage" dest="nile" chart={NILE_CHART} kicker="THE NILE · BY RIVER" eyebrow="The routes · by river" title="Every Nile Route on One Chart"
          line="Pick a ship and a direction: the globe flies to Egypt and sails the river day by day, Luxor to Aswan and back, and on to Abu Simbel."
          routes={ships.flatMap((s) => s.itineraries.filter((i) => i.days.length).map((i) => ({ id: shipRouteId(s, i), label: `${s.name}: ${i.direction}`, href: `/voyages/ships/${s.slug}`, where: `${i.nights} nights` })))} />
        <HubSection eyebrow="Side by side" title="How Do the Nile Ships Compare?" id="nile-compare">
          <div className="hidden md:block overflow-x-auto border ledger-border">
            <table className="w-full text-[14px] border-collapse min-w-[760px]">
              <caption className="sr-only">The A&amp;K Sanctuary Nile ships compared</caption>
              <thead><tr className="bg-paper-card text-left">{["Ship", "Route", "Nights", "Guests", "Ages", "Cabins", "From", "What the fare covers"].map((h) => <th key={h} scope="col" className="ledger-eyebrow font-normal px-3 py-3">{h}</th>)}</tr></thead>
              <tbody>
                {ships.map((s) => {
                  const p = priceLine(s);
                  const cabins = s.cabins.reduce((a, c) => a + (c.count ?? 0), 0);
                  return (
                    <tr key={s.slug} className="border-t ledger-border align-top">
                      <th scope="row" className="px-3 py-3 text-left font-normal"><Link href={`/voyages/ships/${s.slug}`} className="ledger-display text-[17px] underline-offset-4 hover:underline">{s.name}</Link><span className="block text-[12px] ledger-muted">{s.type === "dahabiya" ? "Dahabiya" : "Riverboat"}{s.status !== "sailing" ? ` · ${s.status}` : ""}</span></th>
                      <td className="px-3 py-3">{routeOf(s)}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{nightsLabel(s)}</td>
                      <td className="px-3 py-3">{factOf(s, /guest/i) ?? "To confirm"}</td>
                      <td className="px-3 py-3">{undash(factOf(s, /child|age/i) ?? "Ask us")}</td>
                      <td className="px-3 py-3">{cabins || s.cabins.length}</td>
                      <td className="px-3 py-3 whitespace-nowrap"><span className="ledger-eyebrow block">{p.label}</span><span className="ledger-display ledger-crimson text-[16px]">{p.amount}</span></td>
                      <td className="px-3 py-3 text-[13px] ledger-muted max-w-[16rem]">{p.kind === "cruise" ? "Cruise only, per person, two sharing" : p.basis.replace(/^per person for /, "Per person, ")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ul className="md:hidden space-y-3">
            {ships.map((s) => {
              const p = priceLine(s);
              const rows: [string, string][] = [["Route", routeOf(s)], ["Nights", nightsLabel(s)], ["Guests", factOf(s, /guest/i) ?? "To confirm"], ["Ages", undash(factOf(s, /child|age/i) ?? "Ask us")], ["Cabins", String(s.cabins.reduce((a, c) => a + (c.count ?? 0), 0) || s.cabins.length)], [p.label, `${p.amount}${p.kind === "journey" ? " (full A&K journey)" : ""}`]];
              return (
                <li key={s.slug} className="border ledger-border p-4">
                  <Link href={`/voyages/ships/${s.slug}`} className="ledger-display text-[19px] underline-offset-4 hover:underline">{s.name}</Link>
                  <dl className="mt-2 text-[14px]">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-1.5 border-t ledger-rule"><dt className="ledger-eyebrow pt-0.5">{k}</dt><dd className="text-right">{v}</dd></div>)}</dl>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[12.5px] ledger-muted">Fares as published by Abercrombie &amp; Kent on 1 November 2026; we confirm them live when you ask.</p>
        </HubSection>
      </HubShell>
      <JsonLd data={graph(
        { "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Nile cruises", mainEntity: { "@type": "ItemList", itemListElement: ships.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(shipPath(s.slug)), name: s.name })) } },
        { "@type": "BreadcrumbList", itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })) },
      )} />
    </div>
  );
}
