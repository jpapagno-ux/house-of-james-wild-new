// /plan/iggi: Meet Iggi, James's buddy. Iggi isn't live yet (planned in the
// Base44 library); this page explains him and shows, in sample chats, how he
// answers from the page he's embedded on. Adapted from the Base44 "Meet
// Iggi" sample (SampleMeetIggiPage + components), with James's wit added.
//
// Rules carried over: Iggi quotes James only from approved text, never
// invents a memory, inspection or endorsement, labels every answer by origin,
// and hands prices, availability and booking to a person. Sample answers
// below use only facts on file (stay, vessel and route records, James's
// stated trips); the Aguas Claras sample shows Iggi declining to claim a
// founder stay that isn't recorded.

import type { FieldIconName } from "@/components/ledger/FieldIcon";

export const IGGI_IMG = {
  url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/3e26d6a56_generated_image.png",
  alt: "Iggi, the house chameleon, drawn in charcoal on cream paper",
};

export type Tag = "ledger" | "james" | "founder" | "partner" | "check";
export const TAGS: Record<Tag, { label: string; line: string }> = {
  ledger: { label: "From the Ledger", line: "Facts from the house's own record of the stay, ship or route." },
  founder: { label: "James was there", line: "A trip James made himself, with the year. Never claimed without a record." },
  james: { label: "James's field note", line: "His approved words, quoted, not paraphrased into something he didn't say." },
  partner: { label: "Partner-supplied", line: "What the lodge, captain or guide tells us, labelled as theirs." },
  check: { label: "Needs a current check", line: "Prices, availability, offers and transfers. A person confirms these." },
};

export const PLACES: { icon: FieldIconName; place: string; line: string }[] = [
  { icon: "mountain-sun", place: "On a destination page", line: "The regions, the seasons and the routes that tie them together." },
  { icon: "tree-ring", place: "On a stay page", line: "The rooms, the setting, who it suits and why it made the Ledger." },
  { icon: "frond", place: "On an Overland route", line: "The order of the stops, the drive times and what each stop adds." },
  { icon: "wave", place: "On a voyage", line: "Life aboard, the cabins, the ports and how one sailing differs from another." },
];

export const QUESTIONS: { icon: string; q: string; a: string }[] = [
  { icon: "key", q: "Why this place?", a: "What earned it a place in the Ledger: the setting, the guiding, the welcome." },
  { icon: "star", q: "Has James been there?", a: "Recorded visits, stays and voyages, with the year. If there's no record, Iggi says so." },
  { icon: "family", q: "Who's behind it?", a: "The hosts, guides and captains, as the house knows them." },
  { icon: "binoculars", q: "Would it suit us?", a: "Pace, atmosphere, rooms and the practical bits. Who'll love it, and who won't." },
  { icon: "route", q: "Why does this route fit together?", a: "The order of the places, the contrasts, and why each gets the nights it does." },
  { icon: "season", q: "What should I know before I go?", a: "Best months, what to pack, and what to check with your advisor." },
];

export type ChatSample = {
  icon: FieldIconName;
  where: string; // the page the chat is embedded on
  path: string;
  opener: string;
  prompts: string[];
  q: string;
  answer: { tag: Tag; text: string }[];
};

