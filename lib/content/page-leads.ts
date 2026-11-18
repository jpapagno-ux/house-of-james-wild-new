// Which advisor the header and the phone bar name on a page (James, 18 Nov 2026: "Plan with" follows the page).
// Kept import-free so the client header can read it without pulling in the advisor library. Every advisor with
// `leads` in lib/content/advisors.ts must have a line here (tests/page-leads.test.ts checks).
export type PageLead = { advisor: string; first: string; country: string; paths: string[] };

export const PAGE_LEADS: PageLead[] = [
  { advisor: "anthony-papagno", first: "Anthony", country: "indonesia", paths: ["/indonesia", "/raja-ampat", "/komodo", "/ships/aliikai"] },
];

/** The lead for a path, or null (then the page plans with James). */
export function leadForPath(path: string | null | undefined): PageLead | null {
  if (!path) return null;
  return PAGE_LEADS.find((l) => l.paths.some((p) => path === p || path.includes(`${p}/`) || path.endsWith(p))) ?? null;
}

export const planFor = (path: string | null | undefined) => {
  const l = leadForPath(path);
  return l ? { label: `Plan with ${l.first}`, href: `/plan?advisor=${l.advisor}&destination=${l.country}` } : { label: "Plan with James", href: "/plan" };
};
