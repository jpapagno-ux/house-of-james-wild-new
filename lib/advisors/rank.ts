// Who plans a place — the pure ranking behind "Who plans it" (Stage 4b, 1 Nov 2026).
// Kept free of site imports so plain Node can test it. Inputs are the advisor
// facts the site holds: Desk entries (the sample desks and James's), and the
// Library's Advisor DNA (what the advisor states: countries, volumes, availability)
// with the advisor's own marks on Ledger records.
//
// Order: marked on this record / in this country (James first, then by guests)
//   → the advisor's own Library mark here
//   → states they know the country (and works in the volume), unless closed.

export type RankEntry = { ledgerId: string; countrySlug: string | null; regionSlug: string | null; volume: string; guests: number; theirs: { mark: string } | null };
export type RankMark = { ledgerId: string; mark: string };
export type RankDna = { countries: string[]; volumes: string[]; availability: string; marks: RankMark[] } | null | undefined;
export type Rankable<T> = { a: T; slug: string; entries: RankEntry[]; dna: RankDna; deskCountries: string[]; deskVolumes: string[] };
export type Where = { countrySlug?: string | null; regionSlug?: string | null; volume?: string; ledgerId?: string | null };

export function rankAdvisors<T>(pool: Rankable<T>[], where: Where, opts: { defaultSlug: string; countryOfRecord: (ledgerId: string) => string | null }): { advisors: T[]; slept: number; carried: number } {
  const match = (e: RankEntry) =>
    (where.ledgerId ? e.ledgerId === where.ledgerId : true) &&
    (where.countrySlug ? e.countrySlug === where.countrySlug : true) &&
    (where.regionSlug ? e.regionSlug === where.regionSlug : true) &&
    (where.volume ? e.volume === where.volume : true);
  const hits = pool.map((r) => ({ r, es: r.entries.filter(match) })).filter((x) => x.es.length);
  hits.sort((x, y) => (x.r.slug === opts.defaultSlug ? -1 : y.r.slug === opts.defaultSlug ? 1 : y.es.reduce((n, e) => n + e.guests, 0) - x.es.reduce((n, e) => n + e.guests, 0)));
  const markHere = (r: Rankable<T>) => (r.dna?.marks ?? []).filter((m) => (where.ledgerId ? m.ledgerId === where.ledgerId : where.countrySlug ? opts.countryOfRecord(m.ledgerId) === where.countrySlug : false));
  const marked = pool.filter((r) => !hits.some((h) => h.r === r) && markHere(r).length);
  const countries = (r: Rankable<T>) => r.dna?.countries ?? r.deskCountries;
  const volumes = (r: Rankable<T>) => r.dna?.volumes ?? r.deskVolumes;
  const knows = where.countrySlug
    ? pool.filter((r) => !hits.some((h) => h.r === r) && !marked.includes(r) && countries(r).includes(where.countrySlug!) && (!where.volume || volumes(r).includes(where.volume)) && r.dna?.availability !== "closed")
    : [];
  return {
    advisors: [...hits.map((x) => x.r.a), ...marked.map((r) => r.a), ...knows.map((r) => r.a)],
    slept: hits.filter((x) => x.es.some((e) => e.theirs && e.theirs.mark !== "Sent Guests")).length + marked.filter((r) => markHere(r).some((m) => m.mark !== "Sent Guests")).length,
    carried: hits.reduce((n, x) => n + x.es.length, 0) + marked.reduce((n, r) => n + markHere(r).length, 0),
  };
}
