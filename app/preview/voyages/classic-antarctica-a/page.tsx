import { notFound } from "next/navigation";
import PolarVoyagePage from "@/components/polar/PolarVoyagePage";
import { OpeningArrival } from "@/components/polar/VoyageOpening";
import { polarVoyage } from "@/lib/content/polar";
import { CLASSIC } from "@/lib/content/preview/classic-antarctica";
import { buildMetadata } from "@/lib/seo";

// Preview A, "The Arrival" (James, 8 Nov 2026): the Exceptional Few three-frame scroll arrival on a cruise page,
// then a pathway-ruled glance and three "why this voyage" frames. The rest is the live Classic Antarctica page. Noindex.
export const metadata = buildMetadata({ title: "Classic Antarctica · Opening A, The Arrival (preview)", description: "Cruise opening in the Exceptional Few manner: three frames on scroll.", path: "/preview/voyages/classic-antarctica-a", noindex: true });

export default function Page() {
  const v = polarVoyage("classic-antarctica-air-cruise");
  if (!v) notFound();
  const c = CLASSIC;
  return <PolarVoyagePage v={v} opening={<OpeningArrival frames={c.frames} designation={c.designation} title={c.title} place={c.place} line={c.line} pathway={c.pathway} glance={c.glance} why={c.why} planHref="/plan?trip=Classic%20Antarctica%20Air-Cruise" />} />;
}
