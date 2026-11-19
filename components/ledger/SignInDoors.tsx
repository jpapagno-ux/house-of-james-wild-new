"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, KeyRound, ArrowRight } from "lucide-react";
import { FLAGS } from "@/lib/booking-live/flags";
import { ADVISOR_DESK, PARTNER_DESK } from "@/lib/platform/flags";
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
  { key: "advisor", eyebrow: "Advisor", title: "The Desk", line: "The Ledger open, your travelers, the journeys you carry, and your own Bearing in your words, where the house can read it.", open: ADVISOR_DESK, href: ADVISOR_DESK ? "/advisor/login" : "/for-advisors", cta: ADVISOR_DESK ? "Sign in" : "About advisors of the house", soon: "The Desk opens by invitation from the house." },
  { key: "partner", eyebrow: "Partner", title: "Partner Desk", line: "Your properties as the house sells them: rooms, rates, photographs and the facts, written by you, approved by James.", open: PARTNER_DESK, href: PARTNER_DESK ? "/partner/login" : "/partners", cta: PARTNER_DESK ? "Sign in" : "Partner with the house", soon: "The Partner Desk is in review with the first partners." },
];

// The three doors share one watercolour (the house's email header): savanna, lagoon and mountains, left to right.
const WC = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const DOOR_ART = ["west", "center", "east"].map((g) => `${WC}/c_fill,g_${g},ar_4:5,w_520,q_auto:good,f_auto/jwco/email/header-house-watercolour`);

export default function SignInDoors({ light = false, className = "" }: { light?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
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
      {open && mounted && createPortal(
        // Portalled to <body> (fix, 18 Nov 2026): inside the header over the film it inherited white type on a white panel.
        <div className="fixed inset-0 z-[90] text-ink" role="dialog" aria-modal="true" aria-labelledby="doors-heading">
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/75 backdrop-blur-[3px]" />
          <div className="absolute inset-x-0 top-0 max-h-[100svh] overflow-y-auto bg-paper border-b ledger-border shadow-2xl animate-[doorsIn_.35s_ease-out]">
            <div className="max-w-[1200px] mx-auto px-5 md:px-10 pt-6 pb-8 md:pb-12">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <JwcoSeal size={48} />
                  <div>
                    <p className="ledger-eyebrow !text-[#8B2525]">The house has three doors</p>
                    <h2 id="doors-heading" className="ledger-display text-[1.7rem] md:text-[2.4rem] leading-tight mt-1 text-ink">Which one is yours?</h2>
                  </div>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="h-11 w-11 -mr-2 inline-flex items-center justify-center text-ink hover:text-[#8B2525]"><X className="w-5 h-5" /></button>
              </div>
              <ul className="mt-6 md:mt-10 grid gap-5 md:gap-6 md:grid-cols-3">
                {DOORS.map((d, i) => (
                  <li key={d.key} className="group" style={{ animation: `doorsIn .45s ease-out ${0.08 * i + 0.05}s both` }}>
                    <Link href={d.href} onClick={() => setOpen(false)} className="flex md:block h-full bg-white border ledger-border text-ink transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(26,24,22,0.14)] hover:border-[#2E2B28] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8B2525]">
                      {/* The door: an arched frame on one watercolour, savanna, lagoon and mountains across the three */}
                      <div className="shrink-0 pl-4 pt-4 md:px-6 md:pt-6">
                        <div className="relative mx-auto w-24 md:w-full md:max-w-[260px] aspect-[4/5] overflow-hidden rounded-t-full border border-[#CFC8BF] bg-[#F4F2EF]">
                          <Image src={DOOR_ART[i]} alt="" aria-hidden="true" fill sizes="(min-width: 768px) 260px, 96px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                          <span className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 bg-white/90 px-1.5 md:px-2.5 py-0.5 md:py-1 font-mono text-[11px] tracking-[0.14em] text-ink">0{i + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 p-4 md:p-6 md:pt-5 flex flex-col">
                        <p className="ledger-eyebrow !text-[#8B2525]">{d.eyebrow}</p>
                        <p className="ledger-display text-[1.35rem] md:text-[1.6rem] leading-tight mt-1 text-ink">{d.title}</p>
                        <p className="mt-2 text-[14px] md:text-[14.5px] leading-relaxed text-[#6B635A]">{d.line}</p>
                        {!d.open && d.soon && <p className="mt-3 text-[12.5px] text-[#6B635A] italic">{d.soon}</p>}
                        <span className={`mt-5 inline-flex items-center justify-between h-12 border border-ink pl-4 text-[14px] ${d.open ? "bg-ink text-white" : "bg-white text-ink"}`}>
                          {d.cta}
                          <span className={`h-full w-12 inline-flex items-center justify-center border-l ${d.open ? "border-white/60 bg-[#8B2525]" : "border-ink text-[#8B2525]"}`}><ArrowRight className="w-4 h-4" aria-hidden="true" /></span>
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[13px] text-[#6B635A]">Travellers sign in with a link sent to their email; advisors and partners with their own password and a code from their phone. Prices, availability and bookings stay with a person at the house.</p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
