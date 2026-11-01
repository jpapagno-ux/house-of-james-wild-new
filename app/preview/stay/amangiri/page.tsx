import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { GlanceBar, LocationBlock } from "@/components/record/Frame";
import { Overview, RecordHero, RecordNav, RoomsLedger, type Room } from "@/components/record/Sections";
import ImageAccordion from "@/components/record/ImageAccordion";
import WhyFilm from "@/components/record/WhyFilm";
import Signature from "@/components/record/Signature";
import TalkToUs, { ContactBar, ContactPill } from "@/components/record/TalkToUs";
import PlanBand from "@/components/destination/PlanBand";
import { PathwayChips } from "@/components/pathways/Pathway";
import { Roundel } from "@/components/ledger/VolumeKit";
import EFDesignation from "@/components/exceptional-few/EFDesignation";
import EFSignals from "@/components/exceptional-few/EFSignals";
import EFStory, { Credit, EFFrame } from "@/components/exceptional-few/EFStory";
import WhoItSuits from "@/components/exceptional-few/WhoItSuits";
import WorthAnotherNight from "@/components/exceptional-few/WorthAnotherNight";
import ContinueTheJourney from "@/components/exceptional-few/ContinueTheJourney";
import LIB_CHARTS from "@/lib/charts/countries.json";
import type { ChartData } from "@/components/destination/LedgerChart";
import { collectionNo, efPathways, efThemeClass, exceptionalFewFor } from "@/lib/content/exceptional-few";
import { assetFor, assetsFor, mediaUrl, storyFrames, type MediaAsset } from "@/lib/content/media-assets";
import { pathwayHref } from "@/lib/content/pathways/flag";
import { isBuilt } from "@/lib/routes";
import { roundelText, VOLUME_STYLES } from "@/lib/volumes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids, imageObject, lodging } from "@/lib/schema";

// PREVIEW of The Exceptional Few™ on Amangiri (Canyon Point, Utah): the Stay
// template with the Exceptional Few modules around it. Stage 5 prototype, noindex.
//
// The Stay record is not yet in the Ledger, so the record facts below are hand-set
// from Aman's own site (aman.com/resorts/amangiri, 1 Nov 2026) in the same way the
// Leeu Estates preview carries its record. Once Stay Studio files Amangiri, the
// production page /stays/amangiri reads the record from stays.json and the two
// editorial exports join on its real Ledger ID; this preview then retires.
// Photography: Aman's own renditions in Cloudinary, credited, rights to_verify —
// shown here only because the page is a noindex preview (lib/content/media-assets.ts).

const STAY_ID = "STY-2026-AMANGIRI"; // provisional: replaced by the Ledger ID at filing
const NAME = "Amangiri";
const PATH = "/preview/stay/amangiri";
const CANONICAL = "/stays/amangiri";
const COORDS = { lat: 37.0183, lng: -111.6165 };
const PREVIEW_RIGHTS = ["approved", "to_verify"] as const;
// A preview renders rows James has not yet published; production renders "published" only (lib/content/exceptional-few.ts LIVE).
const PREVIEW_STATUS = ["draft", "reviewed", "approved", "published"] as const;

export const metadata = buildMetadata({
  title: "Amangiri, Utah: The Exceptional Few (preview)",
  description: "Preview of The Exceptional Few™ editorial layer on the Amangiri Stay page: Canyon Point, Utah, filed in the James Wild & Co Ledger.",
  path: PATH,
  noindex: true,
});

const rightsOwner = (a: MediaAsset) => a.credit.replace(/^(photography courtesy of|image ©|©)\s*/i, "").trim();

