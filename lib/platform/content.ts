// Property content partners may propose (Stage 2 §3.1). Every change is a revision on
// public.entity_content that a house editor approves; the publish run (D-18 A) carries approved
// content to the Library and so to the site. Partners never touch James Wild editorial copy
// (the tagline, the quote, "why we chose it", founder notes), Pathways, SEO or layout.

export type ContentKind = "line" | "text" | "list";
export type ContentField = { key: string; label: string; kind: ContentKind; max: number; help: string; site?: (s: Record<string, unknown>) => string | string[] | null };

const items = (v: unknown): string[] | null => {
  const o = v as { items?: unknown } | null;
  return o && Array.isArray(o.items) && o.items.length ? (o.items as string[]) : null;
};
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

export const CONTENT_FIELDS: ContentField[] = [
  { key: "overview", label: "About the property", kind: "text", max: 2000,
    help: "Plain facts in two or three short paragraphs: where it is, how many suites or villas, what the setting is like. The house writes the story; you give us what's true." },
  { key: "nearest_airport", label: "Nearest airport", kind: "line", max: 160, help: "Name and code, e.g. Ngurah Rai International Airport (DPS).", site: (s) => str(s.airport) },
  { key: "getting_there", label: "Getting there", kind: "text", max: 1200, help: "The road in: distance, time, the transfer you offer and whether it costs extra. Flights and airstrips if there are any.", site: (s) => str(s.airportDirections) },
  { key: "best_months", label: "Best months", kind: "line", max: 160, help: "When you'd send a friend, and why, in one line.", site: (s) => str(s.bestMonths) },
  { key: "features", label: "Features", kind: "list", max: 30, help: "One per line. What every guest has: the pool, the butler, the spa.", site: (s) => items(s.features) },
  { key: "experiences", label: "Experiences", kind: "list", max: 30, help: "One per line. What guests do, and what changes at sunrise.", site: (s) => items(s.experiences) },
  { key: "inclusions", label: "Included in the rate", kind: "list", max: 30, help: "One per line: meals, drinks, activities, transfers, park fees." },
  { key: "exclusions", label: "Not included", kind: "list", max: 30, help: "One per line: what guests pay for on top." },
  { key: "children_policy", label: "Children", kind: "text", max: 800, help: "Minimum ages, family suites, activities that have age limits." },
  { key: "sustainability", label: "Sustainability", kind: "text", max: 1500, help: "What you actually do: energy, water, plastic, sourcing. Numbers beat adjectives." },
  { key: "conservation", label: "Conservation", kind: "text", max: 1500, help: "Land, wildlife or reef you protect, and the partners you work with." },
  { key: "community", label: "Community", kind: "text", max: 1500, help: "Who works here, who benefits, and how guests can take part." },
];
export const CONTENT_KEYS = CONTENT_FIELDS.map((f) => f.key);
export const CONTENT_FIELD = Object.fromEntries(CONTENT_FIELDS.map((f) => [f.key, f])) as Record<string, ContentField>;
const LINE_MAX = 300;

/** A list typed one item per line becomes a clean array. */
export function toList(raw: unknown): string[] {
  const src = Array.isArray(raw) ? raw.map(String) : typeof raw === "string" ? raw.split(/\r?\n/) : [];
  return src.map((l) => l.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean);
}

/** Normalises one value; returns an error message or the value to store. */
export function normaliseValue(key: string, raw: unknown): { ok: true; value: string | string[] } | { ok: false; message: string } {
  const f = CONTENT_FIELD[key];
  if (!f) return { ok: false, message: "That field can't be changed here" };
  if (f.kind === "list") {
    const list = toList(raw);
    if (!list.length) return { ok: false, message: `${f.label}: add at least one line` };
    if (list.length > f.max) return { ok: false, message: `${f.label}: up to ${f.max} lines` };
    if (list.some((l) => l.length > LINE_MAX)) return { ok: false, message: `${f.label}: keep each line under ${LINE_MAX} characters` };
    return { ok: true, value: list };
  }
  const v = typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
  if (!v) return { ok: false, message: `${f.label}: enter the new text` };
  if (f.kind === "line" && v.includes("\n")) return { ok: false, message: `${f.label}: one line only` };
  if (v.length > f.max) return { ok: false, message: `${f.label}: up to ${f.max} characters` };
  if (/[–—]/.test(v)) return { ok: false, message: `${f.label}: please use a comma or a full stop instead of a long dash` };
  return { ok: true, value: v };
}

export type ContentChanges = { propertyId: string; changes: { field: string; value: string | string[] }[]; note: string | null };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseContentChanges(body: unknown): { ok: true; value: ContentChanges } | { ok: false; message: string; field: string } {
  const b = (body ?? {}) as { propertyId?: unknown; changes?: unknown; note?: unknown };
  if (typeof b.propertyId !== "string" || !UUID.test(b.propertyId)) return { ok: false, message: "Unknown property", field: "propertyId" };
  if (!b.changes || typeof b.changes !== "object" || Array.isArray(b.changes)) return { ok: false, message: "Nothing to send", field: "changes" };
  const changes: ContentChanges["changes"] = [];
  for (const [field, raw] of Object.entries(b.changes as Record<string, unknown>)) {
    if (!CONTENT_KEYS.includes(field)) return { ok: false, message: "That field can't be changed here", field };
    const n = normaliseValue(field, raw);
    if (!n.ok) return { ok: false, message: n.message, field };
    changes.push({ field, value: n.value });
  }
  if (!changes.length) return { ok: false, message: "Change at least one field before sending", field: "changes" };
  const note = typeof b.note === "string" && b.note.trim() ? b.note.trim().slice(0, 2000) : null;
  return { ok: true, value: { propertyId: b.propertyId, changes, note } };
}
