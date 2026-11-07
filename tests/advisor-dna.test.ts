import { test } from "node:test";
import assert from "node:assert/strict";
import { dnaChanges, fromLibrary, overlayDna, parseDna } from "../lib/platform/advisor-dna.ts";

const lib = { slug: "kristina-larson", ledgerId: "ADV-2026-000001", pathways: ["PATH-04"], volumes: ["safaris"], partyTypes: ["family"], countries: ["kenya"], languages: [], specialties: ["Fiji specialist"], availability: "open", matchNote: null, marks: [{ ledgerId: "STY-2026-000001", mark: "Sent Guests", when: null, note: null }] };

test("the Library's copy starts the form; Sent Guests is not the advisor's to claim", () => {
  const f = fromLibrary(lib);
  assert.deepEqual(f.party_types, ["family"]);
  assert.equal(f.marks.length, 0);
});

test("parseDna: lists from their sets, at least one country, marks checked", () => {
  const ok = parseDna({ pathways: ["PATH-04", "PATH-04"], volumes: ["safaris"], countries: ["kenya", "tanzania"], languages: "English, Swahili, ", specialties: "First safaris", availability: "waitlist", match_note: "  I   plan first safaris. ", marks: [{ ledgerId: "STY-2026-000101", mark: "Stayed", when: "Nov 2024" }] });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.deepEqual(ok.value.pathways, ["PATH-04"]);
    assert.deepEqual(ok.value.languages, ["English", "Swahili"]);
    assert.equal(ok.value.match_note, "I plan first safaris.");
    assert.equal(ok.value.marks[0].when, "Nov 2024");
  }
  const noCountry = parseDna({ pathways: ["PATH-04"], volumes: ["safaris"], countries: [] });
  assert.equal(!noCountry.ok && noCountry.field, "countries");
  const bad = parseDna({ pathways: ["PATH-04"], volumes: ["safaris"], countries: ["kenya"], marks: [{ ledgerId: "STY-2026-000101", mark: "Sent Guests" }] });
  assert.equal(!bad.ok && bad.field, "marks");
  const year = parseDna({ pathways: ["PATH-04"], volumes: ["safaris"], countries: ["kenya"], marks: [{ ledgerId: "STY-2026-000101", mark: "Stayed", when: "a long time ago, honestly" }] });
  assert.equal(!year.ok && year.field, "marks");
});

test("the house sees what changed", () => {
  const before = fromLibrary(lib);
  const after = { ...before, countries: ["kenya", "tanzania"], availability: "waitlist" as const };
  const c = dnaChanges(before, after);
  assert.deepEqual(c.find((x) => x.field === "Countries")?.added, ["tanzania"]);
  assert.equal(c.find((x) => x.field === "Taking clients")?.now, "waitlist");
});

test("overlay: desk wins, hidden closes, untouched advisors keep the Library's copy", () => {
  const other = { ...lib, slug: "carlos-alger", ledgerId: "ADV-2026-000004" };
  const out = overlayDna([lib, other], [{ slug: "kristina-larson", ledgerId: "ADV-2026-000001", hidden: false, countries: ["fiji"], pathways: ["PATH-02"], volumes: ["stays"], partyTypes: [], languages: [], specialties: [], availability: "open", matchNote: "Mine", marks: [] }]);
  assert.deepEqual(out[0].countries, ["fiji"]);
  assert.equal(out[0].source, "desk");
  assert.deepEqual(out[0].marks.map((m) => m.mark), ["Sent Guests"], "Sent Guests from the Library stays");
  assert.equal(out[1].source, "library");
  const hid = overlayDna([lib], [{ slug: "kristina-larson", ledgerId: "ADV-2026-000001", hidden: true }]);
  assert.equal(hid[0].availability, "closed");
  assert.deepEqual(hid[0].countries, ["kenya"]);
});
