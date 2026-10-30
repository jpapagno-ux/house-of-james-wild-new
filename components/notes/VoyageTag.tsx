"use client";

import { useState } from "react";

// The old voyage (or route) tag tied to the hero of a journey or voyage page:
// a buff baggage tag, foxed and creased, with the Ledger number written in red,
// the date and position, and a country postmark struck across it in the
// destination's ink, the place name scrawled over the top. A hand-drawn arrow
// and "why this voyage" fade in beside it; tap the tag for James's note.
export type TagInfo = {
  kind: string; // "Voyage tag" | "Route tag"
  title: string; // RAJA AMPAT
  ledger: string; // "Voyage ledger"
  no: string; // 12
  date: string; // 11 · 2024
  coords: string; // S 0°33′ · E 130°41′
  postmark: { ring: string; center: string; date: string; ink: string };
  script: string; // Indonesia
  nudge: string; // why this voyage
  note: string; // handwritten line in the card
  cta: string;
};

export default function VoyageTag({ tag, line, href = "#founder" }: { tag: TagInfo; line: string; href?: string }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const ink = tag.postmark.ink;
  const toggle = () => { setOpen((o) => !o); setSeen(true); };
  return (
    <div className="absolute right-4 md:right-14 top-[200px] md:top-[250px] z-20 text-[#3b2c1c]">
      {/* the string, looped over the top edge of the photo */}
      <svg width="90" height="60" viewBox="0 0 90 60" className="absolute -top-12 right-[46px] md:right-[54px] pointer-events-none" aria-hidden="true">
        <path d="M4 2 C22 14 52 4 66 56" fill="none" stroke="#cdb48a" strokeWidth="1.8" />
        <path d="M8 3 C26 16 54 8 68 56" fill="none" stroke="#a88d62" strokeWidth="0.8" opacity=".7" />
      </svg>
      <div className="jw-sway origin-top">
        <button type="button" onClick={toggle} aria-expanded={open} aria-label={`${tag.kind}: ${tag.title}. Tap to read James's note`}
          className="relative block text-left w-[132px] md:w-[168px] rotate-[6deg] hover:rotate-[3deg] transition-transform duration-500"
          style={{ filter: "drop-shadow(0 12px 16px rgba(0,0,0,.45))" }}>
          <svg viewBox="0 0 168 300" className="block w-full h-auto" role="img" aria-hidden="true">
            <defs>
              <clipPath id="tagshape"><path d="M22 0 H146 L168 22 V300 H0 V22 Z" /></clipPath>
              <filter id="foxing" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
                <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 -1.6 1.05" />
              </filter>
              <filter id="rough"><feTurbulence baseFrequency="1.2" numOctaves="1" seed="4" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.4" /><feComposite in="SourceGraphic" operator="in" /></filter>
              <radialGradient id="stain" cx="70%" cy="78%" r="45%"><stop offset="0" stopColor="#9a7748" stopOpacity=".28" /><stop offset="1" stopColor="#9a7748" stopOpacity="0" /></radialGradient>
              <linearGradient id="card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#efe2c6" /><stop offset=".55" stopColor="#e4d2ab" /><stop offset="1" stopColor="#d6c094" /></linearGradient>
              <path id="pmring" d="M0 0 m-34 0 a34 34 0 1 1 68 0 a34 34 0 1 1 -68 0" />
            </defs>
            <g clipPath="url(#tagshape)">
              <rect width="168" height="300" fill="url(#card)" />
              <rect width="168" height="300" filter="url(#foxing)" opacity=".55" />
              <rect width="168" height="300" fill="url(#stain)" />
              <path d="M0 132 C50 128 110 140 168 134" stroke="#a88d62" strokeWidth=".7" opacity=".5" fill="none" />
              <rect x="7" y="7" width="154" height="286" fill="none" stroke="#6b5434" strokeWidth=".8" opacity=".55" />
            </g>
            {/* reinforced eyelet */}
            <circle cx="84" cy="24" r="11" fill="#cdb48a" stroke="#8d7148" strokeWidth="2" />
            <circle cx="84" cy="24" r="5.5" fill="#2a2017" opacity=".85" />
            <g fill="#3b2c1c" style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
              <text x="84" y="56" textAnchor="middle" fontSize="9.5" letterSpacing="2.4">{tag.kind.toUpperCase()}</text>
              <line x1="18" y1="64" x2="150" y2="64" stroke="#3b2c1c" strokeWidth=".7" opacity=".6" />
              <text x="84" y="94" textAnchor="middle" fontSize="22" letterSpacing="1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{tag.title.split(" ")[0].toUpperCase()}</text>
              {tag.title.split(" ").length > 1 && <text x="84" y="118" textAnchor="middle" fontSize="22" letterSpacing="1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{tag.title.split(" ").slice(1).join(" ").toUpperCase()}</text>}
              <line x1="18" y1="132" x2="150" y2="132" stroke="#3b2c1c" strokeWidth=".7" opacity=".6" />
              <text x="84" y="150" textAnchor="middle" fontSize="9" letterSpacing="1.8">{tag.ledger.toUpperCase()}</text>
              <text x="40" y="176" fontSize="11">NO.</text>
              <text x="72" y="179" fontSize="22" fill="#9b2d24" style={{ fontFamily: "'Homemade Apple', cursive" }}>{tag.no}</text>
              <line x1="64" y1="183" x2="146" y2="183" stroke="#3b2c1c" strokeWidth=".6" opacity=".6" />
              <text x="20" y="206" fontSize="7.5" letterSpacing="1.2" opacity=".75">DATE</text>
              <text x="84" y="222" textAnchor="middle" fontSize="13" letterSpacing="1">{tag.date}</text>
              <text x="20" y="244" fontSize="7.5" letterSpacing="1.2" opacity=".75">POSITION</text>
              <text x="84" y="262" textAnchor="middle" fontSize="11" letterSpacing=".6">{tag.coords}</text>
              <text x="84" y="284" textAnchor="middle" fontSize="7" letterSpacing="1.6" opacity=".6">JAMES WILD &amp; CO.</text>
            </g>
            {/* the postmark, struck across the lower half, slightly off the edge */}
            <g transform="translate(126 238) rotate(-18)" filter="url(#rough)" opacity=".72">
              <circle r="38" fill="none" stroke={ink} strokeWidth="2.2" />
              <circle r="25" fill="none" stroke={ink} strokeWidth="1.2" />
              <text fontSize="8" letterSpacing="1.6" fill={ink} style={{ fontFamily: "ui-monospace, monospace" }}><textPath href="#pmring" startOffset="2">{tag.postmark.ring.toUpperCase()}</textPath></text>
              <text y="-2" textAnchor="middle" fontSize="9" fill={ink} style={{ fontFamily: "ui-monospace, monospace" }}>{tag.postmark.center.toUpperCase()}</text>
              <text y="10" textAnchor="middle" fontSize="7.5" fill={ink} style={{ fontFamily: "ui-monospace, monospace" }}>{tag.postmark.date}</text>
              {[0, 1, 2, 3].map((k) => <path key={k} d={`M-96 ${-14 + k * 9} q12 -4 24 0 t24 0 t24 0`} stroke={ink} strokeWidth="1.4" fill="none" />)}
            </g>
            {/* the place, scrawled over the top in faded ink */}
            <text x="14" y="246" fontSize="22" fill={ink} opacity=".8" transform="rotate(-12 14 246)" style={{ fontFamily: "'Homemade Apple', cursive" }}>{tag.script}</text>
          </svg>
        </button>
      </div>
      {!open && !seen && (
        <button type="button" onClick={() => { setOpen(true); setSeen(true); }} className="jw-nudge absolute right-[118px] md:right-[160px] top-[96px] md:top-[150px] flex flex-row-reverse items-end gap-0.5 text-[#fff3ea] drop-shadow-[0_1px_2px_rgba(0,0,0,.9)]" aria-label={`Read ${tag.nudge}`}>
          <svg viewBox="0 0 44 40" className="w-9 h-8 md:w-11 md:h-10 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 37 C 14 36, 30 28, 39 5" /><path d="M31 8 L 39.5 4 L 41 13" />
          </svg>
          <span className="mb-[-6px] text-[14px] md:text-[18px] leading-none whitespace-nowrap -rotate-[4deg]" style={{ fontFamily: "'Homemade Apple', cursive" }}>{tag.nudge} <span className="text-[0.8em]">— JW</span></span>
        </button>
      )}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[260px] md:w-[300px] bg-[#fdfcf8] text-[#2b2622] border border-[#e7e1d4] p-4 shadow-[0_12px_28px_-12px_rgba(0,0,0,.55)]">
          <p className="ledger-eyebrow !text-[9.5px] !text-[#8b3a2e]">{tag.kind} · {tag.title} · {tag.ledger} No. {tag.no}</p>
          <p className="mt-2 text-[15px] text-[#3b2716] -rotate-[2deg]" style={{ fontFamily: "'Homemade Apple', cursive" }}>{tag.note}</p>
          <p className="mt-2 ledger-display italic text-[1rem] leading-snug">&ldquo;{line}&rdquo;</p>
          <a href={href} className="mt-3 inline-block text-[10.5px] tracking-[0.16em] uppercase underline underline-offset-4">{tag.cta}</a>
        </div>
      )}
    </div>
  );
}
