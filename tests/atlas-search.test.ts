import test from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, EMPTY, FRESH_DAYS, availability, fromQuery, matches, minNights, monthRuns, offerLine, offerState, search, season, toQuery, unknowns, whereScore, type AtlasOffer, type AtlasQuery, type AtlasRecord } from "../lib/atlas/match.ts";
import { classifyReserveCamp, classifyRoute, classifyShip, classifyStay, decided, shipInterests, stayInterests } from "../lib/atlas/classify.ts";
import { readAtlasFlag, ATLAS_BRANCH } from "../lib/atlas/flag.ts";

// Atlas Search, Phase 01: the acceptance tests of the revised implementation specification (20 Nov 2026).
const ON = "2026-11-20";
const rec = (over: Partial<AtlasRecord> = {}): AtlasRecord => ({
  id: "STY-1", kind: "stay", name: "Sample Lodge", href: "/stays/sample-lodge", category: "hotels", proposed: null, filedAs: "Hotel", country: "Botswana", countries: ["Botswana"], region: "africa", regionLabel: "Africa",
  tagline: "A quiet camp on the delta", image: null, mark: null, collections: [], interests: [], standing: 0, bestMonths: [5, 6, 7, 8, 9], departures: null, sleeps: null, price: null, booking: "request", offers: [], ...over,
});
const offer = (over: Partial<AtlasOffer> = {}): AtlasOffer => ({ id: "OFR-2026-0001", program: "Worth Another Night", headline: "Stay 4 nights, pay 3", from: "2027-01-10", to: "2027-03-31", bookingWindow: false, checked: "2026-11-10", hasConditions: false, departure: null, travelUntil: null, ...over });
const q = (s: string): AtlasQuery => fromQuery(new URLSearchParams(s));

// ---- categories ----------------------------------------------------------------------------------------------------
test("categories: twelve, River Voyages and Wilderness Lodges among them", () => {
  assert.equal(CATEGORIES.length, 12);
  assert.ok(CATEGORIES.includes("wilderness-lodges"));
  assert.equal(classifyStay({ filed: "lodge", africa: false, volumes: [], primaryPathway: "PATH-01", inReserve: false, isReserve: false }).proposed, "wilderness-lodges");
  assert.ok(CATEGORIES.includes("river-voyages"));
});
test("categories: an African hotel is never a safari camp automatically", () => {
  const v = classifyStay({ filed: "hotel", africa: true, volumes: ["stays", "safaris"], primaryPathway: "PATH-04", inReserve: false, isReserve: false });
  assert.equal(v.category, null); assert.equal(v.review, true); assert.equal(v.proposed, "safari-camps-and-lodges");
  assert.equal(classifyStay({ filed: "hotel", africa: true, volumes: ["stays"], primaryPathway: null, inReserve: false, isReserve: false }).category, "hotels");
});
test("categories: confirmed attributes confirm a category", () => {
  assert.equal(classifyStay({ filed: "lodge", africa: true, volumes: ["safaris"], primaryPathway: "PATH-04", inReserve: false, isReserve: false }).category, "safari-camps-and-lodges");
  assert.equal(classifyStay({ filed: "hotel", africa: true, volumes: [], primaryPathway: null, inReserve: true, isReserve: false }).category, "safari-camps-and-lodges");
  assert.equal(classifyStay({ filed: null, africa: true, volumes: ["safaris"], primaryPathway: null, inReserve: false, isReserve: true }).category, "private-safaris");
  assert.equal(classifyStay({ filed: "resort", africa: false, volumes: [], primaryPathway: null, inReserve: false, isReserve: false }).category, "resorts");
  assert.equal(classifyStay({ filed: "villa", africa: false, volumes: [], primaryPathway: null, inReserve: false, isReserve: false }).category, "villas");
  assert.equal(classifyStay({ filed: "private_house", africa: false, volumes: [], primaryPathway: null, inReserve: false, isReserve: false }).category, "private-residences");
  assert.equal(classifyStay({ filed: "lodge", africa: false, volumes: [], primaryPathway: null, inReserve: false, isReserve: false }).category, null);
});
test("categories: ships by registry type and vessel kind", () => {
  assert.equal(classifyShip(["river"], "riverboat").category, "river-voyages");
  assert.equal(classifyShip(["river", "charter"], "dahabiya").category, "river-voyages");
  assert.equal(classifyShip(["expedition"], "expedition-ship").category, "expedition-voyages");
  assert.equal(classifyShip(["expedition", "charter"], "motor-yacht").category, null);
  assert.equal(classifyShip(["sailing", "charter"], "phinisi").category, "ocean-voyages-and-yachts");
});
test("categories: routes and reserve houses", () => {
  assert.equal(classifyRoute("overland", false).category, "land-journeys");
  assert.equal(classifyRoute("overland", true).category, null);
  assert.equal(classifyRoute("voyage", false).category, null);
  assert.equal(classifyReserveCamp("camp").category, "safari-camps-and-lodges");
  assert.equal(classifyReserveCamp("residence").category, null);
});
test("categories: an editor's decision wins; an unknown value is ignored", () => {
  const held = classifyShip(["expedition"], "yacht");
  assert.equal(decided(held, ["ship-x"], { "ship-x": "ocean-voyages-and-yachts" }).category, "ocean-voyages-and-yachts");
  assert.equal(decided(held, ["ship-x"], { "ship-x": "cruises" }).category, null);
  assert.equal(decided(held, [null, "other"], {}).category, null);
});
test("categories: a record awaiting classification matches no category filter but is still found", () => {
  const held = rec({ category: null, proposed: "safari-camps-and-lodges" });
  assert.equal(matches(held, q("where=Botswana")), true);
  assert.equal(matches(held, q("where=Botswana&cat=safari-camps-and-lodges")), false);
  assert.equal(matches(held, q("where=Botswana&cat=hotels")), false);
  const out = search([held, rec({ id: "B", name: "Camp B", category: "safari-camps-and-lodges" })], q("cat=safari-camps-and-lodges"), ON);
  assert.equal(out.results.length, 1); assert.equal(out.awaitingCategory, 1);
  assert.equal(search([held], q("cat=river-voyages"), ON).awaitingCategory, 0);
});

