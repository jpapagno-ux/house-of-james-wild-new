import ShipPageBody from "@/components/ships/ShipPageBody";
import { timelessVoyageFor, type TimelessVoyage } from "@/lib/content/timeless-voyages";
import { buildMetadata } from "@/lib/seo";

// Preview of the Timeless Voyages · Signature Edition section on Four Seasons I (James, 13 Nov 2026). Noindex. Her
// Airtable row is still a draft, so this page stands in a draft row; once the row is published and exported, the same
// section shows on /voyages/ships/four-seasons-i by itself and this preview reads the published row.
export const metadata = buildMetadata({ title: "Four Seasons I · Signature Edition (preview)", description: "Preview of the Timeless Voyages Signature Edition section.", path: "/preview/voyages/four-seasons-i-signature", noindex: true });

const DRAFT: TimelessVoyage = {
  id: "preview", vesselSlug: "four-seasons-i", vesselName: "Four Seasons I", operator: "Four Seasons Yachts", collectionNumber: 0, ledgerId: "VSL-2026-000051",
  sailingStatus: "sailing", launchDate: "2026-03-20", signatureEdition: true, heroLine: null, whyItBelongs: [], before: [], beyond: [], stamp: "Signature Edition", savings: null,
};

// ?stamp=maiden shows the Maiden Voyage stamp design on the hero for review. It is a design sample only: Four Seasons I
// has been sailing since March 2026 and is not a Maiden Voyage. No sample saving is shown, because none is published.
export default async function Page({ searchParams }: { searchParams: Promise<{ stamp?: string }> }) {
  const sp = await searchParams;
  const row = timelessVoyageFor("four-seasons-i") ?? DRAFT;
  const shown: TimelessVoyage = sp.stamp === "maiden" ? { ...row, stamp: "Maiden Voyage", launchDate: "2027-01-01", signatureEdition: false } : row;
  return <ShipPageBody slug="four-seasons-i" timeless={shown} />;
}
