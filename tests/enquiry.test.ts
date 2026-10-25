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
  assert.equal(inboxFor({ context: {} }), null);
});

import { enquiryEmail } from "../lib/enquiry-email.ts";
test("the house email carries the context and escapes user text", () => {
  const m = enquiryEmail({ ...base, message: "<b>hi</b>", context: { trip: "Two Oceans, One Volcano", estimate: "22614", advisor: "kristina-larson" } });
  assert.match(m.subject, /^Trip enquiry: Ana Ruiz · Two Oceans, One Volcano/);
  assert.match(m.text, /Estimate: US\$22,614/);
  assert.ok(m.html.includes("&lt;b&gt;hi&lt;/b&gt;") && !m.html.includes("<b>hi</b>"));
});
test("advisor applications are labelled", () => assert.match(enquiryEmail({ ...base, context: { from: "advisor-application" } }).subject, /^Advisor application/));
