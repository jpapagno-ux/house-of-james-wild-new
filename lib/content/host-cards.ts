import "server-only";
import type { Host, HostConnect } from "@/components/record/HostPanel";
import { GROUP_CALENDLY, GROUP_CONNECT_ON, HOSTS, hostFor } from "./hosts";

// Host cards from the Partner Desk (James, 4 Nov 2026): the desk is the one place hosts are kept. A partner
// proposes a host, the house approves the details, and the partner switches the card on or off. This reads
// the public view of that (public.site_host_cards: approved hosts switched on, and pages switched off) and
// falls back to the site's own list (lib/content/hosts.ts) for pages the desk does not hold yet.
// Cached for five minutes; if the desk can't be reached the site's own list is used, never an error.

type Row = { page_key: string; state: "available" | "not_linking"; name: string | null; card_line: string | null; place: string | null; tz: string | null; zone_label: string | null; seats: number | null; photo_url: string | null; topics: string[] | null };
export type HostCard = { state: HostConnect; host?: Host };

const GENERIC_TOPICS = [
  "The rooms or cabins, and which suits your party",
  "What the rate includes and what's extra",
  "Your dates against the best months",
  "Getting there: flights, transfers and timings",
  "Children, celebrations, dietary needs, and anything that keeps you up at night",
];

async function load(): Promise<Map<string, Row>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new Map();
  try {
    const res = await fetch(`${url}/rest/v1/site_host_cards?select=page_key,state,name,card_line,place,tz,zone_label,seats,photo_url,topics`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 300, tags: ["site-hosts"] },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return new Map();
    const rows = (await res.json()) as Row[];
    return new Map(rows.filter((r) => typeof r.page_key === "string").map((r) => [r.page_key, r]));
  } catch {
    return new Map();
  }
}

export function toCard(key: string, r: Row): HostCard {
  if (r.state === "not_linking" || !GROUP_CONNECT_ON || !r.name) return { state: "not_linking" };
  const own = HOSTS[key]?.host;
  const property = key.split(":")[1]?.replace(/\//g, "-") ?? "house";
  return {
    state: "available",
    host: {
      name: r.name, role: r.card_line || "Your host", photo: r.photo_url ?? null, seats: r.seats ?? 6,
      tz: r.tz ?? own?.tz, place: r.place ?? own?.place, zoneLabel: r.zone_label ?? own?.zoneLabel,
      calendlyUrl: `${GROUP_CALENDLY}?property=${property}`,
      topics: r.topics?.length ? r.topics : own?.topics ?? GENERIC_TOPICS,
    },
  };
}

/** The card for a page. `optional` pages (voyage and overland routes) show nothing unless a host is set. */
export async function hostCard(key: string, opts: { optional?: boolean } = {}): Promise<HostCard> {
  const row = (await load()).get(key);
  if (row) return toCard(key, row);
  if (opts.optional && !(key in HOSTS)) return { state: "off" };
  return hostFor(key);
}