export default function AmangiriPreview() {
  const ef = exceptionalFewFor(STAY_ID, [...PREVIEW_STATUS]);
  if (!ef) return null;
  const allow = [...PREVIEW_RIGHTS];
  const hero = assetFor(STAY_ID, "hero", allow);
  const whyStill = assetFor(STAY_ID, "architecture", allow);
  const place = assetFor(STAY_ID, "editorial_landscape", allow);
  const story = storyFrames(STAY_ID, allow);
  const experiences = assetsFor(STAY_ID, "experience", allow);
  const roomPhotos = assetsFor(STAY_ID, "room", allow);
  const planHref = `/plan?trip=${encodeURIComponent(NAME)}`;
  const pw = efPathways(ef);
  const chart = (LIB_CHARTS as unknown as Record<string, ChartData>).utah;

  // Record facts from Aman's own site (verified 1 Nov 2026); the Ledger record supersedes these at filing.
  const answer = `${NAME} is a resort at Canyon Point in southern Utah, on more than 900 acres of the Colorado Plateau, with 34 suites, the ten tented pavilions of Camp Sarika and a six-bedroom villa. Designated ${collectionNo(ef.collectionNumber)} in The Exceptional Few by James Wild & Co for its setting, its privacy, its design and its access. Nearest airport: Page Municipal (PGA), about 25 minutes by road. Plan it with James or an advisor.`;
  const facts: [string, string][] = [["Ledger ID", "Being filed"], ["Country", "United States"], ["Setting", "Canyon Point, Utah · Colorado Plateau"], ["Airport", "Page Municipal (PGA) · about 25 min"], ["The Exceptional Few", collectionNo(ef.collectionNumber)]];
  const rooms: Room[] = [
    { name: "The Suites", image: roomPhotos[0] ? mediaUrl(roomPhotos[0], { ratio: "16:10", width: 1200 }) : null, units: 34, note: "Girijaala, Orchard, Desert, Desert Pool, Mesa Pool and the Amangiri Suite: concrete, glass and the mesa in every window." },
    { name: "Camp Sarika", image: roomPhotos[2] ? mediaUrl(roomPhotos[2], { ratio: "16:10", width: 1200 }) : null, units: 10, plunge: true, note: "Ten tented pavilions a short drive from the main resort, each with its own plunge pool, one with two bedrooms." },
    { name: "The Villa", image: roomPhotos[1] ? mediaUrl(roomPhotos[1], { ratio: "16:10", width: 1200 }) : null, units: 1, note: "A six-bedroom ridge villa, taken whole." },
  ];
  const days = [
    { title: "Walk the slot canyons", image: experiences[0] ? mediaUrl(experiences[0], { ratio: "3:2", width: 1200 }) : undefined, alt: experiences[0]?.alt, note: "Narrow sandstone passages on the property's own ground, guided, in the cool of the morning." },
    { title: "Climb the via ferrata", image: experiences[1] ? mediaUrl(experiences[1], { ratio: "3:2", width: 1200 }) : undefined, alt: experiences[1]?.alt, note: "Fixed-cable routes up the formations behind the resort; no climbing experience needed, a head for height helps." },
    { title: "Lake Powell by air or by boat", image: experiences[2] ? mediaUrl(experiences[2], { ratio: "3:2", width: 1200 }) : undefined, alt: experiences[2]?.alt, note: "Private flights over the canyon country and the lake, or a day on the water from Page." },
    { title: "Ride, drive, or go to the parks", note: "Horseback and UTV expeditions across the desert, and day trips to the national parks of the Grand Staircase country." },
  ];
  const faqs = [
    { q: `Why is ${NAME} in The Exceptional Few?`, a: ef.whyItMadeTheCut[1] ?? ef.whyItMadeTheCut[0] },
    { q: `Who is ${NAME} less ideal for?`, a: `${ef.whoItMayNotSuit.join(", ")}. If that's you, the Human Compass will point you somewhere that is.` },
    { q: `How do you get to ${NAME}?`, a: "Fly into Page Municipal Airport (PGA), about 25 minutes by road, as stated by the property. St George and Flagstaff are about 2.5 hours away; Phoenix and Las Vegas about 4.5 hours, through the parks. James arranges the car with your booking." },
    { q: `Is ${NAME} worth another night?`, a: ef.worthAnotherNight ?? "" },
    { q: `How do I book ${NAME}?`, a: "Send an enquiry, call the house on 1.800.419.7000, or book a thirty-minute call. James or an advisor confirms dates, rates and what's included before anything is booked." },
  ];
  const nav: [string, string][] = [["Why it made the cut", "why"], ["The place", "place"], ["The stay", "rooms"], ["The story", "story"], ["What you'll do", "experiences"], ["Who it suits", "who"], ["Another night", "another-night"], ["Questions", "questions"], ["Continue", "continue"]];
  const trail = [{ name: "Home", path: "/" }, ...(isBuilt("/destinations/usa-canada") ? [{ name: "USA & Canada", path: "/destinations/usa-canada" }] : [{ name: "Stays", path: "/stays" }]), { name: NAME, path: CANONICAL }];
  const journeys = [...(isBuilt("/destinations/usa-canada") ? [{ name: "The American West", line: "Utah, Arizona and the parks between them, in the Ledger.", href: "/destinations/usa-canada", eyebrow: "Destinations" }] : [])];
  const schemaImages = [hero, place, story.arrival, story.interior, story.night].filter(Boolean).map((a) => imageObject(mediaUrl(a as MediaAsset, { width: 2000 }), (a as MediaAsset).caption, rightsOwner(a as MediaAsset)));

  return (
    <div className={efThemeClass(ef)}>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        {hero && (
          <RecordHero
            image={{ url: mediaUrl(hero, { ratio: "21:9", width: 2560 }), alt: hero.alt }}
            eyebrow={`The Exceptional Few™ — ${collectionNo(ef.collectionNumber)}`}
            title={NAME}
            tagline={ef.heroLine ?? undefined}
            credit={rightsOwner(hero)}
            glance={<GlanceBar glance={{ facts: [["Best months", "Ask James"], ["Fly into", "Page (PGA) · 25 min"], ["Ledger ID", "Being filed"]], cta: { label: "Plan this journey", href: planHref } }} />}
          />
        )}
        <RecordNav items={nav} cta="Plan this journey" ctaHref={planHref} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6 flex items-center justify-between gap-6"><Breadcrumbs trail={trail} /><p className="hidden md:block ledger-eyebrow">Preview · {ef.publicationStatus} copy · not indexed</p></div>
          <WhyFilm
            eyebrow="The Exceptional Few"
            title="Why It Made the Cut"
            paragraphs={ef.whyItMadeTheCut}
            suited={[]}
            status={<div className="flex flex-wrap items-center gap-x-6 gap-y-3"><EFDesignation no={ef.collectionNumber} />{pw && <PathwayChips primary={pw.primary} secondary={pw.secondary} hrefFor={(p) => pathwayHref(p.key)} />}</div>}
            name={NAME}
            video={null}
            poster={whyStill ? mediaUrl(whyStill, { ratio: "16:10", width: 1400 }) : null}
            planHref={planHref}
            note={whyStill ? <p className="mt-2 flex justify-end"><Credit a={whyStill} /></p> : undefined}
          />
          {/* The editorial row: James' Note · Pathways · At a glance (03 in the brief) */}
          <section aria-label="James' note, pathways and at a glance" className="mt-12 md:mt-16 grid md:grid-cols-3 gap-8 md:gap-10 border-t ef-rule pt-8">
            <div className="ef-module ledger-card border ledger-border p-6">
              <p className="ledger-eyebrow ef-eyebrow">James&rsquo; note</p>
              {ef.jamesNote && <>
                <p className="mt-3 ledger-display italic text-[1.35rem] leading-snug">&ldquo;{ef.jamesNote.text}&rdquo;</p>
                <div className="mt-4 flex items-end justify-between gap-4"><span className="text-[11.5px] tracking-[0.12em] uppercase ledger-muted">{ef.jamesNote.where} · {ef.jamesNote.when}</span><Signature className="w-20" /></div>
              </>}
            </div>
            <div className="p-6 border ledger-border">
              <p className="ledger-eyebrow">Wild Pathways</p>
              {pw ? <div className="mt-4"><PathwayChips primary={pw.primary} secondary={pw.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div> : <p className="mt-3 text-[14px] ledger-muted">Classification pending in the Ledger.</p>}
              <p className="mt-4 text-[13.5px] leading-relaxed ledger-muted">Pathways are the house&rsquo;s themes, not a rating. The Ledger&rsquo;s approved classification replaces these once it is filed.</p>
            </div>
            <div className="p-6 border ledger-border"><EFSignals ef={ef} compact id="glance" /></div>
          </section>
          <Overview answer={answer} facts={facts} />

          {/* 04 The Place: landscape first, then the JW map */}
          <section id="place" className="mt-16 md:mt-24 border-t ef-rule pt-8 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby="place-heading">
            <p className="ledger-eyebrow ef-eyebrow">The place</p>
            <h2 id="place-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Canyon Point, and the Rock It Sits In</h2>
            <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-start">
              {place && <EFFrame a={place} ratio="3:2" sizes="(min-width: 1024px) 58vw, 100vw" />}
              <div className="text-[16.5px] leading-relaxed space-y-4">
                <p>Canyon Point sits in the far south of Utah, a few miles from the Arizona line, where the Entrada sandstone of the Grand Staircase country rises out of the desert in mesas and fins. The nearest town is Page, across the state line, and the nearest water is Lake Powell.</p>
                <p>The resort was built around that geology rather than on it: the main pool is poured against a rock that was already there, and every suite faces the mesa. The slot canyons and the via ferrata are on the property&rsquo;s own ground.</p>
                <EFSignals ef={ef} id="signals-full" />
              </div>
            </div>
            {chart && <LocationBlock chart={chart} name={NAME} pin={COORDS} heading="Southern Utah" rows={[["Airport", "Page Municipal (PGA), about 25 minutes by road"], ["Also", "St George or Flagstaff about 2.5 h; Phoenix or Las Vegas about 4.5 h"], ["Coordinates", "37° 01′ N, 111° 37′ W"]]} note="Transfer times as stated by the property. James arranges the car with your booking." mark={<Roundel volume="stays" text={roundelText(NAME, COORDS, VOLUME_STYLES.stays.roman)} size={120} />} />}
          </section>

          {/* 05 The Stay: existing room architecture */}
          <RoomsLedger id="rooms" eyebrow="The stay" title="Where You'll Sleep" intro="Three ways to stay, as the property files them. Rates are quoted for your dates; nothing here is priced first." rooms={rooms} unit="suite" footnote="Suite and pavilion counts as stated by Aman (1 Nov 2026). Room-level records will come from the Ledger once the Stay is filed." />

          {/* 06 Photographic story */}
          <EFStory name={NAME} frames={story} />

          {/* 07 Experiences: access and environment, not amenities */}
          <ImageAccordion id="experiences" eyebrow="What you'll do" title="What the Place Allows" intro="What the land makes possible, rather than what the resort provides. Pick two; leave the afternoons alone." icon="mountain-sun" items={days} start={0} />

          {/* 08 Who it suits · 09 Worth Another Night */}
          <WhoItSuits name={NAME} bestFor={ef.whoItSuits} lessIdealFor={ef.whoItMayNotSuit} />
          {ef.worthAnotherNight && <WorthAnotherNight copy={ef.worthAnotherNight} />}

          {/* Questions answered plainly: no FAQ schema until the record is reviewed */}
          <div id="questions" className="scroll-mt-32 lg:scroll-mt-[212px]"><FaqBlock faqs={faqs} title={`${NAME}, Answered Straight`} schema={false} /></div>

          {/* 10 Continue the journey · Host Connection / Human Compass */}
          <ContinueTheJourney pathways={pw ? [pw.primary, ...pw.secondary] : []} hrefFor={(p) => pathwayHref(p.key)} journeys={journeys} exceptional={[]} compassHref="/compass" hostHref={null} />
          <TalkToUs name={NAME} planHref={planHref} />
          <PlanBand place={NAME} compassHref="/compass" where={{ regionSlug: "usa-canada", volume: "stays" }} />
          <p className="mt-10 text-[12.5px] ledger-muted">Photography courtesy of Aman, shown in this preview under rights still to be confirmed with the owner. <Link href={CANONICAL} className="underline underline-offset-2">The production page</Link> will carry only approved assets.</p>
        </div>
      </main>
      <ContactBar name={NAME} planHref={planHref} />
      <ContactPill name={NAME} planHref={planHref} />
      <JsonLd data={graph(
        { ...lodging({ path: CANONICAL, name: NAME, description: answer, image: schemaImages, subtype: "Resort", country: "United States", locality: "Canyon Point, Utah", geo: COORDS }), ...(ef.signals.length ? { keywords: [NAME, "Utah", "The Exceptional Few", ...ef.signals.map((s) => s.key)].join(", ") } : {}), audience: ef.whoItSuits.map((t) => ({ "@type": "PeopleAudience", audienceType: t })) },
        { "@type": "DefinedTerm", "@id": absoluteUrl(`${CANONICAL}#exceptional-few`), name: `The Exceptional Few™ ${collectionNo(ef.collectionNumber)}`, description: "A James Wild & Co editorial designation for places that are difficult to replicate because of place, privacy, design, access, humanity or rarity. Not a rating.", inDefinedTermSet: { "@type": "DefinedTermSet", name: "The Exceptional Few by James Wild & Co", url: absoluteUrl("/stays") }, termCode: ef.id, about: { "@id": absoluteUrl(`${CANONICAL}#stay`) }, publisher: { "@id": ids.house } },
      )} />
    </div>
  );
}
