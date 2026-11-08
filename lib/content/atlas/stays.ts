import { pageReady, staysIn } from "@/lib/content/stays";
import { statusLine, type HouseStatus } from "@/lib/ledger/status";
import { recordHref } from "@/lib/ledger/urls";
import { volumeMark } from "@/lib/volumes";
import { ADVISORS, DEFAULT_ADVISOR, advisorsFor } from "@/lib/content/advisors";
import type { AtlasData, AtlasEntry } from "@/components/maps/terrain/atlas";

// Board 4, the country atlas beyond Indonesia (James approved, 3 Nov 2026): every stay in the Ledger for the country
// that has a filed pin, with its founder mark, James's own note where his Desk holds one, and the real advisors who
// carry it. Parks, dive sites and volcanoes are added per country only from official sources, so they start empty;
// stays without a pin are listed in `missing`, never guessed.
/** Countries that straddle the 180th meridian: western-hemisphere pins are carried past 180 (Fiji's Matangi, Laucala). */
const DATELINE = ["fiji"];
export function staysAtlas(country: string, name: string, regionSlug: string): AtlasData & { missing: string[] } {
  const missing: string[] = [];
  const entries: AtlasEntry[] = [];
  const ink = volumeMark("stays");
  for (const s of staysIn(country)) {
    if (!s.coords) { missing.push(`Stay: ${s.name} (${s.slug}, ${s.ledgerId ?? "no Ledger ID"}): no pin filed`); continue; }
    entries.push({
      id: `stay-${s.slug}`, kind: "stay", name: s.name, ledgerId: s.ledgerId ?? null, lat: s.coords.lat, lng: DATELINE.includes(country) && s.coords.lng < 0 ? s.coords.lng + 360 : s.coords.lng, color: ink,
      href: pageReady(s) ? recordHref("stay", s.slug) : `/plan?q=${encodeURIComponent(s.name)}`,
      image: s.hero ? { url: s.hero, alt: `${s.name}, ${name}` } : null,
      mark: statusLine(s.status as HouseStatus | null, s.statusDate, s.slug), sub: s.category ? s.category.charAt(0).toUpperCase() + s.category.slice(1) : "Stay",
    });
  }
  const jamesDesk = ADVISORS.find((a) => a.slug === DEFAULT_ADVISOR)?.desk?.entries ?? [];
  const real = advisorsFor({ countrySlug: country, regionSlug }).advisors.filter((a) => !a.sample);
  for (const e of entries) {
    if (!e.ledgerId) continue;
    const d = jamesDesk.find((x) => x.ledgerId === e.ledgerId);
    if (d?.note && d.james?.year) e.jamesNote = { text: d.note, year: d.james.year };
    const ask = real.filter((a) => (a.desk?.entries ?? []).some((x) => x.ledgerId === e.ledgerId));
    if (ask.length) e.ask = ask.map((a) => ({ first: a.firstName, href: `/plan?advisor=${a.slug}&destination=${country}&trip=${encodeURIComponent(e.name)}` }));
  }
  return { routes: [], entries, parks: [], dives: [], volcanoes: [], flight: [], volcanoAsOf: null, volcanoSource: "", missing };
}
