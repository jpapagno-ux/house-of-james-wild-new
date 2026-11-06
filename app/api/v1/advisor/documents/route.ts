import { withAdvisor } from "@/lib/platform/advisor-api";
import { dbError, error, invalid, ok } from "@/lib/platform/api";
import { advisorDocPath, parseDocument } from "@/lib/platform/advisor-file";

// POST /api/v1/advisor/documents (multipart: file + kind, title, expiresOn, note). Files the register row,
// then the file into the private bucket, both as the advisor, so the database decides. If the upload
// fails, the row is withdrawn so nothing half-filed shows.
export const dynamic = "force-dynamic";

export const POST = withAdvisor(async ({ req, a, requestId }) => {
  let form: FormData;
  try { form = await req.formData(); } catch { return invalid({ ok: false, message: "Send the document as a form upload" }, requestId); }
  const fields = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string"));
  const file = form.get("file");
  const f = file instanceof File ? file : null;
  const p = parseDocument(fields, f ? { name: f.name, type: f.type, size: f.size } : null);
  if (!p.ok || !f) return invalid({ ok: false, message: p.ok ? "Choose a file to upload" : p.message, field: p.ok ? "file" : p.field }, requestId);
  const path = advisorDocPath(a.advisor.id, p.value.kind, f.name, crypto.randomUUID());
  const { data: row, error: e } = await a.sb.from("advisor_documents").insert({
    advisor_id: a.advisor.id, kind: p.value.kind, title: p.value.title, storage_path: path, mime_type: p.value.mime,
    size_bytes: f.size, expires_on: p.value.expiresOn, note: p.value.note, uploaded_by: a.user.id,
  }).select("id").single();
  if (e) return dbError(e, requestId);
  const up = await a.sb.storage.from("advisor-files").upload(path, f, { contentType: p.value.mime, upsert: false });
  if (up.error) {
    await a.sb.from("advisor_documents").update({ status: "archived" }).eq("id", row.id);
    return error("server_error", "The file did not upload. Try again.", requestId);
  }
  return ok({ id: row.id }, requestId, 201);
});
