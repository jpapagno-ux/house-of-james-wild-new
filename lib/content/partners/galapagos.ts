import type { Partner } from "./types";
import type { ShipImage } from "@/lib/content/ships/types";
import Horizon from "@/lib/content/ships/galapagos/galapagos-horizon-trimaran.json";
import Infinity_ from "@/lib/content/ships/galapagos/infinity-yacht-galapagos.json";
import SeaStar from "@/lib/content/ships/galapagos/new-galapagos-sea-star.json";
import NaturalParadise from "@/lib/content/ships/galapagos/natural-paradise-yacht.json";
import GrandMajestic from "@/lib/content/ships/galapagos/grand-majestic-yacht.json";
import Angel from "@/lib/content/ships/galapagos/galapagos-angel-yacht.json";
import Monserrat from "@/lib/content/ships/galapagos/monserrat-yacht-galapagos.json";
import Sirius from "@/lib/content/ships/galapagos/sirius-yacht-galapagos.json";
import Alya from "@/lib/content/ships/galapagos/alya-catamaran-galapagos.json";
import Stella from "@/lib/content/ships/galapagos/galaxy-stella-yacht.json";
import EcoGalaxy from "@/lib/content/ships/galapagos/ecogalaxy-catamaran.json";
import Origin from "@/lib/content/ships/galapagos/ecoventura-origin-yacht.json";
import Theory from "@/lib/content/ships/galapagos/ecoventura-theory-yacht.json";
import Evolve from "@/lib/content/ships/galapagos/ecoventura-evolve-yacht.json";

// The four Galápagos partners (James, 2 Nov 2026; partner approved, images usable with partner credit).
// Facts from each partner's own site only, as filed in the Galápagos review (section 7) and the ship files;
// claims about themselves are quoted and attributed. Photographs are each partner's own, already filed with
// their ships. No commission, net rates or contact names; no founder marks (James has not yet sailed with
// any of them). Base or founding year is left out wherever the partner does not publish it.

type Img = { hero: { url: string; alt: string }; gallery: { url: string; alt: string }[] };
const hero = (s: Img, credit: string): ShipImage => ({ url: s.hero.url, alt: s.hero.alt, credit });
const g1 = (s: Img, credit: string, i = 0): ShipImage => ({ url: s.gallery[i].url, alt: s.gallery[i].alt, credit });
const RELATED = [{ label: "Every Galápagos ship, by partner and tier", href: "/voyages/galapagos" }];

