import { test } from "node:test";
import { isFolioId } from "../lib/folio/shelf.ts";
import assert from "node:assert/strict";
import { validateEnquiry } from "../lib/enquiry.ts";

const base = { name: "Ana Ruiz", email: "ana@example.com", adults: 2, children: 0, interests: [], contact: "email" as const, hasAdvisor: false, travelNotes: false, context: {}, where: "Costa Rica" };

test("a complete email enquiry passes", () => assert.deepEqual(validateEnquiry(base), {}));
test("a call needs a phone number", () => assert.ok(validateEnquiry({ ...base, contact: "phone" }).phone));
test("price-builder context counts as a destination", () => assert.deepEqual(validateEnquiry({ ...base, where: "", context: { trip: "Two Oceans, One Volcano" } }), {}));
test("bad email and missing name are caught", () => { const e = validateEnquiry({ ...base, name: "", email: "ana@" }); assert.ok(e.name && e.email); });
test("an outside advisor needs details", () => assert.ok(validateEnquiry({ ...base, hasAdvisor: true }).advisorDetails));

import { inboxFor } from "../lib/inbox.ts";
test("advisor applications and partner submissions go to advisors@", () => {
  assert.equal(inboxFor({ context: { from: "advisor-application" } }), "advisors@jameswildco.com");
  assert.equal(inboxFor({ context: { from: "partner" } }), "advisors@jameswildco.com");
  assert.equal(inboxFor({ context: {} }), "hello@jameswildco.com");
});

import { enquiryEmail } from "../lib/enquiry-email.ts";
test("the house email carries the context and escapes user text", () => {
  const m = enquiryEmail({ ...base, message: "<b>hi</b>", context: { trip: "Two Oceans, One Volcano", estimate: "22614", advisor: "kristina-larson" } });
  assert.match(m.subject, /^Trip enquiry: Ana Ruiz · Two Oceans, One Volcano/);
  assert.match(m.text, /Estimate: US\$22,614/);
  assert.ok(m.html.includes("&lt;b&gt;hi&lt;/b&gt;") && !m.html.includes("<b>hi</b>"));
});
test("advisor applications are labelled", () => assert.match(enquiryEmail({ ...base, context: { from: "advisor-application" } }).subject, /^Advisor application/));

import { INBOXES, folioSubject } from "../lib/inbox.ts";
test("Folio email comes from myfolio@ and carries the traveller's ID", () => {
  assert.equal(INBOXES.folio, "myfolio@jameswildco.com");
  assert.equal(folioSubject("JWC-2027-000123", "Booking confirmed"), "Booking confirmed · Folio JWC-2027-000123");
});

// Advisor-led handoff (James, 31 Oct 2026): a real advisor gets the enquiry
// directly with hello@ copied; James, stand-ins and the unlisted go to hello@.
import { deliveryFor, parseAdvisorInboxes } from "../lib/inbox.ts";
test("ADVISOR_INBOXES parses slug=email pairs and drops junk", () => {
  assert.deepEqual(parseAdvisorInboxes("anthony-papagno=Anthony@Example.com, kristina-larson=k@example.com, bad=nope,"), { "anthony-papagno": "anthony@example.com", "kristina-larson": "k@example.com" });
  assert.deepEqual(parseAdvisorInboxes(undefined), {});
});
test("a listed advisor is addressed directly with hello@ copied", () => {
  const inboxes = { "anthony-papagno": "anthony@example.com" };
  assert.deepEqual(deliveryFor({ context: { advisor: "anthony-papagno" } }, inboxes), { to: "anthony@example.com", cc: ["hello@jameswildco.com"] });
  assert.deepEqual(deliveryFor({ context: { advisor: "james-papagno" } }, { "james-papagno": "x@example.com" }), { to: "hello@jameswildco.com", cc: [] });
  assert.deepEqual(deliveryFor({ context: { advisor: "sofia-marchetti" } }, inboxes), { to: "hello@jameswildco.com", cc: [] });
  assert.deepEqual(deliveryFor({ context: { from: "advisor-application", advisor: "anthony-papagno" } }, inboxes), { to: "advisors@jameswildco.com", cc: [] });
});
test("JRN journey sketch ids are accepted as folios", () => { assert.ok(isFolioId("JRN-2026-000012")); assert.ok(isFolioId("FOL-2026-000012")); assert.ok(!isFolioId("STY-2026-000012")); });
test("what Iggi learned travels with the enquiry", () => {
  const m = enquiryEmail({ ...base, context: { from: "iggi", advisor: "anthony-papagno", folio: "FOL-2026-000012", q: "Raja Ampat", notes: "Two divers, late Nov; <ruled out> liveaboards over 12 cabins." } });
  assert.match(m.subject, /^Trip enquiry \(from Iggi\)/);
  assert.match(m.text, /Folio: FOL-2026-000012/);
  assert.match(m.text, /Asked about: Raja Ampat/);
  assert.match(m.text, /What Iggi learned:\nTwo divers/);
  assert.ok(m.html.includes("&lt;ruled out&gt;") && m.html.includes("What Iggi learned"));
});

