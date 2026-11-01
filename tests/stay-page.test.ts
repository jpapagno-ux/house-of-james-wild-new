import { test } from "node:test";
import assert from "node:assert/strict";
import { liveOptionsFor, matchKey, pricingModeFrom, pricingStatusLabel, propertyPricingMode, resolvePricingState, type LiveResult } from "../lib/stay-page/pricing.ts";
import { unitMedia, usableUrl } from "../lib/stay-page/adapters/media.ts";
import type { AccommodationUnit } from "../lib/stay-page/contract.ts";

// The Stay-page pricing resolver: the one place that decides what a traveler
// may be told about a unit's price. A legacy reference rate is never an input.

const unit = (over: Partial<AccommodationUnit> = {}): AccommodationUnit => ({
  id: "u1", code: "studio-room", name: "Studio Room", unitType: "room", group: "room", shortDescription: null, fullDescription: null,
  occupancy: { status: "unverified", maxAdults: null, maxChildren: null, maxOccupancy: null }, bedConfiguration: null, size: { sqm: null, sqft: null }, view: null,
  privatePool: null, privateTerrace: null, connectingAvailable: null, features: [], included: [], excluded: [], importantNotes: [], founderNote: null,
  media: { hero: null, gallery: [] }, pricingMode: "HYBRID", bookingMode: "request", liveMatchKey: "Studio Room",
  legacyReference: { amount: 23000, currency: "ZAR", status: "legacy_reference", sourceRoomId: "abc" }, rateCardFrom: null, sortOrder: null, ...over,
});
const search = { checkIn: "2026-12-08", checkOut: "2026-12-11", adults: 2 };
const live = (status: LiveResult["status"], plans: LiveResult["plans"] = []): LiveResult => ({ status, nights: 3, currency: "USD", fetchedAt: "2026-11-01T05:51:00Z", provider: "Tag Albie booking engine", plans });
const priced = live("ok", [{ plan: "Length of Stay Discount", rooms: [{ name: "Studio Room", total: 4770.84 }] }, { plan: "Best Available Rate", rooms: [{ name: "Studio Room", total: 5612.73 }, { name: "Terroir Cottage", total: 8871.75 }] }]);

test("live answer wins for a hybrid unit, cheapest option first, with full provenance", () => {
  const st = resolvePricingState(unit(), search, priced);
  assert.equal(st.kind, "live");
  if (st.kind !== "live") return;
  assert.deepEqual(st.options.map((o) => o.label), ["Length of Stay Discount", "Best Available Rate"]);
  const p = st.options[0].provenance;
  assert.equal(p.sourceType, "LIVE_DYNAMIC"); assert.equal(p.currency, "USD"); assert.equal(p.retrievedAt, "2026-11-01T05:51:00Z");
  assert.equal(p.validFrom, "2026-12-08"); assert.equal(p.validTo, "2026-12-11"); assert.equal(p.availability, "available"); assert.equal(p.reference, "Length of Stay Discount");
  assert.equal(Math.round(st.options[0].perNight!.amount), 1590);
});

test("no live line for the dates never falls back to the legacy reference rate", () => {
  const st = resolvePricingState(unit({ name: "Classic Room", liveMatchKey: "Classic Room", legacyReference: { amount: 16500, currency: "ZAR", status: "legacy_reference", sourceRoomId: "x" } }), search, priced);
  assert.equal(st.kind, "request_quote");
  assert.ok(!JSON.stringify(st).includes("16500"));
  assert.equal(pricingStatusLabel(st).label, "Designed for you");
});

test("before the engine answers the state is checking; an engine error is said plainly; nothing open is unavailable", () => {
  assert.equal(resolvePricingState(unit(), null, null).kind, "checking");
  assert.equal(resolvePricingState(unit(), search, live("loading")).kind, "checking");
  assert.equal(resolvePricingState(unit(), search, live("error")).kind, "source_error");
  assert.equal(resolvePricingState(unit(), search, live("none")).kind, "unavailable_for_dates");
});

