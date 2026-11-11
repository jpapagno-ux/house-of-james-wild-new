import Link from "next/link";
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
import RoomTypes from "@/components/stay/RoomTypes";
import { founderLine } from "@/lib/content/voice/founder-lines";
import WhyWhoVerdict from "@/components/stay/WhyWhoVerdict";
import { thinkTwice } from "@/lib/content/think-twice";
import OnTheseRoutes, { type RouteCard } from "@/components/stay/OnTheseRoutes";
import { roomsFor } from "@/lib/content/stay-rooms";
import { voyagesThrough } from "@/lib/content/ships/either-side";
import { RecordCard } from "@/components/hub/Hub";
import ToneCard from "@/components/hub/ToneCard";
import { stayTone } from "@/lib/content/stay-tone";
import { CHART_COSTA_RICA } from "@/lib/charts/costa-rica";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import type { ChartData } from "@/components/destination/LedgerChart";
import LIB_CHARTS from "@/lib/charts/countries.json";
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
import HouseOpening from "@/components/opening/HouseOpening";
import { Band, tonesStyle } from "@/components/opening/Tones";
import { stayOpening } from "@/lib/content/opening/build";

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

const CHARTS: Record<string, ChartData> = { "costa-rica": CHART_COSTA_RICA, "south-africa": CHART_SOUTH_AFRICA };
const KIND: Record<string, string> = { hotel: "hotel", lodge: "lodge", villa: "private villa", camp: "camp", resort: "resort", residence: "residence" };

const MONTH = "(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
/** "Jan–Apr, Oct–Dec – best for calm seas" → "Jan to Apr, Oct to Dec, best for calm seas". */
function vesselMonths(t: string): string {
  return t.replace(new RegExp(`${MONTH}\\s*[\u2013\u2014-]\\s*${MONTH}`, "g"), "$1 to $2").replace(/\s+[\u2013\u2014]\s+/g, ", ").replace(/\s+/g, " ").trim();
}

/** The stay page body, shared by /stays/<slug> and the opening previews (app/preview/stays/*). `house`: the house
 *  opening, tones and tint (James, 9 Nov 2026), for a stay without an Exceptional Few designation. */
