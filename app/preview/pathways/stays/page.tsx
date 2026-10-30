import Link from "next/link";
import { Compass as CompassIcon, BookMarked } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import { HubShell, HubSection, RecordCard } from "@/components/hub/Hub";
import { PreviewNote } from "@/components/record/Sections";
import { PathwayCard, PathwayChips, PathwayIndex } from "@/components/pathways/Pathway";
import { PATHWAYS, PATHWAY_LIST, pathway } from "@/lib/pathways";
import { pathwayStays } from "@/lib/content/pathways";
import { PATHWAY_CARD_STAY, PROMINENT, pathwayPreviewHref, stayPreviewHref } from "@/lib/content/pathways/preview";
import { STAYS, altFor } from "@/lib/content/stays";
import { LEDGER_COUNTS } from "@/lib/ledger/counts";
import { VOLUMES } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";

// PREVIEW · Stays landing with Wild Pathways (brief §9). Everything the live
// /stays page has today, plus: six prominent pathway cards with all eight
// reachable, featured stays carrying their pathway chips, the impact
// introduction, a Compass entry and the Ledger save. Noindex; nothing on the
// live page changes until James approves.

const PATH = "/preview/pathways/stays";
const V = VOLUMES.find((v) => v.href === "/stays")!;
export const metadata = buildMetadata({ title: "Stays with Wild Pathways (preview)", description: "Preview of the Stays landing with the eight Wild Pathways.", path: PATH, noindex: true });

