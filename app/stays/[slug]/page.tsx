import Link from "next/link";
import StayPageBody from "@/components/stay/StayPageBody";
import React from "react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { placeGuideForStay } from "@/lib/content/guides";
import FaqBlock from "@/components/ledger/FaqBlock";
import GettingThere from "@/components/ledger/GettingThere";
import { hubsForStay, hubsForCountry, transfersForStay, hubLabel, hubSchema, transferLine } from "@/lib/content/arrivals";
import JsonLd from "@/components/ledger/JsonLd";
import SeeIn3D from "@/components/maps/terrain/SeeIn3D";
import { notFound } from "next/navigation";
import { GalleryMosaic, GlanceBar, LocationBlock } from "@/components/record/Frame";
import { Features, FounderStamp, Overview, RecordHero, RecordNav } from "@/components/record/Sections";
import { undash } from "@/lib/content/ships/types";
import LiveRatesBand from "@/components/record/LiveRatesBand";
import RateCardSection from "@/components/booking/RateCardSection";
import FullFrame from "@/components/record/FullFrame";
import OfferPanel from "@/components/ledger/OfferPanel";
import { offersFor } from "@/lib/content/offers/offers";
import ImageAccordion from "@/components/record/ImageAccordion";
import { momentsFor, rowsFrom } from "@/lib/content/stay-moments";
import { FULL_FRAME, PHOTO_CREDIT } from "@/lib/content/stay-media";
import { PRICED } from "@/lib/content/priced-stays";
import Inclusions from "@/components/booking/Inclusions";
import BookingPanel from "@/components/booking/BookingPanel";
import StayActions from "@/components/booking-live/StayActions";
import TalkToUs, { ContactBar, ContactPill } from "@/components/record/TalkToUs";
import WhyFilm from "@/components/record/WhyFilm";
import MarginNote from "@/components/notes/MarginNote";
import HeroMark from "@/components/notes/HeroMark";
import VerdictCard, { verdictSchema } from "@/components/record/VerdictCard";
import { HERO_MARK, SCRIPT, stayVerdict } from "@/lib/content/verdicts";
import { markOn, yearOf } from "@/lib/content/hero-marks";
import { houseNote } from "@/lib/ledger/house-notes";
import { KIND as HOST_KIND } from "@/components/record/HostPanel";
import LiveHostPanel from "@/components/record/LiveHostPanel";
import CallingCard from "@/components/record/CallingCard";
import { heroSlides } from "@/lib/content/hero-sets";
import { hostFor, VIDEOS } from "@/lib/content/hosts";
import { FILM_CREDITS, filmCreditSchema } from "@/lib/content/films";
import { suitedTo } from "@/lib/ledger/travel-types";
import PlanBand from "@/components/destination/PlanBand";
import { AdvisorStrip } from "@/components/advisor/Desk";
import WhoPlans, { whoPlansSchema } from "@/components/advisor/WhoPlans";
import AdvisorChip from "@/components/advisor/AdvisorChip";
import InstrumentsStrip from "@/components/ledger/InstrumentsStrip";
import { RecordCard } from "@/components/hub/Hub";
import { CHART_COSTA_RICA } from "@/lib/charts/costa-rica";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import type { ChartData } from "@/components/destination/LedgerChart";
import { BEST_FOR, STAYS, STAY_PAGES, VESSEL_PAGES, VESSEL_RECORDS, staysIn, stayBySlug, vesselBySlug, pageReady, altFor } from "@/lib/content/stays";
import { VESSEL_WATERS, vessel as vesselOf, vesselHref, watersOf } from "@/lib/content/vessels";
import { regionBySlug } from "@/lib/content/regions";
import { ContinueBySea, StayBeforeYouSail } from "@/components/stays/IndonesiaPairings";
import { founderProof, stampForStatus, statusLine, VETTED_UNVISITED, type HouseStatus } from "@/lib/ledger/status";
import FounderProof from "@/components/record/FounderProof";
import { InkStamp, Roundel } from "@/components/ledger/VolumeKit";
import { entryNo, roundelText, sealFor, volumeInk, volumeMark, VOLUME_STYLES } from "@/lib/volumes";
import FromTheJournal from "@/components/journal/FromTheJournal";
import { SessionsFor } from "@/components/workshops/SessionCard";
import { postsForStay } from "@/lib/content/journal/posts";
import { sessionsFor } from "@/lib/content/workshops";
import { collectionForStay, offerForStay } from "@/lib/content/collections/cayuga";
import ExtensionChip from "@/components/journey/ExtensionChip";
import { EXTENSIONS, CAYUGA_COSTA_RICA_EXTENSION } from "@/lib/content/extensions";
import { sistersFor } from "@/lib/content/collections/groups";
import { routesThrough } from "@/lib/content/trips";
import { recordHref } from "@/lib/ledger/urls";
import { isBuilt } from "@/lib/routes";
import { RESERVES } from "@/lib/content/reserves";
import GatewayNight from "@/components/stays/GatewayNight";
import EuropePlate from "@/components/stays/EuropePlate";
import { EUROPE_PLATES } from "@/lib/content/europe-plates";
import { absoluteUrl, buildMetadata, fitTitle } from "@/lib/seo";
import { graph, ids, imageObject, lodging, touristTrip } from "@/lib/schema";
import ImpactNote from "@/components/impact/ImpactNote";
import FollowThePathway from "@/components/pathways/FollowThePathway";
import IggiLine from "@/components/dialogue/IggiLine";
import { dialogueLine } from "@/lib/content/dialogue-register";
import { PathwayChips } from "@/components/pathways/Pathway";
import IggiPanel from "@/components/iggi/IggiPanel";
import { IGGI_ON } from "@/lib/iggi/flag";
import { onPathway, pathwayStays, vesselChipsFor } from "@/lib/content/pathways";
import { PATHWAYS_ON, pathwayHref } from "@/lib/content/pathways/flag";
// The Exceptional Few™ (Stage 4): an optional editorial layer keyed on the Stay's Ledger ID.
// Every module below is inside an `ef &&` guard; with no live designation the page is unchanged.
import { collectionNo, efPathways, efThemeClass, exceptionalFewFor } from "@/lib/content/exceptional-few";
import { SIGNAL_LABEL } from "@/lib/content/exceptional-few";
import { assetFor, assetsFor, mediaUrl, storyFrames } from "@/lib/content/media-assets";
import EFSignals from "@/components/exceptional-few/EFSignals";
import NoteText from "@/components/exceptional-few/NoteText";
import { EFFrame } from "@/components/exceptional-few/EFStory";
import DriftFrame from "@/components/exceptional-few/DriftFrame";
import PanFrame from "@/components/exceptional-few/PanFrame";
import WhoItSuits from "@/components/exceptional-few/WhoItSuits";
import WorthAnotherNight from "@/components/exceptional-few/WorthAnotherNight";
import ContinueTheJourney from "@/components/exceptional-few/ContinueTheJourney";
import AmbientFilm from "@/components/stay/AmbientFilm";
import { STAY_FILMS, type AmbientFilm as AmbientFilmT } from "@/lib/content/stay-films";
import Signature from "@/components/record/Signature";
import ComingBanner from "@/components/coming/ComingBanner";
import { assembleStayPage } from "@/lib/stay-page/assemble";
import StayHero from "@/components/stay/StayHero";
import StayEditorialIntro from "@/components/stay/StayEditorialIntro";
import AccommodationCollection from "@/components/stay/AccommodationCollection";
import { PreviewNote } from "@/components/record/Sections";

