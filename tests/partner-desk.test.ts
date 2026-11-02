// Run: node --experimental-strip-types --test tests/partner-desk.test.ts
// Partner Desk Stage 1: the flag is off by default, every API body is validated
// strictly, redirects stay on the desk, and Portfolio Health is built only from records.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readPartnerDeskFlag } from "../lib/platform/flags.ts";
import { isHouse, isHouseEditor, isPartnerAdmin, partnerMemberships, type Membership } from "../lib/platform/roles.ts";
import { isLedgerId, parseApplication, parseCompany, parseContact, parseDecision, parseInvite, parseRevision, parseSubmission, parseTeamChange, safePartnerNext } from "../lib/platform/validate.ts";
import { entityHealth, portfolioScore, type EntityFacts } from "../lib/platform/completeness.ts";
import { inviteEmail } from "../lib/platform/invite-email.ts";

const SB = { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "k" };
const U = "4f6a1b2c-3d4e-4f5a-8b6c-7d8e9f0a1b2c";

test("flag: off by default, only the exact word 'on', and only with Supabase configured", () => {
  assert.equal(readPartnerDeskFlag({}), false);
  for (const v of ["true", "1", "ON", " on", "yes"]) assert.equal(readPartnerDeskFlag({ ...SB, NEXT_PUBLIC_PARTNER_DESK: v }), false, v);
  assert.equal(readPartnerDeskFlag({ NEXT_PUBLIC_PARTNER_DESK: "on" }), false);
  assert.equal(readPartnerDeskFlag({ ...SB, NEXT_PUBLIC_PARTNER_DESK: "on" }), true);
});

test("safePartnerNext: desk paths only (no open redirects)", () => {
  assert.equal(safePartnerNext("/partner/portfolio/STY-2026-000128"), "/partner/portfolio/STY-2026-000128");
  assert.equal(safePartnerNext("/desk/review"), "/desk/review");
  assert.equal(safePartnerNext("/partner/invite/abc_DEF-123"), "/partner/invite/abc_DEF-123");
  for (const bad of ["https://evil.test", "//evil.test", "/\\evil.test", "/account", "/partners", "javascript:alert(1)", null, ""]) assert.equal(safePartnerNext(bad), "/partner", String(bad));
});

test("roles: house vs partner, and partner admin", () => {
  const m = (role: string, type: "internal" | "partner", status = "active"): Membership => ({ id: "m", role, status, organization: { id: "o", name: "O", slug: "o", type, partner_code: null } });
  assert.equal(isHouse([m("jw_admin", "internal")]), true);
  assert.equal(isHouse([m("jw_admin", "partner")]), false, "a house role in a partner org is not the house");
  assert.equal(isHouseEditor([m("admin", "internal")]), false, "legacy admin can view but not decide");
  assert.equal(isHouse([m("jw_editor", "internal", "revoked")]), false);
  assert.equal(partnerMemberships([m("partner_contributor", "partner"), m("advisor", "partner"), m("partner_admin", "partner", "revoked")]).length, 1);
  assert.equal(isPartnerAdmin(m("partner_admin", "partner")), true);
  assert.equal(isPartnerAdmin(m("partner_contributor", "partner")), false);
});

test("ledger ids", () => {
  assert.ok(isLedgerId("STY-2026-000128"));
  for (const bad of ["STY-2026-128", "sty-2026-000128", "STY-2026-000128x", "../STY"]) assert.ok(!isLedgerId(bad), bad);
});

test("contacts: strict fields, roles from the list, codes and phones", () => {
  assert.equal(parseContact({ firstName: "Wayan", roles: ["reservations"], country: "id" }).ok, true);
  const v = parseContact({ firstName: " Wayan ", roles: ["reservations", "reservations"], country: "id", entities: [U] });
  assert.ok(v.ok && v.value.country === "ID" && v.value.roles.length === 1 && v.value.first_name === "Wayan");
  for (const [body, field] of [
    [{}, "firstName"], [{ firstName: "A", email: "nope" }, "email"], [{ firstName: "A", roles: ["ceo"] }, "roles"],
    [{ firstName: "A", country: "ZAF" }, "country"], [{ firstName: "A", mobile: "call me" }, "mobile"], [{ firstName: "A", entities: ["x"] }, "entities"],
    [{ firstName: "A", jwOwnerId: U }, "jwOwnerId"], [{ firstName: "A", newsletterOptIn: "yes" }, "newsletterOptIn"],
  ] as const) {
    const r = parseContact(body);
    assert.ok(!r.ok && r.field === field, JSON.stringify(body));
  }
});

test("company: https links, email, never the name or code", () => {
  assert.equal(parseCompany({ website: "https://www.kayumanis.com", generalEmail: "hello@kayumanis.com" }).ok, true);
  assert.equal(parseCompany({ website: "http://x.com" }).ok, false);
  assert.equal(parseCompany({ name: "New name" }).ok, false);
  assert.equal(parseCompany({ partnerCode: "PAR-000009" }).ok, false);
});

