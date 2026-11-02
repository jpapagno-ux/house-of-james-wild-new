import { notFound } from "next/navigation";
import PolarVoyagePage from "@/components/polar/PolarVoyagePage";
import { POLAR_VOYAGES, polarVoyage, voyagePath } from "@/lib/content/polar";
import { buildMetadata } from "@/lib/seo";

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
  return <PolarVoyagePage v={v} />;
}
