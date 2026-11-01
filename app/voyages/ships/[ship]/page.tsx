import { notFound } from "next/navigation";
import AliikaiShip from "@/components/ships/AliikaiShip";
import RecordShip from "@/components/ships/RecordShip";
import { FILMS } from "@/lib/content/films";
import { SHIPS, shipBySlug, shipPath, sistersOf } from "@/lib/content/ships";
import type { ShipRecord } from "@/lib/content/ships/types";
import { buildMetadata } from "@/lib/seo";

// /voyages/ships/<ship>: the vessel profile on the shared ship template
// (components/ships/ShipTemplate): the ship, her day by day, cabins, deck plan
// and every published departure. Aliikai keeps her approved content.
export const dynamicParams = false;
export function generateStaticParams() { return SHIPS.map((s) => ({ ship: s.slug })); }
type P = { params: Promise<{ ship: string }> };

export async function generateMetadata({ params }: P) {
  const e = shipBySlug((await params).ship);
  if (!e) return {};
  if (e.kind === "aliikai") {
    const s = e.data;
    // Copy approved by James on the Ledger Proofs sheet, 27 Oct 2026.
    return { ...buildMetadata({ title: s.seo.title, description: s.seo.description, path: s.path, image: { url: FILMS.aliikai.poster, alt: FILMS.aliikai.alt } }), keywords: s.seo.keywords };
  }
  const s = e.data as ShipRecord;
  return { ...buildMetadata({ title: s.seo.title.replace(/\s*\|\s*James Wild & Co$/, ""), description: s.seo.description, path: shipPath(s.slug), image: { url: s.hero.url, alt: s.hero.alt } }), keywords: s.seo.keywords };
}

export default async function ShipPage({ params }: P) {
  const e = shipBySlug((await params).ship);
  if (!e) notFound();
  return e.kind === "aliikai" ? <AliikaiShip /> : <RecordShip entry={e} sisters={sistersOf(e)} />;
}
