import { KeyRound, Sparkles } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import HostPanel from "@/components/record/HostPanel";
import { Conservation, Experiences, GalleryStrip, Overview, Practical, PreviewNote, RecordHero, RecordNav, RoomsLedger, WhyChose } from "@/components/record/Sections";
import { SAMPLE_MORUKURU as M } from "@/lib/content/preview/morukuru";
import { buildMetadata } from "@/lib/seo";

// Preview of the RESIDENCE (Gatherings) template on Morukuru Farm House
// (Residence RES-2026-000028 / Stay STY-2026-950299, Madikwe). Sold whole,
// never by the room. Content is the library snapshot; host from the Base44
// host sample.

export const metadata = buildMetadata({ title: "Morukuru Farm House, Madikwe: Family Residence (preview)", description: "Preview of the James Wild & Co Gatherings residence template.", path: "/preview/gatherings/morukuru-farm-house", noindex: true });

export default function MorukuruPreview() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <RecordHero image={M.hero} eyebrow={`Wild & Co Gatherings · Madikwe Game Reserve · ${M.ledgerId}`} title={M.name} tagline={M.subtitle} />
        <RecordNav items={[["Overview", "overview"], ["The house", "house"], ["Why we chose it", "why"], ["Days for every age", "experiences"], ["Meet your host", "host"], ["Conservation", "conservation"], ["Practical", "practical"]]} cta="Enquire for the house" />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <Overview
            quote={M.introQuote}
            answer="Morukuru Farm House is a five-bedroom safari home in South Africa's malaria-free Madikwe Game Reserve, taken whole by one family or group of up to ten, with a staff of eight and a private vehicle and guide. From US$4,500 a night for the whole house. Best March to May and September to November."
            facts={[["Residence ledger", M.ledgerId], ["The house", "5 bedrooms · up to 10 guests"], ["Staff", "Fully staffed (8)"], ["Children & elders", "Child- and elderly-friendly"], ["From", "US$4,500 per night, whole house"], ["Power", "100% solar, off-grid"]]}
          />

          {/* The house, taken whole */}
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
            title="One House, Five Bedrooms"
            rooms={[{ name: "The Private Residence", image: M.gallery[2].url, sleeps: "up to 10", beds: "5 en-suite bedrooms", price: 4500, basis: "whole house, per night", note: "Five en-suite bedrooms around one table, one fire and one vehicle." }]}
            footnote="Bedroom-by-bedroom plans (beds, connecting rooms, children's rooms) are filed per residence and shown here as they're added."
          />

          <WhyChose eyebrow={M.whyStayHere.eyebrow} title={M.whyStayHere.title} blocks={M.whyStayHere.paragraphs.map((b) => ({ body: b }))} image={{ url: M.whyStayHere.image, alt: M.whyStayHere.imageAlt }}
            status={<p className="text-[14px] ledger-muted"><span className="ledger-eyebrow ledger-crimson">Vetted by the house</span> · James met the Morukuru team in May 2026</p>} />

          <Experiences eyebrow="Days for every age" title="What the Estate Programs" intro="Planned around the generations: early drives for the keen, walks sized for children, a night out in the hide." items={M.adventures.bullets.map((b) => ({ name: b, meta: b === "Kids adventures" ? "Children" : "All ages" }))} icon="mountain-sun" />

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

          <Conservation eyebrow={M.sustainability.eyebrow} title={M.sustainability.titleA} subtitle={M.sustainability.titleB} intro={M.sustainability.intro} body={M.sustainability.body} image={{ url: M.adventures.image, alt: M.adventures.imageAlt }} />
          <GalleryStrip images={M.gallery} />
          <Practical rows={M.practical as [string, string][]} />
          <PreviewNote>
            <p>No founder stay is filed, so no founder stamp; the host mark appears once the library records whether James met Rinse in person. Rinse has no headshot on file yet.</p>
            <p>No FAQs are on file for this residence yet, so the FAQ block is omitted rather than invented.</p>
          </PreviewNote>
        </div>
      </main>
    </>
  );
}
