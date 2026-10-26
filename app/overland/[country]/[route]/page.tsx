import { notFound } from "next/navigation";
import TripPage from "@/components/journey/TripPage";
import { byPath, mapHtml, paramsFor, tripMetadata, TRIP_IMAGES } from "@/lib/content/trip-pages";

// /overland/<country>/<route> — a land journey James designed.
export const dynamicParams = false;
export function generateStaticParams() { return paramsFor("overland").map(([country, route]) => ({ country, route })); }
type P = { params: Promise<{ country: string; route: string }> };
export async function generateMetadata({ params }: P) { const { country, route } = await params; const t = byPath(`/overland/${country}/${route}`); return t ? tripMetadata(t) : {}; }

export default async function OverlandRoute({ params }: P) {
  const { country, route } = await params;
  const t = byPath(`/overland/${country}/${route}`);
  if (!t) notFound();
  const m = TRIP_IMAGES[t.id] ?? { images: {} };
  return <TripPage trip={t} mapHtml={mapHtml(t)} images={m.images} hero={m.hero} />;
}