export default async function StayPageBody({ slug, house = false }: { slug: string; house?: boolean }) {
  const found = stayBySlug(slug) ?? vesselBySlug(slug);
  // A vessel prints her registry name ("Celestia", not the library's slogan title) and her
  // seasons without dashes ("Jan to Apr"), until her ship page is built.
  const s = found && !stayBySlug(slug) ? { ...found, name: vesselOf(found.slug)?.name ?? found.name, bestMonths: found.bestMonths ? vesselMonths(found.bestMonths) : found.bestMonths } : found;
  if (!s || !s.hero) notFound();
  const path = `/stays/${s.slug}`;
  // A vessel awaiting its ship page: a Voyage, not a stay (lib/content/vessels.ts).
  const boat = !stayBySlug(slug) ? { ...VESSEL_WATERS[watersOf(s.slug)], kind: vesselOf(s.slug)?.kind ?? "small ship" } : null;
  const noun = boat ? "voyage" : "stay";
  const region = s.regionSlug ? regionBySlug(s.regionSlug) : undefined;
  const countryPath = region && s.countrySlug ? `/destinations/${region.slug}/${s.countrySlug}` : null;
  const status = statusLine(s.status as HouseStatus, s.statusDate, s.slug);
  const stamp = stampForStatus(s.status as HouseStatus, s.slug);
  // The library files many safari camps as "hotel"; the name is the better witness.
  const named = /\b(camp|lodge|villa|resort|residence|house|island)\b/i.exec(s.name)?.[1]?.toLowerCase();
  const kind = boat ? boat.kind : (s.category === "hotel" && named ? (named === "villa" ? "private villa" : named === "island" ? "private island" : named) : null) ?? ((s.category && KIND[s.category]) || "stay");
  const bestFor = s.bestFor.map((b) => BEST_FOR[b] ?? b).slice(0, 4);
  const suited = suitedTo([s.tagline, s.quote, ...s.why.map((w) => `${w.title ?? ""} ${w.body}`), ...s.onlyHere, ...s.rooms.items, ...s.rooms.paras, ...s.experiences.items, ...s.experiences.paras, ...s.features.items, ...s.features.paras].filter(Boolean).join(" "), s.bestFor, 4, s.name);
  const answer = boat ? `${s.name} is a ${kind} sailing ${boat.name}, filed in the James Wild & Co Voyages volume${s.ledgerId ? ` under ${s.ledgerId}` : ""}.${s.bestMonths ? ` Best months: ${undash(s.bestMonths).replace(/\s+/g, " ").trim().replace(/\.$/, "")}.` : ""} Her ship page, cabin by cabin with dates and fares, is being built; until then plan the voyage with James or an advisor.` : `${s.name} is a ${kind}${s.country ? ` in ${s.country}` : ""}, filed in the James Wild & Co Ledger${s.ledgerId ? ` under ${s.ledgerId}` : ""}.${s.tagline ? ` ${s.tagline.replace(/\.$/, "")}.` : ""}${s.bestMonths ? ` Best months: ${s.bestMonths}.` : ""}${suited.length ? ` Best suited to ${suited.join(", ").toLowerCase()}.` : bestFor.length ? ` Best for ${bestFor.join(", ").toLowerCase()}.` : ""}${s.airport ? ` Nearest airport: ${s.airport}.` : ""} ${status ? `${status}.` : "Vetted for the Ledger by the house."} Plan it with James or an advisor.`;
  const facts: [string, string][] = [["Ledger ID", s.ledgerId ?? "Being filed"], ...(boat ? [["Volume", "Voyages"] as [string, string], ["Waters", boat.name] as [string, string]] : s.country ? [["Country", s.country] as [string, string]] : []), ...(s.bestMonths ? [["Best months", boat ? undash(s.bestMonths) : s.bestMonths] as [string, string]] : []), ...(suited.length ? [["Best suited to", suited.join(", ")] as [string, string]] : bestFor.length ? [["Best for", bestFor.join(", ")] as [string, string]] : []), ...(s.airport ? [["Airport", s.airport] as [string, string]] : []), ...(status ? [["The Ledger", status] as [string, string]] : [])];
  const images = [s.hero, ...s.gallery].filter(Boolean).map((u, i) => ({ url: u as string, alt: altFor(u as string, s.name, s.country, i) }));
  const more = boat ? VESSEL_RECORDS.filter((x) => x.slug !== s.slug && pageReady(x) && watersOf(x.slug) === watersOf(s.slug)).slice(0, 4)
    : s.countrySlug ? staysIn(s.countrySlug).filter((x) => x.slug !== s.slug && pageReady(x)).slice(0, 4) : [];
  // every stay with a country chart gets its location map (James, 10 Nov 2026: "the Ellerman house has a map. We need
  // to use those maps on the other properties as well"): the hand-drawn charts first, then the library's country charts
  const chart = s.countrySlug ? CHARTS[s.countrySlug] ?? (LIB_CHARTS as unknown as Record<string, ChartData>)[s.countrySlug] : undefined;
  const priced = s.engine ? PRICED[s.slug] : undefined;
  // Steps 1–2: the normalized Stay-page contract (editorial + Booking Live
  // canonical units + media + pricing provenance). Assembled for every stay
  // Booking Live lists with canonical units (one cached lookup per build);
  // null otherwise, or if Booking Live can't be reached, in which case the page
  // keeps its previous layout (BookingPanel for Leeu, rooms list for the rest).
  const stayPage = await assembleStayPage(s);
  // The legacy reference rate stays on the server: it orders units and feeds QA, never the browser.
  const units = stayPage?.accommodations.map((u) => ({ ...u, legacyReference: null })) ?? [];
  const planHref = `/plan?trip=${encodeURIComponent(s.name)}`;
  // Wild Pathways: only an APPROVED classification renders, and only with the flag on.
  const pw = PATHWAYS_ON && !boat ? pathwayStays().find((r) => r.slug === s.slug) ?? null : null;
  // A vessel keeps its pathway tags (shown as chips), listed under Voyages on the pathway pages.
  const chips = pw ? { primary: pw.primary, secondary: pw.secondary } : PATHWAYS_ON && boat ? vesselChipsFor(s.slug) : null;
  const slides = heroSlides(`stay:${s.slug}`, s.name, s.country);
  const video = VIDEOS[`stay:${s.slug}`] ?? priced?.video ?? null;
  const host = hostFor(`stay:${s.slug}`);
  const verdict = stayVerdict(s.slug, s.status);
  const twice = thinkTwice(s.slug, { name: s.name, facts: s.facts, faqs: s.faqs, airportDirections: s.airportDirections });
  const note = houseNote({ key: `stay:${s.slug}`, name: s.name, bestMonths: s.bestMonths, airport: s.airport, suited, rooms: s.rooms.items });
  // Stage 5 (Last Mile): approved Ledger hubs and transfer legs for this stay. Empty until the library approves them.
  const hubs = hubsForStay(s);
  const legs = transfersForStay(s.ledgerId);
  const gatewayHub = hubsForCountry(s.country).find((h) => h.gatewayOvernight && h.gatewayRef && h.gatewayRef !== s.slug) ?? null;
  const gatewayStay = gatewayHub ? STAYS.find((x) => x.slug === gatewayHub.gatewayRef && pageReady(x)) ?? null : null;
  const timedLegs = legs.filter((t) => transferLine(t));
  // Vessels still on this template read as ships (James, 2 Nov 2026): ship section names, no
  // marketing subtitles, and a factual line (kind, waters, seasons) in place of the slogan.
  const L = boat
    ? { why: "Why sail her", overview: "The ship", apart: "What makes her different", apartTitle: "What Makes Her Different?", days: "Days aboard", daysTitle: "What Does a Day on Board Look Like?", rooms: "Cabins", roomsTitle: "Which Cabin Is Yours?", rates: "Cabins & rates" }
    : { why: "Why it's here", overview: "Overview", apart: "What sets it apart", apartTitle: "Why It's Not Just Another Pretty Place", days: "What you'll do", daysTitle: "How to Fill the Days (or Not)", rooms: "Rooms", roomsTitle: "Where You'll Sleep", rates: "Rooms & rates" };
  const seasons = boat && s.bestMonths ? undash(s.bestMonths).replace(/\s+/g, " ").trim() : null;
  const tagline = boat ? `${boat.kind.charAt(0).toUpperCase()}${boat.kind.slice(1)} sailing ${boat.name}${seasons && seasons.length <= 110 ? `. Best months: ${seasons}` : ""}` : s.tagline;
  // A slogan ("Voyages That Transform, Waters That Whisper"): short, every word capitalised, no figures.
  const slogan = (x: string) => { const w = x.replace(/[,:.!]/g, "").split(/\s+/).filter(Boolean); return w.length > 1 && w.length <= 8 && !/\d/.test(x) && w.every((y) => /^[A-Z&]/.test(y)); };
  const keep = (xs: string[]) => (boat ? xs.filter((x) => !slogan(x)) : xs);
  const whyTitle = boat ? `Why Sail ${s.name}?` : s.why[0]?.title ?? `Why ${s.name} Made the Cut`;
  const whyBlocks = s.why.length ? s.why.map((w, i) => ({ title: (i === 0 && s.why[0]?.title) || (boat && w.title && slogan(w.title)) ? null : w.title, body: w.body })) : [];
  const whyParas = s.why.length ? [] : (s.onlyHere.length ? s.onlyHere.slice(0, 2) : [boat ? null : s.tagline].filter(Boolean) as string[]);
  // The Exceptional Few: null for every stay without a published designation (production allows "published" only; assets "approved" only).
  const ef = exceptionalFewFor(s.ledgerId);
  const efPw = ef ? efPathways(ef, s.pathway) : null;
  const efHero = ef ? assetFor(s.ledgerId, "hero") : null;
  const efArch = ef ? assetFor(s.ledgerId, "architecture") : null;
  const efPlace = ef ? assetFor(s.ledgerId, "editorial_landscape") : null;
  const efStory = ef ? storyFrames(s.ledgerId) : null;
  const efNight = ef ? assetFor(s.ledgerId, "night") : null;
  const efAerial = ef ? (assetsFor(s.ledgerId, "editorial_landscape").find((a) => a.sort === 2) ?? null) : null;
  // The approved direction (Mock C, 1 Nov 2026): night → day → night. Arrival and the three "why" screens sit on the
  // dusk surface; the practical middle (overview → who it suits) lifts to desert ivory; Worth Another Night™ closes dark.
  const efCuts = ef ? [efPlace, efArch, efStory?.interior ?? null] : [];
  // Without a designation this renders nothing of its own (a fragment), so the production DOM is unchanged.
  const DayBand = ef ? ({ children }: { children: React.ReactNode }) => <div className="ef-day mx-[calc(50%-50vw)] px-[calc(50vw-50%)] pb-16 md:pb-24">{children}</div> : React.Fragment;
  const quick = [
    ...(ef ? [{ q: `Why is ${s.name} in The Exceptional Few?`, a: ef.whyItMadeTheCut[1] ?? ef.whyItMadeTheCut[0] ?? "" }, ...(ef.whoItMayNotSuit.length ? [{ q: `Who is ${s.name} less ideal for?`, a: `${ef.whoItMayNotSuit.join(", ")}. If that's you, the Human Compass will point you somewhere that is.` }] : [])] : []),
    ...(s.bestMonths ? [{ q: boat ? `When does ${s.name} sail?` : `When is the best time to visit ${s.name}?`, a: `${boat ? undash(s.bestMonths) : s.bestMonths}.${s.bestMonthsNote ? ` ${s.bestMonthsNote}` : ""}` }] : []),
    ...(twice.length ? [{ q: `Who should think twice about ${s.name}?`, a: `Think twice if ${twice.map((t) => t[0].toLowerCase() + t.slice(1).replace(/\.$/, "")).join("; or if ")}.` }] : []),
    ...(suited.length ? [{ q: `Who is ${s.name} best suited to?`, a: `${suited.join(", ")}. If that's you, it's worth a conversation; if it isn't, the house will point you somewhere that is.` }] : []),
    ...(hubs.length
      ? [{ q: `How do you get to ${s.name}?`, a: `${hubs[0].kind === "airport" || hubs[0].kind === "airstrip" ? "Fly into" : "Arrive at"} ${hubLabel(hubs[0])}${hubs.length > 1 ? ` (or ${hubs.slice(1).map(hubLabel).join(", ")})` : ""}.${timedLegs.length ? ` ${timedLegs.map((t) => `From ${hubLabel(t.hub)} it is ${transferLine(t)}, as stated by the property.`).join(" ")}` : " The transfer time is not yet on record with the house."} James arranges arrival and the car with your booking.` }]
      : s.airport ? [{ q: `How do you get to ${s.name}?`, a: `Fly into ${s.airport}.${s.airportDirections ? ` ${s.airportDirections}` : ""} The house arranges the transfer with your booking.` }] : []),
    ...(s.rooms.items.length ? [{ q: `What rooms does ${s.name} have?`, a: `${s.rooms.items.slice(0, 8).join(", ")}.` }] : []),
    { q: `How do I book ${s.name}?`, a: `Send an enquiry, call the house on 1.800.419.7000, or book a thirty-minute call. James or an advisor confirms dates, rates and what's included before anything is booked.` },
  ];
  const overviewParas = s.why.length ? s.onlyHere : s.onlyHere.slice(2);
  const apart = momentsFor(s.slug, rowsFrom(keep(s.features.items), s.features.paras), images.slice(1));
  const days = momentsFor(s.slug, rowsFrom(keep(s.experiences.items), s.experiences.paras), images.slice(1), 3, apart);
  const hostEarly = host.state === "available" && !!host.host;
  const baseNav: [string, string][] = [[L.why, "why"], ["Film", "film"], [L.overview, "overview"], ...(apart.length ? [[L.apart, "features"] as [string, string]] : []), ...(days.length ? [[L.days, "experiences"] as [string, string]] : []), ...(images.length > 2 ? [["Gallery", "gallery"] as [string, string]] : []), ...(s.engine ? [["Live rates", "live-rates"] as [string, string]] : []), ...(s.rooms.items.length || s.rooms.paras.length ? [[L.rooms, "rooms"] as [string, string]] : []), ...(hostEarly ? [["Meet the host", "host"] as [string, string]] : []), ...(s.coords && chart ? [["Location", "location"] as [string, string]] : []), ...(FULL_FRAME[s.slug] ? [["Full frame", "full-frame"] as [string, string]] : []), ...(verdict ? [["The verdict", "verdict"] as [string, string]] : []), ...(ef ? [["Who it suits", "who"] as [string, string], ["Another night", "another-night"] as [string, string], ["Continue", "continue"] as [string, string]] : []), ["Talk to us", "talk"], ["Plan", "plan"]];
  const navAll: [string, string][] = priced || stayPage
    ? [[L.why, "why"], ["Film", "film"], [L.overview, "overview"], ...(apart.length ? [[L.apart, "features"] as [string, string]] : []), ...(days.length ? [[L.days, "experiences"] as [string, string]] : []), ...(priced ? [["Included", "included"] as [string, string]] : []), [L.rates, "rates"], ...(hostEarly ? [["Meet the host", "host"] as [string, string]] : []), ...(FULL_FRAME[s.slug] ? [["Full frame", "full-frame"] as [string, string]] : []), ...(s.coords && chart ? [["Location", "location"] as [string, string]] : []), ...(verdict ? [["The verdict", "verdict"] as [string, string]] : []), ["Talk to us", "talk"], ["Plan", "plan"]]
    : baseNav;
  const nav: [string, string][] = navAll.filter(([, id]) => !ef || id !== "film");
  // Chile → Rapa Nui → Nayara Hangaroa: a stay selected for a place guide gets the place in its trail.
  const place = placeGuideForStay(s.slug);
  const trail = boat ? [{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: s.name, path }] : [{ name: "Home", path: "/" }, { name: "Stays", path: "/stays" }, ...(region && isBuilt(`/destinations/${region.slug}`) ? [{ name: region.name, path: `/destinations/${region.slug}` }] : []), ...(countryPath && isBuilt(countryPath) ? [{ name: s.country as string, path: countryPath }] : []), ...(place && isBuilt(place.path) ? [{ name: place.name, path: place.path }] : []), { name: s.name, path }];
  // The house opening (James, 9 Nov 2026): a stay without a designation arrives as The Exceptional Few do, in its
  // pathway's colour mixed with its own ground, the volume's tab on the frame. On the preview every stay can take it;
  // live, every African safari stay takes it (James, 10 Nov 2026: "proceed with changing all of the African Safari stays
  // using these new pages, style, reference, colors ... it's a go") once it has the photographs to fill the entrance
  // (five or more of its own); a thinner record keeps the earlier page until its partner sends more (Partner Follow-Ups).
  // A safari stay: filed under Safaris & Reserves, or an African stay whose primary pathway is Where the Wild Lives.
  const primaryPath = pw?.primary.id ?? (typeof s.pathway === "object" && s.pathway ? (s.pathway as { primary?: string }).primary ?? null : null);
  const safariVol = (Array.isArray(s.volumes) && s.volumes.includes("safaris")) || (s.regionSlug === "africa" && (primaryPath === "PATH-04" || pw?.primary.key === "where-the-wild-lives"));
  const openingImages = [...slides, ...images].filter((x, k, l) => l.findIndex((y) => y.url === x.url) === k);
  // James, 10 Nov 2026 (07:09): "Ellerman House looks good as a go ... proceed with all these changes for the stay as
  // you've designed and built": every stay with five or more of its own photographs, in every region.
  // a stay with no pathway filed yet keeps the earlier page, so no entrance ever prints a pathway it was not given
  const houseOn = house || (openingImages.length >= 5 && !!(pw || primaryPath));
  const op = houseOn && !ef && !boat ? stayOpening({ slug: s.slug, name: s.name, country: s.country ?? null, regionSlug: s.regionSlug ?? null, kind, place: place?.name ?? null, volumes: Array.isArray(s.volumes) ? s.volumes : null, safari: safariVol, pathway: pw?.primary.key ?? (typeof s.pathway === "object" && s.pathway ? s.pathway.primary : null),
    images: openingImages, quote: s.quote, tagline: s.tagline, bestMonths: s.bestMonths, airport: s.airport, ledgerId: s.ledgerId,
    suited, coords: s.coords ?? null, why: s.why, moments: [...apart, ...days].map((m) => ({ title: m.title, note: m.note, image: m.image ? { url: m.image, alt: m.alt ?? `${s.name}: ${m.title}` } : null })), planHref }) : null;
  const roomData = roomsFor(s.slug);
  // The routes a stay is on (James, 10 Nov 2026: "Ellerman House also shows routes that it's featured on. That's an
  // important feature that we need to build into the logic"): every journey that names it, and every voyage that
  // suggests it either side of the ship, found from the data, never listed by hand.
  const routeCards: RouteCard[] = [
    ...routesThrough(s.slug).map((t) => ({ key: t.id, href: t.seo.path, eyebrow: "Journey", title: t.h1, sub: t.sub, line: t.herofacts[1]?.[1] ?? "" })),
    ...voyagesThrough(s.slug).filter((v) => isBuilt(v.href)).map((v) => ({ key: v.href, href: v.href, eyebrow: v.eyebrow, title: v.title, sub: v.sub, line: v.line })),
  ];
  // No photograph twice (James, 10 Nov 2026: "there's a couple of duplicate photos in there"): with the house entrance,
  // the gallery drops any photograph the entrance or the rooms already show, matched by address or by the name in its
  // file (a library copy and a brand copy of the same frame), and any repeat within itself.
  const photoKey = (u: string) => (u.split("?")[0].split("/").pop() ?? "").replace(/\.(jpe?g|png|webp|avif)$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter((w) => (w.length > 2 || /^\d+$/.test(w)) && !/^[0-9a-f]{6,}$/.test(w)).slice(-2).join(" ");
  const sameFrame = (a: string, b: string) => !!a && !!b && (a === b || a.endsWith(" " + b) || b.endsWith(" " + a));
  const shown = op ? [...op.frames.map((f) => f.src), ...op.why.map((w) => w.photo?.src ?? ""), op.close.photo.src, ...(roomData?.rooms.map((r) => r.image?.id ?? "") ?? [])].filter(Boolean) : [];
  const shownKeys = new Set(shown.map((u) => photoKey(u)).filter(Boolean));
  const shownUrls = new Set(shown);
  const galleryImages = op ? images.filter((im, k, l) => !shownUrls.has(im.url) && ![...shownKeys].some((k2) => sameFrame(photoKey(im.url), k2)) && l.findIndex((y) => photoKey(y.url) === photoKey(im.url)) === k) : images;
  const tones = op ? { palette: op.palette } : undefined;
  // One telling of each thing (James, 10 Nov 2026: "a lot of duplication of my signature ... any duplicate information").
  // With the house entrance, the entrance carries the glance (best months, Ledger ID, the founder stamp, the pathway);
  // the page below does not repeat them. James's own words live once, in The Verdict; one "who plans this" card; one
  // way to talk to the house. Live stay pages without the entrance are unchanged.
  const tight = !!op;
  const inOpening = new Set(["Ledger ID", "Country", "Best months", "Best suited to", "The Ledger", "Airport"]);
  // with the house entrance the chapter rail follows the new order: the verdict after the overview, the map after the rooms
  const ORDER = ["overview", "verdict", "features", "experiences", "rooms", "gallery", "location"];
  const navShown = tight ? (() => {
    const kept = nav.filter(([, id]) => id !== "why" && (id !== "film" || !!video));
    const lead = ORDER.map((id) => kept.find(([, x]) => x === id)).filter((x): x is [string, string] => !!x);
    return [...lead, ...kept.filter(([, id]) => !ORDER.includes(id))];
  })() : nav;
  const europe = s.regionSlug === "europe";
  // Volume V (Europe) stays wear the Europe palette (aubergine) instead of the Stays green; colours only.
  return (
    <div className={[boat ? "theme-sea theme-sea-page" : s.regionSlug === "europe" ? "theme-vol-europe theme-vol-europe-page" : "", ef ? `${efThemeClass(ef)} theme-ef-dark` : "", tones ? `house-tones house-tones--stay${safariVol ? " house-tones--safari" : ""}` : ""].filter(Boolean).join(" ")} style={tones ? tonesStyle(tones) : undefined}>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        {op ? (() => { const { next, ...o } = op; return <HouseOpening {...o} next={next} tab={volumeMark(europe ? "europe" : safariVol ? "safaris" : "stays")} badge={stamp ? <FounderStamp kind={stamp} volume={safariVol ? "safaris" : "stays"} ink={o.palette.sand} year={s.statusDate ? Number(s.statusDate.slice(0, 4)) : undefined} date={s.statusDate} place={s.country ?? undefined} ledgerId={s.ledgerId ?? undefined} size={104} /> : undefined} />; })() : ef && efHero ? (
          <DriftFrame a={efHero} ratio="21:9" priority motion="zoom" film={STAY_FILMS[s.slug]?.hero ? STAY_FILMS[s.slug] : undefined}>
            <p className="ledger-eyebrow !text-white/85">The Exceptional Few&trade; &middot; {collectionNo(ef.collectionNumber)}</p>
            <h1 className="ledger-display text-[2.9rem] md:text-[6.4rem] leading-[0.95] mt-3">{s.name}</h1>
            <p className="ledger-display italic text-xl md:text-3xl text-white/90 mt-3">{[place?.name, s.country].filter(Boolean).join(", ")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-5"><Link href={planHref} className="ledger-btn !border-white !text-white hover:!bg-white hover:!text-ink">Plan this journey</Link><span className="text-[11.5px] tracking-[0.18em] uppercase text-white/75">Ledger ID {s.ledgerId ?? "being filed"}</span></div>
          </DriftFrame>
        ) : stayPage ? <StayHero editorial={stayPage.editorial} slides={slides.map((x) => ({ url: x.url, alt: x.alt, source: "library" as const }))} tag={markOn(`stay:${s.slug}`) ? (verdict ? <HeroMark style={HERO_MARK[`stay:${s.slug}`] ?? "stamp"} image={slides[1]?.url ?? slides[0]?.url} script={SCRIPT[`stay:${s.slug}`]} line={verdict.text[0]} where={verdict.where} when={verdict.when} /> : <HeroMark style="stamp" image={slides[1]?.url ?? slides[0]?.url} script={note.script} line={note.line} where={(s.country ?? "The Ledger")} when={yearOf(s.ledgerId)} label="From the house" href="#why" />) : undefined}
          stamp={stamp ? <FounderStamp kind={stamp} year={s.statusDate ? Number(s.statusDate.slice(0, 4)) : undefined} date={s.statusDate} place={s.country ?? undefined} ledgerId={s.ledgerId ?? undefined} /> : undefined}
          glance={<GlanceBar glance={{ facts: [["Best months", s.bestMonths ?? "Ask James"], ["Best suited to", suited[0] ?? bestFor[0] ?? "Ask James"], ["Ledger ID", s.ledgerId ?? "Being filed"]], cta: { label: "Choose your stay", href: "#rates" } }} />} />
        : <RecordHero image={images[0]} slides={slides} wideFilm={STAY_FILMS[s.slug]?.hero ? STAY_FILMS[s.slug] : undefined} tag={markOn(`stay:${s.slug}`) ? (verdict ? <HeroMark style={HERO_MARK[`stay:${s.slug}`] ?? "stamp"} image={slides[1]?.url ?? slides[0]?.url} script={SCRIPT[`stay:${s.slug}`]} line={verdict.text[0]} where={verdict.where} when={verdict.when} /> : <HeroMark style="stamp" image={slides[1]?.url ?? slides[0]?.url} script={note.script} line={note.line} where={(s.country ?? "The Ledger")} when={yearOf(s.ledgerId)} label="From the house" href="#why" />) : undefined} eyebrow={boat ? `${boat.name} · Voyage` : `${s.country ?? "The Ledger"} · Stay`} title={s.name} tagline={tagline ?? undefined}
          stamp={stamp ? <FounderStamp kind={stamp} year={s.statusDate ? Number(s.statusDate.slice(0, 4)) : undefined} date={s.statusDate} place={s.country ?? undefined} ledgerId={s.ledgerId ?? undefined} /> : undefined}
          glance={<GlanceBar glance={{ facts: [["Best months", s.bestMonths ?? "Ask James"], ["Best suited to", suited[0] ?? bestFor[0] ?? "Ask James"], ["Ledger ID", s.ledgerId ?? "Being filed"]], cta: priced ? { label: "Check live rates", href: "#rates" } : { label: `Plan this ${noun}`, href: `/plan?trip=${encodeURIComponent(s.name)}` } }} />} />}
        <RecordNav items={navShown} cta={priced || stayPage ? (stayPage && !stayPage.commerce.liveEngineProperty ? "Choose your stay" : "Check live rates") : `Plan this ${noun}`} ctaHref={priced || stayPage ? "#rates" : planHref} />
        <ComingBanner slug={s.slug} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={trail} /></div>
          {boat && (
            <aside aria-label="A voyage" className="mt-6 border ledger-border p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div><p className="ledger-eyebrow" style={{ color: volumeInk("voyages") }}>Voyage · {boat.name}</p><p className="mt-1 text-[15.5px]">{s.name} is a {boat.kind}, filed in the Voyages volume, not among the stays. Her ship page, cabins, routes, dates and fares, is being built; until then this is her Ledger record.</p></div>
              <Link href="/voyages#finder-h" className="ledger-btn self-start md:self-center">All voyages</Link>
            </aside>
          )}
          <StayActions slug={s.slug} name={s.name} />
          {ef && (
            <section className="py-16 md:py-28 text-center" aria-label="The line">
              {ef.heroLine && <p className="ledger-display text-[1.9rem] md:text-[3.4rem] leading-[1.12] max-w-4xl mx-auto">{ef.heroLine}</p>}
              <div className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-3">{ef.signals.map((x) => <span key={x.key} className="ledger-eyebrow !text-[11px] !tracking-[0.26em]" style={{ color: "var(--ef-sand)" }}>{SIGNAL_LABEL[x.key]}</span>)}</div>
              {(pw ?? efPw) && <div className="mt-6 flex justify-center"><PathwayChips primary={(pw ?? efPw)!.primary} secondary={(pw ?? efPw)!.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}
              {status && <p className="mt-6 ledger-eyebrow">{status}</p>}
            </section>
          )}
          {STAY_FILMS[s.slug] && STAY_FILMS[s.slug].kind === "mp4" && !STAY_FILMS[s.slug].hero && <AmbientFilm film={STAY_FILMS[s.slug] as AmbientFilmT} eyebrow={ef ? `The Exceptional Few\u2122 \u00b7 ${collectionNo(ef.collectionNumber)}` : s.name} line={tagline ?? undefined} />}
          {ef && ef.whyItMadeTheCut.map((t, i) => { const a = efCuts[i]; return a ? (
            <DriftFrame key={i} a={a} ratio={i === 1 ? "16:10" : "3:2"} id={i === 0 ? "why" : undefined} motion={i === 1 ? "pan" : i === 2 ? "slow" : "zoom"} height="min-h-[78svh] md:min-h-[92svh]" className={i === 0 ? "" : "mt-1"}>
              {i === 0 ? <h2 className="ledger-eyebrow !text-white/80">Why it made the cut</h2> : <p className="ledger-eyebrow !text-white/80">{ `${String(i + 1).padStart(2, "0")} / ${String(ef.whyItMadeTheCut.length).padStart(2, "0")}`}</p>}
              <p className="mt-4 ledger-display text-[1.45rem] md:text-[2.4rem] leading-[1.18] max-w-3xl">{t}</p>
            </DriftFrame>
          ) : <p key={i} id={i === 0 ? "why" : undefined} className="mt-8 ledger-display text-[1.3rem] md:text-[1.7rem] leading-[1.3] max-w-3xl">{t}</p>; })}
          {/* with the house entrance, its "Why it's here" is the why: the record's own why section would say it twice */}
          {!ef && tight && video && <WhyFilm title={whyTitle} blocks={[]} suited={[]} name={s.name} video={video} poster={slides[1]?.url ?? slides[0]?.url} planHref={planHref} hideEmptyFilm />}
          {!ef && !tight && <WhyFilm eyebrow={boat ? L.why : undefined} title={whyTitle} blocks={whyBlocks} paragraphs={whyParas} suited={suited} status={<>{status ? <p className="ledger-eyebrow ledger-crimson">{status}</p> : null}{chips && <div className="mt-3"><PathwayChips primary={chips.primary} secondary={chips.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}</>} name={s.name} video={video} poster={slides[1]?.url ?? slides[0]?.url} planHref={planHref} note={verdict ? <MarginNote line={verdict.text[0]} where={verdict.where} when={verdict.when} /> : undefined} />}
          {ef && (
            /* The Exceptional Few editorial row: James' Note · At a glance (pathways sit under the line above) */
            <section aria-label="James' note and at a glance" className="py-16 md:py-24 grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 items-start">
              <div>
                <h2 className="ledger-eyebrow" style={{ color: "var(--ef-sand)" }}>James&rsquo; note</h2>
                {ef.jamesNote ? <><NoteText text={ef.jamesNote.text} href={planHref} className="mt-4 ledger-display italic text-[1.6rem] md:text-[2.2rem] leading-[1.25]" /><div className="mt-4 flex items-end justify-between gap-4"><span className="text-[11.5px] tracking-[0.12em] uppercase ledger-muted">{ef.jamesNote.where} · {ef.jamesNote.when}</span><Signature className="w-20" /></div></> : <p className="mt-3 text-[14px] ledger-muted">Not yet written.</p>}
              </div>
              <div><EFSignals ef={ef} id="glance" /></div>
            </section>
          )}
          {ef && efAerial && s.coords && <div id="place" className=""><PanFrame src={mediaUrl(efAerial, { width: 2560 })} alt={efAerial.alt} name={s.name} coords={s.coords} line={s.airportDirections ?? undefined} credit={efAerial.credit} /></div>}
          <DayBand>
          {tight && <WhyWhoVerdict name={s.name} why={s.why} vetted={status ?? `Vetted by the house${s.ledgerId ? ` · ${s.ledgerId}` : ""}`} whoFor={s.facts.who_its_for ?? null} suited={suited.length ? suited : bestFor} thinkTwice={twice} verdict={verdict ? { line: verdict.text[0], by: `James Wild · ${verdict.where}, ${verdict.when}` } : founderLine(`stay:${s.slug}`) ? { line: founderLine(`stay:${s.slug}`)!.line, by: `James Wild · ${founderLine(`stay:${s.slug}`)!.where}, ${founderLine(`stay:${s.slug}`)!.when}`, short: true } : null} planHref={planHref} />}
          <Overview quote={tight ? undefined : s.quote ?? undefined} answer={answer} facts={tight ? facts.filter(([k]) => !inOpening.has(k)) : facts} paragraphs={overviewParas} />
          {s.regionSlug === "europe" && EUROPE_PLATES[s.slug] && <EuropePlate plate={EUROPE_PLATES[s.slug]} name={s.name} place={s.country} coords={s.coords} />}
          {!(tight && verdict) && founderProof(s.name, s.status as HouseStatus, s.statusDate, s.slug) && <FounderProof proof={founderProof(s.name, s.status as HouseStatus, s.statusDate, s.slug)!} seal={sealFor(stamp)} note={s.founderNote}{...(VETTED_UNVISITED.has(s.slug) ? { eyebrow: "Founder vetted · not yet visited" } : {})} className="mt-10 max-w-3xl" />}
          {/* The house entrance order (James, 10 Nov 2026: "the verdict seems to be way at the bottom ... tighten this up to
              get the user more information about why, where, and how to get there"): why (the verdict, then the facts
              at a glance) straight after the overview; where and how (the map, the way in, the routes it is on) together
              after the rooms. */}
          {tight && verdict && <VerdictCard k={`stay:${s.slug}`} name={s.name} v={verdict} stamp={entryNo(s.ledgerId) ? <InkStamp volume="stays" no={entryNo(s.ledgerId)!} size={170} /> : undefined} />}
          <OfferPanel offers={offersFor(s.slug)} volume={boat ? "voyages" : "stays"} title={`Offers at ${s.name}`} />
          <Band t={tones} tone="mist"><div>
          {apart.length > 0 && <ImageAccordion id="features" eyebrow={L.apart} title={L.apartTitle} intro={(s.features.items.length ? s.features.paras[0] : undefined) ?? (boat ? undefined : "The short list of reasons it made the Ledger, and a few you only notice on the second day.")} icon="frond" items={apart} />}
          {days.length > 0 && <ImageAccordion id="experiences" eyebrow={L.days} title={L.daysTitle} intro={(s.experiences.items.length ? s.experiences.paras[0] : undefined) ?? (boat ? undefined : "Do all of it, some of it, or none of it. Experienced travellers usually pick two and leave the afternoons alone.")} icon="mountain-sun" items={days} />}
          {!apart.length && s.features.paras.length > 0 && <Features id="features" eyebrow={L.apart} title={L.apartTitle} icon="frond" body={s.features.paras[0]} />}
          {!days.length && s.experiences.paras.length > 0 && <Features id="experiences" eyebrow={L.days} title={L.daysTitle} icon="mountain-sun" body={s.experiences.paras[0]} />}
          </div></Band>
          <Band t={tones} tone="paper"><div>
          {stayPage ? <>
            {/* Stay-page contract (JWC Booking Live): units, media and pricing provenance, live rates from the engine per unit where the stay has one. */}
            <StayEditorialIntro editorial={stayPage.editorial} showVerdict={false} />
            {priced && <Inclusions name={s.name} included={priced.included} excluded={priced.excluded} policies={priced.policies} />}
            <AccommodationCollection units={units} commerce={stayPage.commerce} stayName={stayPage.editorial.name} staySlug={s.slug} />
            {process.env.VERCEL_ENV !== "production" && stayPage.qa.length > 0 && <PreviewNote><p>Booking Live QA (preview only): {stayPage.qa.join(" ")}</p></PreviewNote>}
          </> : priced ? <>
            <Inclusions name={s.name} included={priced.included} excluded={priced.excluded} policies={priced.policies} />
            <BookingPanel hostHref={hostEarly ? "#host" : undefined} property={s.engine as string} name={s.name} rooms={priced.rooms} included={priced.included} excluded={priced.excluded} policies={priced.policies} />
          </> : <>
            {ef && efStory ? (
              <section id="gallery" className="mt-16 md:mt-24 grid md:grid-cols-12 gap-5 items-end" aria-label="Two frames">
                {efStory.human && <div className="md:col-span-5"><EFFrame a={efStory.human} ratio="4:5" sizes="(min-width: 768px) 40vw, 100vw" /></div>}
                {(efStory.arrival ?? efStory.night) && <div className="md:col-span-7"><EFFrame a={(efStory.arrival ?? efStory.night)!} ratio="3:2" sizes="(min-width: 768px) 58vw, 100vw" /></div>}
              </section>
            ) : galleryImages.length > 2 && <GalleryMosaic images={galleryImages} title={s.name} />}
            {s.engine && !stayPage && <LiveRatesBand property={s.engine} name={s.name} />}
            {!s.engine && !stayPage && <RateCardSection pageKey={`stay:${s.slug}`} name={s.name} photo={s.hero as string} hostHref={hostEarly ? "#host" : undefined} />}
          </>}
          </div></Band>
          {hostEarly && priced && <LiveHostPanel pageKey={`stay:${s.slug}`} initial={host} stayName={s.name} kind={s.category === "lodge" ? "lodge" : "stay"} />}
          {FULL_FRAME[s.slug] && <FullFrame frames={FULL_FRAME[s.slug]} name={s.name} />}
          {PHOTO_CREDIT[s.slug] && <p className="mt-4 text-[13px] ledger-muted">Photographs courtesy of {PHOTO_CREDIT[s.slug]}.</p>}
          {!priced && !stayPage && roomData && <RoomTypes name={s.name} data={roomData} quote={SCRIPT[`stay:${s.slug}`] ?? null} />}
          {!priced && !stayPage && !roomData && (s.rooms.items.length > 0 || s.rooms.paras.length > 0) && <Features id="rooms" eyebrow={L.rooms} title={L.roomsTitle} icon="tree-ring" items={s.rooms.items.length ? s.rooms.items : undefined} body={s.rooms.paras[0]} />}
          {hostEarly && !priced && <LiveHostPanel pageKey={`stay:${s.slug}`} initial={host} stayName={s.name} kind={s.category === "lodge" ? "lodge" : "stay"} />}
          {ef && !efAerial && efPlace && <div id="place" className="mt-16 md:mt-24"><EFFrame a={efPlace} ratio="21:9" sizes="100vw" /></div>}
          {s.coords && chart && <LocationBlock chart={chart} name={s.name} pin={s.coords} others={(s.countrySlug ? staysIn(s.countrySlug) : []).filter((x) => x.coords && x.slug !== s.slug).map((x) => x.coords as { lat: number; lng: number })} heading={s.country ?? ""} rows={[...(s.airport ? [["Airport", s.airport] as [string, string]] : []), ...(s.bestMonths && !tight ? [["Best months", boat ? undash(s.bestMonths) : s.bestMonths] as [string, string]] : [])]} note={s.airportDirections ?? undefined} mark={tight ? undefined : <Roundel volume={safariVol ? "safaris" : "stays"} text={roundelText(s.name, s.coords, VOLUME_STYLES[safariVol ? "safaris" : "stays"].roman)} entry={entryNo(s.ledgerId) ? `ENTRY ${entryNo(s.ledgerId)}` : undefined} size={120} />} />}
          {/* 3D terrain (allow-listed page, components/maps/terrain/flag.ts): the stay's own pin over the canyon country, below its map. */}
          {s.slug === "ulum-moab" && s.coords && <SeeIn3D page="stays/ulum-moab" kind="points" ink={volumeMark("stays")} title={`${s.name.replace(/\s+/g, " ")}, Utah`} exaggeration={1.4} playLabel="Turn the canyon country"
            points={[{ name: s.name.replace(/\s+/g, " "), lat: s.coords.lat, lng: s.coords.lng }]}
            intro="The stay's own pin with the red rock country round it raised in relief: mesas, buttes and the canyons cut between them. Press Turn the canyon country, or tilt the map yourself." />}
          <GettingThere name={s.name} hubs={hubs} transfers={legs} gateway={gatewayHub && gatewayStay ? { hub: gatewayHub, stay: gatewayStay } : null} />
          {tight && <OnTheseRoutes routes={routeCards} />}
          {!tight && <AdvisorChip where={{ ledgerId: s.ledgerId, countrySlug: s.countrySlug ?? null, regionSlug: s.regionSlug ?? null }} place={s.name} compact className="mt-10" />}
          <InstrumentsStrip atlasHref={s.coords && chart ? "#location" : undefined} className="mt-8" />
          {!tight && Object.keys(s.facts).length > 0 && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="facts-heading">
              <p className="ledger-eyebrow ledger-crimson">Before you go</p>
              <h2 id="facts-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">{s.name} at a Glance</h2>
              <dl className="mt-6 grid md:grid-cols-2 gap-x-10 gap-y-5">{Object.entries(s.facts).filter(([k]) => !(tight && (k === "best_months" || k === "how_to_get_there"))).map(([k, v]) => <div key={k} className="border-t ledger-border pt-3"><dt className="ledger-eyebrow">{k.replace(/_/g, " ")}</dt><dd className="mt-1.5 text-[16px] leading-relaxed">{v}</dd></div>)}</dl>
            </section>
          )}
          {(() => {
            // A reserve with its own page (camps, residences, compare table) gets pointed to from here.
            const rv = RESERVES.find((r) => r.slug === s.slug || r.camps.some((c) => c.stayHref === `/stays/${s.slug}`));
            if (!rv) return null;
            const own = rv.slug === s.slug;
            return (
              <section aria-label="The reserve" className="mt-16 border ledger-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><p className="ledger-eyebrow ledger-crimson">{own ? "The camps" : "On the reserve"}</p><p className="ledger-display text-[1.5rem] mt-1">{own ? `${rv.name} has ${rv.camps.length} ways to stay` : `${s.name} is one of ${rv.camps.length} lodges on ${rv.name}`}</p><p className="mt-1 text-[15px] ledger-muted">{rv.camps.map((c) => c.name).join(", ")}. Compare them side by side, with who each one suits.</p></div>
                <Link href={`/safaris/${rv.slug}`} className="ledger-btn self-start md:self-center">{own ? "See the camps" : `See ${rv.name}`}</Link>
              </section>
            );
          })()}
          <GatewayNight country={s.countrySlug} exclude={s.slug} />
          {!tight && <OnTheseRoutes routes={routeCards} />}
          {collectionForStay(s.slug) && (
            <section aria-label="Part of a collection" className="mt-16 border ledger-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div><p className="ledger-eyebrow ledger-crimson">Part of a collection</p><p className="ledger-display text-[1.5rem] mt-1">{s.name} is one of seven Cayuga Collection hotels</p><p className="mt-1 text-[15px] ledger-muted">Sustainably run boutique hotels across Costa Rica, Panama, Nicaragua and Guatemala, and how to pair them.</p>{offerForStay(s.slug) && <p className="mt-3 text-[15.5px]"><span className="ledger-eyebrow ledger-crimson mr-2">{offerForStay(s.slug)!.program}</span>{offerForStay(s.slug)!.headline}, travel {offerForStay(s.slug)!.travel}.</p>}{s.countrySlug === "costa-rica" && <ExtensionChip className="mt-4" {...EXTENSIONS[CAYUGA_COSTA_RICA_EXTENSION]} />}</div>
              <Link href={offerForStay(s.slug) ? `${collectionForStay(s.slug)!.path}#offers` : collectionForStay(s.slug)!.path} className="ledger-btn self-start md:self-center">{offerForStay(s.slug) ? "See the offer" : "See the collection"}</Link>
            </section>
          )}
          {!boat && sistersFor(s.slug) && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="sisters-heading">
              <p className="ledger-eyebrow" style={{ color: "var(--tone-path, #2E2B28)" }}>Sister lodges · {sistersFor(s.slug)!.group.name}</p>
              <h2 id="sisters-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">{s.name} Has Family</h2>
              <p className="mt-2 text-[15.5px] ledger-muted max-w-2xl">{sistersFor(s.slug)!.group.line}</p>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{sistersFor(s.slug)!.stays.map((x) => <li key={x.slug}><ToneCard name={x.name} id={x.ledgerId ?? ""} line={x.tagline ?? ""} image={{ url: x.hero as string, alt: `${x.name}, ${x.country}` }} href={recordHref("stay", x.slug)} eyebrow={x.country ?? undefined} {...stayTone(x.slug)} /></li>)}</ul>
            </section>
          )}
          <FromTheJournal posts={postsForStay(s.slug)} />
          <SessionsFor sessions={sessionsFor(`/stays/${s.slug}`)} name={s.name} />
          {!tight && <AdvisorStrip place={s.name} ledgerId={s.ledgerId} className="mt-16 md:mt-24" />}
          {ef && <WhoItSuits name={s.name} bestFor={ef.whoItSuits} lessIdealFor={ef.whoItMayNotSuit} />}
          </DayBand>
          {ef?.worthAnotherNight && (efNight ? (
            <DriftFrame a={efNight} ratio="3:2" id="another-night" motion="slow" height="min-h-[82svh] md:min-h-[92svh]">
              <h2 className="ledger-eyebrow !text-white/80">Worth Another Night&trade;</h2>
              {(() => { const [first, ...rest] = ef.worthAnotherNight!.split(/(?<=\.)\s+/); return <><p className="mt-4 ledger-display text-[1.7rem] md:text-[3rem] leading-[1.12] max-w-3xl">{first}</p>{rest.length > 0 && <p className="mt-5 max-w-xl text-[15px] md:text-[17px] text-white/85 leading-relaxed">{rest.join(" ")}</p>}</>; })()}
            </DriftFrame>
          ) : <WorthAnotherNight copy={ef.worthAnotherNight} />)}
          {/* Stage 4b: who plans it — the Ledger's answer for this record (marks here first, then who states they know the country). */}
          <WhoPlans where={{ ledgerId: s.ledgerId, countrySlug: s.countrySlug ?? null, regionSlug: s.regionSlug ?? null }} place={s.name} />
          <FaqBlock faqs={s.faqs.length ? s.faqs : quick} title={`${s.name}, Answered Straight`} schema={s.faqs.length > 0 && s.reviewed} />
          {/* Indonesia cross-sell (B7): yachts get "Stay before you sail", Bali, Sumba and Rote stays "Continue by sea". */}
          {boat ? <StayBeforeYouSail vessel={s.slug} name={s.name} /> : <ContinueBySea stay={s.slug} />}
          {more.length > 0 && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="more-heading">
              <p className="ledger-eyebrow" style={boat ? undefined : { color: "var(--tone-path, #2E2B28)" }}>{boat ? `Also sailing ${boat.name}` : `Also in ${s.country}`}</p>
              <h2 id="more-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">{boat ? "More Ships on These Waters" : <>More Stays We&rsquo;d Send You To</>}</h2>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{more.map((x) => <li key={x.slug}>{boat ? <RecordCard name={vesselOf(x.slug)?.name ?? x.name} id={x.ledgerId ?? ""} line={`${(vesselOf(x.slug)?.kind ?? "small ship").replace(/^\w/, (c) => c.toUpperCase())} sailing ${boat.name}`} image={{ url: x.hero as string, alt: `${x.name}, ${x.country}` }} href={vesselHref(x.slug)} eyebrow={`Voyage · ${boat.name}`} volume="voyages" /> : <ToneCard name={x.name} id={x.ledgerId ?? ""} line={x.tagline ?? ""} image={{ url: x.hero as string, alt: `${x.name}, ${x.country}` }} href={recordHref("stay", x.slug)} eyebrow={x.country ?? undefined} {...stayTone(x.slug)} />}</li>)}</ul>
            </section>
          )}
          {IGGI_ON && (
            /* Iggi Intelligence Core, Stage 2 (flag NEXT_PUBLIC_IGGI=on): Iggi answers from the Ledger with this stay as page context. */
            <IggiPanel ctx={{ entityType: "stay", entitySlug: s.slug, countrySlug: s.countrySlug ?? null, ledgerId: s.ledgerId ?? null, sourcePage: path, volume: boat ? "voyages" : s.volumes?.[0] ?? "stays" }} heading={`Ask Iggi about ${s.name}`} />
          )}
          {verdict && !tight && <VerdictCard k={`stay:${s.slug}`} name={s.name} v={verdict} stamp={entryNo(s.ledgerId) ? <InkStamp volume="stays" no={entryNo(s.ledgerId)!} size={170} /> : undefined} />}
          {pw && <>
            {/* Wild Pathways (Phase 2C, flag on + approved record): Where Your Stay Gives Back and Follow the Pathway. */}
            {pw.impact.length > 0 && <ImpactNote name={s.name} statements={pw.impact} />}
            <FollowThePathway primary={pw.primary} secondary={pw.secondary} related={onPathway(pw.primaryPathway).filter((x) => x.slug !== s.slug).slice(0, 4)} pathwayHref={(p) => pathwayHref(p.key)} />
            <IggiLine line={dialogueLine("iggi.nudge.follow-pathway")} className="mt-8"><Link href={pathwayHref(pw.primary.key)} className="underline underline-offset-2 hover:text-crimson">Walk {pw.primary.name}.</Link></IggiLine>
          </>}
          {ef && <ContinueTheJourney pathways={(pw ?? efPw) ? [(pw ?? efPw)!.primary, ...(pw ?? efPw)!.secondary] : []} hrefFor={(p) => pathwayHref(p.key)} journeys={[...(region && isBuilt(`/destinations/${region.slug}`) ? [{ name: region.name, line: `${s.country ?? region.name} and its neighbours, in the Ledger.`, href: `/destinations/${region.slug}`, eyebrow: "Destinations" }] : [])]} compassHref="/compass" hostHref={host.state !== "off" ? "#host" : null} />}
          <Band t={tones} tone="night"><TalkToUs name={s.name} planHref={planHref} /></Band>
          {host.state !== "off" && !hostEarly && !(tight && !host.host) && <LiveHostPanel pageKey={`stay:${s.slug}`} initial={host} stayName={s.name} kind={s.category === "lodge" ? "lodge" : "stay"} />}
          {!tight && <PlanBand place={s.name} compassHref="/compass" where={{ ledgerId: s.ledgerId }} />}
        </div>
        {hostEarly && <CallingCard who={HOST_KIND[s.category === "lodge" ? "lodge" : "stay"].who} seats={host.host?.seats} />}
      </main>
      <ContactBar name={s.name} planHref={planHref} />
      <ContactPill name={s.name} planHref={planHref} />
      {video && <JsonLd data={{ "@context": "https://schema.org", "@type": "VideoObject", name: FILM_CREDITS[video.id]?.title ?? video.title, description: FILM_CREDITS[video.id] ? `${FILM_CREDITS[video.id].seriesLine}, filmed at ${s.name}. ${FILM_CREDITS[video.id].credit}.` : `${s.name}: the stay film, from the James Wild & Co Ledger.`, thumbnailUrl: [`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`], embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`, contentUrl: `https://www.youtube.com/watch?v=${video.id}`, uploadDate: "2026-10-25", ...filmCreditSchema(video.id) }} />}
      {verdict && <JsonLd data={graph(verdictSchema(verdict, s.name, absoluteUrl(path), ids.founder))} />}
      {ef && <JsonLd data={graph({ "@type": "DefinedTerm", "@id": absoluteUrl(`${path}#exceptional-few`), name: `The Exceptional Few™ ${collectionNo(ef.collectionNumber)}`, description: "A James Wild & Co editorial designation for places that are difficult to replicate because of place, privacy, design, access, humanity or rarity. Not a rating.", inDefinedTermSet: { "@type": "DefinedTermSet", name: "The Exceptional Few by James Wild & Co", url: absoluteUrl("/stays") }, termCode: ef.id, about: { "@id": absoluteUrl(`${path}#stay`) }, publisher: { "@id": ids.house } })} />}
      {boat ? <JsonLd data={graph(touristTrip({ path, name: s.name, description: answer }))} /> : <JsonLd data={graph({ ...lodging({ path, name: s.name, description: answer, image: (slides.length ? slides : images).slice(0, 5).map((i) => { const u = i.url.startsWith("/") ? absoluteUrl(i.url) : i.url; return PHOTO_CREDIT[s.slug] ? imageObject(u, i.alt, PHOTO_CREDIT[s.slug]) : u; }), subtype: s.category === "resort" ? "Resort" : s.category === "hotel" ? "Hotel" : "LodgingBusiness", country: s.country ?? undefined, locality: place?.name, geo: s.coords ?? undefined, ledgerId: s.ledgerId ?? undefined }), ...whoPlansSchema({ ledgerId: s.ledgerId, countrySlug: s.countrySlug ?? null, regionSlug: s.regionSlug ?? null }), ...(offersFor(s.slug).length ? { makesOffer: offersFor(s.slug).map((o) => ({ "@type": "Offer", name: `${o.headline}: ${o.name}`, description: o.conditions ?? o.headline, validFrom: o.travel.from, validThrough: o.travel.to, url: absoluteUrl(`${path}#offers`), offeredBy: { "@type": "TravelAgency", name: "James Wild & Co", url: absoluteUrl("/") } })) } : {}), ...(apart.length ? { amenityFeature: apart.map((a) => ({ "@type": "LocationFeatureSpecification", name: a.title, value: true })) } : {}), ...(suited.length ? { audience: suited.map((t) => ({ "@type": "PeopleAudience", audienceType: t })), keywords: [s.name, s.country, ...suited].filter(Boolean).join(", ") } : {}), ...(hubs.length ? { potentialAction: hubs.map((h) => { const leg = legs.find((t) => t.hub.id === h.id); return { "@type": "TravelAction", name: `Travel from ${hubLabel(h)} to ${s.name}`, fromLocation: hubSchema(h), toLocation: { "@type": "Place", name: s.name, ...(s.coords ? { geo: { "@type": "GeoCoordinates", latitude: s.coords.lat, longitude: s.coords.lng } } : {}) }, ...(leg?.minutes ? { distance: leg.km ? `${leg.km} km` : undefined, description: `${transferLine(leg)}, as stated by the property`, identifier: leg.ledgerId ?? undefined } : { description: "Transfer time not yet recorded by the house" }) }; }) } : {}) })} />}
    </div>
  );
}
