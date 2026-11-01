import "server-only";
import { STAYS } from "@/lib/content/stays";
import { pathway, type Pathway } from "@/lib/pathways";
import type { VolumeKey } from "@/lib/volumes";
import { entityHealth, type EntityFacts, type HealthCheck } from "./completeness";
import type { DeskContext, OrgSummary } from "./membership";

// Reads for the Partner Desk. Every query runs AS the signed-in person (anon key +
// session), so row-level security decides what comes back; nothing here widens access.

type Ctx = Pick<DeskContext, "sb" | "membership" | "house"> & { org: OrgSummary };

export type Entity = {
  id: string; legacy_cms_id: string; name: string; slug: string; publication_status: string; entity_type: string | null; entity_kind: string | null;
  volume_key: VolumeKey | null; parent_property_id: string | null; provenance: string | null; last_verified_at: string | null; updated_at: string;
  country: string | null; category: string | null; region: string | null; timezone: string | null;
  destination: { name: string; slug: string; parent: { name: string } | null } | null;
  volumes: VolumeKey[];
};

const ENTITY_COLS = "id, legacy_cms_id, name, slug, publication_status, entity_type, entity_kind, volume_key, parent_property_id, provenance, last_verified_at, updated_at, country, category, region, timezone, destination:destinations!destination_id(name, slug, parent:destinations!parent_id(name)), entity_volumes(volume_key, is_primary)";

type Raw = Omit<Entity, "volumes"> & { entity_volumes: { volume_key: VolumeKey; is_primary: boolean }[] | null };
const shape = (r: Raw): Entity => {
  const { entity_volumes, ...rest } = r;
  const vols = (entity_volumes ?? []).sort((a, b) => Number(b.is_primary) - Number(a.is_primary)).map((v) => v.volume_key);
  return { ...rest, volumes: vols.length ? vols : rest.volume_key ? [rest.volume_key] : [] };
};

/** Entities the viewer can work on for the organization in view (narrowed members see only their own). */
export async function portfolio(ctx: Ctx): Promise<Entity[]> {
  const { sb, org, membership } = ctx;
  const { data: links } = await sb.from("entity_partners").select("property_id").eq("organization_id", org.id);
  let ids = [...new Set((links ?? []).map((l) => l.property_id as string))];
  if (membership) {
    const { data: narrow } = await sb.from("entity_access").select("property_id").eq("membership_id", membership.id);
    if (narrow && narrow.length) { const allow = new Set(narrow.map((n) => n.property_id as string)); ids = ids.filter((i) => allow.has(i)); }
  }
  if (!ids.length) return [];
  const { data } = await sb.from("properties").select(ENTITY_COLS).in("id", ids).order("name");
  return ((data ?? []) as unknown as Raw[]).map(shape);
}

export async function entityByLedger(ctx: Ctx, ledgerId: string): Promise<Entity | null> {
  const list = await portfolio(ctx);
  return list.find((e) => e.legacy_cms_id === ledgerId) ?? null;
}

/** Library facts the site already prints (Pathways, founder note) for a Ledger ID. */
export function libraryFor(ledgerId: string): { pathways: { primary: Pathway; secondary: Pathway[] } | null; pathwayStatus: string | null; founderNote: string | null } {
  const s = STAYS.find((x) => x.ledgerId === ledgerId);
  const p = s?.pathway, primary = p ? pathway(p.primary) : undefined;
  return {
    pathways: primary ? { primary, secondary: (p!.secondary ?? []).map((id) => pathway(id)).filter((x): x is Pathway => !!x) } : null,
    pathwayStatus: p?.status ?? null,
    founderNote: s?.founderNote ?? null,
  };
}

export type RequestRow = {
  id: string; reference: string; property_id: string | null; request_type: string; requested_item: string; instructions: string | null;
  priority: string; due_date: string | null; status: string; created_at: string; updated_at: string;
};
export async function requests(ctx: Ctx, opts: { open?: boolean; propertyId?: string } = {}): Promise<RequestRow[]> {
  let q = ctx.sb.from("content_requests").select("id, reference, property_id, request_type, requested_item, instructions, priority, due_date, status, created_at, updated_at")
    .eq("organization_id", ctx.org.id);
  if (opts.open) q = q.in("status", ["open", "changes_requested"]);
  if (opts.propertyId) q = q.eq("property_id", opts.propertyId);
  const { data } = await q.order("due_date", { ascending: true, nullsFirst: false }).order("created_at");
  return (data ?? []) as RequestRow[];
}

export type SubmissionRow = {
  id: string; reference: string; property_id: string | null; request_id: string | null; kind: string; title: string; partner_note: string | null;
  documents: { name: string; url: string }[]; status: string; submitted_at: string | null; decided_at: string | null; jw_note: string | null; created_at: string;
  revisions: { id: string; field: string; target_table: string; current_value: unknown; proposed_value: unknown; final_value: unknown; status: string; jw_note: string | null; partner_note: string | null }[];
};
export async function submissions(ctx: Ctx, opts: { propertyId?: string; limit?: number } = {}): Promise<SubmissionRow[]> {
  let q = ctx.sb.from("submissions")
    .select("id, reference, property_id, request_id, kind, title, partner_note, documents, status, submitted_at, decided_at, jw_note, created_at, revisions(id, field, target_table, current_value, proposed_value, final_value, status, jw_note, partner_note)")
    .eq("organization_id", ctx.org.id);
  if (opts.propertyId) q = q.eq("property_id", opts.propertyId);
  const { data } = await q.order("created_at", { ascending: false }).limit(opts.limit ?? 100);
  return (data ?? []) as unknown as SubmissionRow[];
}

