import SiteHeader from "@/components/ledger/SiteHeader";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import FilmHero from "@/components/home/FilmHero";
import CompassBand from "@/components/home/CompassBand";
import { AdvisorForward, CountedBand, Stance, VolumeStrip } from "@/components/home/Entrance";
import {
  FilmSection,
  HouseJournal,
  HouseStandard,
  HouseStory,
  JamesNote,

  OverlandRoutes,

  SignatureShelf,
  Stewards,

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
    name: "The five volumes of James Wild & Co",
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

export default function Home() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <FilmHero {...HOME.hero} />
        {/* The entrance (house chrome): counted, the stance, six volumes, advisor-forward */}
        <CountedBand />
        <div className="max-w-[1400px] mx-auto px-5 md:px-10"><Stance /></div>
        <VolumeStrip />
        <AdvisorForward />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <HouseStory />
          <CompassBand />
          <HouseStandard />
          <SignatureShelf />
          <OverlandRoutes />
          <FilmSection />
          <HouseJournal />
          <JamesNote />
          <FaqBlock faqs={HOME.faqs} title="Questions, Answered" />
        </div>
        <Stewards />
      </main>
      <JsonLd data={pageSchema} />
    </>
  );
}
