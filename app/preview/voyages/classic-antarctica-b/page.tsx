import { notFound } from "next/navigation";
import PolarVoyagePage from "@/components/polar/PolarVoyagePage";
import { OpeningDusk } from "@/components/polar/VoyageOpening";
import { polarVoyage } from "@/lib/content/polar";
import { CLASSIC } from "@/lib/content/preview/classic-antarctica";
import { buildMetadata } from "@/lib/seo";

// Preview B, "Pathway Dusk" (James, 8 Nov 2026): one drifting frame, then the journey's pathway colour (Where the Wild
// Lives) as the surface, as Amangiri Mock C used dusk plum; three frames and a photographic close. Noindex.
export const metadata = buildMetadata({ title: "Classic Antarctica · Opening B, Pathway Dusk (preview)", description: "Cruise opening in the Exceptional Few manner: pathway colour surface.", path: "/preview/voyages/classic-antarctica-b", noindex: true });

export default function Page() {
  const v = polarVoyage("classic-antarctica-air-cruise");
  if (!v) notFound();
  const c = CLASSIC;
  return <PolarVoyagePage v={v} opening={<OpeningDusk hero={c.hero} designation={c.designation} title={c.title} place={c.place} line={c.line} pathway={c.pathway} glance={c.glance} why={c.why} close={c.close} planHref="/plan?trip=Classic%20Antarctica%20Air-Cruise" />} />;
}
