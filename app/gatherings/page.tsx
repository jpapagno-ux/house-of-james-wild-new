import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import { Stamp } from "@/components/ledger/Marks";
import { HubShell, HubSection, RecordCard } from "@/components/hub/Hub";
import { HOME } from "@/lib/content/home";
import { recordHref } from "@/lib/ledger/urls";
import { VOLUMES } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /gatherings: Volume 03 hub shell. Family residences for the generations
// who travel together.
const PATH = "/gatherings";
const V = VOLUMES.find((v) => v.href === PATH)!;
export const metadata = buildMetadata({ title: "Family Residences for Multigenerational Travel | James Wild & Co Gatherings", description: "Private houses, estates and resort residences for families and celebrations that travel together, vetted by James Wild & Co and filed in the Ledger.", path: PATH, noindex: true });

export default function GatheringsHub() {
  const leeu = HOME.shelf.entries.find((s) => s.slug === "leeu-house")!;
  return (
    <>
      <SiteHeader />
      <HubShell name="Gatherings" path={PATH} eyebrow="Volume 03 · Gatherings" title="Houses Big Enough for the Whole Family" intro={V.intro} browse={V.browse}
        answer="Gatherings is James Wild & Co's volume of family residences: private houses, estates and resort residences where several generations or a celebration can stay under one roof, with the adventures around them planned in. Each residence is filed in the Ledger with its own ID and notes on who it suits."
        filling="Residence pages, room by room with how each house sleeps a family, fill from the Ledger export.">
        <HubSection eyebrow="From the Ledger" title="A First Residence" id="res-h">
          <div className="grid md:grid-cols-[minmax(0,320px)_1fr] gap-8 items-center">
            <RecordCard name={leeu.name} id={leeu.id} line={leeu.line} image={leeu.image} href={recordHref("stay", leeu.slug)} />
            <div className="flex items-center gap-6">
              <Stamp kind="Gathering verified" size={130} animate={false} />
              <p className="text-[17px] leading-relaxed max-w-md">The Gathering verified stamp goes only on houses a family has actually tested together. Three generations, one roof, no one sleeping on the sofa.</p>
            </div>
          </div>
        </HubSection>
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Gatherings" })} />
    </>
  );
}
