import "server-only";
import type { StayData } from "@/lib/content/stays";
import type { StayPageData } from "./contract";
import { editorialFrom } from "./adapters/editorial";
import { loadBookingLiveStay } from "./adapters/booking-live";

// Assemble the Stay-page contract for one stay. Returns null when Booking
// Live has no canonical accommodation for the slug (or cannot be reached), so
// the page keeps its existing layout for every other stay and never loses the
// live-rate band. Units are ordered by Booking Live sort_order, then rooms
// before whole houses, then (internally only) by the imported reference rate
// so categories read from entry level upward, then by name. The reference rate
// orders; it is never displayed.

export async function assembleStayPage(s: StayData): Promise<StayPageData | null> {
  const editorial = editorialFrom(s);
  const live = await loadBookingLiveStay(s.slug, editorial.name, s.engine);
  if (!live) return null;
  const accommodations = [...live.accommodations].sort((a, b) =>
    (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) || (a.group === b.group ? 0 : a.group === "room" ? -1 : 1) || (a.legacyReference?.amount ?? Infinity) - (b.legacyReference?.amount ?? Infinity) || a.name.localeCompare(b.name));
  return { editorial, commerce: live.commerce, accommodations, qa: live.qa, assembledAt: new Date().toISOString() };
}
