import { notFound } from "next/navigation";
import PolarVoyagePage from "@/components/polar/PolarVoyagePage";
import { POLAR_VOYAGES, polarVoyage, voyagePath } from "@/lib/content/polar";
import { buildMetadata } from "@/lib/seo";
import HouseOpening from "@/components/opening/HouseOpening";
import { polarOpening } from "@/lib/content/opening/build";

// /voyages/polar/<voyage>: one page per Antarctica21 itinerary (James, 2 Nov 2026). The old
// Polar Circle route page (/voyages/antarctica/antarctica21-polar-circle-air-cruise) 301s here.
export const dynamicParams = false;
export function generateStaticParams() { return POLAR_VOYAGES.map((v) => ({ voyage: v.slug })); }
type P = { params: Promise<{ voyage: string }> };

export async function generateMetadata({ params }: P) {
  const v = polarVoyage((await params).voyage);
  if (!v) return {};
  return { ...buildMetadata({ title: v.seo.title.replace(/\s*\|\s*James Wild & Co$/, ""), description: v.seo.description, path: voyagePath(v.slug), image: { url: v.hero.url, alt: v.hero.alt } }), keywords: v.seo.keywords };
}

export default async function Page({ params }: P) {
  const v = polarVoyage((await params).voyage);
  if (!v) notFound();
  // The house opening and tones (James, 9 Nov 2026), built from the voyage record (lib/content/opening/build.ts).
  const o = polarOpening(v);
  if (!o) return <PolarVoyagePage v={v} />;
  const { next, ...base } = o;
  return <PolarVoyagePage v={v} opening={<HouseOpening {...base} next={next} />} surface={base.palette.day} tones={{ palette: base.palette }} />;
}
