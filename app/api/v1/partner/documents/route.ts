import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, ok } from "@/lib/platform/api";
import { checkFile, parseDocumentFields, storagePath } from "@/lib/platform/documents";

// POST /api/v1/partner/documents (multipart: file + fields). Files the register row first, then the
// file into the private bucket, both AS the signed-in person, so the database decides who may file
// which kind (contracts: house admins and portfolio managers only). If the upload fails, the row is
// archived so nothing half-filed shows up.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  let form: FormData;
  try { form = await req.formData(); } catch { return invalid({ ok: false, message: "Send the document as a form upload" }, requestId); }
  const fields = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string"));
  const p = parseDocumentFields(fields);
  if (!p.ok) return invalid({ ok: false, message: p.message, field: p.field }, requestId);
  const file = form.get("file");
  const f = file instanceof File ? file : null;
  const fc = checkFile(f ? { name: f.name, type: f.type, size: f.size } : null);
  if (!fc.ok || !f) return invalid({ ok: false, message: fc.ok ? "Choose a file to upload" : fc.message, field: "file" }, requestId);

  const id = crypto.randomUUID();
  const path = storagePath(desk.org.id, p.value.kind, f.name, id);
  const { data: row, error: e } = await desk.sb.from("partner_documents").insert({
    organization_id: desk.org.id, property_id: p.value.propertyId, kind: p.value.kind, title: p.value.title, storage_path: path,
    mime_type: fc.value.mime, size_bytes: f.size, effective_from: p.value.effectiveFrom, expires_on: p.value.expiresOn, note: p.value.note,
    uploaded_by: desk.user.id,
  }).select("id").single();
  if (e) {
    if (e.code === "42501" || /row-level security/i.test(e.message)) {
      return error("forbidden", p.value.kind === "contract" ? "Only James Wild & Co files the contract" : "You can't file documents for that property", requestId);
    }
    return dbError(e, requestId);
  }
  const up = await desk.sb.storage.from("partner-documents").upload(path, f, { contentType: fc.value.mime, upsert: false });
  if (up.error) {
    await desk.sb.from("partner_documents").update({ status: "archived", note: "Upload did not complete" }).eq("id", row.id);
    return error("server_error", "The file did not upload. Try again.", requestId);
  }
  return ok({ id: row.id }, requestId, 201);
});
