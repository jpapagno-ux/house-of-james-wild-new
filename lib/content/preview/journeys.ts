// Journeys and voyages by destination, for the "Journeys & voyages" section
// of each destination page. Snapshot of the library's LandItinerary and
// VesselVoyage records (25 Oct 2026); in Phase 3 this comes from the library
// export so every route or voyage appears on its destination page the moment
// it's filed and approved.
//
// Rules (enforced in journeysFor):
//  - only records with content approved or published, and a slug;
//  - stamps follow house_status: founder_traveled → "Field tested" (+ year
//    when dated); house_approved → a "House approved" line, no founder stamp;
//  - voyage prices carry their basis (per person, per voyage).

import { NODES } from "./costa-rica-routes";
import { recordHref } from "@/lib/ledger/urls";

export type Journey = {
  kind: "route" | "voyage";
  ledgerId: string;
  title: string;
  eyebrow: string;
  nights: number | null;
  line: string; // the route or ports, in order
  bestMonths?: string | null;
  href: string;
  image?: string | null;
  status?: "founder_traveled" | "house_approved" | null;
  statusYear?: number | null;
  price?: { amount: number; basis: string } | null;
  stops?: { lat: number; lng: number }[]; // draws the mini route map on the country's chart
  chartKey?: "costa-rica" | "south-africa" | "central-america";
  contentStatus: "approved" | "published" | "needs_review" | "none";
};

const CDN = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";
const MEDIA = "https://media.base44.com/images/public/6a7932161e9318dca1f24474";
const n = (...ids: (keyof typeof NODES)[]) => ids.map((i) => ({ lat: NODES[i].lat, lng: NODES[i].lng }));

