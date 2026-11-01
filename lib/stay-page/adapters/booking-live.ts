import "server-only";
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { AccommodationUnit, BookingMode, DisplayPrice, StayCommerce } from "../contract";
import { pricingModeFrom, propertyPricingMode } from "../pricing";
import { unitMedia } from "./media";

// Booking Live adapter: the canonical accommodation units and commerce
// facts for one property, read from JWC Booking Live (Supabase) with the
// public anon key under row-level security (published properties, active
// room types, published rate cards only). No cookies, so the Stay page stays
// static and revalidates on an interval rather than per request.
//
// Canonical rule (James, Nov 2026): a unit is canonical when it was migrated
// from the Intelligence Library (source_system set). Prototype/sample rows
// (the Airtable-born "Manor House Suite (sample)") are never rendered.

const REVALIDATE_SECONDS = 900;

type RoomRow = {
  id: string; code: string; name: string; description: string | null; max_adults: number | null; max_children: number | null; max_occupancy: number | null;
  unit_type: string | null; bed_configuration: string | null; size_sqm: number | string | null; size_sqft: number | string | null; view_name: string | null;
  private_pool: boolean | null; private_terrace: boolean | null; connecting_available: boolean | null; short_description: string | null; full_description: string | null;
  pricing_mode: string | null; booking_mode: string | null; hero_media_id: string | null; gallery_media_ids: string[] | null; sort_order: number | null; founder_note: string | null;
  amenities: string[] | null; features: string[] | null; included: string[] | null; excluded: string[] | null; important_notes: string[] | null;
  legacy_room_id: string | null; source_system: string | null; reference_from_rate: number | string | null; reference_currency: string | null; reference_rate_status: string | null;
  source_hero_url: string | null; source_gallery_urls: string[] | null; occupancy_status: string | null;
};

export type BookingLiveStay = { commerce: StayCommerce; accommodations: AccommodationUnit[]; qa: string[] };

const num = (v: number | string | null | undefined) => (v == null || v === "" ? null : Number(v));
const clean = (xs: string[] | null | undefined) => (xs ?? []).map((s) => (s ?? "").trim()).filter(Boolean);
const WHOLE = /^(cottage|house|villa|residence|lodge|camp|tent|bungalow|cabin)$/i;
const isCanonical = (r: RoomRow) => !!r.source_system && !/\(sample\)|\bsample\b|\bprototype\b/i.test(r.name);
const bookingMode = (raw: string | null | undefined, fallback: BookingMode): BookingMode => (raw === "live" || raw === "request" || raw === "inquiry" ? raw : fallback);

