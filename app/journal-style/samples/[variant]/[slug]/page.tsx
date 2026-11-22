import { notFound } from "next/navigation";
import SampleStayPage, { SAMPLES, type Variant } from "@/components/journal/samples/SampleStayPage";
import { stayBySlug } from "@/lib/content/stays";
import { JOURNAL_SWITCH_ALLOWED } from "@/lib/journal-style/flag";
import { buildMetadata } from "@/lib/seo";

// JWC-STYLE-01 layout samples: three preview-only pages for James to compare (22 Nov 2026). Not built on the
// production deployment (no static params there, and dynamicParams is off), never indexed, linked from nowhere.
export const dynamicParams = false;
export function generateStaticParams() { return JOURNAL_SWITCH_ALLOWED ? SAMPLES.filter((x) => stayBySlug(x.slug)?.hero).map((x) => ({ variant: x.variant, slug: x.slug })) : []; }

export async function generateMetadata({ params }: { params: Promise<{ variant: string; slug: string }> }) {
  const { slug, variant } = await params;
  const s = stayBySlug(slug);
  if (!s) return {};
  return buildMetadata({ title: `${s.name}: layout sample ${variant.toUpperCase()}`, description: `Layout sample ${variant.toUpperCase()} for ${s.name}. Preview only.`, path: `/stays/${s.slug}`, noindex: true });
}

export default async function SampleRoute({ params }: { params: Promise<{ variant: string; slug: string }> }) {
  const { slug, variant } = await params;
  if (!JOURNAL_SWITCH_ALLOWED || !SAMPLES.some((x) => x.variant === variant && x.slug === slug)) notFound();
  return <SampleStayPage slug={slug} variant={variant as Variant} />;
}