const RAW: Record<string, Journey[]> = {
  "costa-rica": [
    // From James's route file (Oct 2026). Not in the library yet, so no founder stamp on the card until house_status is filed.
    { kind: "route", ledgerId: "JW-CR-C01", title: "Two Oceans, One Volcano", eyebrow: "Caribbean to Pacific, one small plane", nights: 11, line: "San José → Tortuguero → Arenal → Monteverde → Nosara → Liberia", bestMonths: "December to April; turtles July to October", href: recordHref("route", "two-oceans-one-volcano", "costa-rica"), status: null, stops: [{ lat: 9.992, lng: -84.212 }, { lat: 10.54, lng: -83.5 }, { lat: 10.472, lng: -84.644 }, { lat: 10.3, lng: -84.824 }, { lat: 9.936, lng: -85.664 }, { lat: 10.592, lng: -85.544 }], chartKey: "costa-rica", contentStatus: "approved" },
    // The Original Costa Route (27 Oct 2026): Cayuga hotels only, awaiting James on the Proofs sheet.
    { kind: "route", ledgerId: "JW-CR-F07", title: "The Original Costa Route · 7 days", eyebrow: "Cayuga hotels, cloud forest to the south Pacific", nights: 6, line: "San José → Monteverde → Dominical → Uvita", bestMonths: "December to April", href: recordHref("route", "the-original-costa-route-7-days", "costa-rica"), status: null, stops: [{ lat: 9.992, lng: -84.212 }, { lat: 10.3, lng: -84.824 }, { lat: 9.25, lng: -83.86 }, { lat: 9.16, lng: -83.74 }], chartKey: "costa-rica", contentStatus: "needs_review" },
    { kind: "route", ledgerId: "JW-CRPA-F10", title: "The Original Costa Route: Over the Border", eyebrow: "Cayuga hotels, Costa Rica to Panama by land", nights: 9, line: "San José → Monteverde → Manuel Antonio → Paso Canoas → Isla Palenque", bestMonths: "December to April", href: recordHref("route", "the-original-costa-route-10-days", "costa-rica"), status: null, stops: [{ lat: 9.992, lng: -84.212 }, { lat: 10.3, lng: -84.824 }, { lat: 9.39, lng: -84.14 }, { lat: 8.53, lng: -82.84 }, { lat: 8.19, lng: -82.18 }], chartKey: "costa-rica", contentStatus: "needs_review" },
    { kind: "route", ledgerId: "JW-CR-F10C", title: "The Original Costa Route: Both Coasts", eyebrow: "Cayuga hotels, Caribbean to Pacific", nights: 9, line: "San José → Playa Chiquita → Monteverde → Manuel Antonio", bestMonths: "February to April, September and October", href: recordHref("route", "the-original-costa-route-coast-to-coast", "costa-rica"), status: null, stops: [{ lat: 9.992, lng: -84.212 }, { lat: 9.63, lng: -82.74 }, { lat: 10.3, lng: -84.824 }, { lat: 9.39, lng: -84.14 }], chartKey: "costa-rica", contentStatus: "needs_review" },
    { kind: "route", ledgerId: "ITN-LAND-2026-418207", title: "The Classic", eyebrow: "Volcano, cloud forest and the Pacific", nights: 8, line: "San José → Arenal → Monteverde → Manuel Antonio", bestMonths: "December to April", href: recordHref("route", "the-classic", "costa-rica"), status: "house_approved", statusYear: 2026, stops: n("sjo", "arenal", "monteverde", "manuel", "sjo"), chartKey: "costa-rica", contentStatus: "approved" },
    { kind: "route", ledgerId: "ITN-LAND-2026-733519", title: "Two Coasts", eyebrow: "Caribbean, river and volcano", nights: 10, line: "San José → South Caribbean → Pacuare River → Arenal → Costa Ballena", bestMonths: "February to April, or September and October", href: recordHref("route", "two-coasts", "costa-rica"), status: "house_approved", statusYear: 2026, stops: n("sjo", "caribbean", "pacuare", "arenal", "ballena", "sjo"), chartKey: "costa-rica", contentStatus: "approved" },
    { kind: "route", ledgerId: "ITN-LAND-2026-562084", title: "Wild Osa", eyebrow: "Volcano to the wildest peninsula", nights: 9, line: "San José → Arenal → Costa Ballena → Osa Peninsula", bestMonths: "December to April", href: recordHref("route", "wild-osa", "costa-rica"), status: "house_approved", statusYear: 2026, stops: n("sjo", "arenal", "ballena", "osa"), chartKey: "costa-rica", contentStatus: "approved" },
  ],
  indonesia: [
    { kind: "voyage", ledgerId: "ITN-VSL-2026-302558", title: "10 Day Raja Ampat North", eyebrow: "Aliikai · Raja Ampat", nights: 9, line: "Sorong → Wayag → Sorong", bestMonths: "October to April", href: recordHref("voyage", "aliikai-10-day-raja-ampat-north", "raja-ampat"), image: `${CDN}/68bf434cfbdffdbeebf4a0a7_Raja%20Hero%20Main.JPG`, status: "founder_traveled", statusYear: 2024, price: { amount: 7650, basis: "per person, 2027, + 11% tax" }, contentStatus: "approved" },
    { kind: "voyage", ledgerId: "ITN-VSL-2026-483990", title: "8 Day Raja Ampat and Misool", eyebrow: "Aliikai · Raja Ampat", nights: 7, line: "Sorong → Misool → Sorong", bestMonths: "October to April", href: recordHref("voyage", "aliikai-8-day-raja-ampat-and-misool", "raja-ampat"), image: `${CDN}/68bf434cfbdffdbeebf4a0a7_Raja%20Hero%20Main.JPG`, price: { amount: 5950, basis: "per person, 2027, + 11% tax" }, contentStatus: "approved" },
    { kind: "voyage", ledgerId: "ITN-VSL-2026-417445", title: "5 Day Komodo Island", eyebrow: "Aliikai · Komodo", nights: 4, line: "Labuan Bajo → Komodo → Labuan Bajo", bestMonths: "May to September", href: recordHref("voyage", "aliikai-5-day-komodo-island", "komodo"), image: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1200,h_1200/e_upscale/e_improve/c_limit,w_2560/q_auto:good/f_jpg/wildco/voyages/vessels/aliikai/komodo/padar-island-aerial", price: { amount: 3400, basis: "per person, 2027, + 11% tax" }, contentStatus: "approved" },
  ],
  botswana: [
    { kind: "route", ledgerId: "ITN-LAND-2026-713648", title: "Grand Kwando Botswana", eyebrow: "The house Botswana circuit", nights: 12, line: "Maun → Lagoon → Lebala → Splash → Tau Pan → Maun", bestMonths: "May to October", href: recordHref("route", "grand-kwando-botswana", "botswana"), image: `${MEDIA}/08c77d237_generated_image.png`, status: "founder_traveled", contentStatus: "published" },
    { kind: "route", ledgerId: "ITN-LAND-2026-380777", title: "Classic Kwando Circuit", eyebrow: "Kwando Botswana", nights: 10, line: "Maun → Lagoon → Lebala → Pom Pom → Maun", bestMonths: "May to October", href: recordHref("route", "classic-kwando-circuit-lagoon-lebala-pom-pom", "botswana"), image: `${MEDIA}/4bd65272d_generated_image.png`, status: "founder_traveled", contentStatus: "published" },
    { kind: "route", ledgerId: "ITN-LAND-2026-284645", title: "Delta to Desert", eyebrow: "Kwando Botswana", nights: 7, line: "Maun → Splash → Tau Pan → Maun", bestMonths: "May to October", href: recordHref("route", "delta-to-desert-splash-and-tau-pan", "botswana"), image: `${MEDIA}/adced51ee_generated_image.png`, status: "founder_traveled", contentStatus: "published" },
    { kind: "route", ledgerId: "ITN-LAND-2026-905458", title: "Kwando Predator Country", eyebrow: "Kwando Botswana", nights: 7, line: "Maun → Lagoon → Lebala → Maun", bestMonths: "May to October", href: recordHref("route", "kwando-predator-country-lagoon-lebala", "botswana"), image: `${MEDIA}/88ecdae4a_generated_image.png`, status: "founder_traveled", contentStatus: "published" },
  ],
};

/** Approved journeys and voyages for a destination: routes first, then voyages, shortest first. */
export function journeysFor(destination: string) {
  return (RAW[destination] ?? [])
    .filter((j) => j.contentStatus === "approved" || j.contentStatus === "published")
    .sort((a, b) => (a.kind === b.kind ? (a.nights ?? 99) - (b.nights ?? 99) : a.kind === "route" ? -1 : 1));
}