export const ROYAL_GALAPAGOS: Partner = {
  slug: "royal-galapagos",
  name: "Royal Galapagos",
  kind: "Small-ship operator",
  seo: {
    title: "Royal Galapagos Yachts with James Wild & Co",
    description: "Seven small Galápagos yachts for 16 to 20 guests, from the only trimaran in the islands to First Class motor yachts. Chosen and booked through James Wild & Co.",
    keywords: ["Royal Galapagos", "Royal Galapagos yachts", "Galapagos Horizon trimaran", "Infinity yacht Galapagos", "Galapagos yacht charter", "small ship Galapagos cruise"],
  },
  line: "An Ecuadorian company sailing seven small yachts in the islands, from a trimaran to First Class motor yachts.",
  answer: "Royal Galapagos is an Ecuadorian company operating small expedition yachts in the Galápagos since 2012. Its seven yachts carry 16 to 20 guests, from the trimaran Galapagos Horizon to the First Class Galapagos Angel and Calipso, on 4, 5 and 8 day itineraries, and each can be chartered whole.",
  who: {
    facts: [
      ["Who", "\"A proudly Ecuadorian tour company\" running small expedition yachts, many \"owned by Ecuadorian families\", in its own words"],
      ["Operating since", "2012"],
      ["Fleet", "Seven yachts: five Luxury (Galapagos Horizon, Infinity, New Galapagos Sea Star, Natural Paradise, Galapagos Grand Majestic) and two First Class (Galapagos Angel, Calipso), as it grades them"],
      ["Memberships", "USTOA, LATA, the Adventure Travel Association (as its logo is labelled) and Galapagos Conservation Trust, as shown on its site"],
    ],
  },
  how: {
    paragraphs: [
      "Every yacht sails set itineraries of 4, 5 or 8 days between Baltra and San Cristobal, with a 7-day loop on selected dates on Galapagos Horizon and Galapagos Angel, and 5 and 6-day routes on New Galapagos Sea Star. The longer weeks join end to end for a fortnight in the islands.",
      "Royal Galapagos publishes its rack rates per person by yacht, year and length, and a whole-yacht price for every yacht. Galapagos Grand Majestic is built for private charter. Dated departures sit in its live booking engine, so the house confirms dates for you.",
      "It also sells mainland add-ons: Quito and Guayaquil hotels, a Cotopaxi day trip, and Amazon and Andes combinations.",
    ],
    facts: [
      ["Guests", "16 on most yachts; 20 on Infinity"],
      ["Lengths", "4, 5 and 8 days on most yachts"],
      ["Single supplement", "50%, as published"],
      ["Children", "Under 15 sharing with one full-paying adult: 20% off; no minimum age published"],
      ["Groups", "10% off for groups of 4 to 14 (4 to 18 on Infinity)"],
      ["Not included", "Galápagos flights, the US$200 park fee and the US$20 transit card"],
    ],
  },
  fleet: ["galapagos-horizon-trimaran", "infinity-yacht-galapagos", "new-galapagos-sea-star", "natural-paradise-yacht", "grand-majestic-yacht", "galapagos-angel-yacht", "calipso-yacht-galapagos"],
  fleetNote: "Calipso's diving weeks are not listed here.",
  apart: [
    { claim: "The largest private cruise fleet in the Galápagos Islands", attribution: "home page" },
    { claim: "The first operator with a real-time reservation system, available 24/7", attribution: "home page" },
    { claim: "The only trimaran sailing Galapagos", attribution: "on Galapagos Horizon, Galapagos Horizon page" },
    { claim: "A proudly Ecuadorian tour company", attribution: "home page" },
  ],
  why: [
    "Seven yachts across two tiers, so one partner covers a Luxury trimaran with a balcony on every cabin and a First Class yacht at a lower fare.",
    "It publishes per person rack rates and a whole-yacht price for every yacht, so a charter can be priced before anyone asks.",
    "Infinity and New Galapagos Sea Star have interconnecting cabins, per Royal Galapagos, which suits families.",
    "Its 4, 5 and 8-day sections let a shorter trip still reach the outer islands, and the weeks join for a fortnight.",
  ],
  faqs: [
    ["Who is Royal Galapagos?", "An Ecuadorian company running small Galápagos yachts since 2012, many of them owned by Ecuadorian families, in its own words."],
    ["How many yachts does Royal Galapagos have?", "Seven: five Luxury (Galapagos Horizon, Infinity, New Galapagos Sea Star, Natural Paradise and Galapagos Grand Majestic) and two First Class (Galapagos Angel and Calipso)."],
    ["How many guests do the yachts carry?", "Sixteen on most; Infinity takes 20."],
    ["What is unique about Galapagos Horizon?", "Royal Galapagos calls her the only trimaran sailing the Galápagos, with a private balcony on each of her 8 cabins."],
    ["How long are the cruises?", "4, 5 and 8 day itineraries on most yachts, with a 7-day loop on selected dates on Galapagos Horizon and Galapagos Angel, and 5 and 6-day routes on New Galapagos Sea Star."],
    ["Can I charter a whole yacht?", "Yes. Each yacht is offered for charter, and Royal Galapagos publishes the whole-yacht price for each length on every ship page here."],
    ["Are Royal Galapagos yachts family friendly?", "Infinity was built with families and small groups in mind and has interconnecting cabins; New Galapagos Sea Star has interconnected and triple cabins. Children under 15 sharing with one full-paying adult get 20% off; no minimum age is published."],
    ["Do they offer mainland add-ons?", "Yes: Quito and Guayaquil hotels, a Cotopaxi day trip, and Amazon and Andes combinations."],
  ],
  hero: hero(Horizon, "Royal Galapagos"),
  gallery: [g1(Infinity_, "Royal Galapagos"), g1(SeaStar, "Royal Galapagos"), g1(NaturalParadise, "Royal Galapagos"), g1(GrandMajestic, "Royal Galapagos"), g1(Angel, "Royal Galapagos"), g1(Horizon, "Royal Galapagos", 1)],
  credit: "Royal Galapagos",
  related: RELATED,
  organization: { foundingDate: "2012", country: "EC", memberOf: ["USTOA", "LATA", "Galapagos Conservation Trust"] },
  sources: ["https://www.royalgalapagos.com/", "https://www.royalgalapagos.com/cruise-charters/", "https://www.royalgalapagos.com/product/horizon/"],
  checked: "2026-11-02",
};

