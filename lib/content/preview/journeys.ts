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
  stops?: { lat: number; lng: number }[]; // draws the mini route map when the destination has a chart
  contentStatus: "approved" | "published" | "needs_review" | "none";
};

const CDN = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";
const MEDIA = "https://media.base44.com/images/public/6a7932161e9318dca1f24474";
const n = (...ids: (keyof typeof NODES)[]) => ids.map((i) => ({ lat: NODES[i].lat, lng: NODES[i].lng }));

const RAW: Record<string, Journey[]> = {
  "costa-rica": [
    { kind: "route", ledgerId: "ITN-LAND-2026-418207", title: "The Classic", eyebrow: "Volcano, cloud forest and the Pacific", nights: 8, line: "San José → Arenal → Monteverde → Manuel Antonio", bestMonths: "December to April", href: recordHref("route", "costa-rica-the-classic"), status: "house_approved", statusYear: 2026, stops: n("sjo", "arenal", "monteverde", "manuel", "sjo"), contentStatus: "approved" },
    { kind: "route", ledgerId: "ITN-LAND-2026-733519", title: "Two Coasts", eyebrow: "Caribbean, river and volcano", nights: 10, line: "San José → South Caribbean → Pacuare River → Arenal → Costa Ballena", bestMonths: "February to April, or September and October", href: recordHref("route", "costa-rica-two-coasts"), status: "house_approved", statusYear: 2026, stops: n("sjo", "caribbean", "pacuare", "arenal", "ballena", "sjo"), contentStatus: "approved" },
    { kind: "route", ledgerId: "ITN-LAND-2026-562084", title: "Wild Osa", eyebrow: "Volcano to the wildest peninsula", nights: 9, line: "San José → Arenal → Costa Ballena → Osa Peninsula", bestMonths: "December to April", href: recordHref("route", "costa-rica-wild-osa"), status: "house_approved", statusYear: 2026, stops: n("sjo", "arenal", "ballena", "osa"), contentStatus: "approved" },
  ],
  indonesia: [
    { kind: "voyage", ledgerId: "ITN-VSL-2026-302558", title: "10 Day Raja Ampat North", eyebrow: "Aliikai · Raja Ampat", nights: 9, line: "Sorong → Wayag → Sorong", bestMonths: "October to April", href: recordHref("voyage", "10-day-raja-ampat-north", "aliikai"), image: `${CDN}/68bf434cfbdffdbeebf4a0a7_Raja%20Hero%20Main.JPG`, status: "founder_traveled", statusYear: 2024, price: { amount: 4830, basis: "per person, per voyage" }, contentStatus: "approved" },
    { kind: "voyage", ledgerId: "ITN-VSL-2026-483990", title: "8 Day Raja Ampat and Misool", eyebrow: "Aliikai · Raja Ampat", nights: 7, line: "Sorong → Misool → Sorong", bestMonths: "October to April", href: recordHref("voyage", "8-day-raja-ampat-and-misool", "aliikai"), image: `${CDN}/68bf434cfbdffdbeebf4a0a7_Raja%20Hero%20Main.JPG`, price: { amount: 4430, basis: "per person, per voyage" }, contentStatus: "approved" },
    { kind: "voyage", ledgerId: "ITN-VSL-2026-417445", title: "5 Day Komodo Island", eyebrow: "Aliikai · Komodo", nights: 4, line: "Labuan Bajo → Komodo → Labuan Bajo", bestMonths: "April to October", href: recordHref("voyage", "5-day-komodo-island", "aliikai"), image: `${CDN}/68bf434cfbdffdbeebf4a0a7_Raja%20Hero%20Main.JPG`, price: { amount: 3795, basis: "per person, per voyage" }, contentStatus: "approved" },
  ],
  botswana: [
    { kind: "route", ledgerId: "ITN-LAND-2026-713648", title: "Grand Kwando Botswana", eyebrow: "The house Botswana circuit", nights: 12, line: "Maun → Lagoon → Lebala → Splash → Tau Pan → Maun", bestMonths: "May to October", href: recordHref("route", "grand-kwando-botswana"), image: `${MEDIA}/08c77d237_generated_image.png`, status: "founder_traveled", contentStatus: "published" },
    { kind: "route", ledgerId: "ITN-LAND-2026-380777", title: "Classic Kwando Circuit", eyebrow: "Kwando Botswana", nights: 10, line: "Maun → Lagoon → Lebala → Pom Pom → Maun", bestMonths: "May to October", href: recordHref("route", "classic-kwando-circuit-lagoon-lebala-pom-pom"), image: `${MEDIA}/4bd65272d_generated_image.png`, status: "founder_traveled", contentStatus: "published" },
    { kind: "route", ledgerId: "ITN-LAND-2026-284645", title: "Delta to Desert", eyebrow: "Kwando Botswana", nights: 7, line: "Maun → Splash → Tau Pan → Maun", bestMonths: "May to October", href: recordHref("route", "delta-to-desert-splash-and-tau-pan"), image: `${MEDIA}/adced51ee_generated_image.png`, status: "founder_traveled", contentStatus: "published" },
    { kind: "route", ledgerId: "ITN-LAND-2026-905458", title: "Kwando Predator Country", eyebrow: "Kwando Botswana", nights: 7, line: "Maun → Lagoon → Lebala → Maun", bestMonths: "May to October", href: recordHref("route", "kwando-predator-country-lagoon-lebala"), image: `${MEDIA}/88ecdae4a_generated_image.png`, status: "founder_traveled", contentStatus: "published" },
  ],
};

/** Approved journeys and voyages for a destination: routes first, then voyages, shortest first. */
export function journeysFor(destination: string) {
  return (RAW[destination] ?? [])
    .filter((j) => j.contentStatus === "approved" || j.contentStatus === "published")
    .sort((a, b) => (a.kind === b.kind ? (a.nights ?? 99) - (b.nights ?? 99) : a.kind === "route" ? -1 : 1));
}
