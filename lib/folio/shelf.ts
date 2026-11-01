// My Folio — the shelf on this device (Stage 4, 31 Oct 2026).
//
// Iggi hands a shaped journey back to the site as a Folio with a FOL number
// (issued once by the Iggi Core, filed there with the advisor it is open
// with). Until traveller accounts are on in production, the shelf lives in
// this browser: nothing leaves the device, and the FOL number is what the
// house looks up when the traveller quotes it. With accounts on, the same
// Folio is also saved to the traveller's account (components/iggi/IggiPanel).

export type FolioAdvisor = { name: string; firstName?: string; adv: string | null; slug: string | null; plan?: string | null; profile?: string | null; portrait?: string | null; isDefault?: boolean };
export type FolioStay = { name: string; slug: string | null; ledger_id: string | null; reason?: string | null; gateway?: string | null };
export type Folio = {
  fol: string;
  title: string;
  summary: string | null;
  advisor: FolioAdvisor | null;
  stays: FolioStay[];
  days: { day_number: number; title: string }[];
  ledger_ids: string[];
  country: string | null;
  volume: string | null;
  source_page: string | null;
  opened_at: string;
  plan: string;
};

const KEY = "jw.folio.shelf.v1";
// FOL- (Folio) or JRN- (Journey Sketch, the pre-Folio a chat opens — Contract A6, 31 Oct 2026).
const FOL = /^(FOL|JRN)-\d{4}-\d{6}$/;

export const isFolioId = (s: unknown): s is string => typeof s === "string" && FOL.test(s);

function read(): Folio[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(v) ? (v as Folio[]).filter((f) => f && isFolioId(f.fol)) : [];
  } catch { return []; }
}

export function listFolios(): Folio[] { return read().sort((a, b) => (b.opened_at || "").localeCompare(a.opened_at || "")); }
export function getFolio(fol: string): Folio | null { return read().find((f) => f.fol === fol) ?? null; }

/** Shelves a Folio (replacing an earlier copy of the same number). Returns false when storage is unavailable. */
export function saveFolio(f: Folio): boolean {
  if (!isFolioId(f.fol)) return false;
  try {
    const rest = read().filter((x) => x.fol !== f.fol);
    localStorage.setItem(KEY, JSON.stringify([f, ...rest].slice(0, 40)));
    return true;
  } catch { return false; }
}

export function removeFolio(fol: string): void {
  try { localStorage.setItem(KEY, JSON.stringify(read().filter((x) => x.fol !== fol))); } catch { /* nothing to do */ }
}

/** Takes the Core's Folio payload and keeps only what the shelf needs, typed. */
export function folioFromCore(raw: unknown): Folio | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!isFolioId(r.fol) || typeof r.title !== "string") return null;
  const str = (v: unknown, n = 300) => (typeof v === "string" ? v.slice(0, n) : null);
  const adv = r.advisor && typeof r.advisor === "object" ? (r.advisor as Record<string, unknown>) : null;
  const stays = Array.isArray(r.stays) ? (r.stays as Record<string, unknown>[]).filter((s) => s && typeof s.name === "string").slice(0, 20).map((s) => ({ name: String(s.name).slice(0, 120), slug: str(s.slug, 120), ledger_id: str(s.ledger_id, 40), reason: str(s.reason, 300), gateway: str(s.gateway, 80) })) : [];
  const days = Array.isArray(r.days) ? (r.days as Record<string, unknown>[]).filter((d) => d && typeof d.title === "string").slice(0, 21).map((d, i) => ({ day_number: Number(d.day_number) || i + 1, title: String(d.title).slice(0, 160) })) : [];
  return {
    fol: r.fol,
    title: r.title.slice(0, 120),
    summary: str(r.summary, 1200),
    advisor: adv && typeof adv.name === "string" ? { name: adv.name.slice(0, 80), firstName: str(adv.firstName, 40) ?? undefined, adv: str(adv.adv, 20), slug: str(adv.slug, 60), plan: str(adv.plan, 300), profile: str(adv.profile, 300), portrait: str(adv.portrait, 400), isDefault: adv.isDefault === true } : null,
    stays,
    days,
    ledger_ids: Array.isArray(r.ledger_ids) ? (r.ledger_ids as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 30) : [],
    country: str(r.country, 60),
    volume: str(r.volume, 20),
    source_page: str(r.source_page, 200),
    opened_at: typeof r.opened_at === "string" ? r.opened_at : new Date().toISOString(),
    plan: typeof r.plan === "string" ? r.plan.slice(0, 400) : "/plan",
  };
}
