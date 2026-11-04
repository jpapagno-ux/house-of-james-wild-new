"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookmarkCheck, BookmarkPlus, CalendarSearch, MessageCircle } from "lucide-react";
import { FLAGS } from "@/lib/booking-live/flags";
import { api } from "@/components/booking-live/client";
import type { AccommodationPricingState, AccommodationUnit } from "@/lib/stay-page/contract";

// The actions under one unit's detail. Which ones appear follows the unit's
// resolved pricing state and the Booking Live flags, never a fixed list:
//   live rate for the dates  → Check Availability (the engine, deep-linked to the dates)
//   rate card (quotes flag on) → Check Availability (Request to Reserve: priced night by
//                              night from the card with taxes, deposit and balance)
//   anything else            → Request Availability (Plan with James, unit named)
//   always                   → Ask an Advisor
//   save flag on             → Add to Folio (the stay, via /api/v1/me/favorites;
//                              unit-level Folio lines arrive with the quote flow)
// No instant-book wording: nothing here charges or books.

export default function AccommodationActions({ unit, stayName, staySlug, state, engineUrl, travellers, className = "mt-8" }: { unit: AccommodationUnit; stayName: string; staySlug: string; state: AccommodationPricingState; engineUrl: string | null; travellers: number; className?: string }) {
  const [folio, setFolio] = useState<"idle" | "saving" | "saved" | "signin" | "error">("idle");
  const trip = `${stayName} · ${unit.name}`;
  const plan = `/plan?trip=${encodeURIComponent(trip)}&travellers=${travellers}`;
  const live = state.kind === "live" && engineUrl;
  const card = state.kind === "rate_card" && FLAGS.quotes;
  return (
    <div className={`${className} flex flex-wrap items-center gap-3`}>
      {live
        ? <a href={engineUrl} className="ledger-btn ledger-btn--solid inline-flex items-center gap-2" data-event="booking_outbound"><CalendarSearch className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Check availability <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></a>
        : card
        ? <Link href={`/booking/property/${staySlug}`} className="ledger-btn ledger-btn--solid inline-flex items-center gap-2"><CalendarSearch className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Check availability</Link>
        : <Link href={plan} className="ledger-btn ledger-btn--solid inline-flex items-center gap-2"><CalendarSearch className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Request availability</Link>}
      {FLAGS.save && (folio === "signin"
        ? <Link href={`/account/sign-in?next=${encodeURIComponent(`/stays/${staySlug}`)}`} className="ledger-btn">Sign in to add to Folio</Link>
        : <button type="button" disabled={folio === "saving" || folio === "saved"} className="ledger-btn inline-flex items-center gap-2 disabled:opacity-70" aria-live="polite"
            onClick={async () => { setFolio("saving"); const r = await api("/api/v1/me/favorites", "POST", { property: staySlug }); setFolio(r.ok ? "saved" : r.code === "sign_in_required" ? "signin" : "error"); }}>
            {folio === "saved" ? <BookmarkCheck className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> : <BookmarkPlus className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />}
            {folio === "saved" ? "In your Folio" : folio === "saving" ? "Adding…" : "Add to Folio"}
          </button>)}
      <Link href={plan} className="ledger-btn-ghost inline-flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Ask an advisor</Link>
      {folio === "error" && <p role="alert" className="w-full text-[14px] ledger-crimson">Couldn&rsquo;t add that just now. Try again.</p>}
    </div>
  );
}
