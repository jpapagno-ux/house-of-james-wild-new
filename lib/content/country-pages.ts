// What the new country page (lib/content/country-layout.ts) needs beyond the guide itself, per country. Every line
// here is either cited to an official government or tourism source or already in the repo; a fact that cannot be
// sourced is left out, never written.

export type FactSource = { title: string; url: string };
export type CountryPageExtras = {
  /** Hero quick fact "How long", from repo data, with where it comes from. */
  howLong?: { text: string; source: FactSource };
  /** The source for each key fact in the guide's `facts`, by its label. A fact with no entry here is not shown. */
  factSources: Record<string, FactSource[]>;
  /** "Who should think twice": drafted only from facts already in the country's copy. A draft for James: shown on
   *  previews only (country-layout.ts showDrafts) until he approves it. */
  thinkTwice?: { who: string; line: string; from: string }[];
};

const WI_WEATHER = { title: "Wonderful Indonesia: weather and seasons", url: "https://www.indonesia.travel/id/en/general-information/weather-climate-seasons" };
const WI_VISAS = { title: "Wonderful Indonesia: types of Indonesian visas", url: "https://www.indonesia.travel/us/en/travel-ideas/culture/types-of-indonesian-visas-you-need-to-know" };
const WI_EVOA = { title: "Wonderful Indonesia: the e-VOA", url: "https://www.indonesia.travel/us/en/news-update/electronic-visa-on-arrival-e-voa-launched-to-ease-travelers-entry-process-to-indonesia" };
const LEDGER = { title: "The Ledger: the house's own record", url: "/the-ledger" };
const ALIIKAI = { title: "Aliikai: 2027 rates and departures with James Wild & Co", url: "/voyages/ships/aliikai" };

export const COUNTRY_PAGES: Record<string, CountryPageExtras> = {
  indonesia: {
    // lib/content/guides.ts RAJA_VS_KOMODO, "Aboard Aliikai": 3 to 7 nights in Komodo, 7 to 11 in Raja Ampat.
    howLong: { text: "Komodo 3 to 7 nights · Raja Ampat 7 to 11 nights, by boat", source: ALIIKAI },
    factSources: {
      Where: [LEDGER],
      Seasons: [WI_WEATHER, LEDGER],
      "Fly into": [WI_EVOA],
      Visa: [WI_VISAS, WI_EVOA],
      "How to see it": [LEDGER],
      "Vetted by": [{ title: "James Wild & Co: the founder's record", url: "/about/founder" }],
    },
    thinkTwice: [
      { who: "Travellers short on time", line: "Raja Ampat is a flight to Sorong, about 4 to 5 hours from Jakarta, then a 2-hour fast ferry to Waisai.", from: "guides.ts transfers and FAQ" },
      { who: "Anyone set on Raja Ampat and Komodo in one trip", line: "Their best seasons barely overlap, so most travellers choose one per trip.", from: "guides.ts FAQ" },
      { who: "Komodo from January to March, or in July and August", line: "January to March rains often disrupt boat trips; July and August are the dragons' mating season, when they are harder to spot.", from: "guides.ts FAQ and months" },
      { who: "Newer divers at Komodo's big sites", line: "The currents there are stronger, and the water cooler and clearer.", from: "guides.ts RAJA_VS_KOMODO" },
      { who: "Anyone who would rather not spend days at sea", line: "Eastern Indonesia's best places are islands without roads. The way in is a boat.", from: "guides.ts howTo intro" },
    ],
  },
};

/** The answer cut to 40 to 60 words for "In short": whole sentences only, in order, skipping any that would run past
 *  60 words. Nothing is reworded. */
export function shortAnswer(answer: string, min = 40, max = 60): string {
  const sentences = answer.match(/[^.!?]+[.!?]+(\s|$)/g)?.map((x) => x.trim()) ?? [answer];
  const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
  const out: string[] = [];
  let n = 0;
  for (const s of sentences) {
    const w = words(s);
    if (n + w > max) { if (n >= min) break; continue; }
    out.push(s); n += w;
    if (n >= min && n + 6 > max) break;
  }
  return out.length ? out.join(" ") : sentences[0];
}
