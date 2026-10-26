import { notFound } from "next/navigation";
import TripPage from "@/components/journey/TripPage";
import { byPath, mapHtml, paramsFor, tripMetadata, TRIP_IMAGES } from "@/lib/content/trip-pages";

// /voyages/<waters>/<voyage> — a voyage by ship, with the vessel on the same page.
export const dynamicParams = false;
export function generateStaticParams() { return paramsFor("voyage").map(([waters, voyage]) => ({ waters, voyage })); }
type P = { params: Promise<{ waters: string; voyage: string }> };
export async function generateMetadata({ params }: P) { const { waters, voyage } = await params; const t = byPath(`/voyages/${waters}/${voyage}`); return t ? tripMetadata(t) : {}; }

export default async function VoyageRoute({ params }: P) {
  const { waters, voyage } = await params;
  const t = byPath(`/voyages/${waters}/${voyage}`);
  if (!t) notFound();
  const m = TRIP_IMAGES[t.id] ?? { images: {} };
  return <TripPage trip={t} mapHtml={mapHtml(t)} images={m.images} hero={m.hero} host={{ key: "voyage:aliikai", name: "Aliikai", kind: "vessel" }} />;
}