export const VIANATURA: Partner = {
  slug: "vianatura",
  name: "Vianatura",
  kind: "Small-ship operator",
  seo: {
    title: "Vianatura's Hermes and Monserrat with James Wild & Co",
    description: "Vianatura owns the Hermes, a 20-guest Galápagos catamaran with butlers and private jacuzzis, and the 16-guest Monserrat. Plan either with James Wild & Co.",
    keywords: ["Vianatura", "Via Natura Galapagos", "Monserrat yacht", "Hermes catamaran Galapagos", "First Class Galapagos yacht"],
  },
  line: "An Ecuador and Peru travel company that owns its Galápagos ships, with an office in Puerto Ayora.",
  answer: "Vianatura is an Ecuador and Peru travel company with offices in Quito, Guayaquil, Cusco and Puerto Ayora. It owns two Galápagos ships: Hermes, a 50-metre catamaran launched in 2025 for 20 guests in 12 suites with butler service, and Monserrat, a 16-guest First Class motor yacht refurbished in 2025.",
  who: {
    facts: [
      ["Who", "Owner and representative of the Hermes and Monserrat, with land programs in Ecuador, Peru and Bolivia"],
      ["Offices", "Guayaquil, Quito, Cusco and Puerto Ayora"],
      ["Ships", "M/C Hermes (motor catamaran, 2025, 50 m, 20 guests, 12 suites) and M/Y Monserrat (motor yacht, First Class, 28 m, 16 guests, 10 cabins, refurbished 2025)"],
    ],
  },
  how: {
    paragraphs: [
      "Monserrat sails four core routes of 3 or 4 nights that stack into cruises of up to 14 nights, with two naturalist guides for 16 guests. Vianatura publishes her rates by year and length, cabin by cabin, and a whole-yacht charter price.",
      "Vianatura says its operational flights to the islands are booked through it. Dated departures sit in its live booking engine, so the house confirms dates for you.",
      "On the mainland it runs programs including a 9-day Avenue of Volcanoes and Amazon and Andes journeys.",
    ],
    facts: [
      ["Monserrat lengths", "3 to 14 nights"],
      ["Children", "All ages on Monserrat; under 12 with two adults 15% off"],
      ["Flights", "Quito to the Galápagos round trip US$600 economy or US$685 premium economy, booked through Vianatura, as it publishes"],
      ["Not included", "The US$200 park fee and the US$20 transit card"],
    ],
  },
  // Hermes is filed by the Exceptional Few build; her card appears here once her registry row exists.
  fleet: ["monserrat-yacht-galapagos", "hermes-galapagos"],
  apart: [
    { claim: "The World's Largest Luxury Catamaran", attribution: "on Hermes, Hermes page" },
    { claim: "Nearly 1-to-1 crew-to-guest ratio", attribution: "on Hermes, Hermes page" },
  ],
  why: [
    "Vianatura owns the ships it sells, with its own office in Puerto Ayora.",
    "Monserrat's routes stack from 3 to 14 nights, so the length of the trip can follow the traveller.",
    "Two naturalist guides for 16 guests on Monserrat, and children of all ages, per Vianatura.",
    "Its mainland programs in the Andes and the Amazon let one partner plan the whole of Ecuador.",
  ],
  faqs: [
    ["Who is Vianatura?", "A travel company that owns the Hermes and Monserrat in the Galápagos, with programs across Ecuador, Peru and Bolivia."],
    ["Where is Vianatura based?", "It has offices in Guayaquil, Quito, Cusco and Puerto Ayora."],
    ["What is Hermes?", "A 50-metre motor catamaran built in 2025 for 20 guests, which Vianatura calls the world's largest luxury catamaran."],
    ["What are Hermes's suites like?", "Twelve suites, each with a private balcony and jacuzzi; the Owner Suite is 72 m², per Vianatura."],
    ["How many crew sail on Hermes?", "Twenty, including two butlers and a cruise director, with two naturalist guides."],
    ["What is Monserrat?", "A 16-guest First Class motor yacht with 10 cabins, built in 2005 and refurbished in 2025, with two naturalist guides."],
    ["How long are the cruises?", "Hermes sails 3, 4 or 7 nights; Monserrat 3 to 14 nights."],
    ["Do they offer mainland trips?", "Yes, including a 9-day Avenue of Volcanoes and Amazon and Andes programs."],
  ],
  hero: hero(Monserrat, "Vianatura"),
  gallery: [1, 2, 3, 4, 5, 6].map((i) => g1(Monserrat, "Vianatura", i)),
  credit: "Vianatura",
  related: RELATED,
  organization: { locality: "Quito", country: "EC" },
  sources: ["https://vianatura.com/about-us", "https://vianatura.com/hermes-galapagos-luxury-catamaran/", "https://vianatura.com/monserrat-galapagos-cruises/"],
  checked: "2026-11-02",
};

