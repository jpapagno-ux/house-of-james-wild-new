"use client";

import { useEffect, useId, useState, type MouseEvent } from "react";

// The house's mark on the hero (James, 3 Nov 2026: "the square needs to go"):
// the round ink stamp alone, pressed straight onto the photograph in ivory
// ink, no paper card, frame or shadow behind it. Beside it, in James's hand,
// "a note from the house" with a hand-drawn arrow: a real link that scrolls
// to the note on the page (the verdict, "Why it's here" or the founder's
// note), clearing the sticky header through the site-wide scroll-padding.
// The arrow draws itself once, then nudges toward the note a few times; no
// motion with reduced motion. No note on the page, no nudge.
export type MarkStyle = "post" | "tag" | "stamp" | "note";
type P = { line: string; where: string; when: string; style?: MarkStyle; image?: string; script?: string; label?: string; href?: string };
// Journeys and voyages: the stamp inked in a colour from the destination's palette, with its own ring and nudge.
type StampExtra = { tint?: string; sub?: string; nudge?: string; cta?: string };

export function Stamp({ where, when, label = "The verdict", href = "#verdict", tint = "#FFFDF7", sub, nudge }: Omit<P, "style"> & StampExtra) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const target = href.startsWith("#") ? href.slice(1) : "";
  const [hasNote, setHasNote] = useState(false);
  useEffect(() => { setHasNote(!!target && !!document.getElementById(target)); }, [target]);
  const year = when.match(/\d{4}/)?.[0] ?? when;
  const words = nudge ?? (label === "The verdict" ? "the founder's take" : "a note from the house");
  const name = nudge || label === "The verdict" ? `Read the note from the house: ${words}` : "Read the note from the house";
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    const t = document.getElementById(target);
    if (!t) return;
    e.preventDefault();
    history.replaceState(null, "", `#${target}`);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
    if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "-1");
    t.focus({ preventScroll: true });
    // Sections above can grow while the page scrolls past them (images and reveals load in), which
    // leaves the note short of its mark: once the scroll settles, set it under the header again.
    // (A reader who scrolls, taps or types meanwhile keeps control: the checks stop.)
    let left = false;
    const leave = () => { left = true; };
    const evs = ["wheel", "touchstart", "keydown"] as const;
    evs.forEach((ev) => window.addEventListener(ev, leave, { once: true, passive: true }));
    const settle = () => {
      if (left) return;
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const off = t.getBoundingClientRect().top - pad;
      const end = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (Math.abs(off) > 4 && !end) t.scrollIntoView({ behavior: "auto", block: "start" });
    };
    const checks = () => { [120, 500, 1100].forEach((ms) => setTimeout(settle, ms)); setTimeout(() => evs.forEach((ev) => window.removeEventListener(ev, leave)), 1200); };
    if ("onscrollend" in window) window.addEventListener("scrollend", checks, { once: true });
    else setTimeout(checks, 900);
  };
  return (
    <div data-house-note className="relative z-20 mb-4 flex items-center gap-2.5 md:gap-3 lg:mb-0 lg:absolute lg:right-10 lg:top-[250px] lg:flex-row-reverse">
      {/* the stamp: ink only, transparent on the photograph */}
      <span className="jw-note-stamp block shrink-0 w-[68px] h-[68px] md:w-[96px] md:h-[96px] lg:w-[120px] lg:h-[120px]" style={{ color: tint }} aria-hidden="true">
        <svg viewBox="0 0 132 132" className="block w-full h-full overflow-visible">
          <defs>
            <path id={`${uid}r`} d="M66 66 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
            <filter id={`${uid}w`}><feTurbulence baseFrequency="1.4" numOctaves="1" seed="3" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.6" /><feComposite in="SourceGraphic" operator="in" /></filter>
          </defs>
          <g filter={`url(#${uid}w)`} fill="currentColor" style={{ fontFamily: "ui-monospace, monospace" }}>
            <circle cx="66" cy="66" r="63" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="66" cy="66" r="57.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <g className="jw-spin"><text fontSize="9.5" letterSpacing="2.6"><textPath href={`#${uid}r`} startOffset="0">{`JAMES WILD & CO · ${label.toUpperCase()} ·`}</textPath></text></g>
            <text x="66" y="60" textAnchor="middle" fontSize="24" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>JW</text>
            <line x1="40" y1="68" x2="92" y2="68" stroke="currentColor" strokeWidth="1" />
            <text x="66" y="81" textAnchor="middle" fontSize="8" letterSpacing="1.5">{where.toUpperCase().slice(0, 16)}</text>
            <text x="66" y="92" textAnchor="middle" fontSize="8" letterSpacing="1.5">{(sub ?? year).toUpperCase()}</text>
          </g>
        </svg>
      </span>
      {hasNote && (
        <a href={`#${target}`} onClick={go} aria-label={name} data-house-nudge
          className="jw-note-nudge group relative flex flex-col items-start lg:items-end py-1 pr-1 lg:pl-1 lg:pr-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80"
          style={{ color: tint }}>
          <span className="text-[14px] md:text-[19px] leading-[1.5] whitespace-nowrap -rotate-[4deg] decoration-1 underline-offset-[5px] group-hover:underline group-focus-visible:underline" style={{ fontFamily: "'Homemade Apple', cursive" }}>{words}</span>
          {/* hand-drawn arrow, curving down toward the title and the note below it */}
          <svg viewBox="0 0 44 34" className="jw-note-arrow w-9 h-7 md:w-11 md:h-[34px] -mt-0.5 ml-3 lg:ml-0 lg:mr-6 overflow-visible" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path pathLength={1} d="M38 3 C 36 16, 24 27, 6 30" />
            <path pathLength={1} d="M13 24.5 L 5.5 30.2 L 13.5 33" />
          </svg>
        </a>
      )}
    </div>
  );
}

export default function HeroMark(p: P) {
  // The postmark, the luggage tag and the taped note are retired (James, 30 Oct and 3 Nov 2026):
  // every style draws the round ink stamp, with no paper behind it.
  return <Stamp {...p} />;
}
