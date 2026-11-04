// COMO Parrot Cay preview data (The Exceptional Few, EF-002). Facts come from COMO's own site
// only (comohotels.com, 2 Nov 2026). Filed in Stay Studio as STY-2026-000575 (coming_soon until
// James approves the copy). What COMO does not publish (room counts, beach length, map pin) is
// left out and flagged in Stay Studio, not filled in.
import type { Room } from "@/components/record/Sections";
import { assetFor, assetsFor, mediaUrl, storyFrames, type MediaRights } from "@/lib/content/media-assets";
import { exceptionalFewFor, type PublicationStatus } from "@/lib/content/exceptional-few";

export const STAY_ID = "STY-2026-000575"; // Ledger ID, filed in Stay Studio 2 Nov 2026
export const NAME = "COMO Parrot Cay";
export const SHORT = "Parrot Cay";
export const CANONICAL = "/stays/como-parrot-cay";
export const PREVIEW_RIGHTS: MediaRights[] = ["approved", "to_verify"];
export const PREVIEW_STATUS: PublicationStatus[] = ["draft", "reviewed", "approved", "published"];

export function parrotCay() {
  const ef = exceptionalFewFor(STAY_ID, PREVIEW_STATUS);
  const allow = PREVIEW_RIGHTS;
  const hero = assetFor(STAY_ID, "hero", allow);
  const arch = assetFor(STAY_ID, "architecture", allow);
  const place = assetFor(STAY_ID, "editorial_landscape", allow);
  const arrival = assetsFor(STAY_ID, "editorial_landscape", allow).find((a) => a.sort === 2) ?? null;
  const story = storyFrames(STAY_ID, allow);
  const experiences = assetsFor(STAY_ID, "experience", allow);
  const roomPhotos = assetsFor(STAY_ID, "room", allow);
  const night = assetFor(STAY_ID, "night", allow); // none on COMO's site yet: the close falls back to a plain panel
  const planHref = `/plan?trip=${encodeURIComponent(NAME)}`;
  const rooms: Room[] = [
    { name: "Beach villas and beach houses", image: roomPhotos[1] ? mediaUrl(roomPhotos[1], { ratio: "16:10", width: 1200 }) : null, plunge: true, note: "Each with its own private pool and direct access to the beach, as COMO describes them." },
    { name: "The Residences", image: roomPhotos[0] ? mediaUrl(roomPhotos[0], { ratio: "16:10", width: 1200 }) : null, plunge: true, note: "Multi-room houses, each with a private pool; The Sanctuary has three bedrooms and an upper-level infinity pool. Book one whole." },
    { name: "Estate homes", image: roomPhotos[2] ? mediaUrl(roomPhotos[2], { ratio: "16:10", width: 1200 }) : null, note: "The island's largest houses, booked entire for a family or a small group." },
  ];
  const days = [
    { title: "The COMO Shambhala Retreat", note: "COMO's holistic retreat, on the island itself." },
    { title: "The beach, and the water", note: "Private pools and direct beach access at every house." },
    { title: "Bicycles", note: "Complimentary for the length of your stay, as COMO states." },
    { title: "Dinner, unhurried", note: "Courtyard and patio dining, and private dining on request." },
  ];
  const faqs = ef ? [
    { q: `Why is ${NAME} in The Exceptional Few?`, a: "A great sense of place, attention to detail, and modern luxury in a natural setting: more than a thousand acres of private island, reached by boat, run on a philosophy close to our own." },
    { q: `Can you take ${SHORT} privately?`, a: "COMO states that guests can book entire Residences or estate homes. For anything larger, ask James; it is arranged directly with COMO and depends on the dates." },
    { q: `How do you get to ${SHORT}?`, a: "Fly into Providenciales (PLS). COMO states the transfer takes about 50 minutes: a 15-minute drive, then a 35-minute boat ride. James arranges it with your booking." },
    { q: `Is ${SHORT} worth another night?`, a: ef.worthAnotherNight ?? "" },
    { q: `Who is ${SHORT} less ideal for?`, a: `${ef.whoItMayNotSuit.join(", ")}. If that's you, the Human Compass will point you somewhere that is.` },
  ] : [];
  return { ef, allow, hero, arch, place, arrival, story, experiences, roomPhotos, night, planHref, rooms, days, faqs };
}
