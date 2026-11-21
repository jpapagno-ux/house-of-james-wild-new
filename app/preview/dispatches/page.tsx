import SiteHeader from "@/components/ledger/SiteHeader";
import Dispatches from "@/components/record/Dispatches";
import { PreviewNote } from "@/components/record/Sections";
import { buildMetadata } from "@/lib/seo";

// Preview: the "Dispatches from the road" band as it would sit on a stay page.
// Every line below is a labelled sample with an invented first name. No traveler wrote them.

export const metadata = buildMetadata({ title: "Dispatches from the road (preview)", description: "Preview of traveler dispatches on James Wild & Co stay pages.", path: "/preview/dispatches", noindex: true });

const SAMPLES = [
  { firstName: "Elena", date: "7 Aug 2026", line: "We loved the service and the location. The river sent us to sleep both nights.", sample: true },
  { firstName: "Marco", date: "8 Aug 2026", line: "Breakfast, then the volcano from the pool. We nearly cancelled the day's plans.", sample: true },
  { firstName: "Sofia", date: "8 Aug 2026", line: "Ask about the night walk in the forest. The frogs are louder than you think.", sample: true },
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
            <p>These three cards are samples with invented first names, written to show the tone. Real dispatches come from My Folio: a traveler writes a line, ticks &ldquo;share with the House&rdquo;, and it appears on the stay page once approved, with a first name and a date only.</p>
            <p>The band is not on any live stay page. It needs the Folio side built and a first approved dispatch before it ships.</p>
          </PreviewNote>
        </div>
      </main>
    </>
  );
}
