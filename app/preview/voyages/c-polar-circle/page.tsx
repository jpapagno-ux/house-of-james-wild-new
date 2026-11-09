import { notFound } from "next/navigation";
import PolarVoyagePage from "@/components/polar/PolarVoyagePage";
import HouseOpening from "@/components/opening/HouseOpening";
import { polarVoyage } from "@/lib/content/polar";
import { POLAR_CIRCLE_C, polarNext } from "@/lib/content/preview/opening-c";
import { buildMetadata } from "@/lib/seo";

// Preview C, the house opening, on the Polar Circle Air-Cruise (James, 8 Nov 2026). ?grain=1 adds the paper grain. Noindex.
export const metadata = buildMetadata({ title: "Polar Circle · Opening C (preview)", description: "The house opening: arrival, night panel, night close, day surface.", path: "/preview/voyages/c-polar-circle", noindex: true });

export default async function Page({ searchParams }: { searchParams: Promise<{ grain?: string; tones?: string }> }) {
  const v = polarVoyage("polar-circle-air-cruise");
  if (!v) notFound();
  const c = POLAR_CIRCLE_C;
  const sp = await searchParams;
  const grain = sp.grain === "1";
  // Details D, the house tones through the rest of the page (James, 8 Nov 2026); ?tones=0 shows the page without them
  const tones = sp.tones === "0" ? undefined : { palette: c.palette, grain };
  return <PolarVoyagePage v={v} surface={c.palette.day} tones={tones} opening={<HouseOpening {...c} grain={grain} next={polarNext(v, c.planHref)} />} />;
}
