import { notFound } from "next/navigation";
import JournalStayPage from "@/components/journal/JournalStayPage";
import { reserveBySlug } from "@/lib/content/reserves";
import { JOURNAL_STYLE_ON } from "@/lib/journal-style/flag";
import { JOURNAL_CAMPS, campRecord } from "@/lib/journal-style/stay";
import { buildMetadata, fitTitle } from "@/lib/seo";

// Stage 10 (James, 26 Nov 2026): a lodge or residence on a reserve on the locked stay template, served AT
// /safaris/<reserve>/<camp> by a rewrite (next.config.ts) when the flag is on, or with ?journal=1 on a preview.
// Its suites are its rooms; the other lodges on the reserve sit beneath them. Canonical /safaris/<reserve>/<camp>.
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.entries(JOURNAL_CAMPS).flatMap(([reserve, camps]) => camps.filter((camp) => reserveBySlug(reserve)?.camps.some((c) => c.slug === camp)).map((camp) => ({ reserve, camp })));
}

function find(reserveSlug: string, campSlug: string) {
  const reserve = reserveBySlug(reserveSlug);
  const camp = reserve?.camps.find((c) => c.slug === campSlug);
  if (!reserve || !camp || !(JOURNAL_CAMPS[reserveSlug] ?? []).includes(campSlug)) return null;
  const record = campRecord(reserveSlug, camp);
  return record?.hero ? { reserve, camp, record } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ reserve: string; camp: string }> }) {
  const { reserve, camp } = await params;
  const f = find(reserve, camp);
  if (!f) return {};
  const country = f.record.country ?? "South Africa";
  return buildMetadata({
    title: fitTitle([`${f.camp.name}, ${f.reserve.name}: Suites and Rates`, `${f.camp.name}, ${f.reserve.name}`, f.camp.name]),
    description: `${f.camp.name} on ${f.reserve.name}, ${f.reserve.area}, ${country}.${f.camp.intro ? ` ${f.camp.intro}.` : ""} Filed in the James Wild & Co Ledger.`.slice(0, 300),
    path: `/safaris/${reserve}/${camp}`,
    image: { url: f.record.hero as string, alt: `${f.camp.name}, ${f.reserve.name}` },
    noindex: !JOURNAL_STYLE_ON,
  });
}

export default async function JournalCampRoute({ params }: { params: Promise<{ reserve: string; camp: string }> }) {
  const { reserve, camp } = await params;
  const f = find(reserve, camp);
  if (!f) notFound();
  return <JournalStayPage slug={f.record.slug} sample="d" camp={f} />;
}
