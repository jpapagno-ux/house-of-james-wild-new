// The Atlas grows with the site (James, 23 Nov 2026). Every public section and every record page route in app/ is
// either fed into the Atlas by a named feeder or listed outside it with a reason, in lib/atlas/feeders.json.
// A new volume or record route that is in neither list fails here, before it can ship without the Atlas knowing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { matches, EMPTY, type AtlasRecord } from "../lib/atlas/match.ts";

const root = new URL("../", import.meta.url);
const reg = JSON.parse(readFileSync(new URL("lib/atlas/feeders.json", root), "utf8")) as {
  feeders: { id: string; label: string; routes: string[]; sections: string[] }[];
  outside: { routes: Record<string, string>; sections: Record<string, string>; private: string[] };
};
const build = readFileSync(new URL("lib/atlas/build.ts", root), "utf8");
const appDir = new URL("app/", root);

function pages(dir: URL, at = ""): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const u = new URL(`${name}/`, dir);
    if (name === "page.tsx") out.push(at || "/");
    else if (statSync(new URL(name, dir)).isDirectory()) out.push(...pages(u, /^\(.*\)$/.test(name) ? at : `${at}/${name}`));
  }
  return out;
}
const top = (route: string) => route.split("/")[1];
const all = pages(appDir).filter((r) => !reg.outside.private.includes(top(r)));
const fedRoutes = new Set(reg.feeders.flatMap((f) => f.routes));
const fedSections = new Set(reg.feeders.flatMap((f) => [...f.sections, ...f.routes.map(top)]));

test("every record page route is fed into the Atlas or listed outside it with a reason", () => {
  const missing = all.filter((r) => r.includes("[") && !fedRoutes.has(r) && !(r in reg.outside.routes));
  assert.deepEqual(missing, [], `New record routes the Atlas does not know. Add a feeder in lib/atlas/build.ts and register it, or list the route under "outside" with the reason, in lib/atlas/feeders.json: ${missing.join(", ")}`);
});

test("every public section of the site is fed into the Atlas or listed outside it with a reason", () => {
  const sections = readdirSync(appDir).filter((n) => statSync(new URL(n, appDir)).isDirectory() && !reg.outside.private.includes(n));
  const missing = sections.filter((s) => !fedSections.has(s) && !(s in reg.outside.sections));
  assert.deepEqual(missing, [], `New sections the Atlas does not know (lib/atlas/feeders.json): ${missing.join(", ")}`);
});

test("the register names only routes and sections that exist", () => {
  const routes = new Set(pages(appDir));
  const sections = new Set(readdirSync(appDir));
  const stale = [...fedRoutes, ...Object.keys(reg.outside.routes)].filter((r) => !routes.has(r));
  const gone = [...reg.feeders.flatMap((f) => f.sections), ...Object.keys(reg.outside.sections), ...reg.outside.private].filter((s) => !sections.has(s));
  assert.deepEqual([...stale, ...gone], []);
});

test("every registered feeder runs in the builder, and every feeder that runs is registered", () => {
  const ran = [...build.matchAll(/\bfeed\("([a-z-]+)"\)/g)].map((m) => m[1]);
  assert.deepEqual([...ran].sort(), reg.feeders.map((f) => f.id).sort());
  assert.equal(new Set(ran).size, ran.length, "a feeder id is used once");
});

test("every reason is written down", () => {
  for (const [k, why] of [...Object.entries(reg.outside.routes), ...Object.entries(reg.outside.sections)]) assert.ok(why.trim().length > 8, k);
});

// ---- the two new kinds ---------------------------------------------------------------------------------------------
const base: AtlasRecord = { id: "x", kind: "stay", name: "X", href: "/x", category: null, proposed: null, filedAs: "Stay", country: "Barbados", countries: ["Barbados", "The Caribbean"], region: null, regionLabel: "The Caribbean", tagline: null, image: null, mark: null, collections: [], interests: [], standing: 0, bestMonths: null, departures: null, sleeps: null, price: null, booking: "request", offers: [] };
const sailing: AtlasRecord = { ...base, id: "sailing:a/b", kind: "sailing", name: "The Glorious Grenadines, SeaDream I", category: "ocean-voyages-and-yachts", departures: [["2027-01-09", "2027-01-16"]] };
const coming: AtlasRecord = { ...base, id: "coming:c", kind: "coming", name: "Kahavadi Chiang Rai", country: "Thailand", countries: ["Thailand"], regionLabel: "Asia", filedAs: "Opens July 2027" };

test("a dated sailing shows for dates or by name; otherwise her ship stands for her", () => {
  assert.equal(matches(sailing, { ...EMPTY, where: "Caribbean" }), false, "a place alone does not list every sailing");
  assert.equal(matches(sailing, EMPTY), false, "an empty search does not list every sailing");
  assert.equal(matches(sailing, { ...EMPTY, where: "Glorious Grenadines" }), true, "named");
  assert.equal(matches(sailing, { ...EMPTY, where: "Caribbean", months: ["2027-01"] }), true, "in the dates");
  assert.equal(matches(sailing, { ...EMPTY, where: "Caribbean", months: ["2027-03"] }), false, "outside the dates");
});

test("a place that is not open yet is found by name or place only", () => {
  assert.equal(matches(coming, { ...EMPTY, where: "Kahavadi" }), true);
  assert.equal(matches(coming, { ...EMPTY, where: "Thailand" }), true);
  assert.equal(matches(coming, EMPTY), false, "never in an open browse");
  assert.equal(matches(coming, { ...EMPTY, where: "Thailand", months: ["2027-01"] }), false, "never offered for dates");
  assert.equal(matches(coming, { ...EMPTY, where: "Thailand", cat: ["hotels"] }), false, "never under a category");
});
