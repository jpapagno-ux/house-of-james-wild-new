// Resolve the places Iggi names (slug or Ledger ID, from the Core's journey) against the
// Ledger's pinned places (/atlas/places.json). Pure, so it is tested. Order is Iggi's order;
// a place named twice is pinned once; a place the Ledger cannot pin is reported by name.
export type IggiPlace = { slug?: string | null; ledger_id?: string | null; name?: string | null; reason?: string | null };
export type AtlasPlace = { slug: string; ledgerId: string | null; name: string; country: string | null; href: string; lat: number; lng: number };

export function resolveAtlasPlaces(stays: IggiPlace[], places: AtlasPlace[]): { fits: AtlasPlace[]; unpinned: string[] } {
  const bySlug = new Map(places.map((p) => [p.slug, p]));
  const byId = new Map(places.filter((p) => p.ledgerId).map((p) => [p.ledgerId!.toUpperCase(), p]));
  const seen = new Set<string>(); const fits: AtlasPlace[] = []; const unpinned: string[] = [];
  for (const s of stays) {
    const p = (s.ledger_id && byId.get(s.ledger_id.trim().toUpperCase())) || (s.slug && bySlug.get(s.slug.trim())) || null;
    if (p) { if (!seen.has(p.slug)) { seen.add(p.slug); fits.push(p); } }
    else if (s.name && s.name.trim()) unpinned.push(s.name.trim());
  }
  return { fits, unpinned };
}
