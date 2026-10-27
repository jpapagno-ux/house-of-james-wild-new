import { notFound } from "next/navigation";
import GuidePage from "@/components/destination/GuidePage";
import { GUIDES } from "@/lib/content/guides";
import { buildMetadata } from "@/lib/seo";

// /destinations/[region]/[country]/[place]: a place guide inside a country
// (Raja Ampat, Komodo), for the searches people make by place name.
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.values(GUIDES).filter((g) => g.parent).map((g) => ({ region: g.region, country: g.parent!, place: g.slug }));
}
type P = { params: Promise<{ region: string; country: string; place: string }> };
const find = (p: { region: string; country: string; place: string }) => { const g = GUIDES[p.place]; return g && g.parent === p.country && g.region === p.region ? g : undefined; };

export async function generateMetadata({ params }: P) {
  const g = find(await params);
  if (!g) return {};
  return { ...buildMetadata({ title: g.seo.title, description: g.seo.description, path: g.path, image: { url: g.slides[0].url, alt: g.slides[0].alt } }), keywords: g.seo.keywords };
}

export default async function PlacePage({ params }: P) {
  const g = find(await params);
  if (!g) notFound();
  return <GuidePage g={g} />;
}
