// Hosts on the Partner Desk (James, 4 Nov 2026). Pure: shared by the page, the API and tests.
// A partner proposes who hosts a page ("Meet your host"); the house approves; the partner switches the
// card on or off. Contact details never reach the website: only the name, title and the card's line.

export type HostProposal = { pageKey: string; name: string; jobTitle: string | null; company: string | null; cardLine: string; place: string | null; contactId: string | null; note: string | null };
type Fail = { ok: false; message: string; field: string };
const fail = (message: string, field: string): Fail => ({ ok: false, message, field });
const s = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const PAGE_KEY = /^(stay|camp|reserve|voyage|trip):[a-z0-9/_-]{1,160}$/;
const DASH = /[–—]/;

/** "Your host · Sales Manager, Londolozi": the line under the name on the card. */
export function cardLine(jobTitle: string | null, company: string | null): string {
  const t = [jobTitle, company].filter(Boolean).join(", ");
  return t ? `Your host · ${t}` : "Your host";
}

export function parseHostProposal(raw: unknown, pages: string[], contacts: { id: string; name: string; title: string | null }[]): { ok: true; value: HostProposal } | Fail {
  const r = (raw ?? {}) as Record<string, unknown>;
  const pageKey = s(r.pageKey);
  if (!PAGE_KEY.test(pageKey) || !pages.includes(pageKey)) return fail("Choose one of your pages", "pageKey");
  const contactId = s(r.contactId) || null;
  if (contactId && (!UUID.test(contactId) || !contacts.some((c) => c.id === contactId))) return fail("Choose one of your contacts", "contactId");
  const picked = contacts.find((c) => c.id === contactId);
  const name = (s(r.name) || picked?.name || "").slice(0, 120);
  if (name.length < 2) return fail("Who hosts the call? Their name, as guests will see it", "name");
  const jobTitle = (s(r.jobTitle) || picked?.title || "").slice(0, 120) || null;
  const company = s(r.company).slice(0, 120) || null;
  const place = s(r.place).slice(0, 120) || null;
  const note = s(r.note).slice(0, 1000) || null;
  for (const [k, v] of [["name", name], ["jobTitle", jobTitle], ["company", company], ["place", place], ["note", note]] as const)
    if (v && DASH.test(v)) return fail("Please use a comma instead of a long dash", k);
  return { ok: true, value: { pageKey, name, jobTitle, company, cardLine: cardLine(jobTitle, company).slice(0, 200), place, contactId, note } };
}

export const VOLUME_LABEL: Record<string, string> = { stays: "Stays", safaris: "Safaris", gatherings: "Gatherings", voyages: "Voyages", europe: "The Other Europe", overland: "Overland" };
export const HOST_STATUS: Record<string, { label: string; tone: "progress" | "good" | "attention" | "neutral" }> = {
  proposed: { label: "With the house", tone: "progress" }, approved: { label: "Approved", tone: "good" },
  declined: { label: "Not approved", tone: "attention" }, retired: { label: "Replaced", tone: "neutral" },
};