// ---- interests -----------------------------------------------------------------------------------------------------
test("interests: read from pathways and tags, spellings normalised, nothing inferred", () => {
  assert.deepEqual(stayInterests({ pathways: ["PATH-04"], tags: ["Families", "couples"], setting: null, filed: "lodge" }).sort(), ["family", "romance", "wildlife"]);
  assert.deepEqual(stayInterests({ pathways: [], tags: [], setting: null, filed: "hotel" }), []);
  assert.ok(stayInterests({ pathways: ["PATH-02"], tags: [], setting: "Islands and oceans", filed: "resort" }).includes("islands"));
  assert.ok(!shipInterests({ types: ["river"], waters: ["nile"], activities: [], couples: false, publishesChildPolicy: false }).includes("family"));
  assert.ok(shipInterests({ types: ["river"], waters: ["nile"], activities: [], couples: false, publishesChildPolicy: true }).includes("family"));
  assert.equal(matches(rec({ interests: [] }), q("for=wildlife")), false);
  assert.equal(matches(rec({ interests: ["wildlife", "family"] }), q("for=wildlife,family")), true);
});

// ---- the address ---------------------------------------------------------------------------------------------------
test("address: a search survives a round trip and has one spelling", () => {
  const s = "where=Botswana&cat=safari-camps-and-lodges,hotels&from=2027-06-10&to=2027-06-17&adults=2&children=8,11&for=family,wildlife&sort=savings";
  const once = toQuery(q(s));
  assert.equal(once, "where=Botswana&cat=hotels,safari-camps-and-lodges&from=2027-06-10&to=2027-06-17&children=8,11&for=wildlife,family&sort=savings");
  assert.equal(toQuery(q(once)), once);
  assert.equal(toQuery(EMPTY), "");
});
test("address: nonsense is dropped, never guessed", () => {
  const x = q("cat=cruises,river-voyages&from=2027-06-17&to=2027-06-10&months=2027-13x,2027-07&adults=99&children=abc,40,5&for=golf&sort=cheapest&where=Anywhere");
  assert.deepEqual(x.cat, ["river-voyages"]); assert.equal(x.from, null); assert.deepEqual(x.months, ["2027-07"]);
  assert.equal(x.adults, 16); assert.deepEqual(x.children, [5]); assert.deepEqual(x.interests, []); assert.equal(x.sort, "best"); assert.equal(x.where, "");
});

