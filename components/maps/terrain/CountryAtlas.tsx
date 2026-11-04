// The country atlas section (flag.ts atlasOn: Indonesia, approved by James on 3 Nov 2026; kill switch in flag.ts).
// Server side it gathers the pins and the official layers, draws the still poster from the house's engraved chart, and
// prints every place again as a plain list for search and answer engines. The MapLibre half loads on the client.
import type React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { SectionHead } from "@/components/record/Sections";
import LedgerChart, { projectOn, type ChartData } from "@/components/destination/LedgerChart";
import REGION_LIB from "@/lib/charts/regions.json";
import { indonesiaAtlas } from "@/lib/content/atlas/indonesia";
import { HOUSE } from "@/lib/palette";
import { atlasOn } from "./flag";
import { DIVE_FLAG, pinsOf, signed, type AtlasEntry, type AtlasPoint, type JamesNote } from "./atlas";
import JsonLd from "@/components/ledger/JsonLd";
import { Headshot } from "@/components/advisor/Desk";
import { advisorsFor } from "@/lib/content/advisors";
import { absoluteUrl } from "@/lib/seo";

const AtlasShell = dynamic(() => import("./AtlasShell"));

const ATLAS: Record<string, () => ReturnType<typeof indonesiaAtlas>> = { indonesia: indonesiaAtlas };
const fmt = (n: number, pos: string, neg: string) => `${Math.abs(n).toFixed(3)}° ${n < 0 ? neg : pos}`;
const coord = (p: { lat: number; lng: number }) => `${fmt(p.lat, "N", "S")}, ${fmt(p.lng, "E", "W")}`;

/** James's signed notes on the atlas's places (the "From the field" section of the new country page). */
export function atlasNotes(country: string): { text: string; year: number; name: string; href: string }[] {
  if (!atlasOn(country) || !ATLAS[country]) return [];
  const d = ATLAS[country]();
  const seen = new Set<string>();
  return [
    ...d.entries.filter((e) => e.jamesNote).map((e) => ({ ...e.jamesNote!, name: `${e.name}, ${e.sub}`, href: e.href })),
    ...[...d.parks, ...d.dives].filter((p) => p.jamesNote).map((p) => ({ ...p.jamesNote!, name: p.name, href: p.url })),
  ].filter((n) => (seen.has(n.text) ? false : (seen.add(n.text), true)));
}

/** The diver-down flag, as on the map: a red square with a white diagonal. */
const DiveFlag = () => (
  <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" className="shrink-0"><rect x="0.5" y="0.5" width="13" height="13" fill={DIVE_FLAG.red} stroke={HOUSE.paper} /><path d="M1 1 L13 13" stroke={DIVE_FLAG.stripe} strokeWidth="3" /></svg>
);
const Note = ({ n }: { n?: JamesNote | null }) => (n ? <span className="jw-atlas__acc-note"><span>&ldquo;{n.text}&rdquo;</span> <em>{signed(n)}</em></span> : null);

