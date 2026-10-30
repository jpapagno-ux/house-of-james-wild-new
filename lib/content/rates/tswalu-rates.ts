// Tswalu Kalahari rate cards, from Tswalu's own public rate cards (direct /
// rack rates, ZAR, per night, fully inclusive):
//   2026: tswalu.com/wp-content/uploads/2025/08/TSW_2026_RATES_240725.pdf
//   2027: tswalu.com/wp-content/uploads/2026/08/TSW_2027_DIRECT_RATES_20260824.pdf
// Read 30 Oct 2026. The 2027 figures were transcribed from the PDF in table
// order and must be checked against the card before quoting [confirm].
// Public rates only. Commission and net terms live in the studio (PartnerTerms),
// never here and never on the site.

export const TSWALU_RATES_CHECKED = "2026-10-30";
export const TSWALU_RATE_SOURCE = "Tswalu Kalahari public rate cards 2026 and 2027 (ZAR, per night, fully inclusive)";

export type Basis = "per-adult" | "single" | "unit";
export type RateRow = {
  id: string;
  camp: "Motse" | "Loapi" | "Tarkuni";
  label: string;
  /** per-adult = per adult, two sharing; single = one adult; unit = the whole room, home or homestead */
  basis: Basis;
  sleeps: string;
  /** adults this row prices (for unit rows) */
  adults?: number;
  /** how many children 0–17 the row already includes (family rows) */
  childrenIncluded?: number;
  /** extra children 0–17 allowed at the extra-child rate */
  extraChildrenMax: number;
  r2026: number;
  r2027: { high: number; peak: number };
};

export const RATE_ROWS: RateRow[] = [
  { id: "motse-legae", camp: "Motse", label: "Legae (suite), two adults sharing", basis: "per-adult", sleeps: "2 adults + up to 2 children", adults: 2, extraChildrenMax: 1, r2026: 46400, r2027: { high: 48800, peak: 53400 } },
  { id: "motse-legae-single", camp: "Motse", label: "Legae (suite), single", basis: "single", sleeps: "1 adult", adults: 1, extraChildrenMax: 1, r2026: 57700, r2027: { high: 60600, peak: 66400 } },
  { id: "motse-family-2a2c", camp: "Motse", label: "Family legae, 2 adults + 2 children", basis: "unit", sleeps: "2 adults + 2 children (0–17)", adults: 2, childrenIncluded: 2, extraChildrenMax: 3, r2026: 107400, r2027: { high: 112800, peak: 123600 } },
  { id: "motse-family-3a", camp: "Motse", label: "Family legae, 3 adults", basis: "unit", sleeps: "3 adults", adults: 3, extraChildrenMax: 3, r2026: 139200, r2027: { high: 131600, peak: 144100 } },
  { id: "loapi-1bed", camp: "Loapi", label: "One-bedroom home, two adults sharing", basis: "per-adult", sleeps: "2 adults + up to 2 children", adults: 2, extraChildrenMax: 1, r2026: 55800, r2027: { high: 58600, peak: 64200 } },
  { id: "loapi-1bed-single", camp: "Loapi", label: "One-bedroom home, single", basis: "single", sleeps: "1 adult", adults: 1, extraChildrenMax: 1, r2026: 69100, r2027: { high: 72600, peak: 79500 } },
  { id: "loapi-2bed-2a2c", camp: "Loapi", label: "Two-bedroom home, 2 adults + 2 children", basis: "unit", sleeps: "2 adults + 2 children (0–17)", adults: 2, childrenIncluded: 2, extraChildrenMax: 3, r2026: 128800, r2027: { high: 135300, peak: 148200 } },
  { id: "loapi-2bed-3a", camp: "Loapi", label: "Two-bedroom home, 3 adults", basis: "unit", sleeps: "3 adults", adults: 3, extraChildrenMax: 3, r2026: 150300, r2027: { high: 157900, peak: 172900 } },
  { id: "loapi-2bed-4a", camp: "Loapi", label: "Two-bedroom home, 4 adults", basis: "unit", sleeps: "4 adults", adults: 4, extraChildrenMax: 3, r2026: 200300, r2027: { high: 210400, peak: 230400 } },
  { id: "tarkuni-1-4", camp: "Tarkuni", label: "Whole homestead, 1–4 guests", basis: "unit", sleeps: "up to 4 guests", extraChildrenMax: 0, r2026: 190200, r2027: { high: 199800, peak: 218800 } },
  { id: "tarkuni-5", camp: "Tarkuni", label: "Whole homestead, 5 guests", basis: "unit", sleeps: "5 guests", extraChildrenMax: 0, r2026: 236000, r2027: { high: 247800, peak: 271400 } },
  { id: "tarkuni-6", camp: "Tarkuni", label: "Whole homestead, 6 guests", basis: "unit", sleeps: "6 guests", extraChildrenMax: 0, r2026: 267600, r2027: { high: 281000, peak: 307800 } },
  { id: "tarkuni-7", camp: "Tarkuni", label: "Whole homestead, 7 guests", basis: "unit", sleeps: "7 guests", extraChildrenMax: 0, r2026: 299200, r2027: { high: 314200, peak: 344100 } },
  { id: "tarkuni-8-10", camp: "Tarkuni", label: "Whole homestead, 8–10 guests", basis: "unit", sleeps: "8–10 guests (5 en-suite bedrooms)", extraChildrenMax: 0, r2026: 339800, r2027: { high: 356800, peak: 390800 } },
];
// 2027 also lists Motse family legae for 4 adults (175,400 high / 192,100 peak); 2026 does not.
export const MOTSE_FAMILY_4A_2027 = { high: 175400, peak: 192100 };

