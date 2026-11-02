import { notFound } from "next/navigation";
import TripPage from "@/components/journey/TripPage";
import { FILMS } from "@/lib/content/films";
import { byPath, mapHtml, paramsFor, tripMetadata, TRIP_IMAGES, TRIP_SLIDES } from "@/lib/content/trip-pages";

// /voyages/<waters>/<voyage> — a voyage by ship, with the vessel on the same page.
export const dynamicParams = false;
// Polar voyages have their own route (/voyages/polar/<voyage>, app/voyages/polar), so they are not generated here.
export function generateStaticParams() { return paramsFor("voyage").filter(([waters]) => waters !== "polar").map(([waters, voyage]) => ({ waters, voyage })); }
type P = { params: Promise<{ waters: string; voyage: string }> };
export async function generateMetadata({ params }: P) { const { waters, voyage } = await params; const t = byPath(`/voyages/${waters}/${voyage}`); return t ? tripMetadata(t) : {}; }

export default async function VoyageRoute({ params }: P) {
  const { waters, voyage } = await params;
  const t = byPath(`/voyages/${waters}/${voyage}`);
  if (!t) notFound();
  const m = TRIP_IMAGES[t.id] ?? { images: {} };
  // Aliikai's crew card and film belong on Aliikai's voyages only.
  const aliikai = /\/aliikai-/.test(t.seo.path);
  return <TripPage trip={t} mapHtml={mapHtml(t)} images={{ ...m.images, ...(t.images ?? {}) }} hero={m.hero} slides={TRIP_SLIDES[t.id] ?? []} host={aliikai ? { key: "voyage:aliikai", name: "Aliikai", kind: "vessel" } : undefined} film={aliikai ? FILMS.aliikai : undefined} />;
}
