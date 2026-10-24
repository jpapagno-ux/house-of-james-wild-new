import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { KeyRound, Sparkles } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import HostPanel from "@/components/record/HostPanel";
import { CardRail, Conservation, Experiences, IncludedLists, Overview, PreviewNote, RecordHero, RecordNav, RoomsLedger, SectionHead, WhyChose, type RecordCard } from "@/components/record/Sections";
import { GalleryMosaic, GlanceBar, LocationBlock, RecordActionBar } from "@/components/record/Frame";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import { zaOthers } from "@/lib/content/preview/za-ledger";
import { ZA_FAVOURITES } from "@/lib/content/preview/za-favourites";
import { SAMPLE_MORUKURU as M } from "@/lib/content/preview/morukuru";
import { buildMetadata } from "@/lib/seo";

// Preview of the RESIDENCE (Gatherings) template on Morukuru Farm House
// (Residence RES-2026-000028 / Stay STY-2026-950299, Madikwe). Sold whole,
// never by the room. Content is the library snapshot; host from the Base44
// host sample.

export const metadata = buildMetadata({ title: "Morukuru Farm House, Madikwe: Family Residence (preview)", description: "Preview of the James Wild & Co Gatherings residence template.", path: "/preview/gatherings/morukuru-farm-house", noindex: true });

const CDN = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";
// Experience records (library, imported from wildearthstays.com). No Feature
// records are filed for Morukuru; "The house, taken whole" carries that slot.
const EXPERIENCES: RecordCard[] = [
  { name: "Bush Walks", meta: "Every age", image: `${CDN}/683f35c13ed3220a36304cd5_Morukuru%20Farm%20House%20-%20Bush-Walks.JPG`, alt: "A tracker-led bush walk at Morukuru Farm House", body: "Immersive walks led by skilled trackers. Children join safe, shorter walks inside the fenced area; adults go deeper into the wild." },
  { name: "Boma Outdoor Dining", meta: "Evenings", image: `${CDN}/683f312a1f186f070513a4d9_Morukuru%20Farm%20House%20-%20Boma.jpg`, alt: "Dinner in the boma at Morukuru Farm House", body: "Chef-prepared meals, to your wishes, under the stars in the boma." },
  { name: "Star Gazing", meta: "A night out", image: `${CDN}/683f35b698632c87ac1f6430_Morukuru%20Farm%20House%20-%20Star-Gazing.jpg`, alt: "Sleeping out under the stars at Morukuru", body: "Sleep under the stars in the bush hide or on a deck near the farmhouse." },
  { name: "Local Community Visit", meta: "Molatedi Village", image: `${CDN}/683f35a613d13c4157fd6868_Morukuru%20Farm%20House%20-%20Local-Community-Engagement.JPG`, alt: "Molatedi Village near Madikwe", body: "Meet local artisans in Molatedi Village, support community projects and watch the village's dancers perform." },
];

