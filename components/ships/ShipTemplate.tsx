import type { ReactNode } from "react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { KIND as HOST_KIND } from "@/components/record/HostPanel";
import LiveHostPanel from "@/components/record/LiveHostPanel";
import CallingCard from "@/components/record/CallingCard";
import { Overview, RecordHero, type Img } from "@/components/record/Sections";
import { RecordActionBar } from "@/components/record/Frame";
import type { ShortFilm } from "@/lib/content/films";
import { hostFor } from "@/lib/content/hosts";
import type { ShipFilm as FilmData, ShipItinerary as Itin, ShipPathway } from "@/lib/content/ships/types";
import { PathwayChips } from "@/components/pathways/Pathway";
import { pathway as pathwayOf, type Pathway } from "@/lib/pathways";
import { pathwayHref } from "@/lib/content/pathways/flag";
import { VOYAGE_PATHWAYS_ON } from "@/lib/content/ships/flags";
import ShipFilm from "./ShipFilm";
import type { TerrainFlyoverProps } from "@/components/maps/terrain/TerrainFlyover";
import ShipItinerary from "./ShipItinerary";
import ShipNav from "./ShipNav";
import type { ShipEF } from "./ShipEntrance";
import { Band, tonesStyle, type Tones } from "@/components/opening/Tones";

// The shared ship page (Voyages, approved by James 1 Nov 2026). One frame for
// every vessel, in this order:
//   hero + glance → sticky section nav (ShipNav: 44px targets, scroll-spy) → overview (the AEO answer first) → [lead]
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
  itinerary: { itineraries: Itin[]; map: { html: string; figCss?: string } | null; title: string; intro?: string; eyebrow?: string; routesNote?: string; combinations?: { name: string; nights: number }[]; terrain?: Omit<TerrainFlyoverProps, "head" | "note"> };
  /** The film slot; null when the vessel's own film already plays as the hero (never "Film coming soon" then). */
  film: { film: FilmData | undefined; poster: Img; credit?: string } | null;
  faqs: [string, string][];
  faqTitle: string;
  host: { key: string; name: string };
  action: { price?: string; basis?: string; cta: string; href?: string; house?: boolean };
  crumbs: { name: string; path: string }[];
  jsonld: object[];
  /** Wild Pathways chips, as on stay pages (shown with the pathways flag on). */
  pathway?: ShipPathway;
  /** The Exceptional Few™ entrance (ShipEntrance), when the vessel carries a published designation. */
  ef?: ShipEF | null;
  /** A preview opening (components/opening/HouseOpening) in place of the hero, and the page surface under it. */
  opening?: ReactNode;
  surface?: string;
  /** Details D: the record palette carried through the details as bands (preview). */
  tones?: Tones;
};

export default function ShipTemplate({ ship, lead, body, after, itineraryAfter }: { ship: ShipFrame; lead?: ReactNode; body?: ReactNode; after?: ReactNode; itineraryAfter?: ReactNode }) {
  const host = hostFor(ship.host.key);
  const primary = VOYAGE_PATHWAYS_ON && ship.pathway ? pathwayOf(ship.pathway.primary) : undefined;
  const secondary = primary && ship.pathway ? ship.pathway.secondary.map((p) => pathwayOf(p)).filter((p): p is Pathway => !!p) : [];
  const ef = ship.ef ?? null;
  // A designated vessel: night (hero, the line, the cuts), day (the practical middle) and night (the close),
  // as Amangiri. Without one this renders exactly as before.
  const Day = ef ? ({ children }: { children: ReactNode }) => <div className="ef-day mx-[calc(50%-50vw)] px-[calc(50vw-50%)] pt-2 pb-16 md:pb-24">{children}</div> : ({ children }: { children: ReactNode }) => <>{children}</>;
  return (
    <div className={`${ef ? `theme-sea theme-sea-page ${ef.theme}` : "theme-sea theme-sea-page"}${ship.tones ? " house-tones" : ""}`} style={ship.tones ? tonesStyle(ship.tones) : ship.surface ? { background: ship.surface } : undefined}>
      <SiteHeader overlay tuck />
      <main id="main" className={ef ? "overflow-x-clip" : undefined}>
        {ship.opening ?? (ef ? ef.hero : <RecordHero film={ship.heroFilm} image={ship.hero} eyebrow={ship.eyebrow} title={ship.name} tagline={ship.tagline} stamp={ship.stamp} glance={ship.glance} credit={ship.heroFilm ? undefined : ship.heroCredit} />)}
        <ShipNav items={ship.nav} cta={ship.cta.label} ctaHref={ship.cta.href} house={ship.cta.house} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-4"><Breadcrumbs trail={ship.crumbs} touch /></div>
          {!ef && primary && <div className="mt-4"><PathwayChips primary={primary} secondary={secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}
          {ef?.opening}
          <Day>
          {ef && <div className="pt-12 md:pt-16">{ship.glance}</div>}
          <Overview quote={ship.overview.quote} answer={ship.overview.answer} facts={ship.overview.facts} paragraphs={ship.overview.paragraphs} />
          {lead}
          {ship.film && !(ship.tones && !ship.film.film) && <ShipFilm film={ship.film.film} name={ship.name} poster={ship.film.poster} credit={ship.film.credit} />}
          <Band t={ship.tones} tone="mist"><ShipItinerary ship={ship.name} {...ship.itinerary} />{itineraryAfter}</Band>
          <Band t={ship.tones} tone="paper">{ship.tones ? <div>{body}</div> : body}</Band>
          <Band t={ship.tones} tone="night"><LiveHostPanel pageKey={ship.host.key} initial={host} stayName={ship.host.name} kind="vessel" /></Band>
          {after}
          <FaqBlock faqs={ship.faqs.map(([q, a]) => ({ q, a }))} title={ship.faqTitle} />
          {ef?.suits}
          </Day>
          {ef?.close}
        </div>
        {host.state === "available" && <CallingCard who={HOST_KIND.vessel.who} />}
      </main>
      <RecordActionBar price={ship.action.price} basis={ship.action.basis} cta={ship.action.cta} href={ship.action.href} house={ship.action.house} />
      <JsonLd data={ef ? [...ship.jsonld, ef.jsonld] : ship.jsonld} />
    </div>
  );
}
