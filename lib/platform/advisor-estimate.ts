import "server-only";
import { MORE } from "@/lib/content/rate-cards";
import { estimate as cardEstimate, yearFor, nightsOf } from "@/lib/rate-card";
import { FX_DATE, RATE_ROWS as TSWALU_ROWS, ZAR_PER_USD, quote as tswaluQuote, TSWALU_RATE_SOURCE } from "@/lib/content/rates/tswalu-rates";

// Advisor Desk · Step 5: an estimate for a quote request, where the house holds a rate card for the stay.
// Two sources today: MORE's cards (lib/content/rate-cards) and Tswalu's published 2026 and 2027 rates
// (lib/content/rates/tswalu-rates). Everything else: the house prices it. An estimate is never a price:
// the house confirms availability and the exact price before anything is held.

export type EstimateOption = { label: string; usd: number; zar: number; lines: string[] };
export type Estimate = { source: string; currency: "USD"; options: EstimateOption[]; note: string } | null;
export type Party = { adults: number; childAges: number[] };

const round = (n: number) => Math.round(n * 100) / 100;

function moreEstimate(slug: string, arrival: string, departure: string, party: Party): Estimate {
  const page = MORE.pages[`stay:${slug}`];
  if (!page) return null;
  const year = yearFor(MORE, page.property, arrival, departure);
  const nights = nightsOf(arrival, departure);
  if (!year) return { source: "MORE rate card", currency: "USD", options: [], note: "No published MORE card covers these dates yet; the house prices it." };
  const rows = year.rows.filter((r) => !page.rows || page.rows.includes(r.key));
  const options = rows.flatMap((r) => {
    const e = cardEstimate(r, nights, { adults: party.adults, children: party.childAges });
    return e.ok ? [{ label: r.name, usd: round(e.usd), zar: round(e.zar), lines: e.lines }] : [];
  }).sort((a, b) => a.usd - b.usd).slice(0, 6);
  return { source: "MORE rate card", currency: "USD", options, note: options.length ? "From MORE's published rates. Offers and exact availability are confirmed by the house." : "No room on the card fits this party; the house will suggest one." };
}

function tswaluEstimate(arrival: string, departure: string, party: Party): Estimate {
  const nights = nightsOf(arrival, departure);
  const kids = party.childAges.length, adults = party.adults;
  const fits = TSWALU_ROWS.filter((r) =>
    r.camp === "Tarkuni" ? (r.id === "tarkuni-1-4" ? adults + kids <= 4 : r.id === "tarkuni-5" ? adults + kids === 5 : adults + kids === 6)
    : r.basis === "single" ? adults === 1
    : r.basis === "per-adult" ? adults === 2
    : r.childrenIncluded ? adults === (r.adults ?? 0) && kids > 0
    : adults === (r.adults ?? 0));
  const options = fits.flatMap((r) => {
    const q = tswaluQuote({ rowId: r.id, arrive: arrival, nights, adults, children0to11: party.childAges.filter((a) => a <= 11).length, children12to17: party.childAges.filter((a) => a >= 12).length, malori: 0, photoDays: 0, flightsReturn: 0, offer: "none" });
    return q.ok ? [{ label: `${r.camp}: ${r.label}`, usd: round(q.total / ZAR_PER_USD), zar: q.total, lines: [`${nights} nights, ${q.nights.map((n) => n.season).filter((v, i, a) => a.indexOf(v) === i).join(" and ")}`] }] : [];
  }).sort((a, b) => a.usd - b.usd).slice(0, 6);
  return { source: TSWALU_RATE_SOURCE, currency: "USD", options, note: options.length ? `From Tswalu's published rates in rand, shown in US dollars at the exchange rate of ${FX_DATE}. Flights, Malori and offers are added by the house.` : "Tswalu's published rates don't cover these dates or this party; the house prices it." };
}

export function estimateFor(slug: string, arrival: string, departure: string, party: Party): Estimate {
  if (slug === "tswalu-reserve") return tswaluEstimate(arrival, departure, party);
  return moreEstimate(slug, arrival, departure, party);
}
/** Which stays have a house rate card the desk can estimate from. */
export const hasCard = (slug: string) => slug === "tswalu-reserve" || !!MORE.pages[`stay:${slug}`];
/** Tswalu's lowest published "from", per person per night sharing, for the Ledger. */
export const tswaluFrom = () => Math.min(...TSWALU_ROWS.filter((r) => r.basis === "per-adult").map((r) => r.r2026)) / ZAR_PER_USD;
