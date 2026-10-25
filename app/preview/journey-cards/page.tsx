import SiteHeader from "@/components/ledger/SiteHeader";
import Journeys from "@/components/destination/Journeys";
import { PreviewNote } from "@/components/record/Sections";
import { journeysFor } from "@/lib/content/preview/journeys";
import { buildMetadata } from "@/lib/seo";

// Preview: the same "Journeys & voyages" section as it will appear on the
// Indonesia (small-ship voyages) and Botswana (founder-travelled Overland
// routes) destination pages, before those pages are built in Phase 2.

export const metadata = buildMetadata({ title: "Journeys & voyages on destination pages (preview)", description: "Preview of the journey and voyage cards on James Wild & Co destination pages.", path: "/preview/journey-cards", noindex: true });

export default function JourneyCardsPreview() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-8">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <p className="ledger-eyebrow">Preview · destination page section</p>
          <Journeys id="indonesia" country="Indonesia" journeys={journeysFor("indonesia")} />
          <Journeys id="botswana" country="Botswana" journeys={journeysFor("botswana")} />
          <PreviewNote>
            <p>Indonesia shows three of Aliikai&rsquo;s four voyages. The 7 Day Komodo Island Cruise is held back until its US$12,000 &ldquo;from&rdquo; price is confirmed, because it reads like a charter rate. All four voyages share the Raja Ampat hero image, including the Komodo ones; each needs its own.</p>
            <p>The Field verified stamp on the 10 Day Raja Ampat North reflects James&rsquo;s November 2024 voyage; the library&rsquo;s voyage status still needs setting. Botswana&rsquo;s routes are marked founder-travelled in the library, with no year filed, so their stamps show no year. Their images are generated placeholders to replace.</p>
            <p>Belize has five approved routes without web addresses (slugs), and two South Africa routes and three Tanzania/Kenya routes are still under review, so none of them show yet.</p>
          </PreviewNote>
        </div>
      </main>
    </>
  );
}
