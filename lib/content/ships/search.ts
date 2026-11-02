import { SHIPS } from "./index";
import { allCards } from "./cards";
import { POLAR_WATERS, SHIP_REGISTRY, WATERS_HUBS, type Activity, type Waters } from "./registry";
import { activeMonths } from "./months";
import { departureMonths, groupMonths, type PageLink, type SearchItem, type SearchWhere, type Who } from "./search-match";
import { POLAR_PATH } from "@/lib/content/polar";

// The search index for "Find your voyage" on /voyages: one row per filed ship, built at build time
// from the registry (facts, waters, charter) and her record (departures, lengths, ports, routes).
// Records reach here with past departures already removed (lib/dates.ts), and month groups pass
// activeMonths, so the When filter only ever offers a month with a real departure still to sail.

const whereOf = (w: Waters): SearchWhere => (POLAR_WATERS.includes(w) ? "polar" : (w as SearchWhere));
const portsOf = (dirs: string[]) => [...new Set(dirs.flatMap((d) => d.replace(/\s*\(.*?\)/g, "").replace(/,?\s*(round trip|either way)$/i, "").split(/\s+to\s+|\s+or\s+|\s*,\s*/)).map((p) => p.trim()).filter((p) => p.length > 2 && p.length < 32 && !/\d|nights?|route/i.test(p)))];

export function searchItems(): SearchItem[] {
  const cards = allCards();
  return cards.map((c) => {
    const reg = SHIP_REGISTRY.find((r) => r.slug === c.slug)!;
    const e = SHIPS.find((x) => x.slug === c.slug);
    const s = e?.data;
    const monthly = s?.monthly ? activeMonths(s.monthly) : [];
    const months = s ? [...new Set([...departureMonths(s.departures), ...groupMonths(monthly)])].sort() : [];
    const nights = s ? [...new Set([...s.itineraries.map((i) => i.nights), ...s.departures.map((d) => d.nights), ...monthly.map((g) => g.nights)].filter((n): n is number => typeof n === "number" && n > 0))].sort((a, b) => a - b) : [];
    const port = s?.facts.find(([k]) => /^port$/i.test(k))?.[1];
    return {
      slug: c.slug, name: c.name, href: c.href, eyebrow: c.eyebrow, operator: reg.operator, image: c.image, price: c.price, low: c.low,
      where: [...new Set(reg.waters.map(whereOf))],
      months, nights,
      traits: reg.traits ?? {},
      couples: !!s?.suits.some((x) => /couple|honeymoon/i.test(x.who)),
      charter: !!reg.charter?.whole,
      ports: s ? portsOf([...s.itineraries.map((i) => i.direction), ...(port ? [port] : [])]) : [],
      routes: s ? s.itineraries.filter((i) => i.name).map((i) => ({ name: i.name, href: i.href ?? c.href })) : [],
      page: c.page,
    };
  });
}

/** Months to offer in the When filter: every month at least one ship sails, in order. */
export const searchMonths = (items: SearchItem[]) => [...new Set(items.flatMap((x) => x.months))].sort().slice(0, 24);

/** Real pages a search can land on (the category pages join as they are built). */
export const SEARCH_PAGES: { where: Partial<Record<SearchWhere, PageLink>>; who: Partial<Record<Who, PageLink>>; what: Partial<Record<Activity, PageLink>> } = {
  where: {
    nile: { label: "The Nile, ship by ship", href: WATERS_HUBS.nile.path },
    amazon: { label: "The Amazon, ship by ship", href: WATERS_HUBS.amazon.path },
    galapagos: { label: "The Galápagos, ship by ship", href: WATERS_HUBS.galapagos.path },
    indonesia: { label: "Indonesia, ship by ship", href: WATERS_HUBS.indonesia.path },
    polar: { label: "Polar Crossings", href: POLAR_PATH },
  },
  who: {
    couple: { label: "Honeymoons and couples, compared", href: "/voyages/honeymoon" },
    family: { label: "Family voyages: ages, cabins and programmes", href: "/voyages/family" },
    solo: { label: "Solo voyages: single supplements compared", href: "/voyages/solo" },
    group: { label: "The Whole Ship: charters for your group", href: "/voyages/charter" },
  },
  what: {
    sailing: { label: "Under Sail", href: "/voyages/sailing" },
  },
};
