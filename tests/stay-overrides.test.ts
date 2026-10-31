// The stay merge file is edited by hand in GitHub; catch mistakes before a publish does.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const file = JSON.parse(readFileSync(new URL("../scripts/data/stay-overrides.json", import.meta.url), "utf8"));
const ALLOWED = new Set(["name", "tagline", "hero", "gallery", "galleryAdd", "bestMonths", "bestMonthsNote", "coords", "airport", "airportDirections", "hide", "note", "status", "statusDate"]);
const photo = (u: unknown) => typeof u === "string" && /^https:\/\/(res\.cloudinary\.com|media\.base44\.com)\//.test(u);

test("stay merge file entries use allowed fields, a note and our own photos", () => {
  assert.equal(typeof file.stays, "object");
  for (const [slug, ov] of Object.entries<Record<string, unknown>>(file.stays)) {
    assert.match(slug, /^[a-z0-9-]+$/, `${slug}: slug`);
    for (const k of Object.keys(ov)) assert.ok(ALLOWED.has(k), `${slug}: '${k}' can't be set in the merge file`);
    assert.ok(String(ov.note ?? "").trim(), `${slug}: add a note saying who and why`);
    for (const u of [ov.hero, ...((ov.gallery as unknown[]) ?? []), ...((ov.galleryAdd as unknown[]) ?? [])].filter((u) => u !== undefined))
      assert.ok(photo(u), `${slug}: photo must be on Cloudinary or the library: ${u}`);
    if (ov.coords !== undefined) assert.match(String(ov.coords), /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/, `${slug}: coords 'lat, lng'`);
  }
});
