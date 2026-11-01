// Roles across the James Wild & Co network (D-04). The database is the authority
// (RLS + security-definer functions); these helpers only decide what to SHOW.
// No imports, so plain Node can test it.

export type PartnerRole = "partner_admin" | "partner_contributor" | "partner_manager" | "partner_editor";
export type HouseRole = "jw_admin" | "jw_editor" | "jw_portfolio_manager" | "admin";
export type Role = PartnerRole | HouseRole | "finance" | "advisor";

export const PARTNER_ROLES: PartnerRole[] = ["partner_admin", "partner_contributor", "partner_manager", "partner_editor"];
export const HOUSE_ROLES: HouseRole[] = ["jw_admin", "jw_editor", "jw_portfolio_manager", "admin"];
export const HOUSE_EDITOR_ROLES: HouseRole[] = ["jw_admin", "jw_editor", "jw_portfolio_manager"];
/** Roles a partner admin may give a teammate. */
export const INVITABLE_PARTNER_ROLES: PartnerRole[] = ["partner_admin", "partner_contributor"];

export const ROLE_LABEL: Record<string, string> = {
  partner_admin: "Partner admin",
  partner_contributor: "Contributor",
  partner_manager: "Partner admin",
  partner_editor: "Contributor",
  jw_admin: "James Wild & Co · Admin",
  jw_editor: "James Wild & Co · Editor",
  jw_portfolio_manager: "James Wild & Co · Portfolio",
  admin: "James Wild & Co · Admin",
  finance: "Finance",
  advisor: "Advisor",
};

export const ROLE_LINE: Record<string, string> = {
  partner_admin: "Manages the team, company details and contacts; submits updates for every property.",
  partner_contributor: "Submits updates and answers requests for the properties they are given.",
};

export type Membership = {
  id: string;
  role: string;
  status: string;
  organization: { id: string; name: string; slug: string | null; type: "internal" | "agency" | "partner"; partner_code: string | null };
};

const active = (m: Membership) => m.status === "active";
export const isHouse = (ms: Membership[]) => ms.some((m) => active(m) && m.organization.type === "internal" && (HOUSE_ROLES as string[]).includes(m.role));
export const isHouseEditor = (ms: Membership[]) => ms.some((m) => active(m) && m.organization.type === "internal" && (HOUSE_EDITOR_ROLES as string[]).includes(m.role));
export const partnerMemberships = (ms: Membership[]) => ms.filter((m) => active(m) && m.organization.type === "partner" && (PARTNER_ROLES as string[]).includes(m.role));
export const isPartnerAdmin = (m: Membership | null | undefined) => !!m && active(m) && (m.role === "partner_admin" || m.role === "partner_manager");
