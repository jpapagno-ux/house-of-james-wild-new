import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import AtlasResults from "@/components/atlas/AtlasResults";
import { ATLAS_ON } from "@/lib/atlas/flag";
import { atlasPlaces } from "@/lib/atlas/places";
import { buildMetadata } from "@/lib/seo";

// /atlas: the Atlas results (Phase 01 staging pilot, James, 20 Nov 2026). One address for every search across stays,
// safaris, voyages and journeys; the search itself lives in the query string and is answered in the browser.
// Not found unless the pilot is on (lib/atlas/flag.ts). noindex throughout the pilot: stay, ship, voyage and
// destination pages remain the canonical pages, and no filtered address is ever offered to search engines.
export function generateMetadata() {
  return buildMetadata({ title: "The Atlas: Search Stays, Safaris, Voyages and Journeys", description: "Search every stay, safari camp, ship, voyage and route in the James Wild & Co Ledger by place, category, dates, travellers and interest.", path: "/atlas", noindex: true });
}

export default function AtlasPage() {
  if (!ATLAS_ON) notFound();
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-[70vh]">
        <AtlasResults places={atlasPlaces()} />
        <section className="max-w-[1400px] mx-auto px-5 md:px-10 pb-14" aria-labelledby="atlas-how">
          <div className="border-t ledger-border pt-8 grid gap-6 md:grid-cols-3 max-w-5xl">
            <h2 id="atlas-how" className="sr-only">How to read a result</h2>
            <div><p className="ledger-eyebrow">Season</p><p className="text-[14px] leading-relaxed mt-1.5">Whether your dates fall in the months the Ledger files as best for that country, or when a ship sails. It says nothing about rooms.</p></div>
            <div><p className="ledger-eyebrow">Offer</p><p className="text-[14px] leading-relaxed mt-1.5">The partner&rsquo;s own filed words, with the date its terms were last checked. An offer applies only when every condition can be checked from your search; otherwise an advisor confirms it.</p></div>
            <div><p className="ledger-eyebrow">Availability</p><p className="text-[14px] leading-relaxed mt-1.5">Ships show departures as their operators publish them. For stays, availability is confirmed by the house, and nothing is held until you ask.</p></div>
          </div>
        </section>
      </main>
    </>
  );
}
