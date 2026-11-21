import { withTraveler, ok, error, jsonBody, dbError } from "@/lib/booking-live/api";
import { isUuid, parseThread } from "@/lib/booking-live/validate";

// The Folio's thread (Iggi Stage 2, James 21 Nov 2026): the sketch Iggi had on the table and the chat that shaped it.
// GET    /api/v1/me/folios/:id/thread  → { sketch, turns, savedAt } or null
// PUT    /api/v1/me/folios/:id/thread  { conversationId?, sketch?, turns } → replaces the saved chat (owner, editor)
// DELETE /api/v1/me/folios/:id/thread  → removes it, from the advisor's view too (owner)
// RLS decides who may read or write; the house and its advisors read every thread on the Desk.
export const dynamic = "force-dynamic";

export const GET = withTraveler("accounts", async ({ sb, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const { data: thread, error: e } = await sb.from("folio_threads").select("id, sketch, saved_at, core_conversation_id").eq("folio_id", params.id).maybeSingle();
  if (e) return dbError(e, requestId);
  if (!thread) return ok(null, requestId);
  const { data: turns } = await sb.from("folio_thread_turns").select("id, role, body, citations, said_at").eq("thread_id", thread.id).order("sort_order");
  return ok({ id: thread.id, sketch: thread.sketch, savedAt: thread.saved_at, conversationId: thread.core_conversation_id, turns: turns ?? [] }, requestId);
});

export const PUT = withTraveler("accounts", async ({ req, sb, user, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const parsed = parseThread(await jsonBody(req));
  if (!parsed.ok) return error(parsed.code, parsed.message, requestId);
  const { core_conversation_id, sketch, turns } = parsed.value;
  const { data: thread, error: e } = await sb
    .from("folio_threads")
    .upsert({ folio_id: params.id, core_conversation_id, sketch, saved_by: user.id, saved_at: new Date().toISOString() }, { onConflict: "folio_id" })
    .select("id")
    .single();
  if (e || !thread) return dbError(e, requestId);
  // A save replaces the chat: the traveler's and Iggi's turns are rewritten; an advisor's turns stay.
  const { error: d } = await sb.from("folio_thread_turns").delete().eq("thread_id", thread.id).in("role", ["traveler", "iggi"]);
  if (d) return dbError(d, requestId);
  if (turns.length) {
    const { error: i } = await sb.from("folio_thread_turns").insert(turns.map((t, k) => ({ thread_id: thread.id, role: t.role, body: t.body, citations: t.citations, sort_order: k, author_user_id: t.role === "traveler" ? user.id : null })));
    if (i) return dbError(i, requestId);
  }
  return ok({ id: thread.id, turns: turns.length }, requestId);
});

export const DELETE = withTraveler("accounts", async ({ sb, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const { error: e } = await sb.from("folio_threads").delete().eq("folio_id", params.id);
  return e ? dbError(e, requestId) : ok({ deleted: true }, requestId);
});