export default function StaysPathwaysPreview() {
  const featured = pathwayStays({ includeDrafts: true });
  const hero = (slug: string) => { const s = STAYS.find((x) => x.slug === slug); return s?.hero ? { url: s.hero, alt: altFor(s.hero, s.name, s.country) } : null; };
  const countOn = (id: string) => featured.filter((r) => r.primaryPathway === id || r.secondaryPathways.some((p) => p === id)).length;
  const [lead, ...rest] = PROMINENT.map((id) => PATHWAYS[id]);

  return (
    <>
      <SiteHeader />
      <HubShell name="Stays" path="/stays" eyebrow="Volume 01 · Stays" title="Stays James Has Vetted, by Land and by Water" intro={V.intro} browse={V.browse}
        answer={`James Wild & Co's Stays volume holds ${LEDGER_COUNTS.stays} live stays: safari lodges, island hideaways, mountain and desert retreats and city houses, each vetted in person or by a named partner and filed in the Ledger under a permanent ID. Eight Wild Pathways cut across them: editorial collections by setting and intention, so one stay can sit on several.`}
        filling="Pathway classifications fill from the Ledger as James approves each record's primary and secondary pathways." closeTitle="Not sure which pathway is yours?">

        <div className="mt-8"><PreviewNote>Preview, 30 Oct 2026. Pathway cards use Ledger photographs chosen for the preview; the five featured stays carry draft classifications from <code>pathway-map.json</code> awaiting James&rsquo;s review. Nothing here is on the live Stays page.</PreviewNote></div>

        <HubSection eyebrow="Wild Pathways" title="Six Ways In, and Two More Below" id="pathways-h" more={{ label: "All eight pathways", href: "#all-pathways" }}>
          <p className="-mt-4 mb-6 max-w-2xl text-[16px] ledger-muted leading-relaxed">A pathway is a collection, not a category: it gathers places by the setting you&rsquo;re drawn to and the way you like to travel. Rainforest and jungle. Islands and oceans. Where the wild lives. A stay keeps one Ledger ID however many pathways it sits on.</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2"><PathwayCard pathway={lead} image={hero(PATHWAY_CARD_STAY[lead.id])} href={pathwayPreviewHref(lead.key)} count={countOn(lead.id)} large /></div>
            {rest.map((p) => <PathwayCard key={p.id} pathway={p} image={hero(PATHWAY_CARD_STAY[p.id])} href={pathwayPreviewHref(p.key)} count={countOn(p.id)} />)}
          </div>
        </HubSection>

        <HubSection eyebrow="From the Ledger" title="Featured Stays, Each on Its Pathway" id="featured-h">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <li key={r.slug} className="flex flex-col gap-3">
                <RecordCard name={r.stay.name} id={r.ledgerId ?? r.slug} line={r.stay.tagline ?? r.primary.setting} image={{ url: r.stay.hero ?? "", alt: altFor(r.stay.hero ?? "", r.stay.name, r.stay.country) }} href={stayPreviewHref(r.slug)} eyebrow={r.stay.country ?? undefined} />
                <PathwayChips primary={r.primary} secondary={r.secondary} hrefFor={(p) => pathwayPreviewHref(p.key)} />
              </li>
            ))}
          </ul>
        </HubSection>

        <section className="mt-12 md:mt-16 bg-impact-panel text-impact-copy -mx-5 md:-mx-10 px-5 md:px-10 py-10 md:py-14" aria-labelledby="gives-h">
          <div className="max-w-ledger mx-auto grid md:grid-cols-[1.2fr_1fr] gap-8 items-start">
            <div>
              <p className="ledger-eyebrow !text-impact-copy">Where Your Stay Gives Back</p>
              <h2 id="gives-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Conservation First, Still</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-ink max-w-xl">The house began as Wild Earth Stays, and the rule hasn&rsquo;t changed: a place earns its entry partly by what it does for the land and the people around it. On each stay page a short note says what the house has on record, with its source and review date, and says plainly when it has nothing yet.</p>
            </div>
            <ul className="text-[14.5px] grid gap-2 border-l border-impact-copy/30 pl-5">
              {["Conservation and habitat", "Marine projects", "Local employment and sourcing", "Cultural preservation and community", "Named levies and beneficiaries"].map((x) => <li key={x} className="flex gap-2"><span aria-hidden="true">·</span>{x}</li>)}
              <li className="mt-2 text-[12.5px] text-impact-copy">Guest levies, voluntary gifts and a property&rsquo;s own spending are always labelled apart.</li>
            </ul>
          </div>
        </section>

        <section className="mt-12 md:mt-16 grid md:grid-cols-2 gap-5" aria-label="Find your pathway">
          <Link href="/compass" className="group border ledger-border p-6 md:p-8 hover:border-crimson flex gap-5 items-start">
            <CompassIcon className="w-8 h-8 shrink-0 ledger-crimson" strokeWidth={1.25} aria-hidden="true" />
            <div><p className="ledger-eyebrow ledger-crimson">The Compass</p><h3 className="ledger-display text-[1.5rem] mt-1">Let Iggi Ask the Questions</h3><p className="mt-1.5 text-[15px] ledger-muted leading-relaxed">Three questions find your pathway and a shortlist from the Ledger. A person finishes the trip.</p></div>
          </Link>
          <div className="border ledger-border p-6 md:p-8 flex gap-5 items-start">
            <BookMarked className="w-8 h-8 shrink-0 ledger-crimson" strokeWidth={1.25} aria-hidden="true" />
            <div><p className="ledger-eyebrow ledger-crimson">My Ledger</p><h3 className="ledger-display text-[1.5rem] mt-1">Save a Stay, Keep the Pathway</h3><p className="mt-1.5 text-[15px] ledger-muted leading-relaxed">Saved stays carry their pathway colours into your Ledger. Sign-in arrives with Booking Live; the save button stays off until James switches it on.</p></div>
          </div>
        </section>

        <HubSection eyebrow="Index" title="All Eight Pathways" id="all-pathways">
          <PathwayIndex hrefFor={(p) => pathwayPreviewHref(p.key)} pictured={PROMINENT} />
          <p className="mt-4 text-[13px] ledger-muted">{PATHWAY_LIST.length} pathways · {Object.keys(PATHWAYS).length} IDs · {pathway("PATH-01")?.name} to {pathway("PATH-08")?.name}</p>
        </HubSection>
      </HubShell>
    </>
  );
}