// ---- where ---------------------------------------------------------------------------------------------------------
test("where: the name outranks the place; accents and stop words do not matter", () => {
  const r = rec({ name: "Galápagos Safari Camp", country: "Ecuador", countries: ["Ecuador"] });
  assert.equal(whereScore(r, "galapagos safari"), 3); assert.equal(whereScore(r, "in Ecuador"), 2); assert.equal(whereScore(r, "Kenya"), 0); assert.equal(whereScore(r, ""), 1);
});

// ---- season, offer, availability: three separate things -------------------------------------------------------------
test("season: a stay in season is never called available", () => {
  const r = rec();
  const s = season(r, q("from=2027-07-01&to=2027-07-08")), a = availability(r, q("from=2027-07-01&to=2027-07-08"));
  assert.equal(s.state, "in"); assert.equal(a.state, "request");
  assert.match(a.line, /on request/i); assert.doesNotMatch(`${s.line} ${a.line}`, /\bavailable\b|confirmed availab/i);
  assert.equal(season(r, q("months=2027-01")).state, "outside");
  assert.equal(season(rec({ bestMonths: null }), q("months=2027-01")).state, "not-filed");
  assert.equal(season(r, q("")).state, "no-dates");
});
test("season: month runs read across the year end", () => {
  assert.equal(monthRuns([10, 11, 0, 1]), "Nov to Feb"); assert.equal(monthRuns([5]), "Jun"); assert.equal(monthRuns([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), "all year");
});
test("availability: ships use published departures; stays are on request", () => {
  const ship = rec({ kind: "ship", category: "expedition-voyages", bestMonths: null, departures: [["2027-02-10", "2027-02-10"], ["2027-03-05", "2027-03-05"]], minChildAge: 8 });
  assert.equal(availability(ship, q("months=2027-02")).state, "departs");
  assert.match(availability(ship, q("months=2027-02")).line, /10 February 2027.*confirmed by the house/);
  assert.equal(matches(ship, q("months=2027-06")), false, "a published calendar with no sailing in the dates excludes the ship");
  assert.equal(matches(rec({ kind: "ship", departures: [] }), q("months=2027-06")), true, "an unpublished calendar never excludes");
  assert.equal(availability(rec({ booking: "engine" }), q("")).state, "engine");
  assert.match(availability(rec({ booking: "engine" }), q("")).line, /Nothing is held until you reserve/);
});

// ---- offers --------------------------------------------------------------------------------------------------------
test("offers: applies only when every condition can be checked", () => {
  const dates = q("from=2027-02-10&to=2027-02-15");
  assert.equal(offerState(offer(), dates, ON), "eligible");
  assert.equal(offerState(offer({ hasConditions: true }), dates, ON), "unknown", "free-text conditions cannot be checked by a search");
  assert.equal(offerState(offer(), q("from=2027-02-10&to=2027-02-12"), ON), "unknown", "two nights against a four-night offer");
  assert.equal(offerState(offer(), q("months=2027-02"), ON), "unknown", "flexible dates never confirm an offer");
  assert.equal(offerState(offer(), q(""), ON), "unknown");
  assert.equal(offerState(offer(), q("from=2027-03-28&to=2027-04-03"), ON), "unknown", "a stay that runs past the window is not confirmed");
  assert.equal(offerState(offer(), q("from=2027-06-01&to=2027-06-08"), ON), "outside");
  assert.equal(offerState(offer({ bookingWindow: true }), dates, ON), "unknown", "a booking deadline alone says nothing about travel dates");
});
test("offers: stale terms lose the label, whatever the dates", () => {
  const dates = q("from=2027-02-10&to=2027-02-15");
  assert.equal(offerState(offer({ checked: "2026-10-06" }), dates, ON), "eligible", `${FRESH_DAYS} days is still fresh`);
  assert.equal(offerState(offer({ checked: "2026-10-05" }), dates, ON), "recheck");
  assert.equal(offerLine(rec({ offers: [offer({ checked: "2026-09-01" })] }), dates, ON), null);
  assert.equal(offerLine(rec({ offers: [offer()] }), q("from=2027-06-01&to=2027-06-08"), ON), null);
});
test("offers: the headline is printed as filed and nothing is computed", () => {
  const l = offerLine(rec({ offers: [offer({ headline: "Stay 4 nights, pay 3" })] }), q("from=2027-02-10&to=2027-02-15"), ON)!;
  assert.match(l.line, /^Stay 4 nights, pay 3\. Applies to your dates\.$/);
  assert.doesNotMatch(`${l.line} ${l.meta}`, /%|save \$|was \$|free night worth/i);
  assert.equal(minNights("Stay 10 nights at Masoala, pay for 8"), 10); assert.equal(minNights("20% off Design Suites"), null);
  assert.equal(offerLine(rec(), q(""), ON), null);
});
test("offers: a Final Call follows its departure", () => {
  const fc = offer({ program: "Final Call", headline: "Last cabins", departure: "2027-02-12", from: "2026-11-01", to: "2027-02-12" });
  assert.equal(offerState(fc, q("from=2027-02-10&to=2027-02-20"), ON), "eligible");
  assert.equal(offerState(fc, q("months=2027-05"), ON), "outside");
});

// ---- unknown data --------------------------------------------------------------------------------------------------
test("unknown data: missing occupancy or ages never excludes and is said on the card", () => {
  const family = q("adults=2&children=4,9");
  const r = rec({ kind: "ship", minChildAge: null, departures: [] });
  assert.equal(matches(r, family), true);
  assert.equal(unknowns(r, family).length, 2);
  assert.equal(matches(rec({ kind: "ship", minChildAge: 6, departures: [] }), family), false, "a filed minimum age is a fact");
  assert.equal(matches(rec({ kind: "ship", minChildAge: 0, departures: [] }), family), true);
  assert.equal(matches(rec({ sleeps: 2 }), family), false, "a filed occupancy is a fact");
  assert.equal(matches(rec({ sleeps: 6 }), family), true); assert.deepEqual(unknowns(rec({ sleeps: 6 }), family), []);
  assert.deepEqual(unknowns(rec(), q("")), [], "two adults ask nothing the Ledger must hold");
});

// ---- order ---------------------------------------------------------------------------------------------------------
const names = (rs: AtlasRecord[], s: string) => search(rs, q(s), ON).results.map((x) => x.record.name);
test("order: Best match puts house standing before an offer", () => {
  const plain = rec({ id: "A", name: "A Offer", offers: [offer()] }), ef = rec({ id: "B", name: "B Exceptional", standing: 3 }), vetted = rec({ id: "C", name: "C Vetted", standing: 2 });
  assert.deepEqual(names([plain, vetted, ef], "from=2027-02-10&to=2027-02-15"), ["B Exceptional", "C Vetted", "A Offer"]);
});
test("order: Savings first leads with offers that apply, then may apply, then the rest", () => {
  const applies = rec({ id: "A", name: "Applies", offers: [offer()] }), may = rec({ id: "B", name: "May", standing: 3, offers: [offer({ hasConditions: true })] }), none = rec({ id: "C", name: "None", standing: 3 }), out = rec({ id: "D", name: "Outside", standing: 3, offers: [offer({ from: "2027-09-01", to: "2027-09-30" })] });
  assert.deepEqual(names([none, out, may, applies], "sort=savings&from=2027-02-10&to=2027-02-15"), ["Applies", "May", "None", "Outside"]);
});
test("order: a discount never lifts a weaker match above a stronger one", () => {
  const named = rec({ id: "A", name: "Kenya House" }), placed = rec({ id: "B", name: "Other Camp", country: "Kenya", countries: ["Kenya"], offers: [offer()] });
  assert.deepEqual(names([placed, named], "sort=savings&where=Kenya&from=2027-02-10&to=2027-02-15"), ["Kenya House", "Other Camp"]);
});
test("order: fresher terms lead; the deadline only breaks a tie", () => {
  const fresh = rec({ id: "A", name: "Fresh", offers: [offer({ checked: "2026-11-18", to: "2027-12-31" })] }), soon = rec({ id: "B", name: "Soon", offers: [offer({ checked: "2026-11-01", to: "2027-02-28" })] });
  assert.deepEqual(names([soon, fresh], "sort=savings&from=2027-02-10&to=2027-02-15"), ["Fresh", "Soon"]);
  const t1 = rec({ id: "C", name: "Later", offers: [offer({ to: "2027-12-31" })] }), t2 = rec({ id: "D", name: "Sooner", offers: [offer({ to: "2027-02-28" })] });
  assert.deepEqual(names([t1, t2], "sort=savings&from=2027-02-10&to=2027-02-15"), ["Sooner", "Later"]);
});
test("order: records with a missing fact rank below records that confirm it", () => {
  const known = rec({ id: "A", name: "Z Known", sleeps: 6 }), unknown = rec({ id: "B", name: "A Unknown" });
  assert.deepEqual(names([unknown, known], "adults=2&children=5,7"), ["Z Known", "A Unknown"]);
});

// ---- the pilot flag ------------------------------------------------------------------------------------------------
test("flag: off unless set, or the preview of the pilot branch; never on in production by itself", () => {
  assert.equal(readAtlasFlag({}), false);
  assert.equal(readAtlasFlag({ VERCEL_ENV: "production", VERCEL_GIT_COMMIT_REF: ATLAS_BRANCH }), false);
  assert.equal(readAtlasFlag({ VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: "main" }), false);
  assert.equal(readAtlasFlag({ VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: ATLAS_BRANCH }), true);
  assert.equal(readAtlasFlag({ VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: ATLAS_BRANCH, NEXT_PUBLIC_ATLAS: "off" }), false);
  assert.equal(readAtlasFlag({ NEXT_PUBLIC_ATLAS: "on" }), true);
});

// ---- Step 03 follow-ups (20 Nov 2026) -----------------------------------------------------------------------------
import { mayApplyReason, needNights, parseMonths } from "../lib/atlas/match.ts";
import { conditionKind, conditionMinStay } from "../lib/atlas/classify.ts";
import { ATLAS_FAQ, ATLAS_INTRO } from "../lib/atlas/faq.ts";

test("season: a place's own filed months are read only when they read cleanly", () => {
  assert.deepEqual(parseMonths("May to October"), [4, 5, 6, 7, 8, 9]);
  assert.deepEqual(parseMonths("November - April"), [0, 1, 2, 3, 10, 11]);
  assert.deepEqual(parseMonths("June–October, December–March"), [0, 1, 2, 5, 6, 7, 8, 9, 11]);
  assert.deepEqual(parseMonths("March - May & September - November"), [2, 3, 4, 8, 9, 10]);
  assert.deepEqual(parseMonths("June to mid-September, December to February"), [0, 1, 5, 6, 7, 8, 11]);
  assert.equal(parseMonths("Year-round")?.length, 12);
  assert.equal(parseMonths("Open all year")?.length, 12);
  assert.equal(parseMonths("December to March (kitesurf season)"), null);
  assert.equal(parseMonths("July to October for the Great Migration and river crossings in the Mara Triangle."), null);
  assert.equal(parseMonths(null), null);
});
test("season: a place's own months are worded as this place, a country band as the country", () => {
  assert.match(season(rec({ seasonOf: "place" }), q("")).line, /^Best months here:/);
  assert.match(season(rec({ seasonOf: "country" }), q("")).line, /^Best months in Botswana:/);
  assert.match(season(rec({ seasonOf: "place" }), q("from=2027-01-10&to=2027-01-15")).line, /filed for this place/);
});
test("offers: the kind of condition and the stay it asks for are read, the text is never printed", () => {
  assert.equal(conditionKind("For wedding anniversaries of 1, 5, 10 years"), "occasion");
  assert.equal(conditionKind("10% off accommodation when at least two MORE Collection properties are booked"), "combination");
  assert.equal(conditionKind("10% off for guests who have stayed with MORE Collection before"), "returning");
  assert.equal(conditionKind("No single supplement is charged for mid and green seasons"), "single");
  assert.equal(conditionKind("Subject to availability."), "other");
  assert.equal(conditionKind(""), null);
  assert.equal(conditionMinStay("Minimum stay 2 nights. Booking dates: now to December 15."), 2);
  assert.equal(conditionMinStay("Four consecutive nights required. Up to 5 rooms."), 4);
  assert.equal(conditionMinStay("Subject to availability."), null);
});
test("offers: a card says why an offer only may apply, and conditions still never make it apply", () => {
  const o = offer({ hasConditions: true, condition: "occasion" });
  const stay = q("from=2027-02-01&to=2027-02-06");
  assert.equal(offerState(o, stay, ON), "unknown");
  assert.match(offerLine(rec({ offers: [o] }), stay, ON)!.line, /May apply\. It is for a celebration.*Your advisor confirms\.$/);
  const short = offer({ headline: "Winter rate", minStay: 5 });
  assert.equal(needNights(short), 5);
  assert.equal(offerState(short, q("from=2027-02-01&to=2027-02-04"), ON), "unknown");
  assert.match(mayApplyReason(short, q("from=2027-02-01&to=2027-02-04")), /at least 5 nights and your dates are 3/);
  assert.equal(offerState(short, q("from=2027-02-01&to=2027-02-07"), ON), "eligible");
});
test("categories: records awaiting a category are listed apart, never inside the category", () => {
  const held = rec({ id: "STY-9", name: "Held Lodge", category: null, proposed: "safari-camps-and-lodges", filedAs: "Hotel" });
  const out = search([rec({ category: "safari-camps-and-lodges" }), held, rec({ id: "STY-8", category: null, proposed: "hotels" })], q("cat=safari-camps-and-lodges"), ON);
  assert.deepEqual(out.results.map((x) => x.record.id), ["STY-1"]);
  assert.deepEqual(out.awaiting.map((x) => x.record.id), ["STY-9"]);
  assert.equal(out.awaitingCategory, 1);
  assert.equal(search([held], q(""), ON).awaiting.length, 0);
});
test("unknown data: a family mark softens the wording, it never becomes an occupancy figure", () => {
  const fam = q("adults=2&children=6,9");
  assert.match(unknowns(rec({ familyFiled: true }), fam)[0], /confirmed by the house/);
  assert.equal(/fit|sleeps \d|suited/i.test(unknowns(rec({ familyFiled: true }), fam).join(" ")), false);
  assert.equal(matches(rec({ familyFiled: true }), fam), true);
});
test("copy: the Atlas answers carry no dashes and no vetting or saving claims", () => {
  const all = [ATLAS_INTRO, ...ATLAS_FAQ.flatMap((f) => [f.q, f.a])].join(" ");
  assert.equal(/[–—]/.test(all), false);
  assert.equal(/vetted|inspected|guarantee|cheapest|best price/i.test(all), false);
  assert.ok(ATLAS_FAQ.length >= 5);
});

test("release gate: season never says a place is open, savings order is qualified, held records stay out", () => {
  const s = season(rec({ seasonOf: "place" }), q("from=2027-07-01&to=2027-07-06"));
  assert.equal(s.state, "in"); assert.match(s.line, /Opening dates are confirmed by the house/); assert.equal(/open for|is open|available/i.test(s.line), false);
  assert.equal(search([rec()], q("sort=savings"), ON).savingsEmpty, true);
  assert.equal(search([rec({ offers: [offer()] })], q("sort=savings"), ON).savingsEmpty, false);
  assert.equal(/available now|rooms available|cabins available/i.test(availability(rec(), q("")).line), false);
});

import { describe as heading, isPlace } from "../lib/atlas/match.ts";
test("heading: a place reads 'in', a name reads 'Results for'", () => {
  const places = ["Africa", "Botswana", "South Africa", "Galápagos"];
  assert.equal(isPlace("Botswana", places), true);
  assert.equal(isPlace("south africa", places), true);
  assert.equal(isPlace("Galapagos", places), true);
  assert.equal(isPlace("Dulini", places), false);
  assert.equal(isPlace("", places), false);
  assert.equal(heading(q("where=Botswana"), true), "Everything in Botswana");
  assert.equal(heading(q("where=Dulini"), false), "Results for Dulini");
  assert.equal(heading(q("where=Dulini&cat=safari-camps-and-lodges"), false), "Safari Camps and Lodges matching Dulini");
  assert.equal(heading(q(""), false), "Everything anywhere");
});
