import { test } from "node:test";
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
test("what Iggi learned travels with the enquiry", () => {
  const m = enquiryEmail({ ...base, context: { from: "iggi", advisor: "anthony-papagno", folio: "FOL-2026-000012", q: "Raja Ampat", notes: "Two divers, late Nov; <ruled out> liveaboards over 12 cabins." } });
  assert.match(m.subject, /^Trip enquiry \(from Iggi\)/);
  assert.match(m.text, /Folio: FOL-2026-000012/);
  assert.match(m.text, /Asked about: Raja Ampat/);
  assert.match(m.text, /What Iggi learned:\nTwo divers/);
  assert.ok(m.html.includes("&lt;ruled out&gt;") && m.html.includes("What Iggi learned"));
});
