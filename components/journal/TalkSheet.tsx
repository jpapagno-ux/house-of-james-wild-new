"use client";
// JWC-STYLE-01. Talk to the house: one pop-up for every conversation about a stay (James, 23 Nov 2026).
// Iggi's chat, the phone number, a live call and the team are in one sheet, so the page itself stays short.
// Iggi is passed in as children and is not changed: this only decides where his panel sits.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarClock, MessageCircle, Phone, X } from "lucide-react";
import IggiMark from "@/components/iggi/IggiMark";
import { SITE } from "@/lib/site";

const EVENT = "jw-talk-open";

/** Any button that opens the sheet. */
export function TalkButton({ className = "ledger-btn-ghost", children = "Talk to the house" }: { className?: string; children?: React.ReactNode }) {
  return <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(EVENT))}>{children}</button>;
}

/** The slim row that stands where Iggi's card used to be. */
export function TalkRow({ name, hasIggi }: { name: string; hasIggi: boolean }) {
  return (
    <section id="talk" aria-label={`Talk to the house about ${name}`} className="flex flex-col gap-5 border-y border-[color:var(--jw-hairline)] py-8 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mist text-graphite"><IggiMark size={32} decorative /></span>
        <div>
          <p className="font-display text-[26px] leading-tight text-graphite md:text-[30px]">Questions About {name}?</p>
          <p className="mt-1 text-[15px] text-stone-text">{hasIggi ? "Ask Iggi, call the house, or book a live call." : "Call the house, or book a live call."}</p>
        </div>
      </div>
      <TalkButton className="ledger-btn ledger-btn--house shrink-0">Talk to the house</TalkButton>
    </section>
  );
}

export default function TalkSheet({ name, planHref, callHref, callSeats, children }: {
  name: string;
  /** The house's plan page for this stay. */
  planHref: string;
  /** The live group call with the host and an advisor, where a host is ready. */
  callHref?: string | null;
  callSeats?: number | null;
  /** Iggi's panel, unchanged. */
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const was = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    closeRef.current?.focus();
    return () => { document.body.style.overflow = was; window.removeEventListener("keydown", key); };
  }, [open]);

  const tile = "flex flex-1 flex-col items-center gap-1.5 px-2 py-3 text-center text-graphite hover:text-house";
  const tileLabel = "font-mono text-[10px] uppercase tracking-[0.16em]";
  return (
    <div hidden={!open} className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={`Talk to the house about ${name}`}>
      <button type="button" aria-label="Close" tabIndex={-1} onClick={() => setOpen(false)} className="absolute inset-0 h-full w-full cursor-default bg-ink-deep/55 md:bg-ink-deep/20" />
      {/* Phones: a sheet from the bottom. Desktop: a panel down the right side, so the page stays in view beside it. */}
      <div className="absolute inset-x-0 bottom-0 flex h-[88svh] flex-col bg-white shadow-2xl md:inset-x-auto md:inset-y-0 md:right-0 md:h-auto md:w-[440px]">
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist text-graphite"><IggiMark size={30} decorative /></span>
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-stone-text">Talk to the house</p>
              <p className="font-display text-[24px] leading-tight text-graphite">{name}</p>
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close" className="-mr-2 p-2 text-graphite hover:text-house"><X className="h-5 w-5" strokeWidth={1.5} aria-hidden /></button>
        </div>
        <div className="flex gap-2 border-y border-[color:var(--jw-hairline)] px-3">
          <a href={`tel:${SITE.phone.tel}`} className={tile} aria-label={`Call ${SITE.phone.display}`}><Phone className="h-5 w-5" strokeWidth={1.5} aria-hidden /><span className={tileLabel}>Call</span><span className="text-[12px] text-stone-text">{SITE.phone.display}</span></a>
          {callHref && <a href={callHref} className={tile}><CalendarClock className="h-5 w-5" strokeWidth={1.5} aria-hidden /><span className={tileLabel}>Live call</span><span className="text-[12px] text-stone-text">With the host{callSeats ? `, up to ${callSeats}` : ""}</span></a>}
          <Link href={planHref} onClick={() => setOpen(false)} className={tile}><MessageCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden /><span className={tileLabel}>The team</span><span className="text-[12px] text-stone-text">Write to an advisor</span></Link>
        </div>
        {children ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5 pt-4">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-stone-text">Ask Iggi</p>
            <p className="mt-1 text-[14px] text-stone-text">The house&rsquo;s AI guide. He answers from the Ledger and hands prices and bookings to a person.</p>
            <div className="mt-3">{children}</div>
          </div>
        ) : <p className="px-5 py-6 text-[15px] text-stone-text">Call, book a live call, or write to the team about {name}.</p>}
      </div>
    </div>
  );
}
