import { HouseInvitation } from "@/components/ledger/SiteFooter";
import SiteHeader from "@/components/ledger/SiteHeader";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import FilmHero from "@/components/home/FilmHero";
import CompassBand from "@/components/home/CompassBand";
import AskHouse from "@/components/home/AskHouse";
import ActRail from "@/components/home/ActRail";
import ComingTicker from "@/components/coming/ComingTicker";
import { mainBoard } from "@/lib/content/board";
import { comingOn } from "@/lib/content/whats-coming";
import { sortComing } from "@/lib/content/coming-view";
import { today } from "@/lib/dates";
import WhenToGoBand, { type WhenPlace } from "@/components/home/WhenToGoBand";
import { COUNTRIES } from "@/lib/content/countries";
import { CountedBand, VolumeStrip } from "@/components/home/Entrance";
import { AdvisorsScroll, ForTravellers, HouseUnderStrip, PathwaysBand } from "@/components/home/Entrance2";
import {
  FilmSection,
  HouseJournal,


  OverlandRoutes,

  SignatureShelf,


} from "@/components/home/Sections";
import { HOME } from "@/lib/content/home";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids, touristTrip } from "@/lib/schema";
import { recordHref } from "@/lib/ledger/urls";

// Page 1 of Site map v1: the home page, ported from the approved Base44
// sample. Four acts, in the order a first-time reader asks:
//   the hook   film hero + quote card · the Ledger counted · places marquee
//   the story  forty-four years, kept in one Ledger (+ the answer block)
//   the offer  the five volumes
//   the proof  house standard · signature shelf · Overland routes · the film
//   go deeper  journal hubs · James's note · FAQ (FAQPage schema) · stewards
// Organization, founder and WebSite schema come from the root layout.

export const metadata = {
  ...buildMetadata({
    title: HOME.seo.title,
    description: HOME.seo.description,
    path: "/",
    image: { url: HOME.hero.loop.poster, alt: HOME.hero.loop.label },
  }),
  title: { absolute: HOME.seo.title },
};

const pageSchema = graph(
  {
    "@type": "WebPage",
    "@id": absoluteUrl("/#webpage"),
    url: absoluteUrl("/"),
    name: HOME.seo.title,
    description: HOME.seo.answer,
    isPartOf: { "@id": ids.website },
    about: { "@id": ids.house },
    primaryImageOfPage: HOME.hero.loop.poster,
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["#story-heading", "[aria-label='In short'] p"] },
  },
  {
    "@type": "ItemList",
    "@id": absoluteUrl("/#volumes"),
    name: "The six volumes of James Wild & Co",
    itemListElement: HOME.volumes.map((v, i) => ({ "@type": "ListItem", position: i + 1, name: v.name, url: absoluteUrl(v.path) })),
  },
  {
    "@type": "ItemList",
    "@id": absoluteUrl("/#overland"),
    name: "Overland Expeditions by James",
    itemListElement: HOME.overland.routes.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: touristTrip({
        path: recordHref("route", r.slug, r.country),
        name: `${r.name}: ${r.subtitle}`,
        description: r.expect.join("; "),
        stays: r.stays.filter(([, slug]) => slug).map(([name, slug]) => ({ name, path: `/stays/${slug}` })),
      }),
    })),
  },
);

// Board 9: each country's filed month bands (the same lines as its page), best months only.
const WHEN: WhenPlace[] = COUNTRIES.filter((c) => c.months.length).map((c) => ({
  name: c.name, href: `/destinations/${c.region}/${c.slug}`,
  areas: c.months.map((a) => ({ area: a.area, best: a.months.flatMap((v, i) => (v === "best" ? [i] : [])) })).filter((a) => a.best.length),
})).filter((p) => p.areas.length)
  // countries with stays filed come first; destination cards (stays coming) follow
  .sort((a, b) => Number(!!COUNTRIES.find((c) => c.name === a.name)?.staysComing) - Number(!!COUNTRIES.find((c) => c.name === b.name)?.staysComing));

export default function Home() {
  const day = today();
  const BOARD = mainBoard(sortComing(comingOn(day), "soonest"), day);
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <ActRail />
        {/* Act I · The house: the film, the question box, the Ledger counted, the stance */}
        <div id="act-1" className="scroll-mt-28">
          <FilmHero {...HOME.hero} />
          <AskHouse />
          <CountedBand />
          <div className="max-w-[1400px] mx-auto px-5 md:px-10"><ForTravellers /></div>
        </div>
        {/* Act II · The volumes */}
        <div id="act-2" className="scroll-mt-28">
          <VolumeStrip />
          <div className="max-w-[1400px] mx-auto px-5 md:px-10">
            <HouseUnderStrip />
            <PathwaysBand />
          </div>
        </div>
        {/* Act III · On now: the live board (openings, offers, sailings) and where is best this month */}
        <div id="act-3" className="scroll-mt-28 mt-16 md:mt-24">
          {BOARD.length > 0 && <ComingTicker entries={BOARD} label="On now: coming and on offer" />}
          <div className="max-w-ledger mx-auto px-5 md:px-10"><WhenToGoBand places={WHEN} /></div>
        </div>
        {/* Act IV · The Ledger: the signature stays, the routes, the Compass */}
        <div id="act-4" className="scroll-mt-28 max-w-ledger mx-auto px-5 md:px-10">
          <SignatureShelf />
          <OverlandRoutes />
          <CompassBand />
        </div>
        {/* Act V · Go deeper: the film, the journal, questions, the advisors, the house */}
        <div id="act-5" className="scroll-mt-28">
          <div className="max-w-ledger mx-auto px-5 md:px-10">
            <FilmSection />
            <HouseJournal />
            <FaqBlock faqs={HOME.faqs} title="Questions, Answered" />
          </div>
          <AdvisorsScroll />
          {/* "James knows a place": Talk to the house, with the seal (the one signature moment), above the footer */}
          <HouseInvitation />
        </div>
      </main>
      <JsonLd data={pageSchema} />
    </>
  );
}
