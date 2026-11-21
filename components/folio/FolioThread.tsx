import Link from "next/link";
import { isBuilt } from "@/lib/routes";
import { RemoveButton } from "@/components/booking-live/Actions";

// The Folio's thread (Iggi Stage 2, James 21 Nov 2026): the sketch Iggi left on the table and the chat that shaped
// it, read by the traveler in the portal and by the advisor on the Desk. Iggi's turns are marked as his, with the
// Ledger IDs he cited, so nobody mistakes Iggi for the advisor. A sketch is a plan: no prices, no bookings.

export type ThreadSketch = {
  title?: string | null;
  stops?: { ledger_id: string | null; slug: string | null; name: string; country: string | null; role: string; nights: number; pairing: string; note: string | null; indicative: string | null }[];
  transfers?: { from: string; to: string; note: string | null }[];
  dates_hint?: string | null; party?: string | null; last_change?: string | null;
};
export type ThreadTurnRow = { id: string; role: string; body: string; citations: string[] | null; said_at: string };
export type ThreadData = { id: string; sketch: ThreadSketch | null; saved_at: string; turns: ThreadTurnRow[] };

const ROLE_LABEL: Record<string, string> = { gateway: "Gateway", stay: "Stay", voyage: "By sea", overland: "By road", home: "Home" };

export default function FolioThread({ thread, folioId, canDelete, advisorName, reader }: { thread: ThreadData; folioId?: string; canDelete?: boolean; advisorName?: string | null; reader: "traveler" | "desk" }) {
  const sk = thread.sketch ?? {};
  const stops = sk.stops ?? [];
  const nights = stops.reduce((n, s) => n + (s.nights || 0), 0);
  const saved = new Date(thread.saved_at);
  const savedLine = Number.isNaN(saved.getTime()) ? "" : saved.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return (
    <div className="grid gap-8">
      {stops.length > 0 && (
        <section aria-labelledby="sketch-h">
          <h2 id="sketch-h" className="ledger-eyebrow">The sketch{sk.title ? ` · ${sk.title}` : ""}</h2>
          <p className="mt-1 text-[13.5px] ledger-muted">
            {[nights ? `${nights} night${nights === 1 ? "" : "s"}` : null, sk.dates_hint, sk.party].filter(Boolean).join(" · ")}
            {savedLine ? `${nights || sk.dates_hint || sk.party ? " · " : ""}as Iggi left it on ${savedLine}` : ""}
          </p>
          <ol className="mt-3 divide-y ledger-rule border-y ledger-rule">
            {stops.map((s, i) => {
              const href = s.slug && isBuilt(`/stays/${s.slug}`) ? `/stays/${s.slug}` : null;
              return (
                <li key={i} className="py-3 grid gap-1 md:grid-cols-[6rem_1fr_auto] md:gap-4 items-baseline">
                  <span className="ledger-eyebrow">{s.pairing === "before" ? "Before" : s.pairing === "after" ? "After" : ROLE_LABEL[s.role] ?? "Stay"}</span>
                  <span className="min-w-0">
                    {href ? <Link href={href} className="ledger-display text-[18px] hover:ledger-crimson">{s.name}</Link> : <span className="ledger-display text-[18px]">{s.name}</span>}
                    {s.country ? <span className="ledger-muted text-[14px]"> · {s.country}</span> : null}
                    {s.note && <p className="text-[14.5px] mt-0.5">{s.note}</p>}
                    {s.indicative && <p className="text-[13px] ledger-muted mt-0.5">{s.indicative}</p>}
                  </span>
                  <span className="text-[13.5px] tabular-nums whitespace-nowrap">
                    {s.ledger_id && <span className="font-mono text-[11px] ledger-id mr-3">{s.ledger_id}</span>}
                    {s.nights ? `${s.nights} night${s.nights === 1 ? "" : "s"}` : ""}
                  </span>
                </li>
              );
            })}
          </ol>
          {(sk.transfers ?? []).length > 0 && (
            <ul className="mt-3 grid gap-1 text-[14px] ledger-muted">
              {sk.transfers!.map((t, i) => <li key={i}>{t.from} to {t.to}{t.note ? `: ${t.note}` : ""}</li>)}
            </ul>
          )}
          <p className="mt-3 text-[13px] ledger-muted max-w-xl">A sketch, not a booking. Indicative rates are from rates; prices, availability and booking are confirmed by {advisorName ?? "your advisor"}.</p>
        </section>
      )}

      {thread.turns.length > 0 && (
        <section aria-labelledby="chat-h">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="chat-h" className="ledger-eyebrow">The chat with Iggi{savedLine ? ` · saved ${savedLine}` : ""}</h2>
            {canDelete && folioId && <RemoveButton path={`/api/v1/me/folios/${folioId}/thread`} label="Remove this chat" confirm="Remove the saved chat and sketch from this journey? Your advisor will no longer see it either." />}
          </div>
          {reader === "traveler" && <p className="mt-1 text-[13.5px] ledger-muted">{advisorName ?? "Your advisor"} can read what you saved here.</p>}
          {reader === "desk" && <p className="mt-1 text-[13.5px] ledger-muted">Saved by the traveler. Iggi&rsquo;s turns are his, from the Ledger; the traveler&rsquo;s words are theirs.</p>}
          <ol className="mt-4 grid gap-4">
            {thread.turns.map((t) => (
              <li key={t.id} className={t.role === "traveler" ? "md:ml-16" : "md:mr-16"}>
                <p className="ledger-eyebrow">{t.role === "traveler" ? "Traveler" : t.role === "advisor" ? advisorName ?? "Advisor" : "Iggi · from the Ledger"}</p>
                <p className="mt-1 text-[15.5px] leading-relaxed whitespace-pre-line">{t.body}</p>
                {(t.citations ?? []).length > 0 && <p className="mt-1 font-mono text-[11px] ledger-id tabular-nums">{t.citations!.join(" · ")}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
