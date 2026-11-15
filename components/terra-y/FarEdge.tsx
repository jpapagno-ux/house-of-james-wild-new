import Link from "next/link";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import Pic from "@/components/opening/Pic";
import LoopVideo from "@/components/journal/LoopVideo";
import { DossierCard, TyHead, TyHero, VipStamp } from "@/components/terra-y/Dossier";
import { PATHWAY_ANSWER, PATHWAY_FAQS } from "@/lib/content/pathways/copy";
import { PATHWAYS } from "@/lib/pathways";
import { TY_DOSSIERS, TY_FILES, TY_PATH, ty, tyFilm, tyPath, tyPoster } from "@/lib/content/terra-y";
import { breadcrumbs, graph } from "@/lib/schema";

// /pathways/the-far-edge (James, 15 Nov 2026: "very adventure, expedition style… like an Exceptional Few photo
// landing. Series of images with a scroll… videos… contours and Antarctica maps as a backdrop, faded"). The ninth
// pathway's own landing in the Polar Chart theme: the film hero, a scroll deck of full-screen photographs that stack
// as you go, a reel of the brands' films, the Terra Y dossiers, and the rest of the far edge in the Ledger. The
// backdrop is Antarctica's own coastline with contour rings and a polar graticule (public/terra-y-antarctica.svg,
// drawn from the OSM land polygons), faded into the chart grid.

const P = PATHWAYS["PATH-09"];
const PATH = `/pathways/${P.key}`;

const DECK: { id: string; alt: string; coord: string; kicker: string; line: string; href: string }[] = [
  { id: "south-pole-penguins/d4", alt: "A guest at the South Pole, where every direction is north", coord: "90° 00′ S", kicker: "The bottom of the world", line: "Fewer than 500 people stand here in a year. Every direction is north.", href: tyPath("south-pole-penguins") },
  { id: "south-pole-penguins/colony", alt: "Thousands of Emperor penguins on the sea ice at Atka Bay", coord: "Atka Bay, Queen Maud Land", kicker: "The colony", line: "Thousands of Emperors on the sea ice, reached by a flight over the shelf.", href: tyPath("baby-penguins-blue-tunnels") },
  { id: "south-pole-blue-rivers/hero", alt: "Blue meltwater rivers across the Antarctic ice, from the air", coord: "70° 48′ S, 11° 23′ E", kicker: "The Blue Rivers", line: "A few weeks each summer, the ice runs blue.", href: tyPath("south-pole-blue-rivers") },
  { id: "baby-penguins-blue-tunnels/d4", alt: "Walking through the sapphire walls of the ice tunnels", coord: "Queen Maud Land", kicker: "Inside the ice", line: "Tunnels carved by meltwater over thousands of years.", href: tyPath("baby-penguins-blue-tunnels") },
  { id: "aircraft/cabin", alt: "The leather-seated cabin of the Basler BT-67", coord: "Douglas C-47, 1942", kicker: "The DC-3", line: "A wartime Dakota, rebuilt for twelve guests and runways no airline uses.", href: tyPath("scotland-to-greenland") },
  { id: "scotland-to-greenland/hero", alt: "Icebergs crowding the Ilulissat Icefjord", coord: "69° 13′ N, 51° 06′ W", kicker: "Ilulissat", line: "The fjord where the ice sheet calves into the sea.", href: tyPath("scotland-to-greenland") },
  { id: "peru-to-patagonia/hero", alt: "The towers of Torres del Paine above the steppe", coord: "51° 00′ S, 72° 55′ W", kicker: "Patagonia", line: "Where the continent ends in granite and glaciers.", href: tyPath("peru-to-patagonia") },
];

const REEL = [
  { film: "south-pole-penguins", title: "South Pole & Emperors", credit: "White Desert" },
  { film: "baby-penguins-blue-tunnels", title: "The blue ice tunnels", credit: "White Desert" },
  { film: "echo-charlie", title: "Echo Charlie, the DC-3", credit: "Echo Charlie" },
];

const MORE = [
  { href: "/stays/white-desert", title: "White Desert", line: "The Ledger record: three camps in Queen Maud Land, flown from Cape Town.", img: ty("camps/echo", 900), alt: "An Echo Base sleeping pod looking out on the ice" },
  { href: "/voyages/polar", title: "Polar voyages", line: "Antarctica21's air-cruises over the Drake and the small-ship voyages to South Georgia.", img: ty("south-pole-penguins/d3", 900), alt: "Hikers above the Antarctic ice sheet" },
  { href: "/destinations/polar-antarctica", title: "Antarctica, the destination", line: "Stays, routes and how to reach the White Continent.", img: ty("the-long-stay/d2", 900), alt: "A guide walking through a channel of blue ice" },
];

