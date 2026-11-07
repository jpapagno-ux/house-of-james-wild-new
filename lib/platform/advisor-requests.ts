// Advisor Desk · Step 5 · Quote requests. Pure helpers, no imports, so plain Node can test them.

export type RequestStatus = "sent" | "pricing" | "held" | "confirmed" | "declined" | "withdrawn";
export const REQUEST_STATUS: Record<RequestStatus, { label: string; tone: "progress" | "good" | "attention" | "neutral"; line: string }> = {
  sent: { label: "Sent", tone: "progress", line: "The house has it and will price it." },
  pricing: { label: "Being priced", tone: "progress", line: "The house is checking price and space with the property." },
  held: { label: "Held", tone: "good", line: "Priced and held for your client until the date shown." },
  confirmed: { label: "Confirmed", tone: "good", line: "The house has confirmed the price and the stay." },
  declined: { label: "Not available", tone: "attention", line: "The house could not hold it; the note says why." },
  withdrawn: { label: "Withdrawn", tone: "neutral", line: "You withdrew this request." },
};
export const OPEN: RequestStatus[] = ["sent", "pricing", "held"];

type Result<T> = { ok: true; value: T } | { ok: false; message: string; field: string };
export type RequestInput = { stay: string; client_name: string; client_email: string | null; arrival: string; departure: string; adults: number; child_ages: number[]; room_pref: string | null; notes: string | null };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const day = (s: string) => Date.parse(`${s}T12:00:00Z`);
export const nightsBetween = (a: string, b: string) => Math.round((day(b) - day(a)) / 86400000);

/** The advisor's request form, checked before the database checks it again. */
export function parseRequest(f: Record<string, unknown>, today: string): Result<RequestInput> {
  const s = (k: string, max: number) => (typeof f[k] === "string" ? (f[k] as string).trim().replace(/\s+/g, " ").slice(0, max) : "");
  const stay = s("stay", 120);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(stay)) return { ok: false, message: "Choose a stay from the Ledger", field: "stay" };
  const client_name = s("client_name", 160);
  if (client_name.length < 2) return { ok: false, message: "Your client's name", field: "client_name" };
  const email = s("client_email", 254).toLowerCase();
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: "That email doesn't look right; leave it empty if you prefer", field: "client_email" };
  const arrival = s("arrival", 10), departure = s("departure", 10);
  if (!ISO.test(arrival) || Number.isNaN(day(arrival))) return { ok: false, message: "Choose the arrival date", field: "arrival" };
  if (arrival < today) return { ok: false, message: "Arrival is in the past", field: "arrival" };
  if (!ISO.test(departure) || Number.isNaN(day(departure))) return { ok: false, message: "Choose the departure date", field: "departure" };
  const n = nightsBetween(arrival, departure);
  if (n < 1) return { ok: false, message: "Departure comes after arrival", field: "departure" };
  if (n > 60) return { ok: false, message: "Up to 60 nights in one request", field: "departure" };
  const adults = Number(f.adults);
  if (!Number.isInteger(adults) || adults < 1 || adults > 20) return { ok: false, message: "Adults: 1 to 20", field: "adults" };
  const raw = Array.isArray(f.child_ages) ? f.child_ages : typeof f.child_ages === "string" ? f.child_ages.split(",") : [];
  const child_ages = raw.map((x) => String(x).trim()).filter(Boolean).map(Number);
  if (child_ages.length > 10 || child_ages.some((a) => !Number.isInteger(a) || a < 0 || a > 17)) return { ok: false, message: "Children's ages, 0 to 17, separated by commas", field: "child_ages" };
  const room_pref = s("room_pref", 200) || null;
  const notes = typeof f.notes === "string" ? f.notes.trim().slice(0, 1000) || null : null;
  return { ok: true, value: { stay, client_name, client_email: email || null, arrival, departure, adults, child_ages, room_pref, notes } };
}

export const party = (adults: number, ages: number[]) =>
  `${adults} ${adults === 1 ? "adult" : "adults"}${ages.length ? `, ${ages.length} ${ages.length === 1 ? "child" : "children"} (${ages.join(", ")})` : ""}`;

export function money(minor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: minor % 100 ? 2 : 0 }).format(minor / 100).replace(/ /g, " ");
}

/** Parse the house's price ("18,400" or "18400.50") into minor units. */
export function priceMinor(v: unknown): number | null {
  if (typeof v !== "string" && typeof v !== "number") return null;
  const t = String(v).replace(/[,\s$]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const n = Math.round(Number(t) * 100);
  return n > 0 ? n : null;
}

/** The words an advisor can copy to their client once the house has held or confirmed it. */
export function shareText(r: { stay_name: string; arrival: string; departure: string; adults: number; child_ages: number[]; price_minor: number | null; currency: string | null; hold_until: string | null; status: RequestStatus; room_pref: string | null; house_note: string | null; ref: string }, advisor: string, fmt: (iso: string) => string): string {
  const n = nightsBetween(r.arrival, r.departure);
  const lines = [
    `${r.stay_name}, ${fmt(r.arrival)} to ${fmt(r.departure)} (${n} ${n === 1 ? "night" : "nights"}), ${party(r.adults, r.child_ages)}.`,
    ...(r.room_pref ? [`Room: ${r.room_pref}.`] : []),
    ...(r.price_minor && r.currency ? [`Price: ${money(r.price_minor, r.currency)}${r.status === "held" ? ", confirmed by James Wild & Co" : ""}.`] : []),
    ...(r.status === "held" && r.hold_until ? [`Held for you until ${fmt(r.hold_until)}. Let me know before then and I'll secure it.`] : []),
    ...(r.status === "confirmed" ? ["Confirmed."] : []),
    ...(r.house_note ? [r.house_note] : []),
    `${advisor}, James Wild & Co (ref. ${r.ref})`,
  ];
  return lines.join("\n");
}
