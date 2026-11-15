import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import Pic from "@/components/opening/Pic";
import LoopVideo from "@/components/journal/LoopVideo";
import { Credit, DossierCard, TyHead, TyHero, VipStamp } from "@/components/terra-y/Dossier";
import { TY_AIRCRAFT, TY_CAMPS, TY_DOSSIERS, TY_FILES, TY_PATH, ty, tyFilm, tyPath, tyPoster, tyUsd } from "@/lib/content/terra-y";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbs, graph, touristTrip } from "@/lib/schema";

// /overland/terra-y: Terra Y, the expedition dossiers (James, 15 Nov 2026). Review build: noindex and left out of the
// menus until James approves it (house rule: design samples are reviewed before they go live).
export const metadata = buildMetadata({
  title: "Terra Y: Antarctica by Private Jet and the DC-3 Expeditions, by James Wild & Co",
  description: "Terra Y is James Wild & Co's VIP expedition file: White Desert's Antarctic camps and the South Pole, and Echo Charlie's twelve-guest DC-3 journeys. Published rates, every date.",
  path: TY_PATH,
  noindex: true,
});

const trail = [{ name: "Home", path: "/" }, { name: "Overland", path: "/overland" }, { name: "Terra Y", path: TY_PATH }];
const FAQS = [
  { q: "What is Terra Y?", a: "Terra Y is James Wild & Co's file of expedition journeys by land, ice and air, chosen by James and planned by the house: White Desert's six Antarctic trips flown from Cape Town, and Echo Charlie's three twelve-guest journeys aboard a rebuilt DC-3. Each dossier gives the route day by day, every published departure and rate, and what the house adds." },
  { q: "Who operates the journeys?", a: "White Desert runs the Antarctic camps and flights; Echo Charlie, presented by White Desert, runs the DC-3 journeys. James Wild & Co is their partner: we plan the journey around them, the nights before and after, the flights and the forms, under one Traveler Folio and one advisor." },
  { q: "How much does a private trip to Antarctica cost?", a: "White Desert publishes its rates per person sharing: US $16,500 for Antarctica in a Day, US $45,000 for Discovery Week, from US $65,000 for Baby Penguins & Blue Tunnels and from US $95,000 for the South Pole trips in the 2026 to 2027 season." },
  { q: "What is the DC-3 expedition?", a: "Echo Charlie flies twelve guests at most in a Douglas C-47 from 1942, rebuilt as a Basler BT-67, on twelve-night journeys: Peru to Patagonia from US $67,500, Colombia to Guatemala from US $54,000 and Scotland to Greenland from US $79,000 per person, all in 2027." },
];

