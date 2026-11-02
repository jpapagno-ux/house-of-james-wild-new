// Portfolio Health: an honest read of what the house holds for an entity, built only
// from records in the database (never assumed). Pure, no imports, so plain Node can test it.

export type CheckState = "ok" | "attention" | "missing";
export type HealthCheck = { key: string; label: string; state: CheckState; detail: string };

export type EntityFacts = {
  publicationStatus: string;
  provenance: string | null;
  hasParent: boolean;
  roomCount: number;
  parentRoomCount: number;
  contacts: { active: number; toVerify: number };
  verifications: Record<string, { status: "verified" | "attention" | "missing"; verifiedAt: string; validUntil: string | null } | undefined>;
  rateCards: { label: string; effectiveTo: string; status: string }[];
  promotions: { label: string; expires: string | null }[];
  openRequests: { media: number; editorial: number; commercial: number };
  today: string; // YYYY-MM-DD
};

const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const addDays = (d: string, n: number) => { const t = new Date(`${d}T00:00:00Z`); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };

export function entityHealth(f: EntityFacts): { score: number; checks: HealthCheck[] } {
  const checks: HealthCheck[] = [];
  const nextYear = String(Number(f.today.slice(0, 4)) + 1);

  // Contacts (organization level)
  checks.push(f.contacts.active > 0
    ? { key: "contacts", label: "Contacts current", state: "ok", detail: `${f.contacts.active} active contact${f.contacts.active === 1 ? "" : "s"}` }
    : f.contacts.toVerify > 0
      ? { key: "contacts", label: "Contacts current", state: "attention", detail: "Placeholder contact still to replace" }
      : { key: "contacts", label: "Contacts current", state: "missing", detail: "No contacts on file" });

  // Property information
  const info = f.verifications.property_info;
  checks.push(info?.status === "verified"
    ? { key: "property_info", label: "Property information verified", state: "ok", detail: `Verified ${fmt(info.verifiedAt.slice(0, 10))}` }
    : f.provenance === "PUBLIC_SOURCE"
      ? { key: "property_info", label: "Property information verified", state: "attention", detail: "Drafted from public sources; awaiting your confirmation" }
      : { key: "property_info", label: "Property information verified", state: "attention", detail: "Not yet verified with you" });

  // Rooms
  checks.push(f.roomCount > 0
    ? { key: "rooms", label: "Rooms & accommodation", state: "ok", detail: `${f.roomCount} room type${f.roomCount === 1 ? "" : "s"} on file` }
    : f.hasParent && f.parentRoomCount > 0
      ? { key: "rooms", label: "Rooms & accommodation", state: "attention", detail: "Held on the reserve record for now" }
      : { key: "rooms", label: "Rooms & accommodation", state: "missing", detail: "No rooms on file" });

  // Images
  const img = f.verifications.images;
  checks.push(img?.status === "verified"
    ? { key: "images", label: "Images current", state: "ok", detail: `Reviewed ${fmt(img.verifiedAt.slice(0, 10))}` }
    : f.openRequests.media > 0
      ? { key: "images", label: "Images current", state: "attention", detail: `${f.openRequests.media} media request${f.openRequests.media === 1 ? "" : "s"} open` }
      : { key: "images", label: "Images current", state: "attention", detail: "Not yet reviewed" });

  // Rates: covered through the end of next year?
  const published = f.rateCards.filter((c) => c.status === "published").sort((a, b) => b.effectiveTo.localeCompare(a.effectiveTo));
  const latest = published[0];
  checks.push(!latest
    ? { key: "rates", label: `${nextYear} rates`, state: "missing", detail: "No rate card on file" }
    : latest.effectiveTo >= `${nextYear}-12-31`
      ? { key: "rates", label: `${nextYear} rates`, state: "ok", detail: `${latest.label}, valid through ${fmt(latest.effectiveTo)}` }
      : { key: "rates", label: `${nextYear} rates`, state: "attention", detail: `Valid through ${fmt(latest.effectiveTo)}` });

  // Offers expiring within 45 days
  const soon = f.promotions.filter((p) => p.expires && p.expires >= f.today && p.expires <= addDays(f.today, 45)).sort((a, b) => a.expires!.localeCompare(b.expires!));
  if (soon.length) checks.push({ key: "offers", label: "Offers", state: "attention", detail: `${soon[0].label} expires ${fmt(soon[0].expires!)}` });

  // Requests
  const open = f.openRequests.media + f.openRequests.editorial + f.openRequests.commercial;
  checks.push(open === 0
    ? { key: "requests", label: "Requests answered", state: "ok", detail: "Nothing outstanding" }
    : { key: "requests", label: "Requests answered", state: "attention", detail: `${open} open request${open === 1 ? "" : "s"}` });

  const weight = { ok: 1, attention: 0.5, missing: 0 } as const;
  const score = Math.round((100 * checks.reduce((s, c) => s + weight[c.state], 0)) / checks.length);
  return { score, checks };
}

/** Averages entity scores into one portfolio figure. */
export const portfolioScore = (scores: number[]) => (scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0);
