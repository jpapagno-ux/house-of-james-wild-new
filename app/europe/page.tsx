import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import { AdvisorScroll } from "@/components/advisor/Desk";
import { HubShell, HubSection, RecordCard } from "@/components/hub/Hub";
import { HOUSE_LOOP } from "@/lib/content/home";
import { STAYS, altFor, pageReady } from "@/lib/content/stays";
import { REGION_DATA } from "@/lib/content/regions";
import { recordHref } from "@/lib/ledger/urls";
import { VOLUMES } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /europe: Volume VI, Other Europe. Not the capitals and the queues: the
// valleys, islands and river towns James keeps going back to, grouped by
// country from the Ledger, with the river cruises as the cross-sell to
// Voyages. Country pages under /destinations/europe open as each is built.
const PATH = "/europe";
const V = VOLUMES.find((v) => v.href === PATH)!;
const EU = STAYS.filter((s) => s.regionSlug === "europe" && s.hero);
const byCountry = EU.reduce<Record<string, typeof EU>>((g, s) => { const k = (s.country ?? "Elsewhere").replace(" + Azores", ""); (g[k] = g[k] || []).push(s); return g; }, {});
const COUNTRIES = Object.entries(byCountry).sort((a, b) => b[1].length - a[1].length);
const region = REGION_DATA.find((r) => r.slug === "europe");

export const metadata = buildMetadata({
  title: "Other Europe: The Valleys, Islands and River Towns, Vetted",
  description: `Volume VI of the James Wild & Co Ledger: ${EU.length} stays across ${COUNTRIES.length} countries — Ireland's country houses, the Douro and the Alentejo, the Balearics, the Alps — not the capitals and the queues. Often paired with a river cruise.`,
  path: PATH,
});

const STANCE: [string, string][] = [
  ["Not the capitals", "Rome, Paris and London are in the Ledger as a night on the way through. The volume is for the places you fly past."],
  ["A valley, an island, a river town", "Ireland's country houses, the Douro, the Alentejo, Ibiza off-season, the Alps when the lifts are quiet."],
  ["Before or after a river", "Most Other Europe journeys pair with a river cruise: the Douro, the Danube, the Rhône. The house plans the stays either side of the boat."],
  ["Three nights, as everywhere", "Slow enough to learn the baker's name. Worth Another Night offers apply here as they do on safari."],
];

export default function EuropeHub() {
  const total = EU.length;
  return (
    <>
      <SiteHeader />
      <HubShell
        name="Other Europe"
        path={PATH}
        eyebrow="Volume VI · Other Europe"
        title="Not the Capitals and the Queues"
        intro={`${V.intro} ${total} stays across ${COUNTRIES.length} countries, every one filed in the Ledger.`}
        browse={V.browse}
        film={{ poster: HOUSE_LOOP.poster, mp4: HOUSE_LOOP.mp4, webm: HOUSE_LOOP.webm, alt: HOUSE_LOOP.label, eyebrow: "The house film", title: "The Europe most travellers are never shown.", credit: "Film by Felix Studios", href: "/#film" }}
        answer={`Other Europe is the sixth volume of the James Wild & Co Ledger: ${total} vetted stays across ${COUNTRIES.map(([c]) => c).join(", ")} — country houses, quintas, island retreats and alpine lodges away from the capitals — each with a permanent Ledger ID. The house pairs them with river cruises on the Douro, Danube and Rhône, planned either side of the boat, and plans three nights or more in each place.`}
        filling="Country pages for Ireland, Portugal, Spain, Italy, Switzerland and France open under Destinations as each is built; the Greek islands and Mallorca are there now."
        closeTitle="Tell James the valley you've always meant to find."
      >
        <HubSection eyebrow="The stance" title="What Other Europe Means Here" id="stance-h">
          <ul className="grid md:grid-cols-2 gap-px bg-ink/15 border border-ink/15">
            {STANCE.map(([t, l], i) => (
              <li key={t} className="bg-paper p-6 flex gap-4"><span className="ledger-display text-[2rem] leading-none ledger-crimson w-10 shrink-0">{String(i + 1).padStart(2, "0")}</span><span><span className="ledger-display text-[1.35rem] leading-tight">{t}</span><span className="block mt-2 text-[15px] ledger-muted leading-relaxed">{l}</span></span></li>
            ))}
          </ul>
        </HubSection>

        {COUNTRIES.map(([country, stays]) => (
          <HubSection key={country} eyebrow={`${stays.length} ${stays.length === 1 ? "stay" : "stays"} in the Ledger`} title={country} id={`c-${country.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stays.map((s) => (
                <li key={s.slug}><RecordCard volume="europe" name={s.name} id={s.ledgerId ?? "Being filed"} line={s.tagline ?? ""} image={{ url: s.hero as string, alt: altFor(s.hero as string, s.name, s.country) }} href={pageReady(s) ? recordHref("stay", s.slug) : `/plan?q=${encodeURIComponent(s.name)}`} /></li>
              ))}
            </ul>
          </HubSection>
        ))}

        <HubSection eyebrow="Before or after" title="The River, Then the Valley" id="rivers-h" more={{ label: "Voyages, Volume IV", href: "/voyages" }}>
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
            <p className="text-[17px] leading-relaxed max-w-2xl">A river cruise is the easiest week in Europe: one unpacking, the towns come to you. The house plans the stays either side of it — a quinta above the Douro before Porto, a country house in the Wachau after the Danube — so the boat is the middle of the journey, not the whole of it. Ask for the river and James will draw the rest.</p>
            <ul className="space-y-2 text-[15px]">
              {[["The Douro", "Porto and the valley quintas; Six Senses Douro Valley either side"], ["The Danube", "Vienna to Budapest, with the Wachau's villages between"], ["The Rhône", "Lyon to Arles; Provence and the Camargue after"]].map(([r, l]) => (
                <li key={r} className="flex gap-3 border-t ledger-border pt-2"><span className="ledger-display text-[1.15rem] w-28 shrink-0">{r}</span><span className="ledger-muted leading-snug">{l}</span></li>
              ))}
              <li className="pt-2"><Link href="/plan?q=river%20cruise%20Europe" className="ledger-btn-ghost">Plan a river and its valley</Link></li>
            </ul>
          </div>
        </HubSection>

        {region && <HubSection eyebrow="On the chart" title="Europe, Pinned" id="map-h" more={{ label: "The Europe region page", href: "/destinations/europe" }}><p className="-mt-4 text-[16px] ledger-muted max-w-2xl">Every Other Europe stay with a position on file is pinned on the region chart, country by country, with the Greek islands and Mallorca open now.</p></HubSection>}

        <AdvisorScroll volume="europe" title="Who knows Other Europe" />
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Other Europe", mainEntity: { "@type": "ItemList", itemListElement: EU.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: absoluteUrl(recordHref("stay", s.slug)) })) } })} />
    </>
  );
}