// The enquiry record (1 Nov 2026): ENQ IDs and the Airtable row.
import { enquiryId, recordFields, inboxMap, F } from "../lib/enquiry-record.ts";
test("ENQ IDs are year + six digits", () => {
  assert.equal(enquiryId(2026, 1), "ENQ-2026-000001");
  assert.equal(enquiryId(2026, 1234), "ENQ-2026-001234");
  assert.equal(enquiryId(2026, 0), "ENQ-2026-000001");
});
test("the record row carries the context, the advisor link and the delivery", () => {
  const e = { ...base, message: "Hello", context: { from: "iggi", advisor: "anthony-papagno", folio: "FOL-2026-000012", q: "Raja Ampat", notes: "Two divers", destination: "raja-ampat", estimate: "22614" } };
  const f = recordFields(e, "ENQ-2026-000007", "2026-11-01T12:00:00.000Z", "recAnthony", { to: "a@example.com", cc: ["hello@jameswildco.com"] }, "sent");
  assert.equal(f[F.enquiryId], "ENQ-2026-000007");
  assert.equal(f[F.source], "iggi");
  assert.equal(f[F.folio], "FOL-2026-000012");
  assert.equal(f[F.destination], "raja ampat");
  assert.equal(f[F.notes], "Two divers");
  assert.equal(f[F.estimate], 22614);
  assert.deepEqual(f[F.advisor], ["recAnthony"]);
  assert.equal(f[F.deliveredTo], "a@example.com, hello@jameswildco.com");
  assert.equal(f[F.status], "New");
  assert.equal(f[F.delivery], "sent");
  const g = recordFields({ ...base, context: { from: "nonsense" } }, "ENQ-2026-000008", "2026-11-01T12:00:00.000Z", null, null, "preview");
  assert.equal(g[F.source], "page"); assert.equal(g[F.advisor], undefined);
});
test("only active real advisors with an address are in the inbox map", () => {
  const rows = [
    { recordId: "r1", slug: "james-papagno", inbox: "hello@jameswildco.com", active: true, standIn: false },
    { recordId: "r2", slug: "anthony-papagno", inbox: "a@example.com", active: true, standIn: false },
    { recordId: "r3", slug: "sofia-marchetti", inbox: "s@example.com", active: true, standIn: true },
    { recordId: "r4", slug: "kristina-larson", inbox: null, active: true, standIn: false },
    { recordId: "r5", slug: "carlos-alger", inbox: "c@example.com", active: false, standIn: false },
  ];
  assert.deepEqual(inboxMap(rows), { "james-papagno": "hello@jameswildco.com", "anthony-papagno": "a@example.com" });
});
