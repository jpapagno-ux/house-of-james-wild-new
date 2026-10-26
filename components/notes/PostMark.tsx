"use client";

import Image from "next/image";
import { useState } from "react";

// The postmark: the verdict sent from the place itself. An original house
// stamp (perforated, engraved-style frame, the stay's own photograph in
// duotone, "James Wild & Co · Correo · 1982") is cancelled by a round
// postmark with wavy lines — place round the top, "The verdict" round the
// bottom, the date in the old style (day omitted, month in Roman numerals,
// as on the 1980s San José marks) — and a line in James's hand beneath.
// Tap to read the verdict's opening line.
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export default function PostMark({ line, where, when, image, script, label = "The verdict", href = "#verdict" }: { line: string; where: string; when: string; image?: string; script: string; label?: string; href?: string }) {
  const [open, setOpen] = useState(false);
  const year = when.match(/\d{4}/)?.[0] ?? "";
  const m = MONTHS.findIndex((x) => when.toLowerCase().startsWith(x));
  const date = m >= 0 ? `${ROMAN[m]} · ${year}` : year;
  const place = where.split(",")[0].toUpperCase().slice(0, 18);
  const ink = "#fbf3e6";
  return (
    <div className="absolute left-3 md:left-auto md:right-10 top-[78px] md:top-[200px] z-20 select-none">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`${label}, postmarked ${where} ${when}: tap to read`} className="group relative block w-[196px] h-[136px] md:w-[290px] md:h-[200px] text-left">
        {/* the house stamp */}
        <span className="absolute right-1 top-1 w-[80px] h-[96px] md:w-[116px] md:h-[140px] rotate-[5deg] group-hover:rotate-[2deg] transition-transform drop-shadow-[0_4px_8px_rgba(0,0,0,.45)]"
          style={{ background: "#f6efdf", padding: 5, WebkitMask: "radial-gradient(circle, transparent 3px, #000 3.4px) -5px -5px / 10px 10px, linear-gradient(#000 0 0) content-box", WebkitMaskComposite: "source-over", mask: "radial-gradient(circle, transparent 3px, #000 3.4px) -5px -5px / 10px 10px, linear-gradient(#000 0 0) content-box", maskComposite: "add" }}>
          <span className="absolute inset-[7px] md:inset-[9px] border-[2.5px] border-[#2f4a34] bg-[#f6efdf] flex flex-col">
            <span className="text-center font-mono text-[6.5px] md:text-[8px] tracking-[0.14em] text-[#2f4a34] leading-[1.6] border-b border-[#2f4a34]">JAMES WILD &amp; CO</span>
            <span className="relative flex-1 overflow-hidden">
              {image && <Image src={image} alt="" fill sizes="120px" className="object-cover grayscale contrast-125 sepia-[.35]" />}
              <span className="absolute inset-0 bg-[#2f4a34] mix-blend-color opacity-70" />
              <span className="absolute left-1 top-0.5 ledger-display text-[15px] md:text-[20px] text-[#f6efdf] drop-shadow">JW</span>
            </span>
            <span className="flex items-center justify-between px-1 font-mono text-[6.5px] md:text-[8px] tracking-[0.12em] text-[#2f4a34] border-t border-[#2f4a34] leading-[1.6]"><span>CORREO</span><span>1982</span></span>
          </span>
        </span>
        {/* the cancellation: round postmark + wavy lines across the stamp */}
        <svg viewBox="0 0 290 200" className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_1px_1.5px_rgba(0,0,0,.6)]" aria-hidden="true">
          <defs>
            <path id="pm-top" d="M78 92 m-50 0 a50 50 0 1 1 100 0" />
            <path id="pm-bot" d="M78 92 m-50 0 a50 50 0 1 0 100 0" />
            <filter id="pm-worn"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="11" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.45" /><feComposite in="SourceGraphic" operator="in" /></filter>
          </defs>
          <g filter="url(#pm-worn)" fill="none" stroke={ink} transform="rotate(-9 78 92)">
            <circle cx="78" cy="92" r="62" strokeWidth="2.6" />
            <circle cx="78" cy="92" r="40" strokeWidth="1.4" />
            <g fill={ink} stroke="none" style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
              <text fontSize="11" letterSpacing="3"><textPath href="#pm-top" startOffset="50%" textAnchor="middle">{place}</textPath></text>
              <text fontSize="10" letterSpacing="3" dy="9"><textPath href="#pm-bot" startOffset="50%" textAnchor="middle">{label.toUpperCase()}</textPath></text>
              <text x="78" y="88" textAnchor="middle" fontSize="15" letterSpacing="1.5">{date}</text>
              <text x="78" y="104" textAnchor="middle" fontSize="8" letterSpacing="2.2">JW &amp; CO</text>
            </g>
            {[0, 1, 2, 3, 4].map((i) => <path key={i} strokeWidth="2.2" d={`M146 ${66 + i * 11} q 14 -7 28 0 t 28 0 t 28 0 t 28 0 t 28 0`} />)}
          </g>
        </svg>
        {/* James's hand */}
        <span className="absolute left-1 -bottom-3 md:bottom-0 text-[13px] md:text-[19px] leading-tight text-[#fbf3e6] -rotate-[4deg] drop-shadow-[0_1px_2px_rgba(0,0,0,.75)]" style={{ fontFamily: "'Homemade Apple', cursive" }}>{script}</span>
      </button>
      {open && (
        <div className="absolute left-0 md:left-auto md:right-0 top-[150px] md:top-[212px] w-[260px] md:w-[300px] bg-[#fdfcf8] text-[#2b2622] border border-[#e7e1d4] p-4 shadow-[0_12px_28px_-12px_rgba(0,0,0,.55)]">
          <p className="ledger-eyebrow !text-[9.5px] !text-[#8b3a2e]">{label} · {where}</p>
          <p className="mt-2 ledger-display italic text-[1rem] leading-snug">&ldquo;{line}&rdquo;</p>
          <a href={href} className="mt-3 inline-block text-[10.5px] tracking-[0.16em] uppercase underline underline-offset-4">{href === "#verdict" ? "Read the full note ↓" : "Why it's in the Ledger ↓"}</a>
        </div>
      )}
    </div>
  );
}
