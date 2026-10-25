// SAMPLE legal pages for review by James's lawyer and host agency. They are
// drafts, not in force, and say so at the top of every page. Brackets mark
// details only the house can supply. Written for a Florida-registered seller
// of travel (ST45327) acting as a wholesaler and hybrid host agency.

export type LegalDoc = { slug: string; title: string; short: string; description: string; sections: { h: string; p: string[] }[] };

export const LEGAL_UPDATED = "Draft of 25 October 2026";

export const LEGAL: LegalDoc[] = [
  {
    slug: "terms",
    title: "Website Terms of Use",
    short: "Terms",
    description: "The terms that apply when you use the James Wild & Co website.",
    sections: [
      { h: "Who we are", p: ["This website is operated by [legal entity name] trading as James Wild & Co (“the house”, “we”, “us”), based in Miami, Florida, USA. We are registered as a Florida Seller of Travel, registration no. ST45327, and hold IATA number 10783883.", "By using this website you agree to these terms. If you don't agree, please don't use the site."] },
      { h: "What the website is for", p: ["The website describes stays, safari reserves, residences, vessels, voyages and routes that the house recommends, and lets you send an enquiry or request a call. Information on the site is for planning. It is not an offer to sell, and nothing is booked until you have received and accepted a written quote and confirmation under our Booking Conditions."] },
      { h: "Accuracy of information", p: ["We work hard to keep the Ledger accurate, and every entry shows how we know it. But properties, ships, routes, prices, seasons and availability change. Prices shown are examples or starting points per person unless stated, are re-checked at enquiry, and are confirmed only in your written quote.", "Founder marks and dates record when James or a named partner visited or reviewed a place. They describe that visit; they don't guarantee that every detail is unchanged."] },
      { h: "Iggi and other tools", p: ["Iggi, the Compass and the price builder are planning aids. Iggi is an AI-powered guide that answers from information the house provides; it can be wrong or incomplete, and it cannot book, confirm or change a reservation. Rely on your advisor and your written confirmation for anything that matters."] },
      { h: "Third-party suppliers and links", p: ["Travel services are provided by independent suppliers: hotels, lodges, camps, ship and yacht operators, airlines, guides and ground handlers. We are not the supplier of those services. Links to third-party sites are provided for convenience; we're not responsible for their content or practices."] },
      { h: "Intellectual property", p: ["The site's text, the Ledger, photographs, films, marks, stamps, the James Wild & Co seal and the names James Wild & Co, Worth Another Night™ and Time Rewarded™ belong to the house or its licensors. You may view and share pages for personal, non-commercial use. Please don't copy, scrape or republish content without written permission."] },
      { h: "Acceptable use", p: ["Please don't misuse the site: no attempts to break its security, overload it, scrape it at scale, or submit false enquiries."] },
      { h: "Liability", p: ["To the extent the law allows, the site is provided “as is”, and the house is not liable for indirect or consequential loss arising from use of the site. Nothing in these terms limits liability that cannot be limited by law. [Counsel to set the cap and governing wording.]"] },
      { h: "Governing law", p: ["These terms are governed by the laws of the State of Florida, USA, and disputes are subject to the courts of [Miami-Dade County], Florida. [Counsel to confirm venue, arbitration and consumer carve-outs.]"] },
      { h: "Changes and contact", p: ["We may update these terms; the date at the top shows the latest version. Questions: [house email], 1.800.419.7000."] },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    short: "Privacy",
    description: "How James Wild & Co collects, uses and protects your personal information.",
    sections: [
      { h: "The short version", p: ["We collect what we need to plan your trip and run the site, we use it for that, we share it only with the people who have to see it to make your trip happen, and we never sell it."] },
      { h: "What we collect", p: ["When you enquire or request a call: your name, email, phone number, trip ideas, dates, number of travellers (adults and children), budget range if you give one, and anything you write in your message. If you name your own travel advisor, their name and contact details.", "When you book: traveller names, dates of birth, passport details where a supplier requires them, dietary, medical or accessibility needs you choose to tell us, and payment information (processed by our payment provider; we don't store full card numbers).", "When you browse: basic technical data such as device, browser and pages visited, collected by our hosting and analytics providers. [List providers, e.g. Vercel Analytics, once confirmed.]"] },
      { h: "How we use it", p: ["To answer your enquiry and plan, quote and book your journey; to send booking documents and travel updates; to meet legal, tax and seller-of-travel obligations; to improve the site; and, only if you tick the box, to send Travel Notes, which you can stop at any time."] },
      { h: "Your Iggi and Compass conversations", p: ["If you choose to send your Compass reading or the useful parts of an Iggi chat with your enquiry, we receive that content and treat it like the rest of your enquiry. [Counsel and the Iggi provider to confirm retention and processing terms before launch.]"] },
      { h: "Who we share it with", p: ["The suppliers delivering your trip (properties, operators, guides, airlines, ground handlers), insurers if you buy cover through us, our host-agency and technology providers acting on our instructions, your own advisor if you ask us to coordinate with them, and authorities where the law requires. Suppliers may be outside the United States."] },
      { h: "How long we keep it", p: ["Enquiries that don't become bookings: [24 months]. Booking records: as long as tax and seller-of-travel rules require, typically [7 years]. Then we delete or anonymise it."] },
      { h: "Your choices and rights", p: ["You can ask to see, correct or delete your information, or to stop marketing, by writing to [house email]. Depending on where you live (for example California, or the EU and UK), you may have further rights, including to know what we hold and to object to certain uses. We'll respond within the time the law sets."] },
      { h: "Children", p: ["We collect information about children only from their parent or guardian, and only what a booking needs."] },
      { h: "Security", p: ["We use reputable providers, encryption in transit and access controls. No system is perfectly secure; if something goes wrong that affects you, we'll tell you as the law requires."] },
      { h: "Contact", p: ["[Legal entity name] trading as James Wild & Co, Miami, Florida, USA. [house email] · 1.800.419.7000."] },
    ],
  },
  {
    slug: "booking-conditions",
    title: "Booking Conditions",
    short: "Booking conditions",
    description: "The conditions that apply when you book a journey with James Wild & Co.",
    sections: [
      { h: "Our role", p: ["James Wild & Co acts as a seller of travel and, depending on the arrangement, as agent for the suppliers who provide your travel services, or as the wholesaler who packages them. Your quote and confirmation say which applies. Each supplier's own terms also apply to its services, and we'll give you the key ones before you book."] },
      { h: "Quotes and confirmation", p: ["An enquiry, a quote, an Iggi answer or a price-builder estimate is not a booking. Your booking is confirmed only when we've received your signed or accepted booking form and the required deposit, and we've issued written confirmation. Please check every detail on it, including names exactly as on passports, and tell us of any error within [48 hours]."] },
      { h: "Prices", p: ["Prices are in US dollars, per person, based on two people sharing (double occupancy), unless stated. Single, child and extra-person rates are quoted separately. Taxes are shown in your quote. [Counsel to confirm the basis of the 7% tax shown in the price builder.] Prices can change before confirmation; after confirmation they change only for reasons set out in your supplier's terms, such as government taxes or fuel surcharges, which we'll explain."] },
      { h: "Deposit and balance", p: ["A deposit of US$500 per person is due to confirm, unless your quote states a higher supplier deposit (some safari camps, yachts and expedition ships require more). The balance is due [90 days] before departure, or earlier where a supplier requires. If the balance isn't paid on time we may cancel and apply cancellation charges."] },
      { h: "Changes by you", p: ["Ask us and we'll try. Changes depend on supplier availability and may carry supplier charges plus a house amendment fee of [US$__ per change]."] },
      { h: "Cancellation by you", p: ["Cancel in writing. Charges depend on how close to departure you cancel and on each supplier's terms; your quote includes the schedule. As a guide: [more than 90 days: loss of deposit; 89–60 days: 50% of the total; under 60 days: 100%]. Many safari, yacht and expedition suppliers are stricter, and their terms prevail. That's why we strongly recommend travel insurance from the moment you book."] },
      { h: "Changes or cancellation by suppliers", p: ["Suppliers occasionally change itineraries, vessels, camps or schedules, sometimes for weather, safety or wildlife reasons. We'll tell you promptly and help with alternatives. Refunds or compensation follow the supplier's terms and applicable law."] },
      { h: "Travel insurance", p: ["Comprehensive travel insurance covering cancellation, medical care and evacuation is strongly recommended, and some suppliers require it. Insurance doesn't replace the cancellation conditions on your booking."] },
      { h: "Passports, visas and health", p: ["You're responsible for valid passports, visas, entry requirements and vaccinations for every traveller. We'll point you to official sources; requirements change, so check before you travel."] },
      { h: "Your responsibilities", p: ["Tell us about any medical, mobility or dietary needs before booking so we can confirm suppliers can meet them. Follow guides' and crews' instructions, especially on safari and at sea."] },
      { h: "Our responsibility", p: ["We'll arrange your booking with reasonable skill and care. We're not liable for the acts or omissions of independent suppliers, or for events beyond anyone's control. [Counsel to draft limitation and force majeure wording and the Florida Seller of Travel disclosures required under Chapter 559, Part XI, Florida Statutes, plus any other states' seller-of-travel requirements for where the house sells.]"] },
      { h: "Complaints", p: ["Tell the supplier on the spot so they can put it right, and tell us. If it isn't resolved, write to us within [30 days] of your return and we'll respond."] },
      { h: "Law", p: ["These conditions are governed by Florida law. [Counsel to confirm venue and dispute resolution.]"] },
    ],
  },
];

export const legalBySlug = (s: string) => LEGAL.find((d) => d.slug === s);
