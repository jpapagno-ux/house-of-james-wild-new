"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { listFolios, removeFolio, type Folio } from "@/lib/folio/shelf";
import { isBuilt } from "@/lib/routes";
import { FLAGS } from "@/lib/booking-live/flags";

// The shelf: every Folio on this device, newest first; ?fol= opens one.
export default function Shelf() {
  const sp = useSearchParams();
  const want = sp.get("fol");
  const [folios, setFolios] = useState<Folio[] | null>(null);
  useEffect(() => { setFolios(listFolios()); }, []);
  const open = useMemo(() => (folios && want ? folios.find((f) => f.fol === want) ?? null : null), [folios, want]);

  if (folios === null) return <p className="mt-10 text-[15px] ledger-muted">Opening the shelf…</p>;
  if (!folios.length) {
    return (
      <div className="mt-10 border ledger-rule p-6 md:p-8 max-w-2xl">
        <p className="ledger-display text-[1.4rem]">Nothing on the shelf yet.</p>
        <p className="mt-2 text-[15.5px] ledger-muted leading-relaxed">Ask Iggi on any stay, reserve or country page. When a journey takes shape, choose <em>Open as a Folio</em> and it lands here with its number.{want ? ` (Folio ${want} isn't on this device — it was opened in another browser.)` : ""}</p>
        <div className="mt-5 flex gap-3"><Link href="/stays" className="ledger-btn">The Ledger</Link><Link href="/plan" className="ledger-btn ledger-btn--solid">Plan with James</Link></div>
      </div>
    );
  }
  const list = open ? [open, ...folios.filter((f) => f.fol !== open.fol)] : folios;
  return (
    <div className="mt-10 grid gap-6">
      {FLAGS.accounts && <p className="text-[14px] ledger-muted">Signed in? These are also saved under <Link href="/account/folios" className="underline underline-offset-4">your account</Link>.</p>}
      {list.map((f) => <FolioCard key={f.fol} f={f} expanded={open?.fol === f.fol || list.length === 1} onRemove={() => { removeFolio(f.fol); setFolios(listFolios()); }} />)}
    </div>
  );
}

function FolioCard({ f, expanded, onRemove }: { f: Folio; expanded: boolean; onRemove: () => void }) {
  const who = f.advisor?.adv ? (f.advisor.isDefault ? "James" : f.advisor.firstName ?? f.advisor.name) : null;
  const plan = toLocal(f.plan);
  const opened = new Date(f.opened_at);
  return (
    <article className="border ledger-rule bg-paper-card" aria-labelledby={`f-${f.fol}`}>
      <div className="p-5 md:p-7 grid md:grid-cols-[1fr_auto] gap-6">
        <div className="min-w-0">
          <p className="ledger-eyebrow ledger-crimson">{f.fol}{who ? ` · open with ${who}${f.advisor?.adv ? ` (${f.advisor.adv})` : ""}` : ""}</p>
          <h2 id={`f-${f.fol}`} className="ledger-display text-[1.7rem] md:text-[2rem] mt-1 leading-tight">{f.title}</h2>
          <p className="text-[13.5px] ledger-muted mt-1">Opened {Number.isNaN(opened.getTime()) ? "" : opened.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}{f.country ? ` · ${f.country.replace(/-/g, " ")}` : ""}{f.volume ? ` · ${f.volume}` : ""}</p>
          {f.summary && <p className="mt-4 text-[16px] leading-relaxed max-w-2xl">{f.summary}</p>}
          {expanded && f.stays.length > 0 && (
            <div className="mt-6">
              <p className="ledger-eyebrow">On this Folio</p>
              <ul className="mt-2 grid gap-2">
                {f.stays.map((s, i) => {
                  const href = s.slug && isBuilt(`/stays/${s.slug}`) ? `/stays/${s.slug}` : null;
                  return (
                    <li key={i} className="flex items-baseline gap-3 text-[15.5px]">
                      {s.ledger_id && <span className="font-mono text-[11px] ledger-crimson tabular-nums shrink-0">{s.ledger_id}</span>}
                      {href ? <Link href={href} className="underline underline-offset-4 hover:ledger-crimson">{s.name}</Link> : <span>{s.name}</span>}
                      {s.reason && <span className="ledger-muted text-[14px]">— {s.reason}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {expanded && f.days.length > 0 && (
            <div className="mt-6">
              <p className="ledger-eyebrow">The shape of it</p>
              <ol className="mt-2 grid gap-1.5 text-[15.5px]">
                {f.days.map((d) => <li key={d.day_number} className="flex gap-3"><span className="ledger-display ledger-crimson w-7 shrink-0">{String(d.day_number).padStart(2, "0")}</span><span>{d.title}</span></li>)}
              </ol>
            </div>
          )}
        </div>
        <div className="flex md:flex-col gap-3 md:items-end shrink-0">
          <Link href={plan} className="ledger-btn ledger-btn--solid">Plan with {who ?? "James"}</Link>
          {!expanded && <Link href={`/folio?fol=${encodeURIComponent(f.fol)}`} className="ledger-btn">Open</Link>}
          <button type="button" onClick={onRemove} className="text-[13px] ledger-muted underline underline-offset-4 md:mt-auto">Take off the shelf</button>
        </div>
      </div>
    </article>
  );
}

function toLocal(href: string): string {
  try { const u = new URL(href, "https://house-of-james-wild-new.vercel.app"); return u.pathname + u.search; } catch { return "/plan"; }
}
