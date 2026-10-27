// Rate samples for the Cayuga hotels, read from Cayuga's public booking
// engine (search.travelclick.com/CYG) on 27 Oct 2026: 2 adults, 1 room,
// 3-night searches, the lowest room available, USD per night. "list" is the
// rate before the hotel's own promotion; "now" is what the engine showed
// after it (null = sold out). Taxes and service charges are NOT confirmed as
// included [confirm]. These are public rates for pricing the house's routes;
// never publish net or commission figures. Re-check before quoting.

export type RateSample = { list: number | null; now: number | null };
export type RateWindow = { id: string; label: string; from: string; to: string; season: "Green" | "Shoulder" | "High" | "Peak"; rates: Record<string, RateSample> };

const R = (list: number | null, now: number | null = list): RateSample => ({ list, now });
const SO: RateSample = { list: null, now: null };

export const RATES_CHECKED = "2026-10-27";
export const RATE_SOURCE = "Cayuga Collection booking engine, public rate, lowest available room, 2 adults";

// keys are stay slugs
export const CAYUGA_RATES: RateWindow[] = [
  { id: "2026-10-27", label: "Late Oct 2026", from: "2026-10-27", to: "2026-10-30", season: "Green", rates: { "senda-monteverde-lodge": R(390, 312), "arenas-del-mar-resort": R(670, 435.5), "kura-boutique-resort": R(870, 609), "isla-palenque-resort": SO, "aguas-claras": SO } },
  { id: "2026-11-10", label: "Mid Nov 2026", from: "2026-11-10", to: "2026-11-13", season: "Shoulder", rates: { "senda-monteverde-lodge": R(515, 343.33), "aguas-claras": R(770, 616), "kura-boutique-resort": R(1050, 735), "arenas-del-mar-resort": R(1060, 901), "isla-palenque-resort": R(1460, 1095) } },
  { id: "2026-12-27", label: "Holidays 2026", from: "2026-12-27", to: "2026-12-30", season: "Peak", rates: { "kura-boutique-resort": R(2450), "arenas-del-mar-resort": SO, "isla-palenque-resort": SO, "aguas-claras": SO, "senda-monteverde-lodge": SO } },
  { id: "2027-01-12", label: "Mid Jan 2027", from: "2027-01-12", to: "2027-01-15", season: "High", rates: { "aguas-claras": R(480), "kura-boutique-resort": R(1340, 1139), "isla-palenque-resort": R(1500), "arenas-del-mar-resort": SO, "senda-monteverde-lodge": SO } },
  { id: "2027-02-16", label: "Mid Feb 2027", from: "2027-02-16", to: "2027-02-19", season: "High", rates: { "aguas-claras": R(480, 432), "kura-boutique-resort": R(1080, 972), "arenas-del-mar-resort": R(2620), "isla-palenque-resort": SO, "senda-monteverde-lodge": SO } },
  { id: "2027-03-09", label: "Early Mar 2027", from: "2027-03-09", to: "2027-03-12", season: "High", rates: { "aguas-claras": R(480, 432), "senda-monteverde-lodge": R(545), "arenas-del-mar-resort": R(970), "kura-boutique-resort": R(1340, 1206), "isla-palenque-resort": R(1500) } },
  { id: "2027-05-11", label: "Mid May 2027", from: "2027-05-11", to: "2027-05-14", season: "Green", rates: { "senda-monteverde-lodge": R(395, 263.33), "aguas-claras": R(400, 360), "arenas-del-mar-resort": R(680), "kura-boutique-resort": R(895, 805.5), "isla-palenque-resort": R(1155) } },
  { id: "2027-07-13", label: "Mid Jul 2027", from: "2027-07-13", to: "2027-07-16", season: "Green", rates: { "senda-monteverde-lodge": R(400, 266.67), "aguas-claras": R(400, 360), "kura-boutique-resort": R(895, 805.5), "arenas-del-mar-resort": R(855), "isla-palenque-resort": R(1155) } },
  { id: "2027-09-14", label: "Mid Sep 2027", from: "2027-09-14", to: "2027-09-17", season: "Green", rates: { "senda-monteverde-lodge": R(395, 263.33), "aguas-claras": R(480), "arenas-del-mar-resort": R(680), "kura-boutique-resort": R(895, 805.5), "isla-palenque-resort": R(1155) } },
];

/** Hotel cost of a route for one room (2 adults) in a window: nights per stay x the rate shown. null if any stay was sold out. */
export function routeHotelCost(stays: Record<string, number>, w: RateWindow, use: "list" | "now" = "now") {
  let t = 0;
  for (const [slug, nights] of Object.entries(stays)) { const r = w.rates[slug]?.[use]; if (r == null) return null; t += r * nights; }
  return Math.round(t);
}

// Room types and public rack rates per night, 2 adults, from each hotel's own
// booking page for 11–14 May 2027 (read 27 Oct 2026). Before tax: Costa Rica
// adds 13% government sales tax, Isla Palenque (Panama) 10%. "now" = after the
// hotel's own promotion. Breakfast: included at Senda, Arenas del Mar and most
// Aguas Claras rooms; not shown for Kura or Isla Palenque [confirm].
export const CAYUGA_ROOMS_MAY_2027: Record<string, { promo?: string; tax: number; rooms: { name: string; sleeps: number; list: number; now: number }[] }> = {
  "senda-monteverde-lodge": { promo: "Stay 2 nights, the 3rd on us", tax: 0.13, rooms: [
    { name: "Superior Room", sleeps: 2, list: 395, now: 263.33 }, { name: "Junior Suite", sleeps: 3, list: 475, now: 316.67 }, { name: "Premium Suite", sleeps: 3, list: 555, now: 370 } ] },
  "kura-boutique-resort": { promo: "Early Bird 10% off", tax: 0.13, rooms: [
    { name: "Junior", sleeps: 2, list: 895, now: 805.5 }, { name: "Suite", sleeps: 2, list: 1020, now: 918 }, { name: "Deluxe (plunge pool)", sleeps: 2, list: 1190, now: 1071 }, { name: "Master (plunge pool)", sleeps: 2, list: 1370, now: 1233 } ] },
  "arenas-del-mar-resort": { promo: "Stay 5 nights, pay 4 (5-night stays)", tax: 0.13, rooms: [
    { name: "Ocean Breeze Superior", sleeps: 2, list: 680, now: 680 }, { name: "Ocean View Superior", sleeps: 2, list: 705, now: 705 }, { name: "Ocean Breeze Suite", sleeps: 4, list: 895, now: 895 }, { name: "Ocean View Premium Suite", sleeps: 4, list: 1080, now: 1080 }, { name: "Playitas Suite", sleeps: 8, list: 1405, now: 1405 } ] },
  "isla-palenque-resort": { promo: "Stay 5 nights, pay 4 (5-night stays)", tax: 0.1, rooms: [
    { name: "Beachfront Casita", sleeps: 4, list: 1155, now: 1155 }, { name: "Beachfront Villa Estate", sleeps: 14, list: 3190, now: 3190 } ] },
  "aguas-claras": { promo: "Early Bird 10% off", tax: 0.13, rooms: [
    { name: "Pavlova Suite", sleeps: 2, list: 400, now: 360 }, { name: "1-Bedroom Bungalow", sleeps: 2, list: 495, now: 445.5 }, { name: "Bungalow Suite", sleeps: 2, list: 550, now: 495 }, { name: "2-Bedroom Bungalow", sleeps: 4, list: 790, now: 711 }, { name: "Two Bedroom Deluxe Bungalow", sleeps: 4, list: 880, now: 792 } ] },
};
