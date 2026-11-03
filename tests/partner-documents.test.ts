import { test } from "node:test";
import assert from "node:assert/strict";
import { checkFile, daysToExpiry, parseDocumentFields, safeFileName, storagePath } from "../lib/platform/documents.ts";

const ORG = "11111111-2222-3333-4444-555555555555";
const PATH = /^[0-9a-f-]{36}\/(contract|commercial|supporting)\/[A-Za-z0-9._-]{1,200}$/;

test("storage paths match the table's check constraint", () => {
  const p = storagePath(ORG, "contract", "Kayumanis Agreement (signed) 2027.PDF", "abcdef12-0000-0000-0000-000000000000");
  assert.equal(p, `${ORG}/contract/abcdef12-Kayumanis-Agreement-signed-2027.pdf`);
  assert.match(p, PATH);
  assert.match(storagePath(ORG, "supporting", "Ficha técnica Ñandú.docx", "12345678-0000-0000-0000-000000000000"), PATH);
  assert.match(storagePath(ORG, "commercial", "../../etc/passwd", "12345678-0000-0000-0000-000000000000"), PATH);
});

test("file names are made safe", () => {
  assert.equal(safeFileName("../../evil name.pdf"), "evil-name.pdf");
  assert.equal(safeFileName(""), "document");
  assert.equal(safeFileName("rates"), "rates");
});

test("document fields: kind, title, dates", () => {
  assert.equal(parseDocumentFields({ kind: "nope", title: "x" }).ok, false);
  assert.equal(parseDocumentFields({ kind: "supporting", title: " " }).ok, false);
  assert.equal(parseDocumentFields({ kind: "commercial", title: "Rates", propertyId: "zzz" }).ok, false);
  const bad = parseDocumentFields({ kind: "contract", title: "A", effectiveFrom: "2027-01-01", expiresOn: "2026-12-31" });
  assert.equal(bad.ok, false);
  const good = parseDocumentFields({ kind: "contract", title: "Agency agreement", effectiveFrom: "2027-01-01", expiresOn: "2027-12-31", note: "" });
  assert.deepEqual(good, { ok: true, value: { kind: "contract", title: "Agency agreement", propertyId: null, effectiveFrom: "2027-01-01", expiresOn: "2027-12-31", note: null } });
});

test("files: type and size", () => {
  assert.equal(checkFile(null).ok, false);
  assert.equal(checkFile({ name: "a.exe", type: "application/x-msdownload", size: 10 }).ok, false);
  assert.equal(checkFile({ name: "a.pdf", type: "application/pdf", size: 21 * 1024 * 1024 }).ok, false);
  assert.equal(checkFile({ name: "a.pdf", type: "application/pdf", size: 1000 }).ok, true);
});

test("days to expiry", () => {
  assert.equal(daysToExpiry(null, "2026-11-02"), null);
  assert.equal(daysToExpiry("2026-12-02", "2026-11-02"), 30);
  assert.equal(daysToExpiry("2026-11-01", "2026-11-02"), -1);
});
