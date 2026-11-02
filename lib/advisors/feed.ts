import { ADVISORS, DEFAULT_ADVISOR, advisorCounts, advisorsFor, type Advisor } from "@/lib/content/advisors";
import { VOLUME_LABEL, type Volume } from "@/lib/content/advisor-desk";

// The advisor feed Iggi (and Safari Crux) read — Contract C3, "who should plan
// this?". Public fields only: no personal email or phone. Every line here is
// what the Desk already shows on the site, shaped for a conversation guide:
// specialties, volumes, countries, and each entry with both marks.
export type AdvisorFeedEntry = {
  ledgerId: string; name: string; place: string; countrySlug: string | null; regionSlug: string | null; volume: Volume;
  founderMark: string; founderYear: number | null; founderFavourite: boolean;
  advisorMark: string | null; advisorWhen: string | null; note: string | null;
};
export type AdvisorFeed = {
  slug: string; name: string; firstName: string; role: string; adv: string; standIn: boolean; isDefault: boolean;
  profile: string; plan: string; portrait: string | null; line: string;
  specialties: string[]; volumes: { key: Volume; label: string }[]; countries: string[]; languages: string[]; base: string | null;
  counts: { carried: number; guests: number; folios: number; slept: number };
  entries: AdvisorFeedEntry[];
  // Stage 4b: the Library's Advisor DNA (Contract C5), the same record matchAdvisor reads; null for stand-ins.
  dna: { pathways: string[]; partyTypes: string[]; availability: string; confirmed: string | null; marks: { ledgerId: string; mark: string; when: string | null; note: string | null }[] } | null;
};

const BASE = "https://house-of-james-wild-new.vercel.app";

export function advisorFeed(a: Advisor): AdvisorFeed | null {
  // A Desk (entries) or Library DNA makes an advisor nameable; a card alone does not.
  if (!a.desk && !a.dna) return null;
  const d = a.desk;
  const dna = a.dna ?? null;
  return {
    slug: a.slug, name: a.name, firstName: a.firstName, role: a.role, adv: a.ledgerId ?? d?.adv ?? "", standIn: !!a.sample, isDefault: a.slug === DEFAULT_ADVISOR,
    profile: `${BASE}${a.profileHref ?? "/about/team#advisors"}`, plan: `${BASE}/plan?advisor=${a.slug}`, portrait: a.portrait?.url ?? null, line: a.line ?? d?.line ?? "",
    specialties: dna?.specialties.length ? dna.specialties : d?.specialties ?? a.specialties,
    volumes: (dna?.volumes ?? d?.volumes ?? []).map((v) => ({ key: v, label: VOLUME_LABEL[v] })),
    countries: dna?.countries ?? d?.countries ?? [], languages: dna?.languages.length ? dna.languages : d?.languages ?? [], base: d?.base ?? null,
    counts: advisorCounts(a),
    dna: dna ? { pathways: dna.pathways, partyTypes: dna.partyTypes, availability: dna.availability, confirmed: dna.confirmed, marks: dna.marks } : null,
    entries: (d?.entries ?? []).map((e) => ({
      ledgerId: e.ledgerId, name: e.name, place: e.place, countrySlug: e.countrySlug, regionSlug: e.regionSlug, volume: e.volume,
      founderMark: e.james.mark, founderYear: e.james.year ?? null, founderFavourite: !!e.james.favourite,
      advisorMark: e.theirs?.mark ?? null, advisorWhen: e.theirs?.when ?? null, note: e.note ?? null,
    })),
  };
}

export const allAdvisorFeeds = () => ADVISORS.map(advisorFeed).filter((x): x is AdvisorFeed => !!x);

/** Who should plan a journey to this place: the house's answer, default advisor first. */
export function whoShouldPlan(where: { countrySlug?: string | null; regionSlug?: string | null; volume?: Volume; ledgerId?: string | null }) {
  const { advisors, slept } = advisorsFor(where);
  return { slept, advisors: advisors.map(advisorFeed).filter((x): x is AdvisorFeed => !!x) };
}
