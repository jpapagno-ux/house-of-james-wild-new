import SiteHeader from "@/components/ledger/SiteHeader";
import VolumeEntrance from "@/components/entrance/VolumeEntrance";
import { ENTRANCES } from "@/lib/content/entrances";
import JsonLd from "@/components/ledger/JsonLd";
import { AdvisorScroll } from "@/components/advisor/Desk";
import { Stamp } from "@/components/ledger/Marks";
import { HubShell, HubSection, RecordCard } from "@/components/hub/Hub";
import { HOME } from "@/lib/content/home";
import { recordHref } from "@/lib/ledger/urls";
import { VOLUMES } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";
import { volumeEyebrow } from "@/lib/volumes";
import { STAY_PAGES } from "@/lib/content/stays";

// /gatherings: Volume III hub shell. Family residences for the generations
// who travel together.
const PATH = "/gatherings";
const V = VOLUMES.find((v) => v.href === PATH)!;
export const metadata = buildMetadata({ title: "Family Residences for Multigenerational Travel", description: "Private houses, estates and resort residences for families and celebrations that travel together, vetted by James Wild & Co and filed in the Ledger.", path: PATH, noindex: false /* approved by James, 28 Oct 2026 */ });

// Residences filed in Gatherings in the Library (house_volumes includes "gatherings"), with a hero to show.
// Whole islands and big houses: Laucala, Turtle Island, Royal Davui, Namale, Six Senses Fiji's residences (Fiji, 5 Nov 2026).
const RESIDENCES = STAY_PAGES.filter((s) => s.volumes?.includes("gatherings") && s.hero && s.slug !== "leeu-house");

export default function GatheringsHub() {
  const leeu = HOME.shelf.entries.find((s) => s.slug === "leeu-house")!;
  return (
    <>
      <SiteHeader overlay />
      <HubShell name="Gatherings" entrance={<VolumeEntrance e={ENTRANCES.gatherings} />} path={PATH} eyebrow={volumeEyebrow("gatherings")} title="Houses Big Enough for the Whole Family" intro={V.intro} browse={V.browse}
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
        {RESIDENCES.length > 0 && (
          <HubSection eyebrow="Filed in Gatherings" title="Islands and Houses for the Whole Family" id="residences-h">
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {RESIDENCES.map((s) => <li key={s.slug}><RecordCard name={s.name} id={s.ledgerId ?? "Being filed"} line={s.tagline ?? (s.country ?? "")} image={{ url: s.hero!, alt: `${s.name}, ${s.country ?? ""}` }} href={recordHref("stay", s.slug)} eyebrow={s.country ?? undefined} volume="gatherings" /></li>)}
            </ul>
          </HubSection>
        )}
        <AdvisorScroll volume="gatherings" title="Who books the whole house" />
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Gatherings" })} />
    </>
  );
}
