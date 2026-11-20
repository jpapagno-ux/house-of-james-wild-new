import Link from "next/link";
import AtlasSearch from "./AtlasSearch";
import { atlasPlaces } from "@/lib/atlas/places";

// Atlas Search inside Ask the House (Phase 01 staging pilot, James, 20 Nov 2026). The band, eyebrow, headline and
// Stone Mist ground are the existing ones (components/home/AskHouse.tsx, which is untouched and still renders
// whenever the pilot is off); only the single text field becomes the Atlas bar. The plain links stay so a traveller
// or a crawler can reach the volumes without the form.
const BROWSE: [string, string][] = [["Stays", "/stays"], ["Safaris", "/safaris"], ["Voyages", "/voyages"], ["Overland", "/overland"], ["On the Horizon", "/offers"], ["The Exceptional Few", "/the-exceptional-few"]];

export default function AtlasBand() {
  return (
    <section className="bg-mist border-y ledger-border" aria-labelledby="ask-house-h">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 md:py-14">
        <p className="ledger-eyebrow ledger-crimson">Ask the house</p>
        <h2 id="ask-house-h" className="ledger-display text-[1.7rem] md:text-[2.6rem] leading-tight mt-2">Where do you want to wake up?</h2>
        <div className="mt-5 md:mt-6"><AtlasSearch places={atlasPlaces()} /></div>
        <p className="mt-4 text-[13px] ledger-muted">
          Browse without searching:{" "}
          {BROWSE.map(([label, href], i) => <span key={href}>{i > 0 && " · "}<Link href={href} className="underline underline-offset-2 hover:text-ink">{label}</Link></span>)}
        </p>
      </div>
    </section>
  );
}
