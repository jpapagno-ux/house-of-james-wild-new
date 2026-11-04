"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X, KeyRound, ArrowRight } from "lucide-react";
import { FLAGS } from "@/lib/booking-live/flags";
import { PARTNER_DESK } from "@/lib/platform/flags";
import { JwcoSeal } from "./Marks";
import { lockScroll } from "@/lib/scroll-lock";

// SignInDoors — one "Sign in" in the header, three doors behind it (James, 3 Nov 2026):
// Traveler (My Folio), Advisor (the Desk), Partner (Partner Desk). Each door is
// open only when its feature flag is on in this build; otherwise it says so and
// points at the page that explains it, so a door never leads to a 404. Copy is the
// house's: a person, not a form; the Ledger behind every door.

type Door = { key: "traveler" | "advisor" | "partner"; eyebrow: string; title: string; line: string; open: boolean; href: string; cta: string; soon?: string };

const DOORS: Door[] = [
  { key: "traveler", eyebrow: "Traveler", title: "My Folio", line: "Your shelf for the places worth returning to. Save stays, gather them into a journey, share it with the people you travel with.", open: FLAGS.accounts, href: FLAGS.accounts ? "/account/sign-in" : "/folio", cta: FLAGS.accounts ? "Sign in" : "See how Folios work", soon: "Folio accounts open with Booking Live." },
  { key: "advisor", eyebrow: "Advisor", title: "The Desk", line: "The Ledger open, your travelers, the journeys you carry, and your own DNA in your words, where the house can read it.", open: FLAGS.quotes, href: FLAGS.quotes ? "/account/sign-in?next=%2Fdesk" : "/for-advisors", cta: FLAGS.quotes ? "Sign in" : "About advisors of the house", soon: "The Desk opens with Booking Live. Today, James sends each advisor their DNA link by hand." },
  { key: "partner", eyebrow: "Partner", title: "Partner Desk", line: "Your properties as the house sells them: rooms, rates, photographs and the facts, written by you, approved by James.", open: PARTNER_DESK, href: PARTNER_DESK ? "/partner/login" : "/partners", cta: PARTNER_DESK ? "Sign in" : "Partner with the house", soon: "The Partner Desk is in review with the first partners." },
];

export default function SignInDoors({ light = false, className = "" }: { light?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const unlock = lockScroll();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { unlock(); window.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}
        className={`inline-flex items-center gap-2 ledger-eyebrow !text-[10.5px] tracking-[0.18em] hover:text-house ${light ? "text-white" : ""} ${className}`}>
        <KeyRound className="w-3.5 h-3.5" strokeWidth={1.6} aria-hidden="true" />Sign in
      </button>
      {open && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-labelledby="doors-heading">
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/70 backdrop-blur-[2px]" />
          <div className="absolute inset-x-0 top-0 bg-paper border-b ledger-border shadow-2xl animate-[doorsIn_.35s_ease-out]">
            <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-6 pb-8 md:pb-12">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <JwcoSeal size={44} />
                  <div>
                    <p className="ledger-eyebrow text-house">The house has three doors</p>
                    <h2 id="doors-heading" className="ledger-display text-[1.6rem] md:text-[2.2rem] leading-tight mt-1">Which one is yours?</h2>
                  </div>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-2 -mr-2 hover:text-house"><X className="w-5 h-5" /></button>
              </div>
              <ul className="mt-6 md:mt-8 grid gap-4 md:grid-cols-3">
                {DOORS.map((d, i) => (
                  <li key={d.key} className="group relative border ledger-border bg-paper-card p-5 md:p-6 flex flex-col min-h-[220px] transition-transform duration-300 hover:-translate-y-0.5" style={{ animation: `doorsIn .45s ease-out ${0.08 * i + 0.05}s both` }}>
                    <span className="absolute top-3 right-4 font-mono text-[11px] tracking-[0.12em] ledger-muted">0{i + 1}</span>
                    <p className="ledger-eyebrow" style={{ color: d.open ? "var(--jw-accent-hex)" : undefined }}>{d.eyebrow}</p>
                    <p className="ledger-display text-[1.5rem] leading-tight mt-1">{d.title}</p>
                    <p className="mt-2 text-[14.5px] leading-relaxed ledger-muted flex-1">{d.line}</p>
                    {!d.open && d.soon && <p className="mt-3 text-[12.5px] ledger-muted italic">{d.soon}</p>}
                    <Link href={d.href} onClick={() => setOpen(false)} className={`mt-4 inline-flex items-center gap-2 self-start text-[13px] ${d.open ? "ledger-btn ledger-btn--solid !py-2 !px-4" : "underline underline-offset-4 hover:text-house"}`}>
                      {d.cta}<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[12.5px] ledger-muted">No passwords to remember: each door sends a sign-in link to your email. Prices, availability and bookings stay with a person at the house.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
