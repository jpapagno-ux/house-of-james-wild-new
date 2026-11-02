import { notFound } from "next/navigation";
import PartnerPage from "@/components/partners/PartnerPage";
import { PARTNER_LIST, partnerBySlug, partnerPath } from "@/lib/content/partners";
import { buildMetadata } from "@/lib/seo";

// /partners/<partner>: the reusable partner template (James, 2 Nov 2026). Antarctica21 first.
export const dynamicParams = false;
export function generateStaticParams() { return PARTNER_LIST.map((p) => ({ partner: p.slug })); }
type P = { params: Promise<{ partner: string }> };

export async function generateMetadata({ params }: P) {
  const p = partnerBySlug((await params).partner);
  if (!p) return {};
  return { ...buildMetadata({ title: p.seo.title, description: p.seo.description, path: partnerPath(p.slug), image: { url: p.hero.url, alt: p.hero.alt } }), ...(p.seo.keywords ? { keywords: p.seo.keywords } : {}) };
}

export default async function Page({ params }: P) {
  const p = partnerBySlug((await params).partner);
  if (!p) notFound();
  return <PartnerPage p={p} />;
}
