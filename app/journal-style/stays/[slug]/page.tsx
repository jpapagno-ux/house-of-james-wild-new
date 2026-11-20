import { notFound } from "next/navigation";
import JournalStayPage from "@/components/journal/JournalStayPage";
import { stayBySlug } from "@/lib/content/stays";
import { JOURNAL_STYLE_ON } from "@/lib/journal-style/flag";
import { JOURNAL_STAYS } from "@/lib/journal-style/stay";
import { buildMetadata, fitTitle } from "@/lib/seo";

// JWC-STYLE-01: the Modern Journal stay page, served AT /stays/<slug> by a rewrite (next.config.ts) when the flag is
// on, or when ?journal=1 is added on a preview. It has no public address of its own: nothing links here, its
// canonical is the stay's own /stays/<slug>, and while the flag is off it is noindex. Static, like the stay page.
export const dynamicParams = false;
export function generateStaticParams() { return JOURNAL_STAYS.filter((slug) => stayBySlug(slug)?.hero).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const s = stayBySlug((await params).slug);
  if (!s) return {};
  // the same title, description and canonical as the stay page it stands in for
  return buildMetadata({
    title: fitTitle([`${s.name}${s.country ? `, ${s.country}` : ""}: Vetted Stay`, `${s.name}${s.country ? `, ${s.country}` : ""}`, s.name]),
    description: (s.tagline ? `${s.tagline} ` : "") + `${s.name}${s.country ? ` in ${s.country}` : ""}, filed in the James Wild & Co Ledger${s.ledgerId ? ` (${s.ledgerId})` : ""}.${s.bestMonths ? ` Best ${s.bestMonths}.` : ""}`.slice(0, 300),
    path: `/stays/${s.slug}`,
    image: s.hero ? { url: s.hero, alt: `${s.name}${s.country ? `, ${s.country}` : ""}` } : undefined,
    noindex: !JOURNAL_STYLE_ON,
  });
}

export default async function JournalStayRoute({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  if (!JOURNAL_STAYS.includes(slug)) notFound();
  return <JournalStayPage slug={slug} />;
}
