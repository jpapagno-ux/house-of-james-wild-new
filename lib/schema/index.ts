import { SITE } from "../site";
import { absoluteUrl } from "../seo";

// Schema.org builders, one per type the blueprint names. Every page emits a
// single JSON-LD @graph through <JsonLd />. Ids are stable so nodes reference
// each other (a stay's publisher is the house, an article's author is James).
// Rule: schema only states what the visible page states.

export type Thing = Record<string, unknown>;

export const ids = {
  house: absoluteUrl("/#house"),
  founder: absoluteUrl("/about/founder#james"),
  website: absoluteUrl("/#website"),
};

export function organization(): Thing {
  return {
    "@type": ["Organization", "TravelAgency"],
    "@id": ids.house,
    name: SITE.name,
    alternateName: ["House of James Wild & Co", "Wild Earth Stays"],
    url: SITE.url,
    slogan: SITE.tagline,
    description: SITE.description,
    telephone: SITE.phone.tel,
    ...(SITE.email ? { email: SITE.email } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    founder: { "@id": ids.founder },
    identifier: SITE.credentials.map((c) => ({ "@type": "PropertyValue", propertyID: c.label, value: c.value })),
    memberOf: SITE.memberships.map((m) => ({ "@type": "Organization", name: m })),
    sameAs: SITE.social.map((s) => s.url),
  };
}

export function founder(): Thing {
  return {
    "@type": "Person",
    "@id": ids.founder,
    name: SITE.founder.name,
    alternateName: SITE.founder.alternateName,
    jobTitle: SITE.founder.jobTitle,
    worksFor: { "@id": ids.house },
    url: absoluteUrl("/about/founder"),
  };
}

export function website(): Thing {
  return {
    "@type": "WebSite",
    "@id": ids.website,
    url: SITE.url,
    name: SITE.name,
    publisher: { "@id": ids.house },
    inLanguage: "en-US",
  };
}

export function breadcrumbs(trail: { name: string; path: string }[]): Thing {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: absoluteUrl(t.path) })),
  };
}

export function faqPage(faqs: { q: string; a: string }[]): Thing {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

// Stays: LodgingBusiness (or a subtype such as Resort / Campground).
export function lodging(s: {
  path: string;
  name: string;
  description: string;
  image?: string[];
  subtype?: "LodgingBusiness" | "Resort" | "Hotel" | "Campground";
  locality?: string;
  country?: string;
  geo?: { lat: number; lng: number };
  ledgerId?: string;
}): Thing {
  return {
    "@type": s.subtype || "LodgingBusiness",
    "@id": absoluteUrl(`${s.path}#stay`),
    name: s.name,
    url: absoluteUrl(s.path),
    description: s.description,
    ...(s.image?.length ? { image: s.image } : {}),
    ...(s.locality || s.country
      ? { address: { "@type": "PostalAddress", addressLocality: s.locality, addressCountry: s.country } }
      : {}),
    ...(s.geo ? { geo: { "@type": "GeoCoordinates", latitude: s.geo.lat, longitude: s.geo.lng } } : {}),
    ...(s.ledgerId ? { identifier: { "@type": "PropertyValue", propertyID: "Ledger ID", value: s.ledgerId } } : {}),
  };
}

// Overland routes and voyages: TouristTrip whose itinerary lists the stays.
export function touristTrip(t: {
  path: string;
  name: string;
  description: string;
  stays?: { name: string; path: string }[];
}): Thing {
  return {
    "@type": "TouristTrip",
    "@id": absoluteUrl(`${t.path}#trip`),
    name: t.name,
    url: absoluteUrl(t.path),
    description: t.description,
    provider: { "@id": ids.house },
    ...(t.stays?.length
      ? {
          itinerary: {
            "@type": "ItemList",
            itemListElement: t.stays.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: { "@type": "LodgingBusiness", name: s.name, url: absoluteUrl(s.path) },
            })),
          },
        }
      : {}),
  };
}

export function article(a: { path: string; headline: string; description: string; datePublished: string; image?: string }): Thing {
  return {
    "@type": "Article",
    "@id": absoluteUrl(`${a.path}#article`),
    headline: a.headline,
    description: a.description,
    datePublished: a.datePublished,
    author: { "@id": ids.founder },
    publisher: { "@id": ids.house },
    mainEntityOfPage: absoluteUrl(a.path),
    ...(a.image ? { image: a.image } : {}),
  };
}

export const graph = (...nodes: Thing[]) => ({ "@context": "https://schema.org", "@graph": nodes });
