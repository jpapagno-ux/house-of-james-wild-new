// One URL rule per record kind, so every link to a record agrees with the
// site map: stays under /stays, African reserves (and their camps) under
// /safaris, residences under /gatherings, ships and voyages under /voyages,
// routes under /overland. Slugs are the library's own.
export type RecordKind = "stay" | "reserve" | "camp" | "residence" | "ship" | "voyage" | "route";

export function recordHref(kind: RecordKind, slug: string, parent?: string) {
  switch (kind) {
    case "reserve": return `/safaris/${slug}`;
    case "camp": return `/safaris/${parent}/${slug}`;
    case "residence": return `/gatherings/${slug}`;
    case "ship": return `/voyages/${slug}`;
    case "voyage": return `/voyages/${parent}/${slug}`;
    case "route": return `/overland/${slug}`;
    default: return `/stays/${slug}`;
  }
}
