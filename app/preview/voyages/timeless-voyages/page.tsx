import TimelessCollection from "@/components/ships/TimelessCollection";
import { TIMELESS_VOYAGES, type TimelessVoyage } from "@/lib/content/timeless-voyages";
import { buildMetadata } from "@/lib/seo";

// Preview of the Timeless Voyages collection page (James, 13 Nov 2026). Noindex. The Airtable rows are still drafts,
// so this page stands in the three ships with draft rows today (Four Seasons I, Hermes, Amandira; order and stamps here are stand-ins); any
// published row replaces its stand-in. ?maiden=1 adds one sample card to show the Maiden Voyages section: a design
// sample only, with a placeholder date, and never shown on the real page.
export const metadata = buildMetadata({ title: "Timeless Voyages (preview)", description: "Preview of the Timeless Voyages collection page.", path: "/preview/voyages/timeless-voyages", noindex: true });

const row = (vesselSlug: string, vesselName: string, operator: string, n: number, ledgerId: string, stamp: TimelessVoyage["stamp"], signatureEdition = false): TimelessVoyage =>
  ({ id: `preview-${vesselSlug}`, vesselSlug, vesselName, operator, collectionNumber: n, ledgerId, sailingStatus: "sailing", launchDate: null, signatureEdition, heroLine: null, whyItBelongs: [], before: [], beyond: [], stamp, savings: null });
const DRAFTS: TimelessVoyage[] = [
  row("four-seasons-i", "Four Seasons I", "Four Seasons Yachts", 1, "VSL-2026-000051", "Signature Edition", true),
  row("hermes-galapagos", "Hermes", "Vianatura", 2, "VSL-2026-000017", "Timeless Voyages"),
  row("amandira", "Amandira", "Aman", 3, "VSL-2026-000006", "Timeless Voyages"),
];
const SAMPLE_MAIDEN: TimelessVoyage = { ...row("sample-maiden-voyage", "Sample ship (design sample)", "Operator", 99, "", "Maiden Voyage"), sailingStatus: "launching", launchDate: "2027-06-01" , id: "sample-maiden" };

export default async function Page({ searchParams }: { searchParams: Promise<{ maiden?: string }> }) {
  const sp = await searchParams;
  const rows = DRAFTS.map((d) => TIMELESS_VOYAGES.find((t) => t.vesselSlug === d.vesselSlug) ?? d);
  return <TimelessCollection rows={sp.maiden === "1" ? [...rows, SAMPLE_MAIDEN] : rows} path="/preview/voyages/timeless-voyages" />;
}