async function fetchBookingLive(slug: string, stayName: string, liveEngineProperty: string | null): Promise<BookingLiveStay | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: prop, error } = await sb.from("properties").select("id, slug, name, booking_mode, default_currency, legacy_cms_id").eq("slug", slug).maybeSingle();
  if (error || !prop) return null;
  const qa: string[] = [];

  const { data: rows, error: rerr } = await sb.from("room_types").select("*").eq("property_id", prop.id).eq("active", true);
  if (rerr || !rows) return null;
  const all = rows as RoomRow[];
  const canonical = all.filter(isCanonical);
  const skipped = all.length - canonical.length;
  if (skipped) qa.push(`${skipped} non-canonical room record${skipped === 1 ? "" : "s"} (sample/prototype) hidden.`);
  if (!canonical.length) return null;

  // Approved rate cards: the lowest published nightly amount per unit, never a sample card outside Preview.
  const allowSample = process.env.BOOKING_LIVE_ALLOW_SAMPLE_RATES === "on" && process.env.VERCEL_ENV !== "production";
  let cq = sb.from("rate_card_versions").select("id, version_label, currency, effective_from, effective_to, approved_at, is_sample").eq("property_id", prop.id).eq("status", "published");
  if (!allowSample) cq = cq.eq("is_sample", false);
  const { data: cards } = await cq;
  const cardFrom = new Map<string, DisplayPrice>();
  if (cards?.length) {
    const { data: rules } = await sb.from("seasonal_rate_rules").select("rate_card_version_id, room_type_id, amount_minor, stay_start, stay_end").in("rate_card_version_id", cards.map((c) => c.id)).eq("active", true);
    for (const r of rules ?? []) {
      const card = cards.find((c) => c.id === r.rate_card_version_id);
      if (!card) continue;
      const amount = Number(r.amount_minor) / 100;
      const prev = cardFrom.get(r.room_type_id);
      if (prev && prev.total.amount <= amount) continue;
      cardFrom.set(r.room_type_id, {
        total: { amount, currency: card.currency }, perNight: { amount, currency: card.currency }, nights: 1, label: `${card.version_label} contracted rate`,
        provenance: { sourceType: "RATE_CARD", provider: `Rate card ${card.version_label}${card.is_sample ? " (sample)" : ""}`, currency: card.currency, retrievedAt: null, verifiedAt: card.approved_at ?? null, validFrom: card.effective_from, validTo: card.effective_to, availability: "on_request", availabilityCheckedAt: null, reference: card.version_label },
      });
    }
  }

  const propMode = bookingMode(prop.booking_mode, "request");
  const units: AccommodationUnit[] = canonical.map((r) => {
    const occupancyVerified = r.occupancy_status === "verified";
    const unitType = r.unit_type?.toLowerCase() ?? null;
    const legacy = r.reference_from_rate != null && r.reference_currency ? { amount: Number(r.reference_from_rate), currency: r.reference_currency, status: r.reference_rate_status ?? "legacy_reference", sourceRoomId: r.legacy_room_id } : null;
    return {
      id: r.id, code: r.code, name: r.name.trim(), unitType,
      group: unitType && WHOLE.test(unitType) ? "whole" : "room",
      shortDescription: r.short_description?.trim() || null,
      fullDescription: r.full_description?.trim() || r.description?.trim() || null,
      occupancy: { status: occupancyVerified ? "verified" : "unverified", maxAdults: occupancyVerified ? r.max_adults : null, maxChildren: occupancyVerified ? r.max_children : null, maxOccupancy: occupancyVerified ? r.max_occupancy : null },
      bedConfiguration: r.bed_configuration?.trim() || null,
      size: { sqm: num(r.size_sqm), sqft: num(r.size_sqft) },
      view: r.view_name?.trim() || null,
      privatePool: r.private_pool, privateTerrace: r.private_terrace, connectingAvailable: r.connecting_available,
      features: clean(r.features).length ? clean(r.features) : clean(r.amenities),
      included: clean(r.included), excluded: clean(r.excluded), importantNotes: clean(r.important_notes),
      founderNote: r.founder_note?.trim() || null,
      media: unitMedia({ name: r.name.trim(), stayName, heroMediaId: r.hero_media_id, galleryMediaIds: r.gallery_media_ids, sourceHeroUrl: r.source_hero_url, sourceGalleryUrls: r.source_gallery_urls }),
      pricingMode: pricingModeFrom(r.pricing_mode, !!liveEngineProperty),
      bookingMode: bookingMode(r.booking_mode, propMode),
      liveMatchKey: r.name.trim(),
      legacyReference: legacy,
      rateCardFrom: cardFrom.get(r.id) ?? null,
      sortOrder: r.sort_order,
    };
  });

  const noMedia = units.filter((u) => !u.media.hero).map((u) => u.name);
  if (noMedia.length) qa.push(`No usable photograph for: ${noMedia.join(", ")}.`);
  const unverified = units.filter((u) => u.occupancy.status !== "verified").length;
  if (unverified) qa.push(`Occupancy unverified on ${unverified} of ${units.length} units (guest counts withheld).`);
  const thin = units.filter((u) => !u.features.length && !u.included.length && !u.shortDescription).length;
  if (thin) qa.push(`${thin} units carry no description, features or inclusions yet; the detail panel shows only what is on record.`);

  return {
    commerce: { propertyId: prop.id, propertySlug: prop.slug, propertyBookingMode: propMode, defaultCurrency: prop.default_currency ?? "USD", liveEngineProperty, pricingMode: propertyPricingMode(units, !!liveEngineProperty) },
    accommodations: units,
    qa,
  };
}

/** Cached read (15 minutes), keyed by slug. A failed read returns null so the page can fall back. */
export async function loadBookingLiveStay(slug: string, stayName: string, liveEngineProperty: string | null): Promise<BookingLiveStay | null> {
  const run = unstable_cache(() => fetchBookingLive(slug, stayName, liveEngineProperty).catch(() => null), ["stay-page:booking-live", slug], { revalidate: REVALIDATE_SECONDS, tags: ["booking-live:accommodations", `stay:${slug}`] });
  return run();
}
