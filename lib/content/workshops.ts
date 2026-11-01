// House Sessions: the live workshops. Two routes, from the Base44 workshops
// sample: House Workshops (public, everyone welcome) and Advisor Briefings
// (inside the Advisor Desk, verified advisors only). Planning calls keep
// their own name, The Wild Connection.
//
// Sessions are posted here as James schedules them (Base44 Webinar records
// are the source of truth; Livestorm runs the room). Each session lists what
// it is about (`about`): a stay, ship, voyage, route or destination. The
// session card links there, and that page shows the session back, so a
// traveller reading about Monwana sees the Monwana session and vice versa.

import { isPast, today } from "@/lib/dates";

export type SessionAbout = { kind: "stay" | "vessel" | "voyage" | "route" | "destination" | "reserve"; name: string; href: string };
export type Session = {
  slug: string;
  ledgerId?: string; // WEB-2026-XXXXXX
  series: "House Workshops" | "Advisor Briefings";
  title: string;
  start?: string; // ISO 8601 with offset, e.g. 2027-01-08T12:00:00-05:00
  duration: string; // "1 hour"
  minutes?: number;
  hosts: string[]; // "James Papagno", "Miguel, MORE Family Collection"
  description: string;
  image: { url: string; alt: string };
  registerUrl?: string; // Livestorm registration
  recordingUrl?: string; // YouTube or Livestorm replay
  about: SessionAbout[];
};

export const SESSIONS: Session[] = [
  // Posted by James as each season is scheduled.
];

export const WORKSHOPS_PATH = "/workshops";

// One date rule (lib/dates.ts): a session is upcoming until its day has passed
// (in the house's time zone, as of the daily build), then only its recording shows.
export const upcoming = (on = today()) => SESSIONS.filter((s) => s.series === "House Workshops" && s.start && !isPast(s.start, on)).sort((a, b) => Date.parse(a.start!) - Date.parse(b.start!));
export const recordings = (on = today()) => SESSIONS.filter((s) => s.series === "House Workshops" && s.recordingUrl && (!s.start || isPast(s.start, on)));
/** Sessions about a given page (a stay, ship, voyage or route), for the cross-link back. */
export const sessionsFor = (href: string, on = today()) => SESSIONS.filter((s) => s.series === "House Workshops" && s.about.some((a) => a.href === href) && (!s.start || !isPast(s.start, on) || !!s.recordingUrl));

export const WORKSHOP_COPY = {
  seoTitle: "House Sessions: Live Travel Workshops and Destination Talks",
  description: "Live travel workshops and destination talks with James Papagno, our hosts and partners: ask the people who know the place, then watch the recordings at your own pace.",
  eyebrow: "Live learning · House Sessions",
  title: "House Sessions",
  tagline: "Live travel talks and destination workshops, with a separate desk for travel advisors.",
  answer: "House Sessions are free, live online workshops from James Wild & Co. James Papagno, our hosts and the people who run the stays and ships talk through a place, a lodge or a voyage, and you ask your questions. Each session links to the stay, ship or route it covers, and recordings stay here to watch later. Advisors have their own briefings.",
  public: {
    eyebrow: "House Sessions",
    title: "Come curious. Get to know the place.",
    body: ["Conversations with James, our hosts and the people who know the destination. Explore what makes a place special, ask useful questions and discover what might belong in your next journey.", "Join us live or watch an available recording at your own pace."],
    who: "For travelers, advisors and anyone with a little curiosity.",
    chips: ["House Workshops", "Everyone welcome"],
  },
  trade: {
    eyebrow: "The Advisor Desk",
    title: "Your client. Our knowledge. A journey thoughtfully arranged.",
    body: ["A dedicated place for travel professionals working with James Wild & Co.", "Build your destination knowledge through Advisor Briefings, explore our selected portfolio and access the resources and personal support that help you turn an idea into a well-considered journey.", "When a question calls for local insight, we help bring the right partner into the conversation, with you at the center of your client's plans."],
    who: "Professional resources and training for verified travel advisors.",
    chips: ["Advisor Briefings", "Advisors only"],
  },
  how: [
    ["Live, online, free", "Sessions run online. Reserve a seat, join from anywhere and put your questions to the people who know the place."],
    ["About a real place", "Every session is about a stay, a ship, a route or a destination in the Ledger, and links straight to it."],
    ["With the people who run it", "James, our hosts, guides and the owners and teams of the lodges and ships we work with."],
    ["Recorded", "Missed it? Recordings stay on this page, and on the stay or voyage page they cover."],
  ] as [string, string][],
  faqs: [
    { q: "What are House Sessions?", a: "Live online workshops and destination talks from James Wild & Co, with James Papagno, our hosts and the teams behind the stays and ships in the Ledger. You can ask questions live or watch the recording later." },
    { q: "Do House Sessions cost anything?", a: "No. House Workshops are free and open to everyone. Reserve a seat for the live session, or watch the recording when it's posted." },
    { q: "Can I watch a session I missed?", a: "Yes. Recordings are posted on this page and on the page of the stay, ship or route the session covers." },
    { q: "Are there sessions for travel advisors?", a: "Yes. Advisor Briefings run inside the Advisor Desk for verified travel advisors, with their recordings and transcripts. Request access through the For Advisors page." },
    { q: "How do I hear about the next session?", a: "Dates post here first. Join Travel Notes, the house's monthly letter, and each new session arrives with it." },
  ],
};