export const GALAXY_CRUISES: Partner = {
  slug: "galaxy-cruises",
  name: "Galaxy Cruises",
  kind: "Small-ship operator",
  seo: {
    title: "Galaxy Cruises Galápagos Yachts with James Wild & Co",
    description: "Galaxy Cruises runs small Galápagos catamarans and yachts for 12 to 16 guests, from Galaxy Sirius and Alya to the 12-guest Galaxy Stella. Plan with James Wild & Co.",
    keywords: ["Galaxy Cruises", "Galaxy Cruises Galapagos", "Galaxy Sirius", "Alya catamaran", "Galaxy Stella", "EcoGalaxy"],
  },
  line: "A Quito operator with an office in Puerto Ayora, sailing catamarans and yachts for no more than 16 guests.",
  answer: "Galaxy Cruises is a Quito-based operator with an office in Puerto Ayora, sailing small Galápagos catamarans and yachts that carry no more than 16 guests. The house files six of them: the catamarans Galaxy Sirius, Alya and EcoGalaxy, and the yachts Galaxy Stella, Galaxy Bonita and Galaxy Orion.",
  who: {
    facts: [
      ["Who", "An operator of Galápagos expedition yachts and catamarans, also in Costa Rica, with South America tours and charters"],
      ["Based", "Quito, with an office in Puerto Ayora, Santa Cruz"],
      ["History", "Its timeline begins in 2003 with the boat Ilusiones"],
      ["Boats", "No more than 16 passengers, per Galaxy Cruises"],
    ],
    history: [
      ["2003", "Ilusiones"],
      ["2005", "Narel"],
      ["2007", "Galaxy Yacht"],
      ["2013", "EcoGalaxy"],
      ["2017", "Alya Catamaran"],
      ["2020", "Bonita Yacht"],
      ["2024", "Galaxy Diver II"],
      ["2025", "Galaxy Zibó, for Costa Rica"],
    ],
  },
  how: {
    paragraphs: [
      "Each boat sails routes of 3 to 7 nights named by region (Southern, Eastern, Western, Northern), from Baltra or San Cristobal, and the short routes join into a week.",
      "Galaxy publishes its 2026 fare for each route on each yacht's page; Galaxy Sirius and Alya also have dated departures here. Whole-boat charters are offered, and on a charter children of any age can sail.",
    ],
    facts: [
      ["Guests", "12 on Galaxy Stella, 14 on Galaxy Orion, 16 on the others"],
      ["Children", "Over 6 on shared departures; any age on a full charter"],
      ["Diving", "Galaxy Diver II and III, dive liveaboards, planned separately by the house"],
      ["Not included", "Galápagos flights, the US$200 park fee and the US$20 transit card"],
    ],
  },
  fleet: ["sirius-yacht-galapagos", "alya-catamaran-galapagos", "galaxy-stella-yacht", "ecogalaxy-catamaran", "galaxy-bonita-yacht", "galaxy-orion-yacht"],
  fleetNote: "Galaxy's day boat (Galaxy Skape) and its dive liveaboards (Galaxy Diver II and III) are not filed here.",
  apart: [
    { claim: "We promote our destinations directly, which ensures an authentic and efficient experience", attribution: "About us page" },
    { claim: "Luxury at its finest", attribution: "on Galaxy Sirius, About us page" },
    { claim: "The perfect combination of elegance and functionality", attribution: "on Alya, About us page" },
    { claim: "Responsible and comfortable tourism", attribution: "on EcoGalaxy, About us page" },
  ],
  why: [
    "Six boats from 12 to 16 guests, from Luxury and First Class to its naturalist yachts, so a family, a couple or a group can each find the right size and fare.",
    "Short routes of 3 to 5 nights that join into a week, from Baltra or San Cristobal.",
    "Its own office in Puerto Ayora, on Santa Cruz.",
    "Children of any age on a full charter, per Galaxy's terms.",
  ],
  faqs: [
    ["Who is Galaxy Cruises?", "A Galápagos and Costa Rica small-ship operator based in Quito, with an office in Puerto Ayora."],
    ["How big are the boats?", "At most 16 guests; Galaxy Stella takes 12 and Galaxy Orion 14."],
    ["Which Galaxy ships does the house sail?", "Six: the catamarans Galaxy Sirius, Alya and EcoGalaxy, and the yachts Galaxy Stella, Galaxy Bonita and Galaxy Orion."],
    ["What routes do they run?", "Routes of 3 to 7 nights named by region (Southern, Eastern, Western and Northern), from Baltra or San Cristobal."],
    ["Can children sail?", "Over 6 on shared departures; any age on a full charter, per Galaxy's terms. Galaxy's EcoGalaxy page says children from 6."],
    ["Can I charter a whole ship?", "Yes, Galaxy offers whole-boat charters; James quotes them for your dates."],
    ["Do they offer diving?", "Yes, on two dive liveaboards, Galaxy Diver II and III, which the house plans separately."],
    ["Where is their Galápagos office?", "Puerto Ayora, on Santa Cruz."],
  ],
  hero: hero(Sirius, "Galaxy Cruises"),
  gallery: [g1(Alya, "Galaxy Cruises"), g1(Stella, "Galaxy Cruises"), g1(EcoGalaxy, "Galaxy Cruises"), g1(Sirius, "Galaxy Cruises"), g1(Alya, "Galaxy Cruises", 1), g1(Stella, "Galaxy Cruises", 1)],
  credit: "Galaxy Cruises",
  related: RELATED,
  organization: { locality: "Quito", country: "EC" },
  sources: ["https://galaxycruises.com", "https://galaxycruises.com/about-us"],
  checked: "2026-11-02",
};

