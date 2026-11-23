"use client";

import { useEffect, useRef, useState } from "react";

// The founder's field note, animated (James, 23 Nov 2026: "a cool animated footnote from James Wild on the stay page
// ... cool tinted effects on the corners ... a cool edgy style, slightly"; one live try, one stay). Taken from the
// tone of "The Personal Ledger of James Wild": a torn card with album corners, a crimson "Recorded from experience"
// stamp that lands, the note typed in Plex Mono, the sign-off in Cormorant, the Ledger ID on a baggage tag.
// House rules kept: no parchment texture (Paper on Stone Mist), one crimson accent, the one Ink to Garnet gradient
// for the page corners. The note comes only from the Ledger (founderNote); nothing renders without one.
// Reduced motion: everything shows finished, nothing moves.

function split(note: string): { line: string; sign: string } {
  const clean = note.replace(/\s*,\s*JW\s*$/i, "").trim();
  const m = clean.match(/^(.*?)\s*(Stayed [^.]+\.?.*)$/);
  return m ? { line: m[1].trim(), sign: m[2].replace(/;\s*/g, " · ").replace(/\.$/, "") } : { line: clean, sign: "" };
}

export default function FieldNoteTry({ note, ledgerId, place }: { note: string; ledgerId: string | null; place: string | null }) {
  const { line, sign } = split(note);
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const [n, setN] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStill(true); setSeen(true); setN(line.length); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, [line.length]);

  useEffect(() => {
    if (!seen || still || n >= line.length) return;
    const ch = line[n - 1];
    const t = window.setTimeout(() => setN((x) => x + 1), ch === "." || ch === "," ? 220 : 26);
    return () => window.clearTimeout(t);
  }, [seen, still, n, line]);

  const done = n >= line.length;
  return (
    <aside ref={ref} className="jw-fieldnote relative mt-10 md:mt-14 max-w-3xl" aria-label="Founder's field note" data-seen={seen ? "1" : "0"} data-done={done ? "1" : "0"}>
      <div className="jw-fieldnote__card relative bg-paper px-6 md:px-10 pt-9 md:pt-11 pb-12 md:pb-14">
        <span className="jw-corner jw-corner--tl" aria-hidden="true" /><span className="jw-corner jw-corner--tr" aria-hidden="true" />
        <span className="jw-corner jw-corner--bl" aria-hidden="true" /><span className="jw-corner jw-corner--br" aria-hidden="true" />

        <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[#6B635A]">The personal ledger of James Wild{place ? ` · ${place}` : ""}</p>

        <p className="mt-5 font-mono text-[15px] md:text-[17px] leading-[1.75] text-[#1A1816] min-h-[6.5em]">
          <span className="sr-only">{line}</span>
          <span aria-hidden="true">{line.slice(0, n)}{!done && <span className="jw-caret">&#9612;</span>}</span>
        </p>

        <p className="jw-fieldnote__sign mt-5 ledger-display italic text-[1.5rem] md:text-[1.75rem] text-[#1A1816]">
          J.W.{sign ? <span className="font-mono not-italic text-[11px] tracking-[0.16em] uppercase text-[#6B635A] ml-3 align-middle">{sign}</span> : null}
        </p>

        <span className="jw-stamp" aria-hidden="true">
          <svg viewBox="0 0 120 120" width="112" height="112">
            <circle cx="60" cy="60" r="56" fill="none" stroke="#8B2525" strokeWidth="2.2" />
            <circle cx="60" cy="60" r="47" fill="none" stroke="#8B2525" strokeWidth="1" />
            <text x="60" y="50" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10.5" letterSpacing="1.6" fill="#8B2525">RECORDED</text>
            <text x="60" y="64" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10.5" letterSpacing="1.6" fill="#8B2525">FROM</text>
            <text x="60" y="78" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10.5" letterSpacing="1.6" fill="#8B2525">EXPERIENCE</text>
          </svg>
        </span>
      </div>

      {ledgerId && (
        <span className="jw-tag" aria-label={`Ledger ID ${ledgerId}`}>
          <svg className="jw-tag__string" width="2" height="34" aria-hidden="true"><line x1="1" y1="0" x2="1" y2="34" stroke="#2E2B28" strokeWidth="1.2" /></svg>
          <span className="jw-tag__card">
            <span className="jw-tag__hole" aria-hidden="true" />
            <span className="block font-mono text-[9px] tracking-[0.2em] uppercase text-[#6B635A]">Ledger</span>
            <span className="block font-mono text-[12px] tracking-[0.06em] text-[#8B2525] mt-0.5">{ledgerId}</span>
            <span className="block font-mono text-[9px] tracking-[0.2em] uppercase text-[#6B635A] mt-1">Since 1982</span>
          </span>
        </span>
      )}
    </aside>
  );
}

// The page corners: the one Ink to Garnet gradient, gathering in the two lower corners of the window as the reader goes
// past the opening, like the last pages of a journal. Never over the content's middle; pointer events pass through.
export function EdgyCorners() {
  const [o, setO] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setO(0.35); return; }
    const on = () => setO(Math.max(0, Math.min(0.55, (window.scrollY - 500) / 1400)));
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return <div className="jw-edgy-corners" style={{ opacity: o }} aria-hidden="true" />;
}
