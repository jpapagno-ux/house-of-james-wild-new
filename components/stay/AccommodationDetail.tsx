"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Carousel from "@/components/booking/Carousel";
import type { AccommodationPricingState, AccommodationUnit } from "@/lib/stay-page/contract";
import AccommodationFacts from "./AccommodationFacts";
import { AccommodationExclusions, AccommodationFeatures, AccommodationImportantNotes, AccommodationInclusions } from "./AccommodationLists";
import AccommodationPricingStatus from "./AccommodationPricingStatus";
import AccommodationActions from "./AccommodationActions";
import FounderFieldNote from "./FounderFieldNote";

// The expanded unit, by progressive disclosure: a drawer from the right on a
// desk (two columns: photographs and facts beside pricing and actions), a
// full-height sheet from the bottom on a phone with the booking action pinned
// at the foot. Esc or the scrim closes it; the page behind keeps its scroll.

export default function AccommodationDetail({ unit, state, stayName, staySlug, engineUrl, travellers, dates, onClose }: { unit: AccommodationUnit; state: AccommodationPricingState; stayName: string; staySlug: string; engineUrl: string | null; travellers: number; dates: { checkIn: string; checkOut: string } | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);
  const photos = unit.media.gallery.map((g) => g.url);
  const nice = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" });
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby={`unit-${unit.code}`}>
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <aside className="absolute inset-x-0 bottom-0 top-[6svh] md:inset-y-0 md:left-auto md:right-0 md:w-full md:max-w-[880px] bg-paper flex flex-col shadow-[0_0_40px_rgba(45,42,38,0.18)]">
        <header className="shrink-0 flex items-start justify-between gap-4 px-5 md:px-8 pt-5 pb-4 border-b ledger-rule">
          <div>
            <p className="ledger-eyebrow ledger-muted">{stayName}{unit.unitType ? ` · ${unit.unitType}` : ""}</p>
            <h2 id={`unit-${unit.code}`} className="ledger-display text-[1.7rem] md:text-[2.1rem] leading-tight mt-1">{unit.name}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="p-2 -mr-2 hover:text-crimson"><X className="w-5 h-5" strokeWidth={1.5} /></button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="md:grid md:grid-cols-[1.1fr_1fr] md:gap-10 px-5 md:px-8 py-6">
            <div>
              {photos.length ? <Carousel photos={photos} name={unit.name} ratio="aspect-[4/3]" /> : <div className="aspect-[4/3] bg-paper-card flex items-center justify-center ledger-eyebrow ledger-muted">Photograph to follow</div>}
              {unit.fullDescription && <p className="mt-6 text-[16px] leading-relaxed">{unit.fullDescription}</p>}
              {!unit.fullDescription && unit.shortDescription && <p className="mt-6 text-[16px] leading-relaxed">{unit.shortDescription}</p>}
              <section className="mt-6"><p className="ledger-eyebrow ledger-crimson">Essentials</p><div className="mt-3"><AccommodationFacts unit={unit} /></div></section>
              <AccommodationFeatures items={unit.features} />
              <AccommodationInclusions items={unit.included} />
              <AccommodationExclusions items={unit.excluded} />
              <AccommodationImportantNotes items={unit.importantNotes} />
              <FounderFieldNote note={unit.founderNote} compact />
            </div>
            <div className="mt-10 md:mt-0">
              <div className="md:sticky md:top-0">
                <p className="ledger-eyebrow ledger-crimson">{dates ? `Your dates · ${nice(dates.checkIn)} to ${nice(dates.checkOut)} · ${travellers} ${travellers === 1 ? "adult" : "adults"}` : "Rates"}</p>
                <div className="mt-3"><AccommodationPricingStatus state={state} /></div>
                <div className="hidden md:block"><AccommodationActions unit={unit} stayName={stayName} staySlug={staySlug} state={state} engineUrl={engineUrl} travellers={travellers} /></div>
                <p className="mt-6 text-[12.5px] ledger-muted">Nothing is charged here. James Wild &amp; Co confirms every rate and date with the estate before a booking is made; the engine shows the estate&rsquo;s own taxes and terms for your exact rate.</p>
              </div>
            </div>
          </div>
        </div>
        <footer className="md:hidden shrink-0 border-t ledger-rule bg-paper px-5 py-3 [padding-bottom:max(12px,env(safe-area-inset-bottom))]">
          <AccommodationActions unit={unit} stayName={stayName} staySlug={staySlug} state={state} engineUrl={engineUrl} travellers={travellers} className="" />
        </footer>
      </aside>
    </div>
  );
}
