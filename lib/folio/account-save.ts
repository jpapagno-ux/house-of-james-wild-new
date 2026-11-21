// Save to my Folio, in the account (Iggi Stage 2, James 21 Nov 2026).
//
// When Iggi opens a Folio he hands the host site the Folio, the sketch on the table and the turns of the chat.
// Signed in: the Folio is created in the traveler's account (or found by its FOL number), the stays become items,
// and the sketch and chat become the Folio's thread, which the advisor on the Folio reads on the Desk.
// Not signed in: the whole hand-off is kept in this browser and completed on /account/folios after the magic link.
// Nothing here is a booking or a quote; the device shelf (lib/folio/shelf) keeps its copy either way.

import type { Folio } from "./shelf";

export type ChatTurn = { role: "traveler" | "iggi"; body: string; citations: string[] };
export type PendingSave = { folio: Folio; chat: ChatTurn[]; sketch: unknown; conversationId: string | null; at: string };

const KEY = "jw.iggi.pendingSave.v1";
export const RESUME_HREF = "/account/sign-in?next=" + encodeURIComponent("/account/folios?resume=iggi");

const LEDGER_ID = /^[A-Z]{3,4}(-[A-Z]{2,5})?-\d{4}-\d{6}$/;
/** Takes the Core's chat payload and keeps only typed turns. */
export function chatFromCore(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatTurn[] = [];
  for (const t of raw.slice(0, 80)) {
    if (!t || typeof t !== "object") continue;
    const o = t as Record<string, unknown>;
    const role = o.role === "traveler" || o.role === "iggi" ? o.role : null;
    const body = typeof o.body === "string" ? o.body.trim().slice(0, 4000) : "";
    if (!role || !body) continue;
    const citations = Array.isArray(o.citations) ? (o.citations as unknown[]).filter((c): c is string => typeof c === "string" && LEDGER_ID.test(c)).slice(0, 12) : [];
    out.push({ role, body, citations });
  }
  return out;
}

export function stashPending(p: PendingSave): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(p)); return true; } catch { return false; }
}
export function readPending(): PendingSave | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingSave;
    if (!p || !p.folio || typeof p.folio.fol !== "string") return null;
    // A hand-off older than two days is stale: the chat has moved on.
    if (Date.now() - new Date(p.at).getTime() > 2 * 86_400_000) { clearPending(); return null; }
    return p;
  } catch { return null; }
}
export function clearPending(): void { try { localStorage.removeItem(KEY); } catch { /* nothing to do */ } }

type Saved = { ok: true; id: string; created: boolean } | { ok: false; reason: "sign_in" | "off" | "error" };

const json = (body: unknown) => ({ headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

/** Creates or finds the Folio in the account, adds the stays once, then saves the sketch and chat as its thread. */
export async function saveFolioToAccount(p: Omit<PendingSave, "at">): Promise<Saved> {
  const f = p.folio;
  try {
    let id: string | null = null;
    let created = false;
    const r = await fetch("/api/v1/me/folios", { method: "POST", ...json({ title: f.title.slice(0, 120), destinationSummary: (f.summary ?? "").slice(0, 400) || undefined, ledgerId: f.fol, advisorAdv: f.advisor?.adv ?? undefined, advisorSlug: f.advisor?.slug ?? undefined, source: "iggi" }) });
    if (r.status === 401) return { ok: false, reason: "sign_in" };
    if (r.status === 404) return { ok: false, reason: "off" };
    if (r.status === 409) {
      // Saved before under this FOL number: find it.
      const l = await fetch("/api/v1/me/folios", { cache: "no-store" });
      if (!l.ok) return { ok: false, reason: "error" };
      const { data } = (await l.json()) as { data?: { id: string; ledger_id?: string | null }[] };
      id = data?.find((x) => x.ledger_id === f.fol)?.id ?? null;
    } else if (r.ok) {
      const { data } = (await r.json()) as { data?: { id?: string } };
      id = data?.id ?? null;
      created = true;
    }
    if (!id) return { ok: false, reason: "error" };
    if (created) {
      for (const s of f.stays) {
        if (!s.slug) continue;
        await fetch(`/api/v1/me/folios/${id}/items`, { method: "POST", ...json({ property: s.slug, notes: s.reason ?? undefined }) }).catch(() => undefined);
      }
      if (f.days.length) await fetch(`/api/v1/me/folios/${id}/items`, { method: "POST", ...json({ type: "note", notes: f.days.map((d) => `Day ${d.day_number}: ${d.title}`).join("\n").slice(0, 2000) }) }).catch(() => undefined);
    }
    if (p.chat.length || (p.sketch && typeof p.sketch === "object")) {
      await fetch(`/api/v1/me/folios/${id}/thread`, { method: "PUT", ...json({ conversationId: p.conversationId ?? undefined, sketch: p.sketch ?? {}, turns: p.chat }) }).catch(() => undefined);
    }
    return { ok: true, id, created };
  } catch {
    return { ok: false, reason: "error" };
  }
}
