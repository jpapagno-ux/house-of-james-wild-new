// One URL rule per record kind, so every link to a record agrees with the
// site map: stays under /stays, African reserves (and their camps) under
// /safaris, residences under /gatherings, routes under /overland/[country]
// and voyages under /voyages/[waters] (audit addendum, 25 Oct 2026); ships
// have their own page at /voyages/ships/[ship]. Slugs are the library's own.
export type RecordKind = "stay" | "reserve" | "camp" | "residence" | "ship" | "voyage" | "route";

export function recordHref(kind: RecordKind, slug: string, parent?: string) {
  switch (kind) {
    case "reserve": return `/safaris/${slug}`;
    case "camp": return `/safaris/${parent}/${slug}`;
    case "residence": return `/gatherings/${slug}`;
    case "ship": return `/voyages/ships/${slug}`;
    case "voyage": return `/voyages/${parent}/${slug}`; // parent = the waters, e.g. raja-ampat
    case "route": return `/overland/${parent}/${slug}`; // parent = the country
    default: return `/stays/${slug}`;
  }
}