/** Extra child 0–17 (where the row allows one); children 0–11 sharing a legae or one-bedroom home with two adults are complimentary (max 2). */
export const EXTRA_CHILD = { r2026: 10900, r2027: { high: 11500, peak: 12600 } };
export const EXTRAS = {
  malori: { label: "Malori sleep-out (under canvas)", r2026: 13000, r2027: { high: 13700, peak: 15000 } },
  photoSafari: { label: "Photographic safari, per day (minimum 2 days)", r2026: 10400, r2027: { high: 11000, peak: 12000 } },
};
/** Tswalu's own charter flights, Johannesburg or Cape Town, per person [confirm basis]. Non-commissionable. */
export const FLIGHTS = { r2026: { oneWay: 19600, ret: 39200 }, r2027: { oneWay: 29800, ret: 59600 } };

export const INCLUDED = [
  "Private access to the reserve: no other camps or safari vehicles on it",
  "A private 4×4 with your own guide and tracker for every booking",
  "Luxury accommodation",
  "All meals, snacks and drinks, including South African wines",
  "A Boscia dining experience (stays of two nights or more; not for under-12s)",
  "Game drives, walks, rock-engraving sites, tracking, birding and stargazing",
  "A close meerkat encounter",
  "Horse riding for intermediate and advanced riders",
  "Child-minding and the Junior Ranger programme",
  "Wi-Fi and laundry",
];
export const EXCLUDED = [
  "Travel to and from Tswalu (Tswalu's own charter flights are priced separately)",
  "Private photographic tuition",
  "The Malori sleep-out",
  "Spa treatments",
  "Gift shop and gallery purchases",
  "Donations to the Tswalu Foundation",
  "Gratuities",
];
export const MIN_STAY = [
  "Minimum 2 nights (outside the festive season)",
  "Minimum 3 nights in peak festive season (20 Dec 2026 to 6 Jan 2027; peak season in 2027)",
  "Minimum 2 nights per camp when combining Motse and Loapi",
];
export const PAYMENT = [
  "20% non-refundable deposit to confirm, due 14 days after a provisional booking",
  "Balance due 60 days before arrival; bookings inside 60 days are paid in full",
  "Cancellation: 20% at 61 days or more before arrival; 100% at 60 days or less (flights included)",
];

/** 2027 seasons: High 4 Jan–31 May and 1 Sep–17 Dec; Peak 1–3 Jan, 1 Jun–31 Aug, 18–31 Dec. 2026 has one rate all year. */
export function seasonOf(iso: string): "2026" | "high" | "peak" | null {
  const [y, m, d] = iso.split("-").map(Number);
  if (y === 2026) return "2026";
  if (y !== 2027) return null;
  const md = m * 100 + d;
  if (md <= 103 || (md >= 601 && md <= 831) || md >= 1218) return "peak";
  return "high";
}
const pick = (r: { r2026: number; r2027: { high: number; peak: number } }, s: "2026" | "high" | "peak") => (s === "2026" ? r.r2026 : r.r2027[s]);

