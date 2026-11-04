// Editorial adapter: the Intelligence Library's Stay record (stays.json
// export) plus the house's own notes (verdict, status) → StayEditorial.
// Nothing is written here that the library does not say.

import type { StayData } from "@/lib/content/stays";
import { verdictFor } from "@/lib/content/verdicts";
import { stampForStatus, statusLine, type HouseStatus } from "@/lib/ledger/status";
import type { StayEditorial } from "../contract";

const TOWN: Record<string, string> = { "leeu-estates": "Franschhoek", "le-quartier-francais": "Franschhoek", "leeu-house": "Franschhoek", "lion-sands": "Sabi Sand", "kayumanis-nusa-dua": "Nusa Dua, Bali", "kayumanis-ubud": "Ubud, Bali", "kayumanis-jimbaran-private-estates": "Jimbaran, Bali" };

export function editorialFrom(s: StayData): StayEditorial {
  const verdict = verdictFor(`stay:${s.slug}`);
  const town = TOWN[s.slug] ?? null;
  const place = [town, s.country].filter(Boolean).join(" · ") || null;
  const overview = (s.why.length ? s.why.map((w) => w.body) : s.onlyHere).filter(Boolean).slice(0, 2);
  return {
    slug: s.slug, ledgerId: s.ledgerId, name: s.name, place, country: s.country,
    tagline: s.tagline, quote: s.quote, overview,
    propertyFeatures: s.features.items.slice(0, 6),
    founderNote: s.founderNote,
    verdict: verdict ? { line: verdict.text[0], where: verdict.where ?? null, when: verdict.when ?? null } : null,
    status: { line: statusLine(s.status as HouseStatus, s.statusDate), stamp: stampForStatus(s.status as HouseStatus), date: s.statusDate },
    pathways: s.pathway && s.pathway.status === "approved" ? { primary: s.pathway.primary, secondary: s.pathway.secondary } : null,
    hero: s.hero ? { url: s.hero, alt: `${s.name}${s.country ? `, ${s.country}` : ""}`, source: s.hero.includes("res.cloudinary.com") ? "cloudinary" : "library" } : null,
    bestMonths: s.bestMonths,
  };
}