export default function TerraYHub() {
  const ice = TY_DOSSIERS.filter((d) => d.file === "ice");
  const dc3 = TY_DOSSIERS.filter((d) => d.file === "dc3");
  return (
    <div className="theme-terra-y">
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <TyHero eyebrow="Terra Y · Expedition dossiers · The Far Edge" title="Terra Y" image={{ id: "south-pole-penguins/d4", alt: "A guest at the South Pole, where every direction is north" }} film={TY_FILES.ice.film}
          line="Expeditions chosen one at a time by James and run by the people who fly to the edge of the map: private jets onto the Antarctic ice, and a 1942 Dakota across three continents. Nine dossiers, every date, every published rate."
          stats={[["Dossiers", "Nine, TY-001 to TY-009"], ["Farthest", "90° South"], ["Aircraft", "Airbus, Basler BT-67"], ["Group", "Six suites to twelve seats"]]}>
          <a href="#ice" className="ty-btn">Open File A · The Ice <span aria-hidden>→</span></a>
          <a href="#dc3" className="ty-btn-line" style={{ color: "var(--ty-frost)" }}>File B · The DC-3</a>
        </TyHero>

        <section className="ty-chart">
          <div className="max-w-ledger mx-auto px-5 md:px-10 py-6"><Breadcrumbs trail={trail} /></div>
          <div className="max-w-ledger mx-auto px-5 md:px-10 pb-16 grid md:grid-cols-[1.4fr_1fr] gap-10 items-start">
            <div>
              <TyHead code="Briefing · In short" title="A House File for the Far Edge" />
              <p className="mt-5 text-[17px] leading-relaxed text-graphite">Terra Y is the James Wild & Co file for journeys where the way in is the adventure: White Desert&rsquo;s camps on the Antarctic ice, flown from Cape Town, and Echo Charlie&rsquo;s twelve-guest DC-3 journeys across South America, Central America and the North Atlantic. Each dossier carries its number, the route day by day with its coordinates, every published departure and rate, and what the house adds around it.</p>
              <p className="mt-4 text-[17px] leading-relaxed text-graphite">The brands run the flights and the camps. We plan the rest: the nights before and after, the long-haul flights, the forms and the kit, under one Traveler Folio and one advisor.</p>
            </div>
            <div className="bg-white border p-6" style={{ borderColor: "var(--ty-ice)", borderTop: "3px solid var(--ty-night)" }}>
              <div className="flex justify-between items-start gap-4"><p className="ty-mono text-[10.5px]" style={{ color: "var(--ty-chart)" }}>Index of dossiers</p><VipStamp light /></div>
              <ol className="mt-4 divide-y" style={{ borderColor: "var(--ty-mist)" }}>
                {TY_DOSSIERS.map((d) => (
                  <li key={d.slug} className="py-2.5 flex items-baseline gap-3" style={{ borderColor: "var(--ty-mist)" }}>
                    <span className="ty-mono text-[10px] w-14 shrink-0" style={{ color: d.file === "ice" ? "var(--ty-chart)" : "var(--ty-signal-deep)" }}>{d.no}</span>
                    <Link href={tyPath(d.slug)} className="flex-1 hover:underline" style={{ color: "var(--ty-night)" }}>{d.title}</Link>
                    <span className="ty-mono text-[9.5px]" style={{ color: "var(--ty-chart)" }}>{tyUsd(d.from)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="ice" className="ty-chart border-t-4" style={{ borderColor: "var(--ty-glacier)" }}>
          <div className="max-w-ledger mx-auto px-5 md:px-10 py-16 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <TyHead code={`${TY_FILES.ice.code} · ${TY_FILES.ice.operator} · Queen Maud Land`} title="The Ice" intro={TY_FILES.ice.line} />
              <Credit file="ice" />
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{ice.map((d) => <DossierCard key={d.slug} d={d} />)}</div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {TY_CAMPS.map((c) => (
                <figure key={c.name} className="bg-white ty-edge-ice">
                  <div className="relative aspect-[3/2] overflow-hidden"><Pic src={ty(c.photo.id, 1200)} alt={c.photo.alt} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover ty-fade-b" /></div>
                  <figcaption className="p-4">
                    <p className="ty-mono text-[10px]" style={{ color: "var(--ty-chart)" }}>⌖ {c.coords}</p>
                    <p className="ledger-display text-[1.3rem] mt-1" style={{ color: "var(--ty-night)" }}>{c.name}</p>
                    <p className="text-[14px] mt-1 text-graphite">{c.line}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="dc3" className="ty-night">
          <div className="max-w-ledger mx-auto px-5 md:px-10 py-16 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <TyHead light={false} code={`${TY_FILES.dc3.code} · ${TY_FILES.dc3.operator} · Modern Odysseys`} title="The DC-3" intro={TY_FILES.dc3.line} />
              <Credit file="dc3" />
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">{dc3.map((d) => <DossierCard key={d.slug} d={d} />)}</div>
            <div className="mt-16 grid gap-8 md:grid-cols-[1.2fr_1fr] items-start">
              <div className="relative aspect-video overflow-hidden border" style={{ borderColor: "var(--ty-chart)" }}>
                <LoopVideo src={tyFilm("basler")} poster={tyPoster("basler")} label="The Basler BT-67 in flight, in black and white" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div>
                <p className="ty-mono text-[10.5px]" style={{ color: "var(--ty-glacier)" }}>The aircraft</p>
                <h3 className="ledger-display text-[2rem] mt-1" style={{ color: "var(--ty-frost)" }}>{TY_AIRCRAFT.name}</h3>
                <p className="mt-3 text-[15.5px] leading-relaxed" style={{ color: "var(--ty-mist)" }}>{TY_AIRCRAFT.story}</p>
                <dl className="mt-5 border-t" style={{ borderColor: "var(--ty-chart)" }}>
                  {TY_AIRCRAFT.facts.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5 border-b" style={{ borderColor: "var(--ty-chart)" }}>
                      <dt className="ty-mono text-[10px]" style={{ color: "var(--ty-glacier)" }}>{k}</dt>
                      <dd className="text-[14.5px]" style={{ color: "var(--ty-frost)" }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="ty-chart">
          <div className="max-w-ledger mx-auto px-5 md:px-10 py-14">
            <FaqBlock faqs={FAQS} title="Terra Y, Answered" />
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link href="/plan?from=terra-y" className="ty-btn">Plan a Terra Y journey <span aria-hidden>→</span></Link>
              <p className="text-[14px] text-graphite">Every enquiry comes to the house; one advisor holds the dossier from first call to last night.</p>
            </div>
          </div>
        </section>
      </main>
      <JsonLd data={graph(breadcrumbs(trail), ...TY_DOSSIERS.map((d) => touristTrip({ path: tyPath(d.slug), name: `${d.title} (${d.operator})`, description: d.answer })))} />
    </div>
  );
}