export type OfferId = "none" | "year-round" | "stay-longer" | "seasonal" | "seven-pay-five";
export const OFFERS: { id: OfferId; name: string; line: string }[] = [
  { id: "year-round", name: "Visit Year-Round", line: "4 nights or more, 50% off the first night" },
  { id: "stay-longer", name: "Stay Longer for Less", line: "5 nights or more, one night complimentary" },
  { id: "seasonal", name: "A Seasonal Escape", line: "4 nights, first night complimentary, March–April and October–November, set travel days" },
  { id: "seven-pay-five", name: "Stay 7, Pay 5", line: "7 nights, two complimentary, 2027 high season (Tarkuni as one 7-night sole-use stay)" },
];

export type Quote = {
  ok: boolean; reason?: string;
  nights: { date: string; season: string; room: number; children: number }[];
  accommodation: number; childrenCost: number; discount: number; extras: number; flights: number; total: number;
  offerApplied: OfferId; minNights: number;
};

export function quote(o: { rowId: string; arrive: string; nights: number; adults: number; children0to11: number; children12to17: number; malori: number; photoDays: number; flightsReturn: number; offer: OfferId }): Quote {
  const row = RATE_ROWS.find((r) => r.id === o.rowId)!;
  const empty: Quote = { ok: false, nights: [], accommodation: 0, childrenCost: 0, discount: 0, extras: 0, flights: 0, total: 0, offerApplied: "none", minNights: 2 };
  if (!o.arrive) return { ...empty, reason: "Pick an arrival date." };
  const nights: Quote["nights"] = [];
  const start = new Date(o.arrive + "T12:00:00Z");
  let peakNights = 0;
  for (let i = 0; i < o.nights; i++) {
    const d = new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10);
    const s = seasonOf(d);
    if (!s) return { ...empty, reason: "Rates are published for 2026 and 2027 only." };
    if (s === "peak") peakNights++;
    nights.push({ date: d, season: s === "2026" ? "2026 rate" : s === "high" ? "2027 high" : "2027 peak", room: 0, children: 0 });
  }
  const festive = nights.some((n) => n.date >= "2026-12-20" && n.date <= "2027-01-06") || peakNights > 0;
  const minNights = festive ? 3 : 2;
  if (o.nights < minNights) return { ...empty, minNights, reason: `Minimum ${minNights} nights for these dates.` };

  // children: 0–11 free (max 2) in legae / one-bedroom homes with two adults; 12–17 at the extra-child rate (max 1).
  // family rows include 2 children; further children 0–17 at the extra-child rate (max 3).
  const kids = o.children0to11 + o.children12to17;
  let paidKids = 0;
  if (row.camp === "Tarkuni") paidKids = 0;
  else if (row.childrenIncluded) paidKids = Math.max(0, kids - row.childrenIncluded);
  else paidKids = o.children12to17;
  if (paidKids > row.extraChildrenMax && row.camp !== "Tarkuni") return { ...empty, minNights, reason: "Too many children for this room; choose a family legae or two-bedroom home." };

  let accommodation = 0, childrenCost = 0, extras = 0;
  const perNight: number[] = [];
  nights.forEach((n, i) => {
    const s = seasonOf(n.date)!;
    const base = pick(row, s);
    const room = row.basis === "per-adult" ? base * 2 : base;
    const child = paidKids * pick(EXTRA_CHILD, s);
    n.room = room; n.children = child;
    accommodation += room; childrenCost += child; perNight[i] = room + child;
  });
  const s0 = seasonOf(nights[0].date)!;
  extras += o.malori * pick(EXTRAS.malori, s0) + o.photoDays * pick(EXTRAS.photoSafari, s0);
  const fl = s0 === "2026" ? FLIGHTS.r2026.ret : FLIGHTS.r2027.ret;
  const flights = o.flightsReturn * fl;

  // offers: one at a time, never combined. Discount applies to accommodation (and children) nights only.
  let discount = 0;
  const month = Number(o.arrive.slice(5, 7));
  if (o.offer === "year-round" && o.nights >= 4) discount = perNight[0] * 0.5;
  if (o.offer === "stay-longer" && o.nights >= 5) discount = perNight[0];
  if (o.offer === "seasonal" && o.nights >= 4 && [3, 4, 10, 11].includes(month)) discount = perNight[0];
  if (o.offer === "seven-pay-five" && o.nights >= 7 && nights.every((n) => n.season === "2027 high")) discount = perNight[0] + perNight[1];
  const offerApplied: OfferId = discount > 0 ? o.offer : "none";

  const total = accommodation + childrenCost - discount + extras + flights;
  return { ok: true, nights, accommodation, childrenCost, discount, extras, flights, total, offerApplied, minNights };
}

// Fixed formatting (same on server and browser): R 48 800
export const zar = (n: number) => `R ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0")}`;
