// Species pages for a place typed into the Atlas ("Rwanda", "Galapagos", "Kenya in August"). Pure, so it runs in the
// browser and under test. `by` is speciesByPlace() from ./by-place; `norm` is the Atlas's own normaliser.
export type SpeciesLink = { name: string; href: string };

export function wildlifeFor(where: string, by: Record<string, SpeciesLink[]>, norm: (s: string) => string): SpeciesLink[] {
  const w = norm(where);
  if (w.length < 4) return [];
  const hit = Object.keys(by).filter((p) => { const n = norm(p); return ` ${w} `.includes(` ${n} `) || n.split(" ").includes(w); });
  return [...new Map(hit.flatMap((p) => by[p]).map((s) => [s.href, s])).values()];
}
