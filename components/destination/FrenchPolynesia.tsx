import Link from "next/link";
import LagoonAtlas, { type LagoonChart, type LagoonStayPin } from "./LagoonAtlas";
import IslandHops from "./IslandHops";
import ShipCard from "@/components/ships/ShipCard";
import LAGOON_CHARTS from "@/lib/charts/lagoons.json";
import { LAGOONS, LEGS, MARQUESAS_UNESCO, NODES, ROUTES, ISLANDS_DREAM } from "@/lib/content/french-polynesia";
import { STAYS, pageReady } from "@/lib/content/stays";
import { recordHref } from "@/lib/ledger/urls";
import { registryShip } from "@/lib/content/ships/registry";
import { shipCard, watersCards } from "@/lib/content/ships/cards";
import { exceptionalFewFor, collectionNo } from "@/lib/content/exceptional-few";
import { volumeInk } from "@/lib/volumes";

// French Polynesia (Tahiti) country page modules (James, 2 Nov 2026), on the archipelago template (voyages plan
// Part 15): the lagoon atlas, the island-hopping routes on Air Tahiti's network, the ships that sail here, the
// house partners, and The Exceptional Few in these islands. Server side: it reads the released stays and passes
// only names, pins and links to the two client maps. A stay that is not released simply drops out.

const CHARTS = LAGOON_CHARTS as unknown as Record<string, LagoonChart>;

export default function FrenchPolynesia() {
  const fp = STAYS.filter((s) => s.countrySlug === "tahiti");
  const ready = (slug: string) => fp.find((s) => s.slug === slug && pageReady(s));
  const pins: LagoonStayPin[] = fp.filter((s) => s.coords).map((s) => ({ slug: s.slug, name: s.name.replace(/\s+by Pearl Resorts$/, ""), href: pageReady(s) ? recordHref("stay", s.slug) : null, lat: s.coords!.lat, lng: s.coords!.lng }));
  const stayHref = Object.fromEntries(fp.filter(pageReady).map((s) => [s.slug, recordHref("stay", s.slug)]));
  const ships = watersCards("tahiti");
  const shipHref = Object.fromEntries(["star-breeze", "wind-star"].map((k) => { const r = registryShip(k); const c = r ? shipCard(r) : null; return [k, c ? { name: c.name, href: c.href } : null]; }).filter(([, v]) => v)) as Record<string, { name: string; href: string }>;
  const ef = ["pearl-resort-vahine-private-island", "the-brando-tetiaroa"].map((slug) => { const s = ready(slug); const e = s ? exceptionalFewFor(s.ledgerId) : null; return s && e ? { s, e } : null; }).filter((x): x is NonNullable<typeof x> => !!x);
  return (
    <>
      <LagoonAtlas lagoons={LAGOONS} charts={CHARTS} stays={pins} stayInk={volumeInk("stays")} />
      <IslandHops chart={CHARTS.whole} nodes={NODES} legs={LEGS} routes={ROUTES} unesco={MARQUESAS_UNESCO} stayHref={stayHref} shipHref={shipHref} airInk={volumeInk("voyages")} seaInk="#0C5D61" offerLine={ISLANDS_DREAM.name} />

      {ef.length > 0 && (
        <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="fp-ef-heading">
          <p className="ledger-eyebrow ledger-crimson">The Exceptional Few&trade; in French Polynesia</p>
          <h2 id="fp-ef-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Two Islands You Can Have to Yourselves</h2>
          <ul className="mt-6 grid md:grid-cols-2 gap-6">
            {ef.map(({ s, e }) => (
              <li key={s.slug} className="border ledger-border p-5 bg-paper">
                <p className="ledger-eyebrow">{collectionNo(e.collectionNumber)}</p>
                <Link href={recordHref("stay", s.slug)} className="ledger-display text-2xl mt-1 block hover:text-[var(--jw-action-deep)]">{e.stayName ?? s.name}</Link>
                {e.heroLine && <p className="mt-2 ledger-display italic text-[1.15rem]">{e.heroLine}</p>}
                <p className="mt-3 text-[15px] ledger-muted">{e.whyItMadeTheCut[1] ?? e.whyItMadeTheCut[0]}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="sail" className="mt-16 md:mt-24 border-t-2 pt-8 scroll-mt-32 lg:scroll-mt-[212px]" style={{ borderTopColor: volumeInk("voyages") }} aria-labelledby="fp-sail-heading">
        <p className="ledger-eyebrow" style={{ color: volumeInk("voyages") }}>Sail it · Windstar in French Polynesia</p>
        <h2 id="fp-sail-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Which Windstar Ship Sails Tahiti?</h2>
        <p className="mt-3 text-[16px] max-w-3xl">Star Breeze, Windstar&rsquo;s 312-guest all-suite yacht, sails Tahiti year round from Papeete. From March 2027 Wind Star, its four-masted sailing yacht for 148 guests, joins her on the 7-night Dreams of Tahiti, calling at Raiatea every week. James has sailed Windstar in these islands himself, with his wife.</p>
        {ships.length > 0 && <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ships.map((c) => <li key={c.slug}><ShipCard c={c} /></li>)}</ul>}
        <Link href="/partners/windstar" className="mt-5 inline-block ledger-btn-ghost">Windstar, the partner</Link>
      </section>

      <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 grid md:grid-cols-[1.2fr_1fr] gap-8 items-start" aria-labelledby="fp-pearl-heading">
        <div>
          <p className="ledger-eyebrow ledger-crimson">House partner · every resort founder vetted</p>
          <h2 id="fp-pearl-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Pearl Resorts of Tahiti</h2>
          <p className="mt-3 text-[16px] leading-relaxed">Le Taha&rsquo;a, Le Bora Bora, Vahine Private Island, Le Tikehau, Le Nuku Hiva and Le Tahiti, across three archipelagos. James has founder vetted every one; Le Taha&rsquo;a, on his favourite island, is a founder favourite.</p>
          <Link href="/partners/pearl-resorts" className="mt-5 inline-block ledger-btn">See every Pearl resort</Link>
        </div>
        <div className="border-l-2 pl-5" style={{ borderColor: "var(--jw-action)" }}>
          <p className="ledger-eyebrow">{ISLANDS_DREAM.name}</p>
          <p className="ledger-display text-xl mt-1">{ISLANDS_DREAM.headline}</p>
          <p className="mt-2 text-[14.5px] ledger-muted">{ISLANDS_DREAM.terms}</p>
        </div>
      </section>
    </>
  );
}
