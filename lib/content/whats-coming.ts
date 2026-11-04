import data from "./whats-coming.json";
import { activeOnly } from "@/lib/dates";

// What's coming (James, 31 Oct 2026): lodges announced, opening or being
// rebuilt, filed before they open. Read from the Library (coming_status,
// coming_date, coming_note) by scripts/export-coming.py on every sync.
export type ComingStatus = "announced" | "opening" | "rebuilding" | "reopened";
export type Coming = {
  slug: string; name: string; ledgerId: string | null;
  country: string | null; countrySlug: string | null; regionSlug: string | null;
  status: ComingStatus; date: string | null; note: string | null; tagline: string | null;
  hero: string | null; source: string | null; href: string | null;
  bestMonths: string | null; airport: string | null; volume: string | null;
};

// One date rule (lib/dates.ts): once an announced, opening or rebuilding
// lodge's date has passed, it has opened and leaves "coming" (a month or a
// year counts to its last day). "Reopened" entries are already open by
// definition and stay until the library takes them off.
const FILED = (data as { coming: Coming[] }).coming;
export const COMING = activeOnly(FILED, (c) => (c.status === "reopened" ? null : c.date));
/** The entries still coming on a given day (YYYY-MM-DD); pages call this at render so a daily rebuild re-checks. */
export const comingOn = (day?: string): Coming[] => activeOnly(FILED, (c) => (c.status === "reopened" ? null : c.date), day);

// Media for the What's Coming pages. The library export carries a hero URL only; alt text and credit
// come from the Cloudinary asset context. FALLBACK_HERO holds a brand image the export doesn't carry
// yet: andBeyond's own Xaranna render, already in Cloudinary. Remove the entry once the library
// record's hero is set (then the export fills c.hero and this map is not read).
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const MEDIA: Record<string, { hero?: string; alt: string; credit?: string }> = {
  "singita-elela": { alt: "Singita Elela, Okavango Delta, Botswana", credit: "Singita" },
  "beyond-xaranna-okavango-delta-camp-by-and-beyond": {
    hero: `${CLD}/f_auto,q_auto/wildco/botswana/okavango-delta/and-beyond-xaranna/and-beyond-xaranna-render-exterior`,
    alt: "An artist's render of the rebuilt Xaranna Okavango Delta Lodge, Okavango Delta, Botswana",
    credit: "Image courtesy of andBeyond (render)",
  },
};
/** The hero for a coming entry, sized for a full-bleed frame (Cloudinary sources capped at 2400w), or null. */
export function comingHero(c: Coming): { src: string; alt: string; credit: string | null } | null {
  const m = MEDIA[c.slug];
  const raw = c.hero ?? m?.hero ?? null;
  if (!raw) return null;
  const src = raw.includes("res.cloudinary.com") ? raw.replace(/\/upload\/(?:[a-z]_[^/]*\/)?/, "/upload/c_limit,w_2400,q_auto:good/") : raw;
  return { src, alt: m?.alt ?? [c.name, c.country].filter(Boolean).join(", "), credit: m?.credit ?? null };
}
export const COMING_EXPORTED_ON = (data as { exportedOn: string }).exportedOn;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "11 December 2026" / "August 2027" / "2027" from YYYY-MM-DD, YYYY-MM or YYYY. */
export function whenLabel(date: string | null): string | null {
  if (!date) return null;
  const [y, m, d] = date.split("-");
  if (!y) return null;
  if (!m) return y;
  const month = MONTHS[Number(m) - 1] ?? "";
  return d ? `${Number(d)} ${month} ${y}` : `${month} ${y}`;
}
export const STATUS_LABEL: Record<ComingStatus, string> = { announced: "Announced", opening: "Opening", rebuilding: "Rebuilding", reopened: "Reopened" };
export function statusLine(c: Coming): string {
  const when = whenLabel(c.date);
  if (c.status === "rebuilding") return when ? `Reopening ${when}` : "Being rebuilt";
  if (c.status === "opening") return when ? `Opens ${when}` : "Opening";
  if (c.status === "reopened") return when ? `Reopened ${when}` : "Reopened";
  return when ? `Announced for ${when}` : "Announced";
}
export function sourceHost(url: string | null): string | null {
  try { return url ? new URL(url).hostname.replace(/^www\./, "") : null; } catch { return null; }
}

// The page scales by region (James, 2 Nov 2026): one group per region, in the order the house lists
// regions, and inside each group by opening date (undated last), then name. Past openings have already
// left COMING through the date rule above, so a group with nothing left simply doesn't appear.
export type ComingGroup = { slug: string; name: string; items: Coming[] };
export function groupByRegion(items: readonly Coming[], regions: readonly { slug: string; name: string }[]): ComingGroup[] {
  const order = new Map(regions.map((r, i) => [r.slug, i]));
  const by = new Map<string, Coming[]>();
  for (const c of items) { const k = c.regionSlug ?? "elsewhere"; by.set(k, [...(by.get(k) ?? []), c]); }
  return [...by.entries()]
    .sort(([a], [b]) => (order.get(a) ?? 99) - (order.get(b) ?? 99))
    .map(([slug, list]) => ({ slug, name: regions.find((r) => r.slug === slug)?.name ?? "Elsewhere",
      items: [...list].sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999") || a.name.localeCompare(b.name)) }));
}
