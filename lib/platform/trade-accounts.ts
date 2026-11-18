// Trade accounts (James, 18 Nov 2026): supplier accounts the house holds that advisors book OFF the
// site, on the supplier's own agent platform (cruise lines, hotel programs, theme parks). One Airtable
// table, "Trade Accounts", in the Enquiries base; read by the Advisor Desk (/advisor/accounts) and the
// house desk (/desk/trade-accounts).
//
// Rules:
//  - Only rows with "Show on Desk" ticked and Status not Paused are listed.
//  - "Open to" decides who sees a row: All advisors, Named advisors (linked in "Named advisors"), or
//    House only. A blank "Open to" is treated as House only.
//  - "House notes" is never read. No usernames or passwords live in the table: a shared house login is
//    kept in the password manager and only its link ("Vault link") is shown.
//  - The supplier's agent address is printed as text, never as a link (CLAUDE.md, no outbound links).
//
// Pure helpers only (no imports, no network) so plain Node can test them. The fetch is in
// trade-accounts-data.ts.

export const TRADE_ACCOUNTS_TABLE = "tblOgHWu3OI9stH8k";

// Field IDs from the base: stable across renames.
export const TA = {
  supplier: "fldsScaGPZsTtZ3FO", category: "fldL4uI4ho5dpOr7p", brands: "fldIykteRcFPHFZgy", portal: "fldCP8xkkRbpazwrE",
  bookUnder: "fldv1nsIWjDj37Mqp", loginType: "fldEPN79G8ZfCEk9h", access: "fld3tLfk9kxWdaNuz", commissionNote: "fldflZwJt1ZVThcsK",
  bookingNotes: "fldYkFJA95XmNav4c", support: "fldgLRHP0nuvzAFAJ", vault: "fldIqBur9jnwNaAdF", openTo: "fld9ZMBmGGwG8IzJy",
  named: "fldkgH4hGYs19b968", status: "fldpAQQMQrIhcLKg5", show: "fldBye9uuCSCye1VR", lastChecked: "fldWd07LGl4DKerfr",
} as const;

export const CATEGORY_ORDER = ["Cruise", "Hotel program", "Theme park & resort", "Air & rail", "Tours & ground", "Insurance", "Other"];

export type OpenTo = "All advisors" | "Named advisors" | "House only";
export type TradeAccount = {
  id: string; supplier: string; category: string; brands: string;
  /** The supplier's agent site, shown as text. Host and path only, no scheme. */
  portal: string;
  bookUnder: string; loginType: string; access: string; commissionNote: string; bookingNotes: string; support: string;
  /** https link to the shared login's entry in the house password manager; "" unless the login is shared. */
  vaultUrl: string;
  openTo: OpenTo; named: string[]; confirmed: boolean; lastChecked: string;
};

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
/** Only https addresses are kept, so a bad cell can never become a script link. */
export const httpsUrl = (v: unknown) => { const s = text(v); return /^https:\/\/[^\s]+$/i.test(s) ? s : ""; };
/** "https://www.example.com/agents/" -> "example.com/agents" */
export const displayAddress = (v: unknown) => httpsUrl(v).replace(/^https:\/\/(www\.)?/i, "").replace(/\/+$/, "");

/** One Airtable record (fields keyed by field ID) -> a TradeAccount, or null when it must not be listed. */
export function toTradeAccount(rec: { id: string; fields: Record<string, unknown> }): TradeAccount | null {
  const f = rec.fields;
  const supplier = text(f[TA.supplier]);
  if (!supplier || f[TA.show] !== true || text(f[TA.status]) === "Paused") return null;
  const loginType = text(f[TA.loginType]) || "To confirm";
  const open = text(f[TA.openTo]);
  return {
    id: rec.id, supplier, category: text(f[TA.category]) || "Other", brands: text(f[TA.brands]), portal: displayAddress(f[TA.portal]),
    bookUnder: text(f[TA.bookUnder]), loginType, access: text(f[TA.access]), commissionNote: text(f[TA.commissionNote]),
    bookingNotes: text(f[TA.bookingNotes]), support: text(f[TA.support]),
    vaultUrl: loginType === "Shared house login" ? httpsUrl(f[TA.vault]) : "",
    openTo: open === "All advisors" || open === "Named advisors" ? open : "House only",
    named: Array.isArray(f[TA.named]) ? (f[TA.named] as unknown[]).filter((x): x is string => typeof x === "string") : [],
    confirmed: text(f[TA.status]) === "Active", lastChecked: text(f[TA.lastChecked]),
  };
}

/** What one advisor may see. advisorRecordId is their row in the Airtable Advisors table (matched by slug), if any. */
export function visibleToAdvisor(accounts: TradeAccount[], advisorRecordId: string | null): TradeAccount[] {
  return accounts.filter((a) => a.openTo === "All advisors" || (a.openTo === "Named advisors" && !!advisorRecordId && a.named.includes(advisorRecordId)));
}

/** Grouped by category in the house order, suppliers A to Z inside each. */
export function byCategory(accounts: TradeAccount[]): [string, TradeAccount[]][] {
  const m = new Map<string, TradeAccount[]>();
  for (const a of accounts) m.set(a.category, [...(m.get(a.category) ?? []), a]);
  const rank = (c: string) => { const i = CATEGORY_ORDER.indexOf(c); return i < 0 ? CATEGORY_ORDER.length : i; };
  return [...m.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b)).map(([c, l]) => [c, [...l].sort((x, y) => x.supplier.localeCompare(y.supplier))]);
}
