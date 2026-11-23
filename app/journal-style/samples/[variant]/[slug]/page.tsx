import { notFound } from "next/navigation";
import JournalStayPage from "@/components/journal/JournalStayPage";
import { BATCH, SAMPLES, type Variant } from "@/components/journal/samples/SampleStayPage";
import { stayBySlug } from "@/lib/content/stays";
import { JOURNAL_SWITCH_ALLOWED } from "@/lib/journal-style/flag";
import { buildMetadata } from "@/lib/seo";

// JWC-STYLE-01 layout samples: three preview-only pages for James to compare (22 Nov 2026). Not built on the
// production deployment (no static params there, and dynamicParams is off), never indexed, linked from nowhere.
export const dynamicParams = false;
export function generateStaticParams() { return JOURNAL_SWITCH_ALLOWED ? [...SAMPLES.map((x) => ({ variant: x.variant as string, slug: x.slug })), ...BATCH.filter((b) => b !== "aguas-claras").map((b) => ({ variant: "d", slug: b }))].filter((x) => stayBySlug(x.slug)?.hero) : []; }

export async function generateMetadata({ params }: { params: Promise<{ variant: string; slug: string }> }) {
  const { slug, variant } = await params;
  const s = stayBySlug(slug);
  if (!s) return {};
  return buildMetadata({ title: `${s.name}: layout sample ${variant.toUpperCase()}`, description: `Layout sample ${variant.toUpperCase()} for ${s.name}. Preview only.`, path: `/stays/${s.slug}`, noindex: true });
}

export default async function SampleRoute({ params }: { params: Promise<{ variant: string; slug: string }> }) {
  const { slug, variant } = await params;
  if (!JOURNAL_SWITCH_ALLOWED || !(SAMPLES.some((x) => x.variant === variant && x.slug === slug) || (variant === "d" && BATCH.includes(slug)))) notFound();
  return <JournalStayPage slug={slug} sample={variant as Variant} preview />;
}