export default function CountryAtlas({ country, name, regionSlug }: { country: string; name: string; regionSlug?: string }) {
  if (!atlasOn(country) || !ATLAS[country]) return null;
  const { missing: _missing, ...data } = ATLAS[country]();
  void _missing;
  const chart = (REGION_LIB as unknown as Record<string, ChartData>)[country];
  const pins = pinsOf(data.entries);
  const onChart = (p: { lat: number; lng: number }) => chart && p.lng >= chart.bounds.w && p.lng <= chart.bounds.e && p.lat >= chart.bounds.s && p.lat <= chart.bounds.n;
  const poster = chart ? (
    <figure className="relative">
      <LedgerChart chart={chart} texture="engraved" title={`Chart of ${name} with the house's stays, voyages and World Heritage Sites`} />
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        {data.parks.filter(onChart).map((p) => { const q = projectOn(chart, p.lat, p.lng); return <rect key={p.id} x={q.x - 5} y={q.y - 5} width="10" height="10" fill={HOUSE.mist} stroke={HOUSE.graphite} strokeWidth="2" />; })}
        {pins.filter(onChart).map((p) => { const q = projectOn(chart, p.lat, p.lng); return <circle key={p.key} cx={q.x} cy={q.y} r={p.ids.length > 1 ? 7 : 5.5} fill={p.color} stroke={p.ids.length > 1 ? HOUSE.graphite : HOUSE.paper} strokeWidth="2" />; })}
      </svg>
    </figure>
  ) : <div className="jw-relief__frame" />;

  const stays = data.entries.filter((e) => e.kind === "stay");
  const voyages = data.entries.filter((e) => e.kind === "voyage");
  const group = (list: AtlasPoint[]) => [...new Set(list.map((p) => p.group))].map((g) => [g, list.filter((p) => p.group === g)] as const);
  const intro = `Every stay and voyage in the Ledger in ${name}, on the terrain, with the World Heritage Sites and the dive sites our partners name${data.volcanoes.length ? ", plus the volcano alert levels" : ""}. Tap a pin for its card, or fly the route from Bali to Komodo and Raja Ampat.`;
  // The real advisors who know the country (stand-ins never: lib/content/advisors.ts ADVISORS), James first.
  const advisors = advisorsFor({ countrySlug: country, regionSlug }).advisors.filter((a) => !a.sample);
  const planHref = (slug: string) => `/plan?advisor=${slug}&destination=${encodeURIComponent(country)}`;

  // Search and answer engines read every place: an ItemList of the World Heritage components and the dive sites, each
  // with its position (the stays carry theirs in the page's containsPlace).
  const listLd = {
    "@context": "https://schema.org", "@type": "ItemList", "@id": absoluteUrl(`/destinations/${regionSlug ?? "asia"}/${country}#atlas-places`),
    name: `${name}: World Heritage Sites and dive sites on the atlas`,
    itemListElement: [
      ...data.parks.map((p) => ({ "@type": "TouristAttraction", name: p.name, description: p.line, url: p.url, geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng }, containedInPlace: { "@type": "Country", name } })),
      ...data.dives.map((p) => ({ "@type": "Place", name: p.name, description: p.line, url: absoluteUrl(p.url), geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng }, containedInPlace: { "@type": "Place", name: p.group } })),
    ].map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
  };

  const entryRow = (e: AtlasEntry, sub: string) => (
    <li key={e.id} className="jw-atlas__acc-row">
      <span className="jw-atlas__acc-pin" style={{ background: e.color }} aria-hidden="true" />
      <span className="min-w-0">
        <Link href={e.href} className="ledger-display text-[1.05rem] hover:ledger-crimson">{e.name}</Link>
        <span className="block text-[12.5px] ledger-muted">{sub}</span>
        <Note n={e.jamesNote} />
        {e.ask?.length ? <span className="block text-[12.5px] mt-0.5">{e.ask.map((a, i) => <span key={a.first}>{i > 0 ? " · " : ""}<Link href={a.href} className="underline underline-offset-4 hover:ledger-crimson">Ask {a.first}</Link></span>)}</span> : null}
      </span>
    </li>
  );
  const pointRow = (p: AtlasPoint, icon: React.ReactNode, external: boolean) => (
    <li key={p.id} className="jw-atlas__acc-row">
      {icon}
      <span className="min-w-0">
        {external ? <a href={p.url} target="_blank" rel="noopener" className="underline underline-offset-4 hover:ledger-crimson">{p.name}</a> : <Link href={p.url} className="hover:ledger-crimson">{p.name}</Link>}
        <span className="block text-[12.5px] ledger-muted">{p.line} · {coord(p)}</span>
        <Note n={p.jamesNote} />
      </span>
    </li>
  );
  const Group = ({ id, title, count, children }: { id: string; title: string; count: number; children: React.ReactNode }) => (
    <details className="jw-atlas__acc" id={`atlas-${id}`}>
      <summary><span className="ledger-eyebrow">{title}</span><span className="jw-atlas__acc-n">{count}</span></summary>
      <div className="jw-atlas__acc-body">{children}</div>
    </details>
  );

  return (
    <section id="atlas" className="jw-relief jw-atlas mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="atlas-h" data-atlas="1">
      <div id="atlas-h"><SectionHead eyebrow={`${name} in 3D`} title={`${name}, the Atlas`} intro={intro} /></div>
      <div data-map="terrain"><AtlasShell data={data} title={`${name}, the atlas`} poster={poster} /></div>
      <p className="jw-relief__note">Drag to turn and tilt; hold Ctrl or Cmd and scroll to zoom; two fingers on a phone. Positions approximate; not a navigational or dive chart.</p>

      {advisors.length > 0 && (
        <div className="jw-atlas__plan" aria-label={`Plan ${name} with`}>
          <p className="ledger-eyebrow">Plan {name} with</p>
          <ul>
            {advisors.map((a) => (
              <li key={a.slug}>
                <Headshot a={a} size={36} />
                <span className="min-w-0"><span className="block ledger-display text-[17px] leading-tight">{a.name}</span><Link href={planHref(a.slug)} className="text-[12.5px] underline underline-offset-4 hover:ledger-crimson">Plan with {a.firstName}</Link></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Every place in plain HTML, folded: the text is in the page as served, so search and answer engines read it. */}
      <div className="jw-atlas__index mt-8">
        <Group id="stays" title="Stays" count={stays.length}>
          <ul>{stays.map((e) => entryRow(e, [e.mark, coord(e)].filter(Boolean).join(" · ")))}</ul>
        </Group>
        <Group id="voyages" title="Voyages" count={voyages.length}>
          <ul>{voyages.map((e) => entryRow(e, [e.sub, e.start ? `from ${e.start}` : null, coord(e)].filter(Boolean).join(" · ")))}</ul>
        </Group>
        <Group id="parks" title="Parks and UNESCO" count={data.parks.length}>
          {group(data.parks).map(([g, list]) => (
            <div key={g} className="jw-atlas__acc-group"><p className="text-[14px] font-semibold">{g}</p><ul>{list.map((p) => pointRow(p, <span className="jw-atlas__key jw-atlas__key--parks" aria-hidden="true" />, true))}</ul></div>
          ))}
          <p className="mt-2 text-[12px] ledger-muted">Positions and facts from the UNESCO World Heritage Centre.</p>
        </Group>
        <Group id="dives" title="Dive sites" count={data.dives.length}>
          {group(data.dives).map(([g, list]) => (
            <div key={g} className="jw-atlas__acc-group"><p className="text-[14px] font-semibold">{g}</p><ul>{list.map((p) => pointRow(p, <DiveFlag />, false))}</ul></div>
          ))}
          <p className="mt-2 text-[12px] ledger-muted">Dive sites as our partners name them. Positions approximate; not a dive chart.</p>
        </Group>
        {data.volcanoes.length > 0 && data.volcanoAsOf && (
          <Group id="volcanoes" title="Volcanoes" count={data.volcanoes.length}>
            <ul>{data.volcanoes.map((p) => <li key={p.id} className="jw-atlas__acc-row"><span className="jw-atlas__key jw-atlas__key--volcanoes" aria-hidden="true" /><span>{p.name}<span className="block text-[12.5px] ledger-muted">{p.line} · as of {data.volcanoAsOf}</span></span></li>)}</ul>
            <p className="mt-2 text-[12px] ledger-muted">Check the official status before you go: <a href={data.volcanoSource} target="_blank" rel="noopener" className="underline underline-offset-4">MAGMA Indonesia</a>, the government volcano agency.</p>
          </Group>
        )}
      </div>
      <JsonLd data={listLd} />
    </section>
  );
}
