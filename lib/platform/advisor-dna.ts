// Advisor Desk · part five · Advisor DNA. Pure helpers, no imports, so plain Node can test them.
// The database checks the same rules again (private.clean_advisor_dna); these shape the form, the
// starting values, the review on the house desk and the overlay the website builds from.

export const DNA_PATHWAYS = ["PATH-01", "PATH-02", "PATH-03", "PATH-04", "PATH-05", "PATH-06", "PATH-07", "PATH-08"] as const;
export const DNA_VOLUMES: [string, string][] = [["stays", "Stays"], ["safaris", "Safaris"], ["gatherings", "Gatherings"], ["voyages", "Voyages"], ["overland", "Overland"], ["europe", "The Other Europe"]];
export const DNA_PARTIES: [string, string][] = [["couple", "Couples"], ["family", "Families"], ["friends", "Friends"], ["solo", "Solo travellers"], ["group", "Groups"]];
export const DNA_AVAILABILITY: [string, string, string][] = [
  ["open", "Taking new clients", "The site names you on the pages you know."],
  ["waitlist", "Waitlist", "The site still names you; new clients are told you have a waitlist."],
  ["closed", "Not taking new clients", "The site stops naming you for places you only know; your own marks stay."],
];
export const DNA_MARKS = ["Stayed", "Walked It", "Sailed It"] as const;
export type DnaMark = { ledgerId: string; mark: (typeof DNA_MARKS)[number]; when: string | null; note: string | null };

/** What the advisor sends, in the database's own names. */
export type DnaInput = {
  pathways: string[]; volumes: string[]; party_types: string[]; countries: string[]; languages: string[]; specialties: string[];
  availability: "open" | "waitlist" | "closed"; match_note: string | null; marks: DnaMark[];
};
export const EMPTY_DNA: DnaInput = { pathways: [], volumes: [], party_types: [], countries: [], languages: [], specialties: [], availability: "open", match_note: null, marks: [] };

/** The Library's copy (lib/content/advisors-library.json) as a starting point for the form. */
export type LibraryDna = { pathways: string[]; volumes: string[]; partyTypes: string[]; countries: string[]; languages: string[]; specialties: string[]; availability: string; matchNote: string | null; marks: { ledgerId: string; mark: string; when: string | null; note: string | null }[] };
export function fromLibrary(d: LibraryDna | null | undefined): DnaInput {
  if (!d) return EMPTY_DNA;
  return {
    pathways: d.pathways, volumes: d.volumes, party_types: d.partyTypes, countries: d.countries, languages: d.languages, specialties: d.specialties,
    availability: (["open", "waitlist", "closed"].includes(d.availability) ? d.availability : "open") as DnaInput["availability"], match_note: d.matchNote,
    marks: d.marks.filter((m) => (DNA_MARKS as readonly string[]).includes(m.mark)).map((m) => ({ ...m, mark: m.mark as DnaMark["mark"] })),
  };
}

type Result<T> = { ok: true; value: T } | { ok: false; message: string; field: string };
const uniq = (a: unknown, max: number) => Array.from(new Set((Array.isArray(a) ? a : []).filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean))).slice(0, max);
const words = (a: unknown) => (typeof a === "string" ? a.split(",") : Array.isArray(a) ? a : []);