// /stays/[slug]: a stay page from the Ledger export. Hero + glance › page bar ›
// breadcrumbs › overview (quote, in short, facts, the full entry) › gallery ›
// live rates (where the booking engine is connected) › why it earned its place
// › rooms › experiences › features › location › facts & FAQ (reviewed records)
// › more stays in the country › plan. Built for every live stay with a hero
// photo and content; marks come only from house_status.
//
// Vessels filed in the Stay library (lib/content/vessels.ts, James 1 Nov 2026) keep this page
// until their ship page is built in the country pass: labelled "Voyage", noindex, inked in the
// Voyages navy, out of every Stays list. A vessel with a ship page 301s there (redirects.json).

export const dynamicParams = false;
export function generateStaticParams() { return [...STAY_PAGES, ...VESSEL_PAGES].map((s) => ({ slug: s.slug })); }

const CHARTS: Record<string, ChartData> = { "costa-rica": CHART_COSTA_RICA, "south-africa": CHART_SOUTH_AFRICA };
const KIND: Record<string, string> = { hotel: "hotel", lodge: "lodge", villa: "private villa", camp: "camp", resort: "resort", residence: "residence" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const s = stayBySlug(slug) ?? vesselBySlug(slug);
  if (!s) return {};
  if (!stayBySlug(slug)) {
    const w = VESSEL_WATERS[watersOf(s.slug)];
    return buildMetadata({
      title: fitTitle([`${vesselOf(s.slug)?.name ?? s.name}, ${w.name}: Voyage`, `${vesselOf(s.slug)?.name ?? s.name}: Voyage`, s.name]),
      description: `${s.tagline ? `${s.tagline} ` : ""}${s.name}, a ${vesselOf(s.slug)?.kind ?? "small ship"} sailing ${w.name}, filed in the James Wild & Co Voyages volume.`.slice(0, 300),
      path: `/stays/${s.slug}`, noindex: true, // a ship page replaces it in the country pass
      image: s.hero ? { url: s.hero, alt: s.name } : undefined,
    });
  }
  return buildMetadata({
    title: fitTitle([`${s.name}${s.country ? `, ${s.country}` : ""}: Vetted Stay`, `${s.name}${s.country ? `, ${s.country}` : ""}`, s.name]),
    description: (s.tagline ? `${s.tagline} ` : "") + `${s.name}${s.country ? ` in ${s.country}` : ""}, filed in the James Wild & Co Ledger${s.ledgerId ? ` (${s.ledgerId})` : ""}.${s.bestMonths ? ` Best ${s.bestMonths}.` : ""}`.slice(0, 300),
    path: `/stays/${s.slug}`,
    image: s.hero ? { url: s.hero, alt: `${s.name}${s.country ? `, ${s.country}` : ""}` } : undefined,
  });
}

const MONTH = "(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
/** "Jan–Apr, Oct–Dec – best for calm seas" → "Jan to Apr, Oct to Dec, best for calm seas". */
function vesselMonths(t: string): string {
  return t.replace(new RegExp(`${MONTH}\\s*[\u2013\u2014-]\\s*${MONTH}`, "g"), "$1 to $2").replace(/\s+[\u2013\u2014]\s+/g, ", ").replace(/\s+/g, " ").trim();
}

export default async function StayPage({ params }: { params: Promise<{ slug: string }> }) {
  return <StayPageBody slug={(await params).slug} />;
}
