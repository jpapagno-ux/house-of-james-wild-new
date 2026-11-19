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
import { SIGN_IN_EVENT } from "@/lib/signin-bus";

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

// Three trails, three watercolours (James, 19 Nov 2026): a beach path for travellers, a mountain path for advisors,
// an old-town lane for partners. The scene names are never printed (James: they only describe the images).
const WC = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_fill,w_400,h_400,q_auto:good,f_auto/jwco/brand/trails";
const TRAIL = [
  { art: `${WC}/beach-trail`, line: "Your Folio: the places worth returning to, gathered into journeys and shared with the people you travel with." },
  { art: `${WC}/mountain-trail`, line: "The Desk: your travellers, the journeys you carry and your Bearing, with the Ledger open beside you." },
  { art: `${WC}/city-stroll`, line: "The Partner Desk: your properties as the house sells them, written by you and approved by James." },
];

export default function SignInDoors({ light = false, className = "" }: { light?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // The phone bar and the House menu open the doors too (the header's own Sign in shows only on wide screens).
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(SIGN_IN_EVENT, show);
    return () => window.removeEventListener(SIGN_IN_EVENT, show);
  }, []);
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
        // Portalled to <body> so the header's white type over the film never leaks in (18 Nov 2026).
        // The entrance is a journal page with three trails (James, 19 Nov 2026: "a path trail style ... a mountain trail,
        // beach trail or city stroll"): a dotted route leaves the seal and forks to three trailheads, each a watercolour.
        <div className="fixed inset-0 z-[90] text-ink" role="dialog" aria-modal="true" aria-labelledby="doors-heading">
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/75 backdrop-blur-[3px]" />
          <div className="absolute inset-x-0 top-0 max-h-[100svh] overflow-y-auto bg-[#FBFAF8] border-b ledger-border shadow-2xl animate-[doorsIn_.35s_ease-out]"
            style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 31px, rgba(207,200,191,0.35) 31px 32px)" }}>
            <div className="max-w-[1180px] mx-auto px-5 md:px-10 pt-6 pb-10 md:pb-14">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <JwcoSeal size={52} />
                  <div>
                    <p className="ledger-eyebrow !text-[#8B2525]">From the house journal · Sign in</p>
                    <h2 id="doors-heading" className="ledger-display italic text-[1.9rem] md:text-[2.7rem] leading-tight mt-1 text-ink">Choose your trail</h2>
                  </div>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="h-11 w-11 -mr-2 inline-flex items-center justify-center text-ink hover:text-[#8B2525] bg-white/70 border ledger-border"><X className="w-5 h-5" /></button>
              </div>

              {/* The route: on wide screens a dotted line forks from the seal to the three trailheads; on phones it runs down the left */}
              <svg className="hidden md:block w-full h-14 mt-4" viewBox="0 0 1000 56" preserveAspectRatio="none" aria-hidden="true">
                <path d="M500 0 C500 28, 167 20, 167 56 M500 0 L500 56 M500 0 C500 28, 833 20, 833 56" fill="none" stroke="#8B2525" strokeWidth="1.4" strokeDasharray="2 7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
              <ol className="relative mt-6 md:mt-0 grid gap-6 md:gap-8 md:grid-cols-3 before:content-[''] before:absolute before:left-[39px] before:top-6 before:bottom-6 before:border-l before:border-dashed before:border-[#8B2525]/60 md:before:hidden">
                {DOORS.map((d, i) => (
                  <li key={d.key} className="group relative" style={{ animation: `doorsIn .45s ease-out ${0.1 * i + 0.05}s both` }}>
                    <Link href={d.href} onClick={() => setOpen(false)} className="flex md:flex-col gap-4 md:gap-0 md:items-center md:text-center text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8B2525] focus-visible:outline-offset-4">
                      <span className="relative shrink-0 w-20 h-20 md:w-48 md:h-48 rounded-full overflow-hidden border border-[#CFC8BF] bg-white shadow-[0_8px_24px_rgba(26,24,22,0.10)] transition-transform duration-500 group-hover:scale-[1.04]">
                        <Image src={TRAIL[i].art} alt="" aria-hidden="true" fill sizes="(min-width: 768px) 192px, 80px" className="object-cover" />
                      </span>
                      <span className="flex-1 min-w-0 md:mt-5 flex flex-col md:items-center">
                        <span className="font-mono text-[11px] tracking-[0.16em] text-[#6B635A]">TRAIL 0{i + 1}</span>
                        <span className="ledger-display text-[1.45rem] md:text-[1.75rem] leading-tight mt-1">{d.title}</span>
                        <span className="ledger-eyebrow !text-[10.5px] !text-[#8B2525] mt-1">For {d.eyebrow === "Traveler" ? "travellers" : d.eyebrow === "Advisor" ? "advisors" : "partners"}</span>
                        <span className="mt-2 text-[14px] md:text-[14.5px] leading-relaxed text-[#6B635A] md:max-w-[30ch]">{TRAIL[i].line}</span>
                        {!d.open && d.soon && <span className="mt-2 text-[12.5px] text-[#6B635A] italic">{d.soon}</span>}
                        <span className="mt-4 self-start md:self-center inline-flex items-center gap-2 ledger-display italic text-[18px] border-b border-[#8B2525] pb-0.5 group-hover:text-[#8B2525]">
                          {d.open ? "Take this trail" : d.cta}<ArrowRight className="w-4 h-4 text-[#8B2525] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="mt-8 md:mt-10 md:text-center text-[13px] text-[#6B635A]">Travellers sign in with a link sent to their email; advisors and partners with their own password and a code from their phone.</p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
