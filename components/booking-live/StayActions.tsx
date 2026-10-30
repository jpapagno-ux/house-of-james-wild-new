"use client";
import Link from "next/link";
import { CalendarSearch, MessageCircle } from "lucide-react";
import { FLAGS } from "@/lib/booking-live/flags";
import SaveToFolio from "./SaveToFolio";

// The three actions on a stay page (spec §12): Save to My Folio · Check
// Availability · Connect With an Advisor. Each appears only when its flag is
// on, so with Booking Live off the stay page is exactly as before.
export default function StayActions({ slug, name }: { slug: string; name: string }) {
  if (!FLAGS.save && !FLAGS.quotes) return null;
  return (
    <div className="pt-4 flex flex-wrap items-center gap-3">
      <SaveToFolio slug={slug} name={name} inline />
      {FLAGS.quotes && (
        <>
          <Link href={`/booking/property/${slug}`} className="ledger-btn"><CalendarSearch className="w-4 h-4" strokeWidth={1.5} /> Check Availability</Link>
          <Link href={`/plan?trip=${encodeURIComponent(name)}`} className="ledger-btn"><MessageCircle className="w-4 h-4" strokeWidth={1.5} /> Connect With an Advisor</Link>
        </>
      )}
    </div>
  );
}
