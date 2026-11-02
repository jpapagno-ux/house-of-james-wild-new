import VoyageHub from "@/components/ships/VoyageHub";
import CompareTable from "@/components/ships/CompareTable";
import { family } from "@/lib/content/ships/categories";
import { buildMetadata } from "@/lib/seo";

// /voyages/family (James, 2 Nov 2026): every ship's minimum child age, connecting cabins and kids'
// programme, from the registry's published facts. Answer first, then the table, cards and FAQs.
const H = family();
export const metadata = buildMetadata({ title: "Family Cruises on Small Ships: Ages and Cabins", description: `Minimum ages for children, connecting cabins and kids' programmes on ${H.table.rows.length} small ships and yachts: Nile, Amazon, Galápagos and Antarctica.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} before={<CompareTable t={H.table} id="compare-h" />} />;
}
