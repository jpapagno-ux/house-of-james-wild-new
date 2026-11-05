// Rooms & Accommodation (Stage 2 §3.2). Partners propose changes to the descriptive room fields
// through revisions on public.room_types; an editor approves each. The Airtable rates sync owns a
// room's name, description, occupancy and whether it exists, so those (and new rooms) arrive as a
// request the house loads into Airtable (D-08), never as a direct edit the sync would undo.
// (Kept free of imports so plain Node can test it; same rule as content.ts.)
function toList(raw: unknown): string[] {
  const src = Array.isArray(raw) ? raw.map(String) : typeof raw === "string" ? raw.split(/\r?\n/) : [];
  return src.map((l) => l.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean);
}

export type RoomKind = "line" | "text" | "list" | "number" | "choice";
export type RoomField = { key: string; label: string; kind: RoomKind; max: number; help: string; choices?: string[] };

export const ROOM_CATEGORIES = ["room", "suite", "villa", "residence", "cottage", "house", "tent", "cabin", "treehouse"] as const;
export const ROOM_CATEGORY_LABEL: Record<string, string> = {
  room: "Rooms", suite: "Suites", villa: "Villas", residence: "Residences", cottage: "Cottages", house: "Houses", tent: "Tents", cabin: "Cabins", treehouse: "Treehouses",
};

export const ROOM_FIELDS: RoomField[] = [
  { key: "unit_type", label: "Category", kind: "choice", max: 20, choices: [...ROOM_CATEGORIES], help: "How guests would describe it." },
  { key: "short_description", label: "In one line", kind: "text", max: 300, help: "What makes this room itself, in a sentence." },
  { key: "full_description", label: "Description", kind: "text", max: 2000, help: "Layout, light, what you see from the bed. Plain facts; the house writes the story." },
  { key: "bed_configuration", label: "Beds", kind: "line", max: 120, help: "e.g. 1 king bed, or 2 queen beds and a sofa bed." },
  { key: "size_sqm", label: "Size (m²)", kind: "number", max: 5000, help: "Inside and terrace together, in square metres." },
  { key: "view_name", label: "View", kind: "line", max: 120, help: "e.g. Ayung River valley, Sabie River, vineyard." },
  { key: "features", label: "Features", kind: "list", max: 30, help: "One per line: private pool, outdoor shower, fireplace." },
  { key: "included", label: "Included in the rate", kind: "list", max: 30, help: "One per line, for this room: meals, drinks, transfers, activities." },
  { key: "excluded", label: "Not included", kind: "list", max: 30, help: "One per line: what guests pay for on top." },
  { key: "important_notes", label: "Good to know", kind: "list", max: 15, help: "One per line: age limits, stairs, rates per person sharing." },
];
export const ROOM_FIELD = Object.fromEntries(ROOM_FIELDS.map((f) => [f.key, f])) as Record<string, RoomField>;
export const ROOM_KEYS = ROOM_FIELDS.map((f) => f.key);
/** Owned by the Airtable rates sync: changed by request, never by a direct revision. */
export const SYNC_OWNED = ["name", "description", "max_adults", "max_children", "max_occupancy", "active"] as const;

