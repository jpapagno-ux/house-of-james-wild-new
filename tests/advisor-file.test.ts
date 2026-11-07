import { test } from "node:test";
import assert from "node:assert/strict";
import { advisorDocPath, agreementBlocks, example, feeText, fileComplete, fileSteps, parseDetails, parseDocument, readyToActivate, sameName } from "../lib/platform/advisor-file.ts";

const base = { details: true, plan: true, agreement: true, agreement_placeholder: false, tax_form: true, eo_insurance: true, tax_form_accepted: false, eo_insurance_accepted: false, dna: true, dna_approved: false };

test("the four steps, and when the house can activate", () => {
  const steps = fileSteps(base);
  assert.deepEqual(steps.map((s) => s.key), ["details", "plan", "agreement", "documents", "dna"]);
  assert.ok(steps.every((s) => s.done));
  assert.equal(steps[3].waiting, true, "filed but not yet accepted reads as waiting for the house");
  assert.ok(fileComplete(base));
  assert.ok(!readyToActivate(base));
  assert.ok(!readyToActivate({ ...base, tax_form_accepted: true, eo_insurance_accepted: true }), "DNA must be approved too");
  assert.ok(readyToActivate({ ...base, tax_form_accepted: true, eo_insurance_accepted: true, dna_approved: true }));
  assert.equal(steps[4].waiting, true, "DNA sent, not yet approved");
  assert.ok(!fileComplete({ ...base, eo_insurance: false }));
});

test("details: required fields, tidy values, never a tax or bank number", () => {
  const ok = parseDetails({ legal_name: "  Nora   Q. New ", mailing_address: "1 Ocean Drive\nMiami FL 33139", notice_email: "Nora@Example.com", residence_country: "us", languages: "English, Spanish, ", years_selling: "12" });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.value.legal_name, "Nora Q. New");
    assert.equal(ok.value.notice_email, "nora@example.com");
    assert.equal(ok.value.residence_country, "US");
    assert.deepEqual(ok.value.languages, ["English", "Spanish"]);
    assert.equal(ok.value.years_selling, 12);
  }
  const bad = parseDetails({ legal_name: "N", mailing_address: "x", notice_email: "x", residence_country: "US" });
  assert.equal(!bad.ok && bad.field, "legal_name");
  const tin = parseDetails({ legal_name: "Nora New", mailing_address: "1 Ocean Drive", notice_email: "n@e.com", residence_country: "US", memberships: "SSN 123-45-6789" });
  assert.equal(!tin.ok && tin.field, "memberships");
});

test("documents: kind, type and size checked; path stays in the advisor's folder", () => {
  const id = "11111111-2222-3333-4444-555555555555";
  assert.equal(advisorDocPath("a1b2", "tax_form", "My W-9 (2026).PDF", id), "a1b2/tax_form/11111111-My-W-9-2026.pdf");
  assert.ok(parseDocument({ kind: "eo_insurance" }, { name: "eo.pdf", type: "application/pdf", size: 1000 }).ok);
  const w = parseDocument({ kind: "tax_form" }, { name: "w9.docx", type: "application/msword", size: 1000 });
  assert.equal(!w.ok && w.field, "file");
  const k = parseDocument({ kind: "passport" }, { name: "p.pdf", type: "application/pdf", size: 1000 });
  assert.equal(!k.ok && k.field, "kind");
});

test("the agreement reads as headings and paragraphs; names compare plainly", () => {
  const b = agreementBlocks("Intro line\none paragraph\n\n## 1. Appointment\n\n1.1 Text.");
  assert.deepEqual(b, [{ kind: "para", text: "Intro line one paragraph" }, { kind: "heading", text: "1. Appointment" }, { kind: "para", text: "1.1 Text." }]);
  assert.ok(sameName(" nora  q. NEW", "Nora Q. New"));
});

test("plan in words and the worked example", () => {
  assert.equal(feeText({ program_fee_minor: 24900, fee_currency: "USD", fee_period: "year" }), "$249 a year");
  assert.equal(feeText({ program_fee_minor: null, fee_currency: "USD", fee_period: "none" }), "No program fee");
  const e = example(7000);
  assert.equal(e.gross, 200000);
  assert.equal(e.advisor, 140000);
  assert.equal(e.house, 60000);
});
