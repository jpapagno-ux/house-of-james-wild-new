// Amangiri preview data, shared by the three /preview/stay/amangiri* mocks.
// Record facts are hand-set from Aman's own site (aman.com/resorts/amangiri, 1 Nov
// 2026) until the Stay is filed in Stay Studio; the ID is a declared placeholder.
import type { Room } from "@/components/record/Sections";
import { assetFor, assetsFor, mediaUrl, storyFrames, type MediaAsset, type MediaRights } from "@/lib/content/media-assets";
import { exceptionalFewFor, type PublicationStatus } from "@/lib/content/exceptional-few";

export const STAY_ID = "STY-2026-AMANGIRI"; // provisional
export const NAME = "Amangiri";
export const CANONICAL = "/stays/amangiri";
export const COORDS = { lat: 37.0183, lng: -111.6165 };
export const PREVIEW_RIGHTS: MediaRights[] = ["approved", "to_verify"];
export const PREVIEW_STATUS: PublicationStatus[] = ["draft", "reviewed", "approved", "published"];

export const rightsOwner = (a: MediaAsset) => a.credit.replace(/^(photography courtesy of|image ©|©)\s*/i, "").trim();

export function amangiri() {
  const ef = exceptionalFewFor(STAY_ID, PREVIEW_STATUS);
  const allow = PREVIEW_RIGHTS;
  const hero = assetFor(STAY_ID, "hero", allow);
  const arch = assetFor(STAY_ID, "architecture", allow);
  const place = assetFor(STAY_ID, "editorial_landscape", allow);
  const aerial = assetsFor(STAY_ID, "editorial_landscape", allow).find((a) => a.sort === 2) ?? null;
  const story = storyFrames(STAY_ID, allow);
  const experiences = assetsFor(STAY_ID, "experience", allow);
  const roomPhotos = assetsFor(STAY_ID, "room", allow);
  const night = assetFor(STAY_ID, "night", allow);
  const planHref = `/plan?trip=${encodeURIComponent(NAME)}`;
  const answer = `${NAME} is a resort at Canyon Point in southern Utah, on more than 900 acres of the Colorado Plateau, with 34 suites, the ten tented pavilions of Camp Sarika and a six-bedroom villa. Designated in The Exceptional Few by James Wild & Co for its setting, its privacy, its design and its access. Nearest airport: Page Municipal (PGA), about 25 minutes by road. Plan it with James or an advisor.`;
  const facts: [string, string][] = [["Ledger ID", "Being filed"], ["Country", "United States"], ["Setting", "Canyon Point, Utah · Colorado Plateau"], ["Airport", "Page Municipal (PGA) · about 25 min"]];
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
  const faqs = ef ? [
    { q: `Why is ${NAME} in The Exceptional Few?`, a: ef.whyItMadeTheCut[1] ?? ef.whyItMadeTheCut[0] },
    { q: `Who is ${NAME} less ideal for?`, a: `${ef.whoItMayNotSuit.join(", ")}. If that's you, the Human Compass will point you somewhere that is.` },
    { q: `How do you get to ${NAME}?`, a: "Fly into Page Municipal Airport (PGA), about 25 minutes by road, as stated by the property. St George and Flagstaff are about 2.5 hours away; Phoenix and Las Vegas about 4.5 hours, through the parks. James arranges the car with your booking." },
    { q: `Is ${NAME} worth another night?`, a: ef.worthAnotherNight ?? "" },
    { q: `How do I book ${NAME}?`, a: "Send an enquiry, call the house on 1.800.419.7000, or book a thirty-minute call. James or an advisor confirms dates, rates and what's included before anything is booked." },
  ] : [];
  return { ef, allow, hero, arch, place, aerial, story, experiences, roomPhotos, night, planHref, answer, facts, rooms, days, faqs };
}