test("a rate card is rate known, availability on request, and never replaced by a live line on a RATE_CARD unit", () => {
  const card = { total: { amount: 650, currency: "USD" }, perNight: { amount: 650, currency: "USD" }, nights: 1, label: "2027-V1 contracted rate", provenance: { sourceType: "RATE_CARD" as const, provider: "Rate card 2027-V1", currency: "USD", retrievedAt: null, verifiedAt: "2026-10-27T00:00:00Z", validFrom: "2027-01-01", validTo: "2027-12-31", availability: "on_request" as const, availabilityCheckedAt: null, reference: "2027-V1" } };
  const st = resolvePricingState(unit({ pricingMode: "RATE_CARD", rateCardFrom: card }), search, priced);
  assert.equal(st.kind, "rate_card");
  if (st.kind === "rate_card") assert.equal(st.from.provenance.availability, "on_request");
  // A hybrid unit with a card and no live line shows the card, not a quote request.
  assert.equal(resolvePricingState(unit({ name: "Deluxe Room", liveMatchKey: "Deluxe Room", rateCardFrom: card }), search, priced).kind, "rate_card");
  // A card marked legacy on its provenance is not a card.
  const bad = { ...card, provenance: { ...card.provenance, sourceType: "LEGACY_REFERENCE" as const } };
  assert.equal(resolvePricingState(unit({ pricingMode: "RATE_CARD", rateCardFrom: bad }), search, priced).kind, "request_quote");
});

test("declared REQUEST_QUOTE / LEGACY_REFERENCE modes never price from the engine", () => {
  assert.equal(resolvePricingState(unit({ pricingMode: "REQUEST_QUOTE" }), search, priced).kind, "request_quote");
  assert.equal(resolvePricingState(unit({ pricingMode: "LEGACY_REFERENCE" }), search, priced).kind, "request_quote");
});

test("engine names match loosely; sample suffixes are ignored", () => {
  assert.equal(matchKey("Manor House Suite (sample)"), matchKey("Manor House Suite"));
  assert.equal(liveOptionsFor(unit({ liveMatchKey: "studio-room" }), search, priced).length, 2);
  assert.equal(liveOptionsFor(unit({ liveMatchKey: "Deluxe Room" }), search, priced).length, 0);
});

test("pricing modes map from Booking Live text; unknown never becomes a price", () => {
  assert.equal(pricingModeFrom("hybrid", true), "HYBRID");
  assert.equal(pricingModeFrom("rate_card", false), "RATE_CARD");
  assert.equal(pricingModeFrom("live", true), "LIVE_DYNAMIC");
  assert.equal(pricingModeFrom(null, false), "REQUEST_QUOTE");
  assert.equal(pricingModeFrom("whatever", false), "REQUEST_QUOTE");
  assert.equal(propertyPricingMode([{ pricingMode: "LIVE_DYNAMIC" }, { pricingMode: "RATE_CARD" }], true), "HYBRID");
  assert.equal(propertyPricingMode([{ pricingMode: "RATE_CARD" }], false), "RATE_CARD");
});

test("media: Cloudinary first, retired WES storage dropped, duplicates removed, hero falls back to the gallery", () => {
  assert.equal(usableUrl("https://xagdnmohexklddgsqdpd.supabase.co/storage/v1/object/public/wes-media/rooms/a.jpg"), null);
  assert.equal(usableUrl("https://evil.example/x.jpg"), null);
  const m = unitMedia({ name: "Studio Room", stayName: "Leeu Estates", heroMediaId: null, galleryMediaIds: null, sourceHeroUrl: "https://xagdnmohexklddgsqdpd.supabase.co/storage/v1/object/public/wes-media/rooms/a.jpg", sourceGalleryUrls: ["https://cdn.prod.website-files.com/x/1.jpg", "https://cdn.prod.website-files.com/x/1.jpg", "https://cdn.prod.website-files.com/x/2.jpg"] });
  assert.equal(m.hero?.url, "https://cdn.prod.website-files.com/x/1.jpg");
  assert.equal(m.gallery.length, 2);
  assert.equal(m.gallery[0].alt, "Studio Room at Leeu Estates");
  const c = unitMedia({ name: "Max House", stayName: "Leeu Estates", heroMediaId: "wildco/leeu/max-house", galleryMediaIds: ["wildco/leeu/max-2"], sourceHeroUrl: "https://cdn.prod.website-files.com/x/3.jpg", sourceGalleryUrls: [] });
  assert.match(c.hero!.url, /res\.cloudinary\.com.*wildco\/leeu\/max-house$/);
  assert.deepEqual(c.gallery.map((g) => g.source), ["cloudinary", "cloudinary", "legacy_cdn"]);
});
