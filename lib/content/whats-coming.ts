import data from "./whats-coming.json";

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

export const COMING = (data as { coming: Coming[] }).coming;
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