export const SAMPLES: ChatSample[] = [
  {
    icon: "mountain-sun",
    where: "Costa Rica · destination page",
    path: "/destinations/central-america/costa-rica",
    opener: "Pura vida. Ask me anything about Costa Rica: when to go, where, and how the pieces fit.",
    prompts: ["When should we go?", "Pacific or Caribbean?", "Which route suits a family?"],
    q: "We can only travel in October. Is that a mistake?",
    answer: [
      { tag: "ledger", text: "Not if you pick the right coast. The Pacific turns wet in October, but the Caribbean side is often at its driest in September and October." },
      { tag: "ledger", text: "That's why James's Two Coasts route lists “February to April, or September and October” as its best months: 10 nights, from the South Caribbean to the Pacuare River, Arenal and Costa Ballena." },
      { tag: "check", text: "Weather is never a promise. Your advisor checks the season and the transfers for your dates." },
    ],
  },
  {
    icon: "tree-ring",
    where: "Aguas Claras · stay page",
    path: "/stays/aguas-claras",
    opener: "You're looking at Aguas Claras on Playa Chiquita. What would you like to know?",
    prompts: ["Would it suit a family?", "Has James stayed here?", "Best months?"],
    q: "Has James stayed here, and would it work for us and two kids?",
    answer: [
      { tag: "ledger", text: "It can work well. It's just twelve rooms, right on Playa Chiquita, and the two-bedroom bungalows suit families or small groups. The Ledger files its best months as May to November." },
      { tag: "founder", text: "There's no founder stay on record for Aguas Claras, so I won't claim one." },
      { tag: "check", text: "Rates and availability for your dates need a current check. I'll pass your questions to an advisor if you'd like." },
    ],
  },
  {
    icon: "wave",
    where: "Aliikai · 10 Day Raja Ampat North",
    path: "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north",
    opener: "Welcome aboard. Ask me about Aliikai, the cabins or the route north to Wayag.",
    prompts: ["Has James sailed on her?", "What's the boat like?", "When does she sail?"],
    q: "Has James actually been on this boat?",
    answer: [
      { tag: "founder", text: "Yes. James sailed Raja Ampat aboard Aliikai with his son in November 2024." },
      { tag: "ledger", text: "She's a phinisi built in Bulukumba, South Sulawesi, from Sulawesi ironwood: two masts, seven sails and a 60 sqm sundeck. This voyage runs Sorong to Wayag and back, from US$4,830 per person." },
      { tag: "check", text: "2027 and 2028 departure dates are coming soon. Cabin availability is confirmed by a person." },
    ],
  },
];

export const NOTES: { icon: FieldIconName; label: string; line: string }[] = [
  { icon: "sun", label: "James's hints", line: "Small observations that get more out of a place." },
  { icon: "coral", label: "Worth your time", line: "The moments that deserve room in the journey." },
  { icon: "mountain-sun", label: "Think twice", line: "Choices that add needless driving or leave too little time." },
  { icon: "frond", label: "Before you go", line: "Practical preparation, and what to raise with your advisor." },
];

export const IGGI = {
  eyebrow: "Coming soon · Meet Iggi",
  title: "Meet Iggi, James's Buddy: Ask About the Page You're On",
  subtitle: "A chameleon, naturally. He takes on the colour of whatever page you're reading, and answers from the house's own Ledger.",
  quips: [
    "I've been briefed by James. Thoroughly. For forty-four years' worth.",
    "I'll tell you when I don't know. Chameleons blend in; they don't bluff.",
  ],
  answer:
    "Iggi is the James Wild & Co guide who answers your questions on the page you're reading: a destination, a stay, an Overland route or a voyage. He draws only on the Ledger of places James has vetted and James's approved notes, labels where every answer comes from, and hands prices, availability and booking to a person. Iggi is coming soon.",
  roadmap: [
    { label: "At launch", line: "Iggi answers from the Ledger on destination, stay, route and voyage pages, each answer labelled by where it came from." },
    { label: "Next", line: "Live rates, current availability and stay-longer offers from the Ledger, so a conversation can move from “why this place” to “shall we hold it” in one sitting." },
    { label: "The standard that holds", line: "First-hand stays first-hand. Partner facts stay attributed. Every answer stays answerable to its source." },
  ],
  faqs: [
    { q: "Who is Iggi?", a: "Iggi is the James Wild & Co guide, a chameleon who answers questions about the destination, stay, route or voyage you're looking at. He answers from the house's Ledger and James's approved notes, and he's coming soon." },
    { q: "Is Iggi a person?", a: "No. Iggi is an AI-powered guide. He's honest about it, labels where each answer comes from, and hands you to James or an advisor whenever a person should take over." },
    { q: "Can Iggi book my trip?", a: "No. Iggi explains and drafts; a person confirms prices and availability and makes the booking. Nothing is booked until you've approved a quote." },
    { q: "Does Iggi make things up about James?", a: "No. Iggi quotes James only from approved notes and only claims he's been somewhere when it's recorded, with the year. Where there's no record, Iggi says so." },
    { q: "Where will I find Iggi?", a: "On every destination page and on selected stay, Overland route and voyage pages, starting from the page you're on. You'll also find him behind the site search and the Compass." },
  ],
};