test("submissions: a note or a document, https links only", () => {
  assert.equal(parseSubmission({ title: "Dusk", note: "Shot last week" }).ok, true);
  assert.equal(parseSubmission({ title: "Rates", documents: [{ name: "2027 STO", url: "https://drive.example.com/x" }] }).ok, true);
  assert.equal(parseSubmission({ title: "Empty" }).ok, false);
  assert.equal(parseSubmission({ title: "Bad link", documents: [{ name: "x", url: "javascript:alert(1)" }] }).ok, false);
  assert.equal(parseSubmission({ title: "x", note: "y", status: "approved" }).ok, false, "status is never client-set");
  assert.equal(parseSubmission({ title: "x", note: "y", requestId: "nope" }).ok, false);
});

test("revisions: only the entity's own whitelisted fields", () => {
  assert.equal(parseRevision({ propertyId: U, field: "name", value: "Kayumanis Jimbaran Private Estate & Spa" }).ok, true);
  for (const field of ["legacy_cms_id", "publication_status", "slug", "pathway", "seo_title", "booking_mode"]) assert.equal(parseRevision({ propertyId: U, field, value: "x" }).ok, false, field);
  assert.equal(parseRevision({ propertyId: U, field: "name", value: "  " }).ok, false);
});

test("invitations and team: partner roles only", () => {
  assert.equal(parseInvite({ email: "New@Example.test", role: "partner_contributor", entities: [U, U, "x"] }).ok, true);
  const v = parseInvite({ email: "New@Example.test", role: "partner_contributor", entities: [U, U] });
  assert.ok(v.ok && v.value.email === "new@example.test" && v.value.entities.length === 1);
  for (const role of ["jw_admin", "admin", "advisor", "owner"]) assert.equal(parseInvite({ email: "a@b.test", role }).ok, false, role);
  assert.equal(parseTeamChange({ role: "jw_admin", status: "active" }).ok, false);
  assert.equal(parseTeamChange({ role: "partner_admin", status: "deleted" }).ok, false);
});

test("applications: no self-signup fields", () => {
  assert.equal(parseApplication({ organizationName: "Lodge", contactName: "A", email: "a@lodge.test" }).ok, true);
  assert.equal(parseApplication({ organizationName: "Lodge", contactName: "A", email: "a@lodge.test", role: "partner_admin" }).ok, false);
  assert.equal(parseApplication({ organizationName: "", contactName: "A", email: "a@lodge.test" }).ok, false);
});

test("decisions: edit + approve needs a value; ask and reject need a reason", () => {
  assert.equal(parseDecision({ action: "approve" }).ok, true);
  assert.equal(parseDecision({ action: "edit_approve" }).ok, false);
  assert.equal(parseDecision({ action: "edit_approve", finalValue: "X" }).ok, true);
  assert.equal(parseDecision({ action: "ask" }).ok, false);
  assert.equal(parseDecision({ action: "reject", note: "Not ours" }).ok, true);
  assert.equal(parseDecision({ action: "publish" }).ok, false);
});

const base: EntityFacts = {
  publicationStatus: "published", provenance: "SYSTEM_SYNC", hasParent: false, roomCount: 4, parentRoomCount: 0,
  contacts: { active: 2, toVerify: 0 }, verifications: {}, rateCards: [{ label: "2027-V1", effectiveTo: "2027-12-31", status: "published" }],
  promotions: [], openRequests: { media: 0, editorial: 0, commercial: 0 }, today: "2026-11-01",
};

test("health: built only from records; missing rates and placeholders are flagged", () => {
  const ok = entityHealth(base);
  assert.equal(ok.checks.find((c) => c.key === "rates")?.state, "ok");
  assert.equal(ok.checks.find((c) => c.key === "property_info")?.state, "attention", "never verified unless the house verified it");
  const draft = entityHealth({ ...base, provenance: "PUBLIC_SOURCE", roomCount: 0, hasParent: true, parentRoomCount: 8, contacts: { active: 0, toVerify: 1 }, rateCards: [], openRequests: { media: 1, editorial: 1, commercial: 1 } });
  const by = Object.fromEntries(draft.checks.map((c) => [c.key, c]));
  assert.equal(by.rates.state, "missing");
  assert.equal(by.rates.label, "2027 rates");
  assert.equal(by.rooms.state, "attention");
  assert.equal(by.contacts.detail, "Placeholder contact still to replace");
  assert.match(by.property_info.detail, /public sources/);
  assert.ok(draft.score < ok.score);
  const stale = entityHealth({ ...base, rateCards: [{ label: "2026", effectiveTo: "2027-03-31", status: "published" }] });
  assert.equal(stale.checks.find((c) => c.key === "rates")?.state, "attention");
  const offer = entityHealth({ ...base, promotions: [{ label: "Stay 4 pay 3", expires: "2026-12-15" }] });
  assert.match(offer.checks.find((c) => c.key === "offers")!.detail, /December 15, 2026/);
  assert.equal(portfolioScore([]), 0);
  assert.equal(portfolioScore([100, 50]), 75);
});

test("invitation email escapes and says nothing is published without review", () => {
  const m = inviteEmail({ org: "Kayumanis <Bali>", role: "Contributor", link: "https://x.test/partner/invite/abc", inviter: null });
  assert.ok(m.html.includes("Kayumanis &lt;Bali&gt;") && !m.html.includes("<Bali>"));
  assert.match(m.text, /until James Wild & Co has reviewed it/);
});
