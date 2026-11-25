import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import AtlasResults from "@/components/atlas/AtlasResults";
import { ATLAS_INDEXABLE, ATLAS_ON } from "@/lib/atlas/flag";
import { ATLAS_FAQ, ATLAS_INTRO } from "@/lib/atlas/faq";
import JsonLd from "@/components/ledger/JsonLd";
import { atlasPlaces } from "@/lib/atlas/places";
import { speciesByPlace } from "@/lib/field-notes/by-place";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

// /atlas: the Atlas results (Phase 01 staging pilot, James, 20 Nov 2026). One address for every search across stays,
// safaris, voyages and journeys; the search itself lives in the query string and is answered in the browser.
// Not found unless the pilot is on (lib/atlas/flag.ts). noindex throughout the pilot (ATLAS_INDEXABLE turns /atlas
// itself on at launch): stay, ship, voyage and destination pages remain the canonical pages, and a filtered address
// always carries /atlas as its canonical, so no filtered list is ever offered to search engines.
export function generateMetadata() {
  return buildMetadata({ title: "The Atlas: Search Stays, Safaris, Voyages and Journeys", description: "Search every stay, safari camp, ship, voyage and route in the James Wild & Co Ledger by place, category, dates, travellers and interest.", path: "/atlas", noindex: !ATLAS_INDEXABLE });
}

export default function AtlasPage() {
  if (!ATLAS_ON) notFound();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: ATLAS_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "James Wild & Co", url: absoluteUrl("/"), potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/atlas")}?where={search_term_string}` }, "query-input": "required name=search_term_string" } }} />
      <SiteHeader />
      <main id="main" className="min-h-[70vh]">
        <AtlasResults places={atlasPlaces()} wildlife={speciesByPlace()} />
        <section className="max-w-[1400px] mx-auto px-5 md:px-10 pb-14" aria-labelledby="atlas-how">
          <div className="border-t ledger-border pt-8 grid gap-6 md:grid-cols-3 max-w-5xl">
            <h2 id="atlas-how" className="sr-only">How to read a result</h2>
            <div><p className="ledger-eyebrow">Season</p><p className="text-[14px] leading-relaxed mt-1.5">Whether your dates fall in the months the Ledger files as best for that country, or when a ship sails. It says nothing about rooms.</p></div>
            <div><p className="ledger-eyebrow">Offer</p><p className="text-[14px] leading-relaxed mt-1.5">The partner&rsquo;s own filed words, with the date its terms were last checked. An offer applies only when every condition can be checked from your search; otherwise an advisor confirms it.</p></div>
            <div><p className="ledger-eyebrow">Availability</p><p className="text-[14px] leading-relaxed mt-1.5">Ships show departures as their operators publish them. For stays, availability is confirmed by the house, and nothing is held until you ask.</p></div>
          </div>
        </section>
        <section className="bg-mist border-t ledger-border" aria-labelledby="atlas-about-h">
          <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-10 md:py-14 grid gap-8 md:grid-cols-[1fr_2fr]">
            <div>
              <p className="ledger-eyebrow">About the Atlas</p>
              <h2 id="atlas-about-h" className="ledger-display text-[1.7rem] md:text-[2.1rem] leading-tight mt-2">One search across the whole Ledger</h2>
              <p className="text-[15px] leading-relaxed mt-3">{ATLAS_INTRO}</p>
            </div>
            <dl className="border-t ledger-border">
              {ATLAS_FAQ.map((f) => (
                <div key={f.q} className="py-4 border-b ledger-border">
                  <dt className="ledger-display text-[1.2rem] leading-snug">{f.q}</dt>
                  <dd className="text-[14.5px] leading-relaxed mt-1.5 max-w-3xl">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </>
  );
}
