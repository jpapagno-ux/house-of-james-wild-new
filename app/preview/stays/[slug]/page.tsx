import { notFound } from "next/navigation";
import StayPageBody from "@/components/stay/StayPageBody";
import { stayBySlug } from "@/lib/content/stays";
import { buildMetadata } from "@/lib/seo";

// Stays with the house opening, tones and tint (James, 9 Nov 2026: "make the stays similar to the exceptional few
// entrance and pathway colors, volume colors and tints, and show me a few examples from different countries").
// Preview only: unlisted and noindex; the live stay pages are unchanged until James approves.
// 10 Nov 2026: Singita Faru Faru and Ellerman House join, with DumaTau, as hand-set entrances on brand photographs.
const PREVIEW_STAYS = ["wilderness-dumatau", "singita-faru-faru-lodge", "ellerman-house", "ulum-moab", "beckon-longitude-131", "aguas-claras", "como-shambhala-estate", "da-licenca"];
export const dynamicParams = false;
export function generateStaticParams() { return PREVIEW_STAYS.map((slug) => ({ slug })); }
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P) {
  const s = stayBySlug((await params).slug);
  return buildMetadata({ title: `${s?.name ?? "Stay"} · Opening (preview)`, description: "Preview of the house opening on a stay page.", path: `/preview/stays/${(await params).slug}`, noindex: true });
}
export default async function Page({ params }: P) {
  const slug = (await params).slug;
  if (!PREVIEW_STAYS.includes(slug) || !stayBySlug(slug)) notFound();
  return <StayPageBody slug={slug} house />;
}
