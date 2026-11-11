// Belmond: the James Wild & Co partner section for Belmond in Africa (James, 4 Nov 2026:
// "a partnership alliance, and we have rights to use their photos"; the Belmond Africa team
// asked to connect). Facts come only from belmond.com and Belmond's own brochures
// (pdfs.belmond.com) and the stay records filed from them (Stay Studio STY-2026-000634 to
// 000636). Photographs are Belmond's, used under the partnership and credited to Belmond.
// Khwai River Lodge is not in Belmond's 2026 Africa line-up, so it is not listed.
// Villa San Michele (Florence) is to be added later (Follow-Up Board).

import type { CollectionHotel, CollectionImage } from "@/lib/content/collections/cayuga";

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const img = (id: string, alt: string, w: number, h: number): CollectionImage => ({ url: `${CLD}/c_limit,w_3200/q_auto:best/f_jpg/${id}`, alt, w, h });
const MN = "wildco/south-africa/cape-town/belmond-mount-nelson/belmond-mount-nelson";
const EI = "wildco/botswana/okavango-delta/belmond-eagle-island-lodge/belmond-eagle-island-lodge";
const SE = "wildco/botswana/chobe/belmond-savute-elephant-lodge/belmond-savute-elephant-lodge";

export const BELMOND = {
  slug: "belmond",
  name: "Belmond in Africa",
  orgName: "Belmond",
  path: "/collections/belmond",
  approved: true, // James, 4 Nov 2026: Belmond partner section, photos cleared under the partnership
  founded: "",
  founders: [] as string[],
  countries: ["South Africa", "Botswana"],
  facts: [["Belmond worldwide", "43 properties"], ["In Africa", "3, all on our list"], ["The story begins", "1976, Venice"], ["Part of", "LVMH, since 2019"]] as [string, string][],
  seo: {
    title: "Belmond in Africa: Mount Nelson, Eagle Island and Savute Elephant Lodge",
    description: "Belmond's three houses in southern Africa, planned by James Wild & Co as a Belmond partner: Mount Nelson in Cape Town, Eagle Island Lodge in the Okavango Delta and Savute Elephant Lodge in Chobe. Which suits whom, and how to join them.",
  },
  eyebrow: "The Collections · Belmond",
  tagline: "Cape Town's pink hotel, then two tented lodges in northern Botswana, joined by light aircraft",
  answer: "Belmond is a collection of 43 hotels, trains, river cruises and safaris in 24 countries, part of LVMH since 2019, whose story begins with Hotel Cipriani in Venice in 1976. In Africa it has three houses, and we plan all of them: Mount Nelson in Cape Town, Eagle Island Lodge in the Okavango Delta and Savute Elephant Lodge in Chobe National Park. Belmond calls its way of travelling slow luxury; in Africa that means a city start, then the Delta and Savute by light aircraft.",
  hero: img(`${EI}-delta-from-the-air`, "The Okavango Delta seen from a helicopter on a safari flight from Eagle Island Lodge, A Belmond Safari, Botswana", 6796, 4531),
  partner: {
    eyebrow: "A James Wild & Co partner",
    line: "We plan Belmond's African houses with the Belmond Africa team, and its photographs appear here with Belmond's permission:",
    credit: "Belmond",
    creditUrl: "https://www.belmond.com/en/destinations/africa",
    story: [
      { ...img(`${EI}-mokoro`, "A guide poling a mokoro canoe through the Okavango Delta waterways at Eagle Island Lodge, A Belmond Safari", 9504, 6336), hotel: "Eagle Island Lodge" },
      { ...img(`${MN}-exterior-grounds`, "The grounds and exterior of Mount Nelson, A Belmond Hotel, Cape Town", 6156, 4104), hotel: "Mount Nelson" },
      { ...img(`${SE}-elephants`, "Elephants seen on a game drive from Savute Elephant Lodge, A Belmond Safari, Chobe National Park", 6774, 4492), hotel: "Savute Elephant Lodge" },
      { ...img(`${EI}-fish-eagle-bar-sunset`, "Sunset at the Fish Eagle Bar, Eagle Island Lodge, A Belmond Safari, Okavango Delta", 7253, 4841), hotel: "Eagle Island Lodge" },
      { ...img(`${SE}-view-over-the-plains`, "The view from Savute Elephant Lodge, A Belmond Safari, over the Savute plains in Chobe National Park", 4915, 6156), hotel: "Savute Elephant Lodge" },
      { ...img(`${EI}-veranda-sunset`, "A shaded veranda of a tented room at Eagle Island Lodge, A Belmond Safari, looking across grasslands at sunset", 7209, 4811), hotel: "Eagle Island Lodge" },
      { ...img(`${EI}-leopard`, "A leopard seen on a game drive from Eagle Island Lodge, A Belmond Safari, Okavango Delta", 3873, 5809), hotel: "Eagle Island Lodge" },
    ],
  },
  copy: {
    hotelsHeading: "Three Houses, One Journey",
    hotelsLine: "A city hotel with nine acres of garden, then the water of the Delta and the dry channel at Savute.",
    says: "At a glance",
    quoteOfficial: false,
    fitHeading: "Which Belmond House Fits Which Traveller",
    pairHeading: "Cape Town, the Delta, Savute",
    askHeading: "Questions Worth Asking Before a Botswana Safari",
    askLine: "The two lodges are a short flight apart, but the Delta and Savute change with the water. These help set the season and the pace.",
    faqTitle: "Questions About Belmond in Africa",
    source: "Hotel details from belmond.com; the roster is confirmed before booking.",
    planPlace: "Cape Town and Botswana",
    galleryCredit: "Photography courtesy of Belmond, used with permission.",
  },
  hotels: [
    {
      slug: "belmond-mount-nelson", name: "Mount Nelson, A Belmond Hotel", country: "South Africa", setting: "City hotel in nine acres of garden", where: "Gardens, Cape Town",
      bestFor: ["Couples", "Families", "Before or after safari"],
      choose: "Choose it for the start or the end of the journey: Cape Town from a garden, with Table Mountain above and afternoon tea on the terrace.",
      line: "A hotel since 1899, painted pink since 1918, in nine acres of gardens below Table Mountain, with Librisa Spa in restored Victorian houses and two outdoor pools.",
      image: img(`${MN}-exterior-facade`, "The pink exterior of Mount Nelson, A Belmond Hotel, Cape Town, from the gardens", 5616, 3744),
      gallery: [],
      official: { who: "For Cape Town at an unhurried pace.", facts: "About 30 minutes from Cape Town International Airport, with a shuttle to the V&A Waterfront." },
      built: true,
    },
    {
      slug: "belmond-eagle-island-lodge", name: "Eagle Island Lodge, A Belmond Safari", country: "Botswana", setting: "Island in the Okavango Delta", where: "Xaxaba Island, Okavango Delta",
      bestFor: ["Water safari", "Couples", "First safari"],
      choose: "Choose it for the Delta from the water: mokoro, boat and fishing from an island you can only reach by air.",
      line: "Twelve tented rooms of 82 square metres on Xaxaba Island, each with a plunge pool and deck, and the Fish Eagle Bar looking over the floodplain at sunset.",
      image: img(`${EI}-exterior`, "The exterior of Eagle Island Lodge, A Belmond Safari, on Xaxaba Island in the Okavango Delta, Botswana", 5000, 3337),
      gallery: [],
      official: { who: "For the Okavango Delta by water.", facts: "Its own airstrip, 20 minutes by air from Maun; Belmond includes flights from Maun and Kasane. Mokoro, powerboat and fishing are included." },
      built: true,
    },
    {
      slug: "belmond-savute-elephant-lodge", name: "Savute Elephant Lodge, A Belmond Safari", country: "Botswana", setting: "Savute Channel, Chobe", where: "Savute, Chobe National Park",
      bestFor: ["Elephants", "Game drives", "Photographers"],
      choose: "Choose it after the Delta, for drives and the elephants that come to the waterhole in front of the lodge.",
      line: "Twelve tented rooms on bamboo platforms beside the Savute Channel, with a lookout hide over a permanent waterhole, a spa tent and a pool facing the plains.",
      image: img(`${SE}-exterior-savute-channel`, "The exterior of Savute Elephant Lodge, A Belmond Safari, on the Savute Channel in Chobe National Park, Botswana", 9504, 6336),
      gallery: [],
      official: { who: "For game drives and elephants.", facts: "Its own airstrip, 40 minutes by air from Kasane and 45 from Eagle Island." },
      built: true,
    },
  ] as CollectionHotel[],
  pairings: [
    { title: "Belmond's Grand Tour", hotels: ["Mount Nelson, A Belmond Hotel", "Eagle Island Lodge, A Belmond Safari", "Savute Elephant Lodge, A Belmond Safari"], line: "Cape Town first, then the Delta and Savute, joined by light aircraft. Belmond packages the three as its Grand Tour of Southern Africa." },
    { title: "Water, then land", hotels: ["Eagle Island Lodge, A Belmond Safari", "Savute Elephant Lodge, A Belmond Safari"], line: "Mokoro and boats in the Delta, then game drives at Savute, 45 minutes apart by air." },
    { title: "Cape Town, either side", hotels: ["Mount Nelson, A Belmond Hotel"], line: "Two or three nights at the Nellie before or after any Botswana safari, to arrive slowly or come down gently." },
  ],
  rule: "Three nights in each lodge, and two or three in Cape Town, is usually better than adding a fourth stop.",
  questions: [
    "Is the Delta in flood when we travel, and what does that change at Eagle Island?",
    "Which activities are included at each lodge, and which cost extra?",
    "What is the luggage limit on the light aircraft?",
    "Is there a minimum age for children on game drives or in the mokoro?",
    "Which malaria precautions does our doctor advise for northern Botswana?",
    "How many nights in Cape Town suit our flights home?",
  ],
  faqs: [
    { q: "Which Belmond properties are in Africa?", a: "Three: Mount Nelson, A Belmond Hotel in Cape Town, Eagle Island Lodge in the Okavango Delta and Savute Elephant Lodge in Chobe National Park, Botswana. We plan all three." },
    { q: "How do you travel between the Belmond lodges in Botswana?", a: "By light aircraft. Eagle Island Lodge and Savute Elephant Lodge each have their own airstrip, about 45 minutes apart by air, with flights from Maun and Kasane." },
    { q: "What is Belmond's Grand Tour of Southern Africa?", a: "Belmond's own package joining Mount Nelson in Cape Town with its two Botswana lodges, with light aircraft flights between the lodges. We plan it, and adjust the nights to suit you." },
    { q: "Is Eagle Island Lodge or Savute Elephant Lodge better for a first safari?", a: "Both work, and they are best together: Eagle Island for the Delta by water, Savute for game drives and elephants. If you have time for only one, tell us what you most want to see." },
    { q: "Why is Mount Nelson known as the Nellie?", a: "The Nellie is the hotel's affectionate name, as Belmond tells it. It opened as a hotel in 1899 and has been painted pink since 1918." },
  ],
  disclosure: "James Wild & Co is a Belmond partner and may help plan and book these properties. Recommendations remain based on traveller fit.",
};
