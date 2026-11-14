// Aman at Sea: builds Amangati's record (lib/content/ships/caribbean/amangati.json) from scripts/data/ams/raw.json
// (ams-fetch.mjs): every voyage day by day, with positions, and every suite's published fare for the voyage (per suite,
// USD, as published). The editorial below comes from amanatsea.com only, read 14 Nov 2026. Amangati is under
// construction, so every image is the brand's rendering and is labelled so. Also writes scripts/data/ams/photos.json
// for the Cloudinary upload. Run from the repo root: node scripts/partners/ams-build.mjs && python3 scripts/build-ship-maps.py .
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "lib/content/ships/caribbean/amangati.json";
const raw = JSON.parse(readFileSync("scripts/data/ams/raw.json", "utf8"));
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/voyages/ships/amangati";
const CREDIT = "Rendering courtesy of Aman at Sea";
const img = (id, alt) => ({ url: `${CLD}/${id}`, alt, credit: CREDIT });

// ports the brand's port cards leave without a position (approximate, the harbour itself)
const PIN = { ITEBA: [42.815, 10.33], ITPCE: [41.137, 9.536], FRBON: [41.387, 9.159], FRAJA: [41.919, 8.738], FRVFM: [43.704, 7.311], ITAMA: [40.634, 14.602], ITSAL: [40.676, 14.75], ITTAO: [37.835, 15.276], ITCRV: [39.083, 17.13], HRDBV: [42.66, 18.085], HRZAD: [44.116, 15.225], ALSAR: [39.875, 20.005], GRLAV: [37.713, 24.056], GRRHO: [36.451, 28.227], GRNIS: [36.613, 27.17], GRANI: [35.19, 25.717], GRJSI: [39.162, 23.49], DOSAM: [19.205, -69.336], DOPCN: [18.452, -68.37], DOLRM: [18.42, -68.96], MQSPI: [14.743, -61.177], VCBQU: [13.007, -61.24], GPGBJ: [15.883, -61.315] };
const ORDER = ["Deluxe Suite", "Premier Suite", "Premier Fore Suite", "Signature Suite", "Grand Suite", "Aman Suite"];

const clean = (s) => String(s ?? "").replace(/[​﻿]/g, "").replace(/\s*[–—]\s*/g, ", ").replace(/\s+-\s+/g, ", ").replace(/\s+/g, " ").trim();
const place = (s) => clean(s).replace(/^Mlaga/, "Málaga").replace(/^Sarande$/, "Sarandë").replace(/^Samana$/, "Samaná").replace(/^Lavrion$/, "Lavrio");
const town = (s) => place(s).split(",")[0].replace(/\s*\(.*\)$/, "");
const hhmm = (t) => (t && !t.startsWith("1970-01-01T00:00") ? t.slice(11, 16) : null);

const days = (v) => {
  const out = v.days.sort((a, b) => a.seq - b.seq).map((d) => {
    const g = raw.gazetteer[d.code], p = g ? [g.lat, g.lng] : PIN[d.code] ?? null;
    const a = hhmm(d.arrive), dep = hhmm(d.depart);
    const time = d.atSea ? null : a && dep ? `${a} to ${dep}` : dep ? `Sails ${dep}` : a ? `Arrives ${a}` : null;
    return {
      day: d.day, title: d.atSea ? "At sea" : town(d.port), place: d.atSea ? "At sea" : place(g?.title ?? d.port),
      lat: d.atSea ? null : p?.[0] ?? null, lng: d.atSea ? null : p?.[1] ?? null,
      summary: d.atSea ? "A day at sea aboard Amangati." : clean(g?.blurb ?? ""),
      ...(time || d.tender ? { label: [time, d.tender ? "by tender" : null].filter(Boolean).join(", ") } : {}),
    };
  });
  out.forEach((d, i) => {
    if (d.lat != null) return;
    const a = out.slice(0, i).reverse().find((x) => x.lat != null), b = out.slice(i + 1).find((x) => x.lat != null);
    if (a && b) { d.lat = +((a.lat + b.lat) / 2).toFixed(3); d.lng = +((a.lng + b.lng) / 2).toFixed(3); } else if (a || b) { d.lat = (a ?? b).lat; d.lng = (a ?? b).lng; }
  });
  return out;
};

