import SiteHeader from "@/components/ledger/SiteHeader";
import Dispatches from "@/components/record/Dispatches";
import { PreviewNote } from "@/components/record/Sections";
import { buildMetadata } from "@/lib/seo";

// Preview: the "Dispatches from the road" band as it would sit on a stay page.
// Every line below is a labelled sample. No traveler wrote them.

export const metadata = buildMetadata({ title: "Dispatches from the road (preview)", description: "Preview of traveler dispatches on James Wild & Co stay pages.", path: "/preview/dispatches", noindex: true });

const SAMPLES = [
  { firstName: "First name", date: "7 Aug 2026", line: "A traveler's own line about this stay appears here.", sample: true },
  { firstName: "First name", date: "8 Aug 2026", line: "One find or curiosity from the road, in their words.", sample: true },
  { firstName: "First name", date: "12 Aug 2026", line: "Shown only when they choose to share it and the House approves.", sample: true },
];

export default function DispatchesPreview() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-8">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <p className="ledger-eyebrow">Preview · stay page section</p>
        </div>
        <Dispatches stay="Noah's Forest by Tifakara" items={SAMPLES} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <PreviewNote>
            <p>These three cards are samples. Real dispatches come from My Folio: a traveler writes a line, ticks &ldquo;share with the House&rdquo;, and it appears on the stay page once approved, with a first name and a date only.</p>
            <p>The band is not on any live stay page. It needs the Folio side built and a first approved dispatch before it ships.</p>
          </PreviewNote>
        </div>
      </main>
    </>
  );
}