export const ECOVENTURA: Partner = {
  slug: "ecoventura",
  name: "Ecoventura",
  kind: "Expedition yacht operator",
  seo: {
    title: "Ecoventura Galápagos Yachts with James Wild & Co",
    description: "Ecoventura's Origin, Theory and Evolve are 20-guest Relais & Châteaux expedition yachts sailing 7-night routes from San Cristóbal. Plan yours with James Wild & Co.",
    keywords: ["Ecoventura", "Ecoventura Origin", "Ecoventura Theory", "Ecoventura Evolve", "Relais & Chateaux Galapagos yacht"],
  },
  line: "Three 20-guest expedition yachts, Relais & Châteaux members, on week-long loops from San Cristóbal.",
  answer: "Ecoventura sails three 20-guest expedition yachts, Origin, Theory and Evolve, which it describes as the only Relais & Châteaux yachts in the Galápagos. Cruises run 7 nights, Sunday to Sunday from San Cristóbal, on two routes that join into 14 nights, with family departures and whole-yacht charters.",
  who: {
    facts: [
      ["Who", "A luxury expedition yacht operator in the Galápagos and \"a pioneer of eco-tourism\", now part of a global travel group"],
      ["Founded", "Launched in the early 1990s, from a family's Galápagos tourism work begun in the early 1980s"],
      ["Sails from", "San Cristóbal, Sunday to Sunday"],
      ["Fleet", "Origin, Theory and Evolve, 20 guests each"],
    ],
  },
  how: {
    paragraphs: [
      "The three yachts sail one weekly schedule: 7-night routes A and B from San Cristóbal, Sunday to Sunday, which join into 14 nights. Two naturalist guides sail with 20 guests, a guide for every 10.",
      "Ecoventura publishes its dated departures and fares for the fleet together, a single fare for solo travellers, and whole-yacht charters.",
    ],
    facts: [
      ["Guests", "20 per yacht, a naturalist guide for every 10"],
      ["Lengths", "7 nights, or 14 back to back"],
      ["Staterooms", "10 on each yacht; two pairs connect into Premium Suites"],
      ["Children", "Ecoventura's own pages differ on the minimum age: ask the house"],
    ],
  },
  fleet: ["ecoventura-origin-yacht", "ecoventura-theory-yacht", "ecoventura-evolve-yacht"],
  apart: [
    { claim: "The only Relais & Châteaux Yachts in Galapagos", attribution: "About us page" },
    { claim: "Sustainability has been at the heart of what we do since our inception", attribution: "About us page" },
    { claim: "A pioneer of eco-tourism", attribution: "About us page" },
  ],
  why: [
    "Three sister yachts on one weekly schedule, so dates are plentiful and the two routes join into a fortnight.",
    "A naturalist guide for every 10 guests, per Ecoventura.",
    "It publishes its departures, fares and a single fare, so a quote starts from real numbers.",
    "Connecting staterooms that open into Premium Suites, for families.",
  ],
  faqs: [
    ["Who is Ecoventura?", "A Galápagos expedition yacht operator launched in the early 1990s, growing from a family's tourism work in the islands begun in the early 1980s."],
    ["Which yachts does Ecoventura sail?", "Origin, Theory and Evolve."],
    ["How many guests are on board?", "Twenty, with a naturalist guide for every 10."],
    ["Where do Ecoventura cruises start?", "San Cristóbal, Sunday to Sunday."],
    ["How long are the cruises?", "Seven nights, or 14 back to back on routes A and B."],
    ["Are children welcome?", "Ecoventura's own pages differ on the minimum age, so ask the house and James will confirm it for your dates."],
    ["What is special about Ecoventura's yachts?", "Ecoventura calls them the only Relais & Châteaux yachts in the Galápagos."],
    ["Can I charter a yacht?", "Yes, Ecoventura offers whole-yacht charters."],
  ],
  hero: hero(Origin, "Ecoventura"),
  gallery: [g1(Origin, "Ecoventura"), g1(Theory, "Ecoventura"), g1(Evolve, "Ecoventura"), g1(Origin, "Ecoventura", 1), g1(Theory, "Ecoventura", 1), g1(Evolve, "Ecoventura", 1)],
  credit: "Ecoventura",
  related: RELATED,
  organization: { country: "EC" },
  sources: ["https://ecoventura.com/about-us/", "https://ecoventura.com/a-journey-that-began-in-the-early-1980s/", "https://ecoventura.com/luxury-expedition-yachts/"],
  checked: "2026-11-02",
};
