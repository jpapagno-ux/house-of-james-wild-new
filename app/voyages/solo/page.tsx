import VoyageHub from "@/components/ships/VoyageHub";
import CompareTable from "@/components/ships/CompareTable";
import { solo } from "@/lib/content/ships/categories";
import { buildMetadata } from "@/lib/seo";

// /voyages/solo (James, 2 Nov 2026): every ship's single supplement, lowest first, from the
// registry's published facts. Answer first, then the table, cards and FAQs.
const H = solo();
export const metadata = buildMetadata({ title: "Solo Cruises on Small Ships: Single Supplements", description: `Single supplements compared on ${H.table.rows.length} small ships and yachts, from cabins with no supplement to 100%: Nile, Amazon, Galápagos and Antarctica.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} before={<CompareTable t={H.table} id="compare-h" />} />;
}
