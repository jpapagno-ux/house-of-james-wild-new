import VoyageHub from "@/components/ships/VoyageHub";
import CompareTable from "@/components/ships/CompareTable";
import { HubSection } from "@/components/hub/Hub";
import { OfferCard } from "@/components/ledger/OfferPanel";
import { honeymoon } from "@/lib/content/ships/categories";
import { buildMetadata } from "@/lib/seo";

// /voyages/honeymoon (James, 2 Nov 2026): ships whose own material names couples or honeymooners,
// compared, with the Celebrations offers filed on them (On the Horizon). Answer first.
const H = honeymoon();
export const metadata = buildMetadata({ title: "Honeymoon Cruises on Small Ships for Couples", description: `${H.cards.length} small ships for two on the Nile, in the Amazon and the Galápagos, compared, with the honeymoon offers filed on them.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  const before = (
    <>
      <CompareTable t={H.table} id="compare-h" />
      {H.offers.length > 0 && (
        <HubSection eyebrow="On the Horizon · Celebrations" title="Which Honeymoon Offers Are Filed?" id="offers-h" more={{ label: "Every offer", href: "/offers#voyages" }}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{H.offers.map((o) => <OfferCard key={o.id} offer={o} volume="voyages" />)}</div>
          <p className="mt-4 text-[13px] ledger-muted">Offers are set by each partner and confirmed when you book.</p>
        </HubSection>
      )}
    </>
  );
  return <VoyageHub {...H} before={before} />;
}
