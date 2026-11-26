import SiteHeader from "@/components/ledger/SiteHeader";
import IggiPanel from "@/components/iggi/IggiPanel";
import { IGGI_ON } from "@/lib/iggi/flag";
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
import { RESERVES, campHref } from "@/lib/content/reserves";
import RESERVE_PAGES from "@/lib/journal-style/reserves.json";
import { campCopy } from "@/lib/journal-style/stay";

// /gatherings: Volume III hub shell. Family residences for the generations
// who travel together.
const PATH = "/gatherings";
const V = VOLUMES.find((v) => v.href === PATH)!;
export const metadata = buildMetadata({ title: "Family Residences for Multigenerational Travel", description: "Private houses, estates and resort residences for families and celebrations that travel together, vetted by James Wild & Co and filed in the Ledger.", path: PATH, noindex: false /* approved by James, 28 Oct 2026 */ });

// Residences filed in Gatherings in the Library (house_volumes includes "gatherings"), with a hero to show.
// Whole islands and big houses: Laucala, Turtle Island, Royal Davui, Namale, Six Senses Fiji's residences (Fiji, 5 Nov 2026).
const RESIDENCES = STAY_PAGES.filter((s) => s.volumes?.includes("gatherings") && s.hero && s.slug !== "leeu-house");
// Private residences on the safari reserves (James, 26 Nov 2026: "you should have these in the gatherings section volume
// as well as the reserve section"). One page each, kept on its reserve; Gatherings is a second door to it.
const CARDS = RESERVE_PAGES.cards as Record<string, Record<string, { url: string; alt: string }>>;
const RESERVE_HOUSES = RESERVES.flatMap((r) => r.camps.filter((c) => c.kind === "residence" && c.hero).map((c) => ({ r, c, href: campHref(r, c) })))
  .filter((x): x is typeof x & { href: string } => !!x.href)
  .map(({ r, c, href }) => ({ key: `${r.slug}/${c.slug}`, name: c.name, reserve: r.name, line: (campCopy(r.slug, c).intro || c.units[0] || "").replace(/\s+/g, " ").trim(), image: CARDS[r.slug]?.[c.slug] ?? { url: c.hero as string, alt: `${c.name}, ${r.name}` }, href, id: c.ledgerId ?? r.rsv }));

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
        {RESERVE_HOUSES.length > 0 && (
          <HubSection eyebrow="On the safari reserves" title="Private Safari Houses for the Family" id="reserve-houses-h">
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {RESERVE_HOUSES.map((h) => <li key={h.key}><RecordCard name={h.name} id={h.id} line={h.line} image={h.image} href={h.href} eyebrow={h.reserve} volume="gatherings" /></li>)}
            </ul>
          </HubSection>
        )}
        {/* Iggi on Gatherings (James, 20 Nov 2026, the last volume): the group is the party, the house is the base. */}
        {IGGI_ON && <IggiPanel ctx={{ entityType: "region", entitySlug: "gatherings", sourcePage: PATH, volume: "gatherings" }} heading="Ask Iggi about a Gathering" lead="Tell him how many are coming and who, and he will find a house that sleeps you all, with the adventures around it planned in." />}
        <AdvisorScroll volume="gatherings" title="Who books the whole house" />
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Gatherings" })} />
    </>
  );
}
