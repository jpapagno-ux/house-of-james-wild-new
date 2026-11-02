import type { ReactNode } from "react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import HostPanel, { KIND as HOST_KIND } from "@/components/record/HostPanel";
import CallingCard from "@/components/record/CallingCard";
import { Overview, RecordHero, RecordNav, type Img } from "@/components/record/Sections";
import { RecordActionBar } from "@/components/record/Frame";
import type { ShortFilm } from "@/lib/content/films";
import { hostFor } from "@/lib/content/hosts";
import type { ShipFilm as FilmData, ShipItinerary as Itin, ShipPathway } from "@/lib/content/ships/types";
import { PathwayChips } from "@/components/pathways/Pathway";
import { pathway as pathwayOf, type Pathway } from "@/lib/pathways";
import { PATHWAYS_ON, pathwayHref } from "@/lib/content/pathways/flag";
import ShipFilm from "./ShipFilm";
import ShipItinerary from "./ShipItinerary";

// The shared ship page (Voyages, approved by James 1 Nov 2026). One frame for
// every vessel, in this order:
//   hero + glance → section nav → overview (the AEO answer first) → [lead]
//   → film slot → animated itinerary → [body: cabins, deck plan, dates, offers,
//   sister ships…] → host → [after] → FAQ (+ FAQPage) → phone action bar.
// A ship brings its data and, where it has more to say (Aliikai's charter and
// founder story), its own sections through the lead / body slots.

export type ShipFrame = {
  name: string;
  path: string;
  hero: Img;
  heroFilm?: ShortFilm; // a vessel's own short film playing as the hero (Aliikai)
  heroCredit?: string;
  eyebrow: string;
  tagline: string;
  stamp?: ReactNode;
  glance: ReactNode;
  nav: [string, string][];
  cta: { label: string; href: string; house?: boolean };
  overview: { quote?: string; answer: string; facts: [string, string][]; paragraphs: string[] };
  itinerary: { itineraries: Itin[]; map: { html: string; figCss?: string } | null; title: string; intro?: string; eyebrow?: string };
  film: { film: FilmData | undefined; poster: Img; credit?: string };
  faqs: [string, string][];
  faqTitle: string;
  host: { key: string; name: string };
  action: { price?: string; basis?: string; cta: string; href?: string; house?: boolean };
  crumbs: { name: string; path: string }[];
  jsonld: object[];
  /** Wild Pathways chips, as on stay pages (shown with the pathways flag on). */
  pathway?: ShipPathway;
};

export default function ShipTemplate({ ship, lead, body, after }: { ship: ShipFrame; lead?: ReactNode; body?: ReactNode; after?: ReactNode }) {
  const host = hostFor(ship.host.key);
  const primary = PATHWAYS_ON && ship.pathway ? pathwayOf(ship.pathway.primary) : undefined;
  const secondary = primary && ship.pathway ? ship.pathway.secondary.map((p) => pathwayOf(p)).filter((p): p is Pathway => !!p) : [];
  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader overlay />
      <main id="main">
        <RecordHero film={ship.heroFilm} image={ship.hero} eyebrow={ship.eyebrow} title={ship.name} tagline={ship.tagline} stamp={ship.stamp} glance={ship.glance} credit={ship.heroFilm ? undefined : ship.heroCredit} />
        <RecordNav items={ship.nav} cta={ship.cta.label} ctaHref={ship.cta.href} house={ship.cta.house} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={ship.crumbs} /></div>
          {primary && <div className="mt-4"><PathwayChips primary={primary} secondary={secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}
          <Overview quote={ship.overview.quote} answer={ship.overview.answer} facts={ship.overview.facts} paragraphs={ship.overview.paragraphs} />
          {lead}
          <ShipFilm film={ship.film.film} name={ship.name} poster={ship.film.poster} credit={ship.film.credit} />
          <ShipItinerary ship={ship.name} {...ship.itinerary} />
          {body}
          <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={host.state} host={host.host} stayName={ship.host.name} kind="vessel" /></div>
          {after}
          <FaqBlock faqs={ship.faqs.map(([q, a]) => ({ q, a }))} title={ship.faqTitle} />
        </div>
        {host.state === "available" && <CallingCard who={HOST_KIND.vessel.who} />}
      </main>
      <RecordActionBar price={ship.action.price} basis={ship.action.basis} cta={ship.action.cta} href={ship.action.href} house={ship.action.house} />
      <JsonLd data={ship.jsonld} />
    </div>
  );
}