/** The form's values made tidy; the same rules as the database, so the message comes before the round trip. */
export function parseDna(f: Record<string, unknown>): Result<DnaInput> {
  const pathways = uniq(f.pathways, 8);
  if (!pathways.length || pathways.some((p) => !(DNA_PATHWAYS as readonly string[]).includes(p))) return { ok: false, message: "Choose at least one Pathway", field: "pathways" };
  const volumes = uniq(f.volumes, 6);
  if (!volumes.length || volumes.some((v) => !DNA_VOLUMES.some(([k]) => k === v))) return { ok: false, message: "Choose at least one volume", field: "volumes" };
  const party_types = uniq(f.party_types, 5);
  if (party_types.some((v) => !DNA_PARTIES.some(([k]) => k === v))) return { ok: false, message: "Choose who you plan for from the list", field: "party_types" };
  const countries = uniq(f.countries, 60);
  if (!countries.length) return { ok: false, message: "Choose at least one country you know first-hand", field: "countries" };
  if (countries.some((c) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c))) return { ok: false, message: "Choose countries from the list", field: "countries" };
  const languages = uniq(words(f.languages), 12);
  const specialties = uniq(words(f.specialties), 12);
  if ([...languages, ...specialties].some((x) => x.length > 80)) return { ok: false, message: "Keep each language and specialty short", field: "specialties" };
  const availability = (typeof f.availability === "string" ? f.availability : "open") as DnaInput["availability"];
  if (!["open", "waitlist", "closed"].includes(availability)) return { ok: false, message: "Choose whether you are taking clients", field: "availability" };
  const match_note = typeof f.match_note === "string" && f.match_note.trim() ? f.match_note.trim().replace(/\s+/g, " ") : null;
  if (match_note && match_note.length > 300) return { ok: false, message: "Keep your line under 300 characters", field: "match_note" };
  const marks: DnaMark[] = [];
  for (const m of Array.isArray(f.marks) ? f.marks : []) {
    const x = m as Record<string, unknown>;
    const ledgerId = String(x.ledgerId ?? ""), mark = String(x.mark ?? ""), when = String(x.when ?? "").trim(), note = String(x.note ?? "").trim();
    if (!/^[A-Z]{3}-\d{4}-\d{6}$/.test(ledgerId) || !(DNA_MARKS as readonly string[]).includes(mark)) return { ok: false, message: "Mark each stay as Stayed, Walked It or Sailed It", field: "marks" };
    if (!/^[A-Za-z0-9 ,.-]{0,20}$/.test(when)) return { ok: false, message: "Say when you were there in a few words, like May 2024", field: "marks" };
    if (note.length > 200) return { ok: false, message: "Keep each note under 200 characters", field: "marks" };
    if (!marks.some((y) => y.ledgerId === ledgerId)) marks.push({ ledgerId, mark: mark as DnaMark["mark"], when: when || null, note: note || null });
  }
  if (marks.length > 80) return { ok: false, message: "Up to 80 marks", field: "marks" };
  return { ok: true, value: { pathways, volumes, party_types, countries, languages, specialties, availability, match_note, marks } };
}

/** What changed between the published DNA and a proposal, for the house's review. */
export function dnaChanges(before: DnaInput | null, after: DnaInput): { field: string; added: string[]; removed: string[]; now?: string }[] {
  const b = before ?? EMPTY_DNA;
  const out: { field: string; added: string[]; removed: string[]; now?: string }[] = [];
  const list = (field: string, x: string[], y: string[]) => {
    const added = y.filter((v) => !x.includes(v)), removed = x.filter((v) => !y.includes(v));
    if (added.length || removed.length) out.push({ field, added, removed });
  };
  list("Pathways", b.pathways, after.pathways); list("Volumes", b.volumes, after.volumes); list("Plans for", b.party_types, after.party_types);
  list("Countries", b.countries, after.countries); list("Languages", b.languages, after.languages); list("Specialties", b.specialties, after.specialties);
  list("Marks", b.marks.map((m) => `${m.ledgerId} ${m.mark}`), after.marks.map((m) => `${m.ledgerId} ${m.mark}`));
  if (b.availability !== after.availability) out.push({ field: "Taking clients", added: [], removed: [], now: after.availability });
  if ((b.match_note ?? "") !== (after.match_note ?? "")) out.push({ field: "Their line", added: [], removed: [], now: after.match_note ?? "(none)" });
  return out;
}

// ===== The website's overlay: the desk's approved DNA over the Library's copy, advisor by advisor.
export type DeskDna = { slug: string; ledgerId: string; hidden: boolean } & Partial<LibraryDna & { confirmed: string | null; updated: string | null }>;
/** Desk wins where it has an advisor; hidden (paused or left) keeps the Library's marks but closes them to new
 *  places; an advisor the desk has not reached keeps the Library's copy unchanged. */
export function overlayDna<T extends LibraryDna & { slug: string; ledgerId: string }>(library: T[], desk: DeskDna[]): (T & { source: "desk" | "library" })[] {
  const bySlug = new Map(desk.map((d) => [d.slug, d]));
  const out = library.map((l) => {
    const d = bySlug.get(l.slug);
    if (!d) return { ...l, source: "library" as const };
    if (d.hidden) return { ...l, availability: "closed", source: "library" as const };
    // Sent Guests comes from bookings, not from the advisor, so the Library's stay with the desk's own marks.
    const sent = l.marks.filter((m) => m.mark === "Sent Guests" && !(d.marks ?? []).some((x) => x.ledgerId === m.ledgerId));
    return { ...l, ...d, marks: [...(d.marks ?? []), ...sent], ledgerId: l.ledgerId, source: "desk" as const } as T & { source: "desk" };
  });
  for (const d of desk) if (!d.hidden && !library.some((l) => l.slug === d.slug)) out.push({ ...(d as unknown as T), source: "desk" as const });
  return out;
}
