// /plan: Plan & Book Your Journey. Copy from the approved Base44 brief
// (samplePlanBookContent.js), reordered so the enquiry sits first: every
// "Plan with James", price-builder "Contact us", Iggi and Compass handoff
// lands here with its context. Online booking is held back until the
// booking connections are live, so it's described, not offered.

export const PLAN = {
  eyebrow: "Plan & Book Your Journey",
  title: "Your Next Chapter Begins in the Wild",
  lead: "A place you've dreamed about. A voyage that changes your perspective. A little more time somewhere extraordinary.",
  answer:
    "To plan a journey with James Wild & Co, tell the house where you're drawn, when and who's travelling. James or an advisor replies by email or arranges a call, shapes the route and stays with you, and sends a quote. Nothing is booked until you approve it. Your own travel advisor is welcome to coordinate with the house.",
  steps: [
    { n: "01", title: "Tell us what matters", body: "Destination ideas, rough dates, who's coming and a comfortable budget. You don't need a finished itinerary to begin." },
    { n: "02", title: "Shape the journey together", body: "Your advisor helps you weigh the route, the pace and the right mix of stays and experiences. Proposal, inclusions and any planning fees are discussed before you decide." },
    { n: "03", title: "Review the details", body: "Names, dates, rooms, arrangements, payment schedule and cancellation conditions. Ask about anything that needs clarifying." },
    { n: "04", title: "Confirm and prepare", body: "Complete the required payment and booking acceptance. Your written confirmation shows what's secured, what's outstanding and what comes next." },
  ],
  ways: {
    advisor: { title: "Plan with an advisor", italic: "For a journey shaped around you.", body: "From a single special stay to a safari or a journey across land and sea, your advisor turns possibilities into a considered plan." },
    online: { title: "Book a selected stay online", italic: "For when you know where you want to be.", body: "Selected stays will offer live availability and online booking. Look for Live Booking Available on the stay page.", badge: "Live booking · opening at selected stays" },
  },
  offers: { title: "A Little More Time. A Little More Possibility.", mark: "Worth Another Night™", line: "Some places reward you for slowing down: an extra night, a thoughtful inclusion or a saving on a qualifying stay. Where an arrangement is exclusive to James Wild & Co, we'll say so.", note: "Every offer has its own dates, rooms, minimum stay and conditions, and applies only where included in your confirmed booking." },
  insurance: "We encourage travel insurance for every journey: cancellation and interruption, emergency medical care and evacuation, matched to your destinations and activities. Insurance doesn't replace the cancellation conditions on your booking.",
  conditions: "Before confirming, review the booking conditions for your journey and each supplier: deposits, payment deadlines, cancellation and change charges, inclusions and exclusions. If something is unclear, ask before you pay.",
  faqs: [
    { q: "How do I start planning a trip with James Wild & Co?", a: "Fill in the short form on this page or call 1.800.419.7000. Tell us where you're drawn, roughly when and who's travelling; James or an advisor replies by email or arranges a call." },
    { q: "Can you help with just one stay?", a: "Yes. You can begin with one place, or ask us to consider how it fits into a wider journey." },
    { q: "Can my own travel advisor work with you?", a: "Yes. Tick the box on the form and add their details so we can coordinate with them." },
    { q: "Can I book online without speaking to anyone?", a: "Soon, at selected stays showing Live Booking Available. Other stays, voyages and tailored journeys are arranged by enquiry." },
    { q: "Can Iggi book or confirm my journey?", a: "No. Iggi answers questions about the places you're exploring. Reservations are confirmed by our team or the relevant booking service." },
    { q: "When is my booking confirmed?", a: "Only when you receive written confirmation. An enquiry, a quote or a payment attempt on its own isn't a confirmation." },
  ],
};
