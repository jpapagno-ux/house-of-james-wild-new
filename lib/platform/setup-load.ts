import "server-only";
import type { DeskContext, OrgSummary } from "@/lib/platform/membership";
import { bankAccounts, commissionTerms, contacts, documents, policies, portfolio } from "@/lib/platform/queries";
import { setupProgress, setupStates, type SetupCounts } from "@/lib/platform/setup";

// /partner/setup (James, 19 Nov 2026): the guided set-up after an invitation. One step per part of the desk, each
// opening the page where it is filled in; a step with something on record is done, an optional one can be skipped.
export async function loadSetup(desk: DeskContext & { org: OrgSummary }) {
  const org = desk.org.id;
  const entities = await portfolio(desk);
  const ids = entities.map((e) => e.id);
  const none = ["00000000-0000-0000-0000-000000000000"];
  const admin = desk.canAdmin || (desk.house && !desk.membership);
  const [o, cs, rooms, content, rates, cards, hosts, docs, terms, banks, pols, team, invs, setup] = await Promise.all([
    desk.sb.from("organizations").select("website, phone, general_email, address").eq("id", org).maybeSingle(),
    contacts(desk),
    desk.sb.from("room_types").select("property_id").in("property_id", ids.length ? ids : none),
    desk.sb.from("entity_content").select("id").in("id", ids.length ? ids : none),
    desk.sb.from("rate_proposals").select("id", { count: "exact", head: true }).eq("organization_id", org),
    desk.sb.from("rate_card_versions").select("id", { count: "exact", head: true }).in("property_id", ids.length ? ids : none),
    desk.sb.from("host_pages").select("page_key", { count: "exact", head: true }).eq("organization_id", org),
    documents(desk),
    admin ? commissionTerms(desk) : Promise.resolve([]),
    admin ? bankAccounts(desk) : Promise.resolve([]),
    admin ? policies(desk) : Promise.resolve([]),
    desk.sb.from("organization_memberships").select("id", { count: "exact", head: true }).eq("organization_id", org).eq("status", "active"),
    desk.sb.from("org_invitations").select("id", { count: "exact", head: true }).eq("organization_id", org).is("revoked_at", null),
    desk.sb.from("partner_setup").select("skipped, finished_at").eq("organization_id", org).maybeSingle(),
  ]);
  const c = o.data;
  const counts: SetupCounts = {
    company: c && c.website && (c.phone || c.general_email) && c.address ? 1 : 0,
    contacts: cs.length,
    entries: entities.length, entriesTotal: entities.length,
    content: (content.data ?? []).length,
    rooms: new Set((rooms.data ?? []).map((r) => r.property_id)).size,
    rates: (rates.count ?? 0) + (cards.count ?? 0),
    hosts: hosts.count ?? 0,
    documents: docs.length,
    commercial: terms.length,
    banking: banks.length && pols.length ? 1 : 0,
    team: Math.max(0, (team.count ?? 0) - 1) + Math.max(0, (invs.count ?? 0) - 1),
  };
  const states = setupStates(counts, (setup.data?.skipped as string[] | null) ?? [], admin);
  return { states, progress: setupProgress(states), finished: !!setup.data?.finished_at, admin };
}