export function normaliseRoomValue(key: string, raw: unknown): { ok: true; value: string | number | string[] } | { ok: false; message: string } {
  const f = ROOM_FIELD[key];
  if (!f) return { ok: false, message: "That field can't be changed here" };
  if (f.kind === "list") {
    const list = toList(raw);
    if (!list.length) return { ok: false, message: `${f.label}: add at least one line` };
    if (list.length > f.max) return { ok: false, message: `${f.label}: up to ${f.max} lines` };
    if (list.some((l) => l.length > 300)) return { ok: false, message: `${f.label}: keep each line under 300 characters` };
    if (list.some((l) => /[–—]/.test(l))) return { ok: false, message: `${f.label}: please use a comma instead of a long dash` };
    return { ok: true, value: list };
  }
  const v = typeof raw === "number" ? String(raw) : typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
  if (!v) return { ok: false, message: `${f.label}: enter the new value` };
  if (f.kind === "number") {
    const n = Number(v.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0 || n > f.max) return { ok: false, message: `${f.label}: a number between 1 and ${f.max}` };
    return { ok: true, value: Math.round(n * 10) / 10 };
  }
  if (f.kind === "choice") {
    const c = v.toLowerCase();
    if (!f.choices!.includes(c)) return { ok: false, message: `${f.label}: choose from the list` };
    return { ok: true, value: c };
  }
  if (f.kind === "line" && v.includes("\n")) return { ok: false, message: `${f.label}: one line only` };
  if (v.length > f.max) return { ok: false, message: `${f.label}: up to ${f.max} characters` };
  if (/[–—]/.test(v)) return { ok: false, message: `${f.label}: please use a comma or a full stop instead of a long dash` };
  return { ok: true, value: v };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type RoomChanges = { roomId: string; changes: { field: string; value: string | number | string[] }[]; note: string | null };
export function parseRoomChanges(body: unknown): { ok: true; value: RoomChanges } | { ok: false; message: string; field: string } {
  const b = (body ?? {}) as { roomId?: unknown; changes?: unknown; note?: unknown };
  if (typeof b.roomId !== "string" || !UUID.test(b.roomId)) return { ok: false, message: "Unknown room", field: "roomId" };
  if (!b.changes || typeof b.changes !== "object" || Array.isArray(b.changes)) return { ok: false, message: "Nothing to send", field: "changes" };
  const changes: RoomChanges["changes"] = [];
  for (const [field, raw] of Object.entries(b.changes as Record<string, unknown>)) {
    if (!ROOM_KEYS.includes(field)) return { ok: false, message: (SYNC_OWNED as readonly string[]).includes(field) ? "Names and occupancy change by request to the house" : "That field can't be changed here", field };
    const n = normaliseRoomValue(field, raw);
    if (!n.ok) return { ok: false, message: n.message, field };
    changes.push({ field, value: n.value });
  }
  if (!changes.length) return { ok: false, message: "Change at least one field before sending", field: "changes" };
  const note = typeof b.note === "string" && b.note.trim() ? b.note.trim().slice(0, 2000) : null;
  return { ok: true, value: { roomId: b.roomId, changes, note } };
}

/** A new room, or a name or occupancy change: a structured request the house loads into Airtable. */
export type RoomRequest = { propertyId: string; kind: "new" | "change"; roomId: string | null; name: string; category: string | null; beds: string | null; adults: number | null; children: number | null; units: number | null; note: string | null };
export function parseRoomRequest(body: unknown): { ok: true; value: RoomRequest } | { ok: false; message: string; field: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const s = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const n = (k: string) => { const v = s(k) || (typeof b[k] === "number" ? String(b[k]) : ""); if (!v) return null; const x = Number(v); return Number.isInteger(x) && x >= 0 && x <= 99 ? x : NaN; };
  if (!UUID.test(s("propertyId"))) return { ok: false, message: "Choose a property", field: "propertyId" };
  const kind = s("kind") === "change" ? "change" : "new";
  const roomId = s("roomId") || null;
  if (kind === "change" && (!roomId || !UUID.test(roomId))) return { ok: false, message: "Choose the room to change", field: "roomId" };
  const name = s("name");
  if (name.length < 2 || name.length > 120) return { ok: false, message: "Enter the room's name, as guests will see it", field: "name" };
  const category = s("category").toLowerCase() || null;
  if (category && !(ROOM_CATEGORIES as readonly string[]).includes(category)) return { ok: false, message: "Choose a category", field: "category" };
  const adults = n("adults"), children = n("children"), units = n("units");
  for (const [k, v] of [["adults", adults], ["children", children], ["units", units]] as const) if (Number.isNaN(v)) return { ok: false, message: "Use a whole number", field: k };
  return { ok: true, value: { propertyId: s("propertyId"), kind, roomId, name, category, beds: s("beds").slice(0, 120) || null, adults, children, units, note: s("note").slice(0, 2000) || null } };
}
/** The request as the house reads it in the review queue. */
export function roomRequestNote(r: RoomRequest, currentName?: string): string {
  return [
    r.kind === "new" ? `New room: ${r.name}` : `Change to ${currentName ?? "a room"}: ${r.name}`,
    r.category ? `Category: ${r.category}` : null,
    r.beds ? `Beds: ${r.beds}` : null,
    r.adults !== null ? `Adults: ${r.adults}` : null,
    r.children !== null ? `Children: ${r.children}` : null,
    r.units !== null ? `How many of them: ${r.units}` : null,
    r.note ? `\n${r.note}` : null,
    "\nFor the house: load this into the Airtable rates base (Room Types); the sync brings it to the site.",
  ].filter(Boolean).join("\n");
}
