import ShipPageBody from "@/components/ships/ShipPageBody";
import { FILMS } from "@/lib/content/films";
import { SHIPS, shipBySlug, shipPath } from "@/lib/content/ships";
import { buildMetadata } from "@/lib/seo";

// /voyages/ships/<ship>: every vessel on the one shared ship template
// (components/ships/RecordShip): the ship, her day by day, cabins, deck plan and
// every published departure. Aliikai brings her own sections through `extra`.
// The old Aliikai URL (/stays/aliikai-voyage) 301s here (redirects.json).
export const dynamicParams = false;
export function generateStaticParams() { return SHIPS.map((s) => ({ ship: s.slug })); }
type P = { params: Promise<{ ship: string }> };

export async function generateMetadata({ params }: P) {
  const e = shipBySlug((await params).ship);
  if (!e) return {};
  const s = e.data;
  // Aliikai's share image is her film poster; her copy was approved on the Ledger Proofs sheet, 27 Oct 2026.
  const image = e.slug === "aliikai" ? { url: FILMS.aliikai.poster, alt: FILMS.aliikai.alt } : { url: s.hero.url, alt: s.hero.alt };
  return { ...buildMetadata({ title: s.seo.title.replace(/\s*\|\s*James Wild & Co$/, ""), description: s.seo.description, path: shipPath(s.slug), image }), keywords: s.seo.keywords };
}

export default async function ShipPage({ params }: P) {
  return <ShipPageBody slug={(await params).ship} />;
}
