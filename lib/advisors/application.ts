import { DNA_LANGUAGES, DNA_PARTY_LABELS, DNA_PATHWAY_NAMES, DNA_SPECIALTIES } from "../dna/vocabulary.ts";
// The advisor application (Stage 5, 31 Oct 2026): what the house asks of an
// advisor who wants to carry the Ledger. Validated here, on both sides.
export const APPLY_VOLUMES = ["Stays", "Safaris", "Gatherings", "Voyages", "Overland", "Other Europe"] as const;
// The six DNA questions (James, 18 Nov 2026): onboarding asks what the desk and the traveller match ask.
export const APPLY_SPECIALTIES = DNA_SPECIALTIES;
export const APPLY_PATHWAYS = DNA_PATHWAY_NAMES;
export const APPLY_PARTIES = DNA_PARTY_LABELS;
export const APPLY_LANGUAGES = DNA_LANGUAGES;
export const APPLY_STATUS = ["Independent advisor", "With an agency", "With a host agency or consortium", "New to the trade"] as const;
export const APPLY_HEARD = ["A traveller I planned for", "Another advisor", "Search", "Social", "ILTM or a trade event", "James"] as const;

export type Application = {
  name: string; email: string; phone: string; base: string;
  status: string; agency: string; years: string; iata: string;
  countries: string; volumes: string[]; specialties: string[];
  pathways: string[]; partyTypes: string[]; languages: string[];
  line: string; heard: string; message: string;
  website: string; // honeypot
};

export const EMPTY: Application = { name: "", email: "", phone: "", base: "", status: "", agency: "", years: "", iata: "", countries: "", volumes: [], specialties: [], pathways: [], partyTypes: [], languages: [], line: "", heard: "", message: "", website: "" };

export function validateApplication(a: Partial<Application>): Record<string, string> {
  const err: Record<string, string> = {};
  if (!a.name?.trim()) err.name = "Your name, please.";
  if (!a.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())) err.email = "An email address we can reply to.";
  if (!a.base?.trim()) err.base = "Where are you based?";
  if (!a.status || !(APPLY_STATUS as readonly string[]).includes(a.status)) err.status = "Choose one.";
  if (!a.countries?.trim()) err.countries = "Name the places you know first-hand, even one.";
  if (!a.volumes?.length) err.volumes = "Pick at least one volume you would carry.";
  if (a.volumes?.some((v) => !(APPLY_VOLUMES as readonly string[]).includes(v))) err.volumes = "Choose from the six volumes.";
  if (a.specialties?.some((v) => !(APPLY_SPECIALTIES as readonly string[]).includes(v))) err.specialties = "Choose from the list.";
  if (a.pathways?.some((v) => !APPLY_PATHWAYS.some((p) => p[0] === v))) err.pathways = "Choose from the Wild Pathways.";
  if (a.partyTypes?.some((v) => !APPLY_PARTIES.some((p) => p[0] === v))) err.partyTypes = "Choose from the list.";
  if (a.languages?.some((v) => !(APPLY_LANGUAGES as readonly string[]).includes(v))) err.languages = "Choose from the list.";
  if ((a.line ?? "").length > 300) err.line = "Keep the line under 300 characters.";
  if ((a.message ?? "").length > 2000) err.message = "Keep it under 2,000 characters.";
  return err;
}

/** The application as one plain-text note for the house (the Core's AdvisorLead and the inbox). */
export function applicationNotes(a: Application): string {
  const row = (k: string, v: string | string[] | undefined) => {
    if (Array.isArray(v)) return v.length ? `${k}: ${v.join(", ")}` : null;
    const t = (v ?? "").trim();
    return t ? `${k}: ${t}` : null;
  };
  return [
    row("Base", a.base), row("Status", a.status), row("Agency / host", a.agency), row("Years advising", a.years), row("IATA / CLIA", a.iata),
    row("Knows first-hand", a.countries), row("Would carry", a.volumes), row("Specialties", a.specialties),
    row("Wild Pathways", (a.pathways ?? []).map((id) => APPLY_PATHWAYS.find((p) => p[0] === id)?.[1] ?? id)),
    row("Plans best for", (a.partyTypes ?? []).map((id) => APPLY_PARTIES.find((p) => p[0] === id)?.[1] ?? id)),
    row("Languages", a.languages ?? []),
    row("In their words", a.line), row("Heard through", a.heard), row("Message", a.message),
  ].filter(Boolean).join("\n");
}