const voyages = raw.voyages.filter((v) => v.days.length && v.departure).sort((a, b) => a.departure.localeCompare(b.departure));
const itineraries = [], departures = [];
const used = new Map();
for (const v of voyages) {
  const from = town(v.from), to = town(v.to);
  let direction = from === to ? `${from} round trip` : `${from} to ${to}`;
  const k = `${direction}|${v.nights}`;
  const n = (used.get(k) ?? 0) + 1; used.set(k, n);
  if (n > 1) direction = `${direction} (${v.departure.slice(0, 7).replace("-", " ")})`.replace(/\((\d{4}) (\d{2})\)/, (m, y, mo) => `(${new Date(`${y}-${mo}-01T12:00:00Z`).toLocaleString("en-GB", { month: "long" })} ${y})`);
  const name = `${from === to ? `${from} round trip` : place(v.name ?? `${from} to ${to}`)}, ${v.nights} nights${n > 1 ? `, ${direction.match(/\(([^)]+)\)$/)?.[1]}` : ""}`;
  itineraries.push({ name, nights: v.nights, direction, days: days(v) });
  const prices = {};
  for (const s of v.suites) if (s.name && s.usd > 0 && s.usd < 9e6) prices[s.name] = Math.round(s.usd);
  departures.push({
    date: v.departure.slice(0, 10), dateTo: v.arrival?.slice(0, 10) ?? null, season: v.subregion, itinerary: name, direction, nights: v.nights,
    status: "open", prices: Object.fromEntries(ORDER.filter((x) => x in prices).map((x) => [x, prices[x]])), voyage: v.code,
    ...(v.code === voyages[0].code ? { note: "Maiden voyage" } : {}),
  });
}
const low = Math.min(...departures.flatMap((d) => Object.values(d.prices)));
const last = departures.at(-1).date;
const read = new Date(raw.fetched + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const usd = (n) => `US$${n.toLocaleString("en-US")}`;

const rec = {
  slug: "amangati", name: "Amangati", ledgerId: "VSL-2026-000052",
  brandLine: "Aman at Sea's first yacht: 47 suites, sailing from May 2027",
  operator: "Aman at Sea", type: "yacht",
  waters: "The Mediterranean from May 2027, then the Atlantic and the Caribbean",
  country: "The Mediterranean and the Caribbean", status: "launching", launch: "2027-05-07",
  seo: {
    title: "Amangati: Aman at Sea's First Yacht, Suites, Voyages and Fares | James Wild & Co",
    description: `Amangati, Aman's first yacht, sails from Palma on 7 May 2027 with 47 suites on nine decks. Every published voyage to ${new Date(last + "T12:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}, day by day, and every suite's fare from ${usd(low)} per suite.`,
    keywords: ["Amangati", "Aman at Sea", "Aman yacht", "Amangati suites", "Amangati voyages", "Amangati price", "luxury yacht cruise Mediterranean", "luxury yacht cruise Caribbean"],
  },
  tagline: "Forty-seven suites, an Aman Spa at sea, and a marina at the waterline.",
  answer: `Amangati is the first yacht from Aman at Sea, the new sea-going arm of Aman. She is being built by T. Mariotti in Genoa to a design by Sinot Yacht Architecture & Design, with 47 suites across nine decks, each with a private terrace. Her maiden voyage leaves Palma de Mallorca on 7 May 2027 for Nice; she spends the summer of 2027 in the Mediterranean, crosses the Atlantic in November and winters in the Caribbean. Aman at Sea publishes ${departures.length} voyages of 5 to 13 nights, with fares per suite for the whole voyage from ${usd(low)}.`,
  facts: [["Suites", "47, in six types, each with a private terrace"], ["Decks", "9"], ["Design", "Sinot Yacht Architecture & Design"], ["Builder", "T. Mariotti, Genoa (under construction)"], ["Maiden voyage", "7 May 2027, Palma de Mallorca to Nice"], ["Dining", "Four restaurants among eight dining and bar venues"], ["Spa", "Aman Spa: eight ocean-facing treatment suites, hammam and banya"], ["Pool", "Heated 16-metre infinity pool"], ["Voyages", `${departures.length} published, 5 to 13 nights, May 2027 to March 2028`]],
  glance: { guests: "47 suites", nights: "5 to 13 nights", route: "Mediterranean, Atlantic, Caribbean" },
  overview: [
    "Amangati is Aman's first yacht and the start of Aman at Sea. She is under construction at T. Mariotti in Genoa, designed by Sinot Yacht Architecture & Design, and carries the calm of an Aman resort to sea: 47 suites across nine decks, every one with a private terrace and ceilings up to 2.5 metres.",
    "The suites draw on the Japanese ryokan: timber tones, full-height windows and a Suite Host on call. They run from the 60 square metre Deluxe Suites to the 354 square metre Aman Suite at the stern, reached by its own lift, with a massage room, a sauna and a terrace whirlpool. Many suites connect to make two and three bedrooms.",
    "Aboard are four restaurants, among them Akari for washoku and an omakase, Hiori for teppanyaki, the Aman Grill and Alira for all-day Mediterranean cooking, plus The Jazz Club after Aman New York's, a cigar lounge and a cinema. The Aman Spa takes most of a deck, with eight treatment suites on the sea, a hammam, a banya and a two-storey Japanese garden. A heated 16-metre infinity pool sits high above the water, and at the stern the marina opens on two floating platforms.",
    `She sails the Mediterranean from May 2027, from Spain and the French and Italian Rivieras to the Adriatic, the Greek islands and Turkey, crosses the Atlantic from Málaga in November, and winters in the Leeward, Windward and ABC islands and the Dominican Republic. Fares are per suite, for the whole voyage, in US dollars.`,
  ],
  why: ["Aman's first yacht, from the people behind Amanpuri, Amangiri and Aman New York.", "47 suites, every one with a terrace, and many that connect into two and three bedrooms.", "The largest spa Aman at Sea describes in luxury yachting: eight treatment suites on the sea, hammam and banya.", "Four restaurants, from washoku at Akari to fire cooking at the Aman Grill.", "A marina on two floating platforms, with a sport tender for waterskiing.", "All onboard gratuities, non-alcoholic drinks and beer included."],
  hero: img("hero", "Rendering of Amangati, a white motor yacht with stepped decks, under way on open sea"),
  gallery: [
    img("aerial", "Rendering of Amangati from above, her pool and sun decks stepped down to the stern"),
    img("marina", "Rendering of the marina at Amangati's stern, two floating platforms on the water"),
    img("spa", "Rendering of a treatment suite in the Aman Spa, open to a private terrace and the sea"),
    img("pool", "Rendering of the heated 16-metre infinity pool high on Amangati"),
    img("alira", "Rendering of Alira, Amangati's open-air Mediterranean restaurant"),
    img("aman-grill", "Rendering of the Aman Grill, an arc of tables around the open fire"),
    img("hiori", "Rendering of Hiori, the teppanyaki counter aboard Amangati"),
    img("selora", "Rendering of the Selora lounge beside the marina"),
    img("cigar-lounge", "Rendering of the cigar lounge in warm timber and leather"),
    img("fitness", "Rendering of the fitness studio terrace above the sea"),
  ],
  cabins: [
    { type: "Deluxe Suite", count: null, size: "60.7 to 65.3 sq m (653 to 703 sq ft)", beds: "King bed", deck: "Decks 5, 6 and 7", features: ["Open-plan living", "Private teak terrace", "Bathroom with soaking tub and double vanity", "Connects to adjacent suites for two or three bedrooms"], image: img("suite-deluxe", "Rendering of a Deluxe Suite bedroom, timber tones and a full-height window to the sea") },
    { type: "Premier Suite", count: null, size: "60.1 to 73.9 sq m (647 to 795 sq ft)", beds: "King bed", deck: "Decks 5, 6 and 7", features: ["Private teak terrace", "Window-side daybed and soaking tub", "Connects to adjacent suites for two or three bedrooms"], image: img("suite-premier", "Rendering of a Premier Suite bedroom with a daybed by the window") },
    { type: "Premier Fore Suite", count: 2, size: "66.3 sq m (713 sq ft)", beds: "King bed", deck: "Deck 5, forward", features: ["Facing forward, port and starboard", "Private terrace and window-side daybed", "Soaking tub", "Part of two- or three-bedroom combinations"], image: img("suite-premier-fore", "Rendering of a Premier Fore Suite facing forward over the bow") },
    { type: "Signature Suite", count: null, size: "80.6 to 85.2 sq m (868 to 917 sq ft)", beds: "King bed and window-side daybed", deck: "Decks 5, 6 and 7, midship", features: ["Floor-to-ceiling sliding glass doors to the terrace", "Workstation and beverage bar"], image: img("suite-signature", "Rendering of a Signature Suite, sliding glass doors open to the terrace") },
    { type: "Grand Suite", count: null, size: "102 sq m (1,098 sq ft)", beds: "King bed", deck: "Deck 6, forward", features: ["Foyer, living room and separate bedroom", "Bow-facing terrace", "Marble from outside Rome"], image: img("suite-grand", "Rendering of a Grand Suite bedroom looking forward to the sea") },
    { type: "Aman Suite", count: 1, size: "354 sq m (3,810 sq ft)", beds: "King bed; combines with a Premier Suite for two bedrooms", deck: "Deck 5, aft", features: ["Private lift", "Living and dining for eight, personal bar", "Teak terrace with whirlpool bath and alfresco dining for six", "Sauna and in-suite massage room"], image: img("suite-aman", "Rendering of the Aman Suite terrace with its sunken whirlpool and the open sea") },
  ],
  deckPlans: [],
  itineraries, departures,
  routesNote: `Every published voyage day by day, as Aman at Sea publishes it, read on ${read}. Courses and positions are approximate.`,
  datesPublished: true,
  fareUnit: "suite",
  fareBasis: "per suite for the voyage, in USD, as published",
  pricesNote: `Aman at Sea prices each voyage per suite, for the whole voyage, in US dollars (it also publishes euro and sterling fares). Each voyage shows every suite type's published fare, read on ${read}. Availability is not yet published; James confirms your suite and fare.`,
  inclusions: ["Suite accommodation with an on-demand Suite Host", "Unpacking and packing, daily laundry and pressing, twice-daily housekeeping", "Personalised beverage replenishment in your suite", "All-day dining at Alira, in-suite breakfast, light bites and the gelateria", "Non-alcoholic drinks and beer", "Fitness studio, marina platforms and water toys, pools", "Onboard entertainment and enrichment, cinema and Youth Lounge", "Starlink Wi-Fi", "All onboard gratuities"],
  exclusions: ["Dining at Akari, Hiori and the Aman Grill where charged", "Wine and spirits beyond your suite's selection", "Aman Spa treatments", "Shore experiences", "Flights and transfers (Aman at Sea does not arrange air travel)", "Select premium experiences and bespoke arrangements"],
  children: "Children are welcome. The Youth Lounge is for ages six to 15, with virtual reality surf simulators and games consoles, and many suites connect into two- and three-bedroom family suites. Aman at Sea publishes no minimum age on its site; James confirms it for your voyage.",
  faqs: [
    ["When does Amangati first sail?", "Her maiden voyage leaves Palma de Mallorca on 7 May 2027 and arrives in Nice on 13 May. She spends the summer of 2027 in the Mediterranean, crosses the Atlantic from Málaga in November, and winters in the Caribbean."],
    ["How many suites does Amangati have?", "47, in six types from the Deluxe Suite (about 61 square metres) to the 354 square metre Aman Suite, every one with a private terrace."],
    ["Who built and designed Amangati?", "She is under construction at T. Mariotti in Genoa, Italy, designed by Sinot Yacht Architecture & Design."],
    ["How much does an Amangati voyage cost?", `Aman at Sea publishes a fare for each suite type on each voyage, per suite for the whole voyage, in US dollars. The lowest published today is ${usd(low)}. Every voyage's fares are under Dates and rates on this page.`],
    ["What is included in the fare?", "Your suite and Suite Host, laundry and pressing, all-day dining at Alira, in-suite breakfast, non-alcoholic drinks and beer, the fitness studio, pools, marina and water toys, Starlink Wi-Fi and all onboard gratuities."],
    ["Where does Amangati sail?", "Mediterranean Spain, the French and Italian Rivieras, Sicily and Malta, the Adriatic, the Greek islands and Turkey in 2027, then an Atlantic passage and the Leeward, Windward and ABC islands and the Dominican Republic in winter 2027 to 2028."],
    ["What are the restaurants on Amangati?", "Four restaurants: Akari (washoku and omakase), Hiori (teppanyaki), the Aman Grill and Alira (all-day Mediterranean), with a private dining room for ten, in-suite dining, The Jazz Club and a cigar lounge."],
    ["Is there a spa on Amangati?", "The Aman Spa has eight ocean-facing treatment suites with terraces and whirlpools, a hammam, a banya, a medi-spa, a beauty lounge, a yoga deck with two sea pools, and a two-storey Japanese garden."],
    ["Can families sail on Amangati?", "Yes. There is a Youth Lounge for ages six to 15, and many suites connect into two- and three-bedroom suites."],
    ["What are the booking terms?", "A 25% deposit at booking, with the balance due 150 days before departure. Cancellation charges rise from 15% of the fare more than 150 days out to 100% inside 60 days."],
    ["Can Amangati be chartered?", "Yes. Aman at Sea offers the whole yacht for private charters and events, with custom itineraries."],
  ],
  suits: [
    { who: "Aman regulars", line: "The resorts you know, now with a wake behind them." },
    { who: "Couples", line: "A terrace suite, the spa, and dinner at Akari." },
    { who: "Families", line: "Connecting suites and a Youth Lounge for six to 15." },
    { who: "Wellness travellers", line: "Eight treatment suites on the sea, hammam, banya and yoga deck." },
    { who: "Groups and celebrations", line: "The whole yacht by charter, or the Aman Suite with a Premier Suite." },
  ],
  sources: ["https://www.amanatsea.com/amangati", "https://www.amanatsea.com/amangati/accommodation", "https://www.amanatsea.com/amangati/dining", "https://www.amanatsea.com/amangati/wellness", "https://www.amanatsea.com/amangati/marina", "https://www.amanatsea.com/destinations", "https://www.amanatsea.com/faqs", "https://www.amanatsea.com/press-room", "https://www.amanatsea.com/voyages"],
  film: null,
  terms: ["Deposit: 25% of the voyage fare at booking.", "Final payment: 150 days before departure.", "Cancellation: 15% of the voyage fare up to 151 days before departure, 25% from 150 to 121 days, 50% from 120 to 91 days, 75% from 90 to 61 days, and 100% from 60 days. Aman at Sea's full terms apply."],
};
writeFileSync(PATH, JSON.stringify(rec, null, 2) + "\n");

// photographs for Cloudinary (jwco/voyages/ships/amangati/<id>), from the brand's own pages
const all = [...new Set(Object.values(raw.pages).flatMap((p) => p?.images ?? []).concat(raw.voyages.flatMap((v) => v.suites.flatMap((s) => s.images.map((i) => i.url)))))];
const find = (needle) => all.find((u) => u.includes(needle)) ?? null;
const PHOTOS = { hero: "Amangati_Exterior_02_2880x1780px", aerial: "Amangati_Bird_View_02-1890x1167px", marina: "Amangati_Marina_01-2880x1780px", spa: "Amangati_Spa_03_2880x1780px", pool: "Amangati_Pool_06-1394x1394px", alira: "Amangati_Alira_03_1890x1167px", "aman-grill": "Amangati_Aman_Grill_03_1890x1167px", hiori: "Amangati_Asian_Restaurant_-_Enju_and_Hiori_02-1394x1394px", selora: "Amangati_Selora_Lounge_and_Marina_02-1394x1394px", "cigar-lounge": "Amangati_Cigar_Lounge_03-1394x1394px", fitness: "Amangati_Fitness_Studio_Exterior_01_1890x1167px", "suite-deluxe": "Amangati_Deluxe_Suite_03-1400x1245px", "suite-premier": "Amangati_Premier_Suite_01-1400x1245px", "suite-premier-fore": "Voyage-Details-Page-PremierFore-1400x1245px", "suite-signature": "Amangati_Signature_Suite_03-1400x1245px", "suite-grand": "Amangati_Grand_Suite_07-1400x1245px", "suite-aman": "Amangati_Aman_Suite_Stateroom_02-1400x1245px" };
const photos = Object.entries(PHOTOS).map(([id, n]) => ({ id: `jwco/voyages/ships/amangati/${id}`, src: find(n) }));
const missing = photos.filter((p) => !p.src).map((p) => p.id);
if (missing.length) console.warn("no photograph found for", missing.join(", "));
writeFileSync("scripts/data/ams/photos.json", JSON.stringify(photos, null, 1) + "\n");
console.log(itineraries.length, "itineraries,", departures.length, "voyages, from", usd(low), "to", last);
