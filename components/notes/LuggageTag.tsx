"use client";

import { useState } from "react";

// A luggage tag tied to the hero, as on the Journeys mock: James Wild & Co,
// the place and the date on a buff card with a reinforced eyelet. Tap and it
// opens to the verdict's opening line, with a way down to the full note.
export default function LuggageTag({ line, where, when }: { line: string; where: string; when: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute right-4 md:right-10 top-[196px] md:top-[226px] z-20 text-[#3b2c1c]">
      <svg width="70" height="46" viewBox="0 0 70 46" className="absolute -top-10 right-9 pointer-events-none" aria-hidden="true"><path d="M2 2 C20 10 46 6 58 40" fill="none" stroke="#c9b28a" strokeWidth="1.6" /></svg>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="tag-note"
        className={`relative block text-left origin-top-right transition-all duration-500 rotate-[7deg] hover:rotate-[4deg] ${open ? "w-[268px] md:w-[300px]" : "w-[118px] md:w-[132px]"}`}
        style={{ background: "linear-gradient(160deg,#efe1c4,#e3cfa6)", clipPath: "polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%, 0 18px)", boxShadow: "0 10px 22px -10px rgba(0,0,0,.55)" }}>
        <span className="absolute top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-[3px] border-[#a98d62] bg-[#f6ecd8]" aria-hidden="true" />
        <span className="block px-3.5 pt-10 pb-4">
          <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase opacity-70">James Wild &amp; Co.</span>
          <span className="block ledger-display text-[1.05rem] leading-tight mt-1">The verdict</span>
          <span className="block font-mono text-[9.5px] tracking-[0.12em] uppercase mt-1 opacity-70">{where} · {when}</span>
          {open ? (
            <span id="tag-note" className="block mt-3 border-t border-dashed border-[#a98d62]/70 pt-3">
              <span className="block ledger-display italic text-[1rem] leading-snug">&ldquo;{line}&rdquo;</span>
              <a href="#verdict" className="mt-3 inline-block font-mono text-[10px] tracking-[0.16em] uppercase underline underline-offset-4" onClick={(e) => e.stopPropagation()}>Read the full note ↓</a>
            </span>
          ) : (
            <span className="block mt-2 font-mono text-[9px] tracking-[0.16em] uppercase text-[#8b3a2e]">Tap to read</span>
          )}
        </span>
      </button>
    </div>
  );
}