export default function MorukuruPreview() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <RecordHero image={M.hero} eyebrow={`Wild & Co Gatherings · Madikwe Game Reserve · ${M.ledgerId}`} title={M.name} tagline={M.subtitle}
          glance={<GlanceBar glance={{ price: { amount: "US$4,500", basis: "whole house, per night · up to 10" }, facts: [["Best months", "March to May"], ["The house", "5 bedrooms · staff of 8"], ["Fly into", "Johannesburg (JNB)"]], photos: M.gallery.length, cta: { label: "Enquire for the house", href: "/plan" } }} />} />
        <RecordNav items={[["Photos", "gallery"], ["Why we chose it", "why"], ["The house", "house"], ["Bedrooms", "rooms"], ["The rate", "rate"], ["Days for every age", "experiences"], ["Location", "location"], ["Conservation", "conservation"], ["Host", "host"], ["James's favourites", "favourites"]]} cta="Enquire" />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Gatherings", path: "/gatherings" }, { name: "South Africa", path: "/destinations/africa/south-africa" }, { name: "Morukuru Farm House", path: "/gatherings/morukuru-farm-house" }]} /></div>
          <Overview
            quote={M.introQuote}
            answer="Morukuru Farm House is a five-bedroom safari home in South Africa's malaria-free Madikwe Game Reserve, taken whole by one family or group of up to ten, with a staff of eight and a private vehicle and guide. From US$4,500 a night for the whole house. Best March to May and September to November."
            facts={[["Residence ledger", M.ledgerId], ["The house", "5 bedrooms · up to 10 guests"], ["Staff", "Fully staffed (8)"], ["Children & elders", "Child- and elderly-friendly"], ["Power", "100% solar, off-grid"]]}
          />

          <GalleryMosaic images={M.gallery} title={M.name} />
          <WhyChose eyebrow={M.whyStayHere.eyebrow} title={M.whyStayHere.title} blocks={M.whyStayHere.paragraphs.map((b) => ({ body: b }))} image={{ url: M.whyStayHere.image, alt: M.whyStayHere.imageAlt }}
            status={<p className="text-[14px] ledger-muted"><span className="ledger-eyebrow ledger-crimson">Vetted by the house</span> · James met the Morukuru team in May 2026</p>} />

          {/* Core · the house, taken whole */}
          <section id="house" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32">
            <div className="flex items-center gap-2"><KeyRound className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /><p className="ledger-eyebrow">Exclusive use · never sold by the room</p></div>
            <h2 className="ledger-display text-[1.75rem] md:text-4xl mt-2">The House, Taken Whole</h2>
            <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
              <dl className="ledger-paper border ledger-border px-5 md:px-7">
                {M.specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-3.5 border-b ledger-rule last:border-0"><dt className="ledger-eyebrow pt-1 shrink-0">{k}</dt><dd className="text-[15px] text-right max-w-[62%]">{v}</dd></div>
                ))}
              </dl>
              <div>
                <p className="ledger-eyebrow flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /> Only here</p>
                <ul className="mt-3 border-t ledger-rule">{M.onlyHere.map((x) => <li key={x} className="py-2.5 border-b ledger-rule text-[16px]">{x}</li>)}</ul>
                <p className="mt-4 text-[14px] ledger-muted leading-relaxed">{M.rate.note}</p>
              </div>
            </div>
          </section>

          <RoomsLedger
            id="rooms"
            eyebrow="Where everyone sleeps"
            title="One House, Five Bedrooms" unit="house"
            rooms={[{ name: "The Private Residence", image: M.gallery[2].url, sleeps: "up to 10", beds: "5 en-suite bedrooms", price: 4500, basis: "whole house, per night", note: "Five en-suite bedrooms around one table, one fire and one vehicle." }]}
            footnote="Bedroom-by-bedroom plans (beds, connecting rooms, children's rooms) are filed per residence and shown here as they're added."
          />

          {/* Core · what the house rate carries */}
          <section id="rate" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32">
            <SectionHead eyebrow="The house rate · whole residence, per night" title="What the House Rate Includes" />
            <div className="mt-6"><IncludedLists included={["Exclusive use of the house and grounds", "Staff of eight, including chef and butler", "Private safari vehicle, guide and tracker", "All meals and local drinks", "Game drives and bush walks at your own pace"]} excluded={["Flights or road transfers to Madikwe", "Madikwe conservation levy", "Spa treatments", "Premium wines and spirits", "Gratuities"]} /></div>
            <p className="mt-5 text-[13px] ledger-muted max-w-3xl">Sample lines to confirm against the Morukuru rate sheet. {M.rate.note}</p>
          </section>
          <Experiences eyebrow="Days for every age" title="Four Ways to Spend a Day Here" intro="Planned around the generations: walks sized for children, dinner in the boma, a night out under the stars." items={EXPERIENCES} icon="mountain-sun" />
          <LocationBlock chart={CHART_SOUTH_AFRICA} name="Morukuru" pin={{ lat: -24.801461, lng: 26.408333 }} others={zaOthers("Morukuru Farm House")} heading="Madikwe, Malaria-Free Big Five Country"
            rows={[["Address", "Madikwe Game Reserve, North West Province, South Africa"], ["Coordinates", "-24.801461, 26.408333"], ["Airports", "O.R. Tambo (JNB) and Lanseria (HLA)"], ["Getting there", "From Johannesburg, a 4-hour scenic drive or a short Federal Air flight to Madikwe. Self-drive also possible, ideally in an SUV."], ["When to go", "March to May and September to November, when animals gather at the water and the days are comfortable for viewing."]]} note="Faint pins are the other stays in the Ledger in South Africa." />

          <Conservation eyebrow={M.sustainability.eyebrow} title={M.sustainability.titleA} subtitle={M.sustainability.titleB} intro={M.sustainability.intro} body={M.sustainability.body} image={{ url: M.adventures.image, alt: M.adventures.imageAlt }} />
          <div className="mt-16 md:mt-24 border-t ledger-rule pt-10">
            <HostPanel
              state="available"
              stayName={M.name}
              host={{
                name: "Rinse",
                role: "Stay Host · Morukuru Farm House",
                bio: "Rinse knows the house and the reserve day to day, so questions about the bedrooms, the guiding, the dining and your days in Madikwe are answered first-hand.",
                calendlyUrl: "https://calendly.com/jameswildco/meet-your-host",
                topics: ["Taking the house for the whole family: who sleeps where, and the team of eight who look after you.", "Days in Madikwe in your own vehicle, at your own pace.", "Walks and adventures sized for children and grandparents.", "Boma dinners, cooking with the chef, a night in the bush hide.", "Getting to malaria-free Madikwe from Johannesburg."],
              }}
            />
          </div>

          <CardRail id="favourites" eyebrow="James's favourites in South Africa" title="Where James Would Go Back" cards={ZA_FAVOURITES} />
          <PreviewNote>
            <p>No founder stay is filed, so no founder stamp; the host mark appears once the library records whether James met Rinse in person. Rinse has no headshot on file yet.</p>
            <p>No FAQs are on file for this residence yet, so the practical ledger closes the page. No Feature records are filed for Morukuru; &ldquo;The house, taken whole&rdquo; fills that slot. &ldquo;Included / not included&rdquo; lines are samples to confirm.</p>
          </PreviewNote>
        </div>
      </main>
      <RecordActionBar price="US$4,500" basis="house / night" />
    </>
  );
}