export default function FarEdge() {
  const trail = [{ name: "Home", path: "/" }, { name: "Pathways", path: "/pathways" }, { name: P.name, path: PATH }];
  return (
    <div className="theme-terra-y">
      <main id="main" className="overflow-x-clip">
        <TyHero eyebrow={`Wild Pathways · ${P.id} · ${P.setting}`} title={P.name} image={{ id: "the-long-stay/d4", alt: "The marker at the Geographic South Pole" }} film={TY_FILES.ice.film}
          line="The last wild edges of the map, and the small planes, ships and ice camps that reach them. Vetted by James or a named partner, every one."
          stats={[["Farthest south", "90° 00′ S"], ["Farthest north", "69° 13′ N"], ["Terra Y dossiers", "Nine"], ["Way in", "Jet, DC-3, ship"]]}
          stamp={<VipStamp line="The Far Edge" />}>
          <a href="#deck" className="ty-btn">Go to the edge <span aria-hidden>→</span></a>
          <Link href={TY_PATH} className="ty-btn-line" style={{ color: "var(--ty-frost)" }}>Terra Y dossiers</Link>
        </TyHero>

        {/* the briefing on the chart, Antarctica's contours faded behind */}
        <section className="ty-chart relative overflow-hidden">
          <div aria-hidden className="absolute -right-[18%] -top-[10%] w-[85%] max-w-[1100px] opacity-[0.22] pointer-events-none" style={{ aspectRatio: "1000 / 847", background: "url(/terra-y-antarctica.svg) center / contain no-repeat" }} />
          <div className="relative max-w-ledger mx-auto px-5 md:px-10 py-6"><Breadcrumbs trail={trail} /></div>
          <div className="relative max-w-ledger mx-auto px-5 md:px-10 pb-20 md:pb-28 grid md:grid-cols-[1.3fr_1fr] gap-10">
            <div>
              <TyHead code={`Briefing · ${P.id}`} title="Where the Map Runs Out" />
              <p className="mt-5 text-[18px] leading-relaxed" style={{ color: "var(--ty-night)" }}>{PATHWAY_ANSWER["PATH-09"]}</p>
              <p className="mt-4 text-[16px] leading-relaxed text-graphite">{P.line} The Far Edge is the ninth of the house&rsquo;s Wild Pathways, and the only one where reaching the place is half the story: a private jet onto blue ice, a Basler to the Pole, a 1942 Dakota into the Greenland ice sheet.</p>
            </div>
            <ul className="self-end grid grid-cols-2 gap-px border" style={{ background: "var(--ty-ice)", borderColor: "var(--ty-ice)" }}>
              {[["90° S", "The Geographic South Pole"], ["−50 °C", "What an Emperor chick's down holds out"], ["12", "Guests on the DC-3, at most"], ["1942", "The year the Dakota first flew for the Air Force"]].map(([k, v]) => (
                <li key={k} className="bg-white/90 p-5">
                  <p className="ledger-display text-[2rem] leading-none" style={{ color: "var(--ty-night)" }}>{k}</p>
                  <p className="ty-mono text-[9.5px] mt-2" style={{ color: "var(--ty-chart)" }}>{v}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* the scroll deck: full-screen photographs that stack as you scroll (CSS sticky, no script) */}
        <section id="deck" aria-label="The far edge in photographs" className="relative" style={{ background: "var(--ty-night)" }}>
          {DECK.map((c, i) => (
            <figure key={c.id} className="sticky top-0 h-[100svh] overflow-hidden">
              <Pic src={ty(c.id, 2400)} alt={c.alt} sizes="100vw" className="object-cover" upscaleUnder={2000} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, color-mix(in srgb, var(--ty-night) 88%, transparent) 0%, transparent 45%), linear-gradient(90deg, color-mix(in srgb, var(--ty-night) 45%, transparent), transparent 55%)" }} />
              <figcaption className="absolute inset-x-0 bottom-0 max-w-ledger mx-auto px-5 md:px-10 pb-12 md:pb-16">
                <p className="ty-mono text-[10.5px]" style={{ color: "var(--ty-ice)" }}>{String(i + 1).padStart(2, "0")} / {String(DECK.length).padStart(2, "0")} · ⌖ {c.coord}</p>
                <p className="ledger-display text-[2.4rem] md:text-[4.2rem] leading-[1] mt-2" style={{ color: "var(--ty-frost)" }}>{c.kicker}</p>
                <p className="mt-3 text-[16px] md:text-[18px] max-w-xl" style={{ color: "var(--ty-mist)" }}>{c.line}</p>
                <Link href={c.href} className="mt-5 inline-flex ty-mono text-[10.5px] border-b pb-1" style={{ color: "var(--ty-frost)", borderColor: "var(--ty-signal)" }}>Open the dossier →</Link>
              </figcaption>
              <span aria-hidden className="absolute right-5 md:right-10 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2">
                {DECK.map((_, j) => <span key={j} className="block h-6 w-[3px]" style={{ background: j === i ? "var(--ty-signal)" : "color-mix(in srgb, var(--ty-frost) 35%, transparent)" }} />)}
              </span>
            </figure>
          ))}
        </section>

        {/* the reel */}
        <section className="ty-night relative overflow-hidden">
          <div aria-hidden className="absolute -left-[20%] top-0 w-[80%] max-w-[1000px] opacity-[0.12] pointer-events-none" style={{ aspectRatio: "1000 / 847", background: "url(/terra-y-antarctica.svg) center / contain no-repeat" }} />
          <div className="relative max-w-ledger mx-auto px-5 md:px-10 py-16 md:py-24">
            <TyHead light={false} code="The reel · Films from the edge" title="Watch It Before You Go" intro="The brands' own films, playing silent as you pass." />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {REEL.map((r) => (
                <figure key={r.film} className="border" style={{ borderColor: "var(--ty-chart)" }}>
                  <div className="relative aspect-[4/5] overflow-hidden"><LoopVideo src={tyFilm(r.film)} poster={tyPoster(r.film)} label={r.title} className="absolute inset-0 h-full w-full object-cover" /></div>
                  <figcaption className="px-4 py-3 flex justify-between gap-3">
                    <span className="text-[14px]" style={{ color: "var(--ty-frost)" }}>{r.title}</span>
                    <span className="ty-mono text-[9.5px]" style={{ color: "var(--ty-glacier)" }}>Film: {r.credit}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* the collection */}
        <section className="ty-chart relative overflow-hidden">
          <div aria-hidden className="absolute -right-[25%] bottom-0 w-[90%] max-w-[1200px] opacity-[0.16] pointer-events-none" style={{ aspectRatio: "1000 / 847", background: "url(/terra-y-antarctica.svg) center / contain no-repeat" }} />
          <div className="relative max-w-ledger mx-auto px-5 md:px-10 py-16 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <TyHead code="On this pathway · Terra Y" title="Nine Expedition Dossiers" intro="Hand-picked by James, run by White Desert and Echo Charlie, planned end to end by the house." />
              <VipStamp light />
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{TY_DOSSIERS.map((d) => <DossierCard key={d.slug} d={d} />)}</div>

            <div className="mt-20">
              <TyHead code="Also on the far edge" title="More From the Ledger" />
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {MORE.map((m) => (
                  <Link key={m.href} href={m.href} className="group block bg-white ty-edge-ice">
                    <div className="relative aspect-[3/2] overflow-hidden"><Pic src={m.img} alt={m.alt} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover ty-fade-b group-hover:scale-[1.03] transition-transform duration-700" /></div>
                    <div className="p-5 pt-2">
                      <p className="ledger-display text-[1.4rem]" style={{ color: "var(--ty-night)" }}>{m.title}</p>
                      <p className="text-[14px] mt-1 text-graphite">{m.line}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-20"><FaqBlock faqs={PATHWAY_FAQS["PATH-09"]} title="The Far Edge, Answered" /></div>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link href="/plan?from=the-far-edge" className="ty-btn">Plan a far-edge journey <span aria-hidden>→</span></Link>
              <p className="text-[14px] text-graphite">Every enquiry comes to the house. One advisor, one Folio, from the first call to the last night.</p>
            </div>
          </div>
        </section>
      </main>
      <JsonLd data={graph(breadcrumbs(trail))} />
    </div>
  );
}