export type ContactRow = {
  id: string; first_name: string | null; last_name: string | null; title: string | null; email: string | null; mobile: string | null; whatsapp: string | null;
  country: string | null; timezone: string | null; territory: string | null; languages: string[]; roles: string[]; preferred_communication: string | null;
  newsletter_opt_in: boolean; trade_opt_in: boolean; status: string; notes: string | null; last_communication_at: string | null; last_verified_at: string | null;
  updated_at: string; contact_entities: { property_id: string }[];
};
export async function contacts(ctx: Ctx): Promise<ContactRow[]> {
  const { data } = await ctx.sb.from("contacts")
    .select("id, first_name, last_name, title, email, mobile, whatsapp, country, timezone, territory, languages, roles, preferred_communication, newsletter_opt_in, trade_opt_in, status, notes, last_communication_at, last_verified_at, updated_at, contact_entities(property_id)")
    .eq("organization_id", ctx.org.id).neq("status", "archived").order("status").order("last_name", { nullsFirst: true });
  return (data ?? []) as unknown as ContactRow[];
}

/** Portfolio Health per entity, from rooms, rate cards, offers, contacts, verifications and requests. */
export async function health(ctx: Ctx, entities: Entity[]): Promise<Map<string, { score: number; checks: HealthCheck[] }>> {
  const ids = entities.map((e) => e.id), parents = [...new Set(entities.map((e) => e.parent_property_id).filter((x): x is string => !!x))];
  const out = new Map<string, { score: number; checks: HealthCheck[] }>();
  if (!ids.length) return out;
  const all = [...new Set([...ids, ...parents])];
  const [rooms, cards, verifs, reqs, cons] = await Promise.all([
    ctx.sb.from("room_types").select("property_id").in("property_id", all).eq("active", true),
    ctx.sb.from("rate_card_versions").select("id, property_id, version_label, effective_to, status").in("property_id", all),
    ctx.sb.from("verifications").select("property_id, aspect, status, verified_at, valid_until").in("property_id", ids),
    ctx.sb.from("content_requests").select("property_id, request_type, status").eq("organization_id", ctx.org.id).in("status", ["open", "changes_requested"]),
    ctx.sb.from("contacts").select("status").eq("organization_id", ctx.org.id).neq("status", "archived"),
  ]);
  const cardIds = (cards.data ?? []).map((c) => c.id as string);
  const promos = cardIds.length ? await ctx.sb.from("promotions").select("rate_card_version_id, label, booking_end").in("rate_card_version_id", cardIds) : { data: [] as { rate_card_version_id: string; label: string; booking_end: string | null }[] };
  const count = (pid: string) => (rooms.data ?? []).filter((r) => r.property_id === pid).length;
  const contactsActive = (cons.data ?? []).filter((c) => c.status === "active").length, contactsToVerify = (cons.data ?? []).filter((c) => c.status === "to_verify").length;
  const today = new Date().toISOString().slice(0, 10);
  for (const e of entities) {
    const cardsFor = (cards.data ?? []).filter((c) => c.property_id === e.id || (!!e.parent_property_id && c.property_id === e.parent_property_id && count(e.id) === 0));
    const cardSet = new Set(cardsFor.map((c) => c.id));
    const v: EntityFacts["verifications"] = {};
    for (const x of (verifs.data ?? []).filter((x) => x.property_id === e.id)) v[x.aspect as string] = { status: x.status, verifiedAt: x.verified_at, validUntil: x.valid_until };
    const r = (reqs.data ?? []).filter((x) => x.property_id === e.id);
    out.set(e.id, entityHealth({
      publicationStatus: e.publication_status, provenance: e.provenance, hasParent: !!e.parent_property_id,
      roomCount: count(e.id), parentRoomCount: e.parent_property_id ? count(e.parent_property_id) : 0,
      contacts: { active: contactsActive, toVerify: contactsToVerify }, verifications: v,
      rateCards: cardsFor.map((c) => ({ label: c.version_label, effectiveTo: c.effective_to, status: c.status })),
      promotions: (promos.data ?? []).filter((p) => cardSet.has(p.rate_card_version_id)).map((p) => ({ label: p.label, expires: p.booking_end })),
      openRequests: { media: r.filter((x) => x.request_type === "media").length, editorial: r.filter((x) => x.request_type === "editorial").length, commercial: r.filter((x) => x.request_type === "commercial").length },
      today,
    }));
  }
  return out;
}

export async function roomsFor(ctx: Ctx, propertyId: string) {
  const { data } = await ctx.sb.from("room_types").select("id, name, code, unit_type, bed_configuration, size_sqm, max_adults, max_children, max_occupancy, occupancy_status, short_description")
    .eq("property_id", propertyId).eq("active", true).order("sort_order", { nullsFirst: false }).order("name");
  return data ?? [];
}

export async function verificationsFor(ctx: Ctx, propertyId: string) {
  const { data } = await ctx.sb.from("verifications").select("aspect, status, note, verified_at, valid_until").eq("property_id", propertyId).order("aspect");
  return data ?? [];
}
