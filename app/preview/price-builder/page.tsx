import SiteHeader from "@/components/ledger/SiteHeader";
import PriceBuilder from "@/components/record/PriceBuilder";
import { PreviewNote } from "@/components/record/Sections";
import { buildMetadata } from "@/lib/seo";

// Preview of the shared price builder on both page types, set up with the
// audit addendum's test cases. Every price here is an example.

export const metadata = buildMetadata({ title: "Price builder (preview)", description: "Preview of the James Wild & Co price builder.", path: "/preview/price-builder", noindex: true });

export default function PriceBuilderPreview() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-8">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <p className="ledger-eyebrow">Preview · Journey page · Costa Rica &ldquo;Two Oceans, One Volcano&rdquo;</p>
          <PriceBuilder kind="journey" tripName="Two Oceans, One Volcano" defaultTravellers={3}
            options={[{ id: "filed", label: "As filed", pp: 6950, detail: "the lodges in the itinerary" }, { id: "upgraded", label: "Upgraded suites", pp: 8450, detail: "example" }]}
            addOns={[{ id: "turtle", label: "Turtle walk", pp: 95, detail: "Caribbean coast, in season" }, { id: "raft", label: "Extra river day", pp: 240, detail: "example" }]} />
          <div className="mt-20" />
          <p className="ledger-eyebrow">Preview · Voyage page · Aliikai &ldquo;10 Day Raja Ampat North&rdquo;</p>
          <div className="[&_#price]:mt-6">
            <PriceBuilder kind="voyage" tripName="Aliikai · 10 Day Raja Ampat North" defaultTravellers={4}
              options={[{ id: "family", label: "Family cabin", pp: 4390, detail: "sleeps 4" }, { id: "owner", label: "Owner's cabin", pp: 5290, detail: "example" }, { id: "ocean", label: "Oceanview cabin", pp: 4830, detail: "example" }]}
              addOns={[{ id: "sorong", label: "Sorong night before", pp: 150, detail: "hotel night before embarkation" }, { id: "dive", label: "Dive package", pp: 680, detail: "example" }]} />
          </div>
          <PreviewNote>
            <p>Test before deploy: Land, As filed × 3 + turtle walk = US$22,614, deposit US$1,500. Voyage, Family cabin × 4 + Sorong night = US$19,431, deposit US$2,000. Both pass in the automated tests (npm test). The option and add-on prices are examples chosen so their per-person sums match the addendum.</p>
          </PreviewNote>
        </div>
      </main>
    </>
  );
}
