// Sample STAY PROMOTION content: the Time Rewarded / Worth Another Night
// offer as it would appear on a published stay page (Aguas Claras example).
// Follows the Soori-style new-brand card: one image, dated offer, included
// and excluded notes. No em dashes.

export const SAMPLE_STAY_PROMOTION = {
  banner: {
    eyebrow: "Worth Another Night™",
    title: "Time Rewarded at Aguas Claras",
    line: "A featured offer for travelers who stay long enough for the Caribbean to slow them down.",
    cta: "View the offer",
  },
  card: {
    badge: "Time Rewarded",
    brand: "Worth Another Night™",
    id: "Entry No. WAN-2026-014",
    statement: "Time is rewarded at Aguas Claras.",
    eyebrow: "Featured stay offer",
    property: "Aguas Claras",
    byline: "Playa Chiquita, Puerto Viejo · Costa Rica",
    tagline: "Stay Long Enough for the Caribbean to Slow You Down.",
    images: [
      {
        url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/75a700e59_2519c4d70_67f59e112bea9b8db9f4408a_1_hac_hero.jpg",
        alt: "Aguas Claras pool at dusk, fringed by tropical greenery",
      },
      {
        url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/623f3abfa_8f19ce550_67f97e530273fe50b6b7c582_4_hac_carousel-3.avif",
        alt: "Aguas Claras bungalow exteriors amid lush gardens",
      },
    ],
    options: [
      { nights: "4 Nights", title: "The Caribbean Rhythm", note: "One rewarded moment" },
      { nights: "5 Nights", title: "One More Swim", note: "Two rewarded moments" },
    ],
    sectionTitle: "More Time. More Sea. More Slow.",
    body:
      "Begin with the mornings that call to you, a swim in the calm cove, a yoga shala session, a slow Papaya breakfast, then stay long enough for Playa Chiquita to become a rhythm rather than a stop.",
    validity: {
      bookBy: "November 30, 2026",
      stayThrough: "December 20, 2026",
      note: "Offer valid for new enquiries made between October 1 and November 30, 2026, for stays completed by December 20, 2026. Selected bungalows and dates; subject to availability.",
    },
    included: [
      "Daily breakfast for two at Papaya restaurant",
      "One private beach bonfire with live music (5-night stays)",
      "Cacao ceremony for two led by a community practitioner",
      "Complimentary beach bicycles and yoga shala sessions",
    ],
    excluded: [
      "International and domestic airfare",
      "Private transfers from San José or Puerto Limón",
      "Spa therapies beyond the wellness program",
      "Full-board dining upgrades and beach club charges",
      "National park and guided excursion fees",
    ],
    cta: "Choose Your Stay + Enquire",
    secondaryCta: "View All Offers",
  },
};