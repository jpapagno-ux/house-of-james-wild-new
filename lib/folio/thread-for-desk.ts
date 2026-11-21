import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ThreadData } from "@/components/folio/FolioThread";

// The saved chat behind an enquiry (Iggi Stage 2, 21 Nov 2026). An enquiry from Iggi carries the Folio number (FOL-);
// when the traveler saved the chat to that Folio, the Desk reads it here. RLS: the house and its advisors read every
// thread; a signed-in client with no org role reads none. Nothing is written.
const FOL = /^FOL-\d{4}-\d{6}$/;

export async function threadForFolioNumber(sb: SupabaseClient, fol: string | null | undefined): Promise<{ folioId: string; title: string; thread: ThreadData } | null> {
  const id = typeof fol === "string" ? fol.trim().toUpperCase() : "";
  if (!FOL.test(id)) return null;
  const { data: folio } = await sb.from("folios").select("id, title").eq("ledger_id", id).maybeSingle();
  if (!folio) return null;
  const { data: t } = await sb.from("folio_threads").select("id, sketch, saved_at, turns:folio_thread_turns(id, role, body, citations, said_at, sort_order)").eq("folio_id", folio.id).maybeSingle();
  if (!t) return null;
  const turns = ((t.turns ?? []) as (ThreadData["turns"][number] & { sort_order: number })[]).sort((a, b) => a.sort_order - b.sort_order);
  return { folioId: folio.id, title: folio.title, thread: { id: t.id, sketch: t.sketch as ThreadData["sketch"], saved_at: t.saved_at, turns } };
}
