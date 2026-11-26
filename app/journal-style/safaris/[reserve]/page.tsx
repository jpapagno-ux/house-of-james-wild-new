import { notFound } from "next/navigation";
import JournalStayPage from "@/components/journal/JournalStayPage";
import { reserveBySlug } from "@/lib/content/reserves";
import { stayBySlug } from "@/lib/content/stays";
import { JOURNAL_STYLE_ON } from "@/lib/journal-style/flag";
import { JOURNAL_RESERVES } from "@/lib/journal-style/stay";
import { buildMetadata, fitTitle } from "@/lib/seo";

// Stage 10 (James, 26 Nov 2026): an African reserve on the locked stay template, served AT /safaris/<slug> by a
// rewrite (next.config.ts) when the flag is on, or with ?journal=1 on a preview. Its lodges and private residences
// sit together as one row of cards in the rooms' place. No public address of its own: the canonical is /safaris/<slug>,
// and while the flag is off it is noindex. The live reserve page is untouched.
export const dynamicParams = false;
export function generateStaticParams() { return JOURNAL_RESERVES.filter((slug) => reserveBySlug(slug) && stayBySlug(slug)?.hero).map((reserve) => ({ reserve })); }

export async function generateMetadata({ params }: { params: Promise<{ reserve: string }> }) {
  const slug = (await params).reserve;
  const r = reserveBySlug(slug), s = stayBySlug(slug);
  if (!r || !s) return {};
  const name = s.name.replace(/\s+/g, " ").trim();
  return buildMetadata({
    title: fitTitle([`${name}, ${r.area}: Lodges and Residences`, `${name}, ${s.country ?? "South Africa"}`, name]),
    description: (s.tagline ? `${s.tagline}. ` : "") + `${name} in the ${r.area}, ${s.country ?? "South Africa"}: ${r.camps.length} lodges and private residences, filed in the James Wild & Co Ledger (${r.rsv}).${s.bestMonths ? ` Best ${s.bestMonths}.` : ""}`.slice(0, 300),
    path: `/safaris/${slug}`,
    image: s.hero ? { url: s.hero, alt: `${name}, ${s.country ?? "South Africa"}` } : undefined,
    noindex: !JOURNAL_STYLE_ON,
  });
}

export default async function JournalReserveRoute({ params }: { params: Promise<{ reserve: string }> }) {
  const slug = (await params).reserve;
  const r = reserveBySlug(slug);
  if (!r || !JOURNAL_RESERVES.includes(slug)) notFound();
  return <JournalStayPage slug={slug} sample="d" reserve={r} />;
}
