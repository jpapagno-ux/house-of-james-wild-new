// Documents and contracts (D-23). Pure helpers, no imports, so plain Node can test them.
// The database decides who sees and adds what (supabase/migrations/*_partner_documents.sql);
// these only shape the form and the file path, and decide what the screen OFFERS.

export type DocKind = "contract" | "commercial" | "supporting";
export const DOC_KINDS: DocKind[] = ["contract", "commercial", "supporting"];
export const DOC_KIND_LABEL: Record<DocKind, string> = { contract: "Contract", commercial: "Commercial", supporting: "Supporting" };
export const DOC_KIND_LINE: Record<DocKind, string> = {
  contract: "The signed agreement with James Wild & Co. Seen by your partner admins and the house's admins only.",
  commercial: "Rate sheets, commission terms, STO letters. Seen by your admins, the house, and property managers for their own property.",
  supporting: "Fact sheets, brochures, licences, insurance, sustainability certificates, press kits. Seen by your whole team.",
};
export const MAX_BYTES = 20 * 1024 * 1024;
export const ALLOWED_MIME: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "image/jpeg": "JPG",
  "image/png": "PNG",
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Who may file a contract: house admins and portfolio managers (never partners, never house editors). */
export const CONTRACT_KEEPER_ROLES = ["jw_admin", "jw_portfolio_manager", "admin"];

/** A safe file name for the storage path: ASCII letters, digits, dot, dash, underscore; keeps the extension. */
export function safeFileName(name: string): string {
  const base = (name || "document").normalize("NFKD").replace(/[̀-ͯ]/g, "");
  const dot = base.lastIndexOf(".");
  const stem = (dot > 0 ? base.slice(0, dot) : base).replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "document";
  const ext = dot > 0 ? base.slice(dot + 1).replace(/[^A-Za-z0-9]/g, "").toLowerCase().slice(0, 8) : "";
  return ext ? `${stem}.${ext}` : stem;
}

/** <organization_id>/<kind>/<id8>-<file>, matching the table's check constraint. */
export function storagePath(orgId: string, kind: DocKind, fileName: string, id: string): string {
  return `${orgId}/${kind}/${id.replace(/-/g, "").slice(0, 8)}-${safeFileName(fileName)}`;
}

export type DocInput = { kind: DocKind; title: string; propertyId: string | null; effectiveFrom: string | null; expiresOn: string | null; note: string | null };
type Result<T> = { ok: true; value: T } | { ok: false; message: string; field?: string };

export function parseDocumentFields(f: Record<string, unknown>): Result<DocInput> {
  const s = (k: string) => (typeof f[k] === "string" ? (f[k] as string).trim() : "");
  const kind = s("kind") as DocKind;
  if (!DOC_KINDS.includes(kind)) return { ok: false, message: "Choose what kind of document this is", field: "kind" };
  const title = s("title").slice(0, 160);
  if (!title) return { ok: false, message: "Give the document a title", field: "title" };
  const propertyId = s("propertyId") || null;
  if (propertyId && !UUID.test(propertyId)) return { ok: false, message: "Unknown property", field: "propertyId" };
  const effectiveFrom = s("effectiveFrom") || null, expiresOn = s("expiresOn") || null;
  if (effectiveFrom && !DAY.test(effectiveFrom)) return { ok: false, message: "Use a full date", field: "effectiveFrom" };
  if (expiresOn && !DAY.test(expiresOn)) return { ok: false, message: "Use a full date", field: "expiresOn" };
  if (effectiveFrom && expiresOn && expiresOn < effectiveFrom) return { ok: false, message: "The expiry date is before the start date", field: "expiresOn" };
  const note = s("note").slice(0, 1000) || null;
  return { ok: true, value: { kind, title, propertyId, effectiveFrom, expiresOn, note } };
}

export function checkFile(file: { name: string; type: string; size: number } | null): Result<{ mime: string }> {
  if (!file || !file.size) return { ok: false, message: "Choose a file to upload", field: "file" };
  if (file.size > MAX_BYTES) return { ok: false, message: "That file is over 20 MB", field: "file" };
  if (!ALLOWED_MIME[file.type]) return { ok: false, message: "PDF, Word, Excel, JPG or PNG only", field: "file" };
  return { ok: true, value: { mime: file.type } };
}

/** Days until expiry (negative when past); null when no expiry. */
export function daysToExpiry(expiresOn: string | null, today: string): number | null {
  if (!expiresOn) return null;
  return Math.round((Date.parse(expiresOn + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / 86400000);
}
