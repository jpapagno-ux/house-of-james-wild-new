"use client";

import { useEffect, useState } from "react";
import LuggageTag from "./LuggageTag";
import PostMark from "./PostMark";

// The verdict's mark on the hero, in one of three styles while James
// chooses: the luggage tag, a rubber stamp pressed onto the photograph, or a
// small taped note, or the postmark (stamp, cancellation and a line in
// James's hand). Preview any style on any verdict page with
// ?mark=post|tag|stamp|note.
export type MarkStyle = "post" | "tag" | "stamp" | "note";
type P = { line: string; where: string; when: string; style: MarkStyle; image?: string; script?: string; label?: string; href?: string };
// Journeys and voyages: the stamp inked in a colour from the destination's palette, with its own ring, nudge and link.
type StampExtra = { tint?: string; sub?: string; nudge?: string; cta?: string };

export function Stamp({ line, where, when, script, label = "The verdict", href = "#verdict", tint = "#fff3ea", sub, nudge, cta }: Omit<P, "style"> & StampExtra) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const year = when.match(/\d{4}/)?.[0] ?? when;
  return (
    <div className="absolute left-4 md:left-auto md:right-10 top-[112px] md:top-[220px] z-20">
      <button type="button" onClick={() => { setOpen((o) => !o); setSeen(true); }} aria-expanded={open} title="Tap to read the note" aria-label={`James Wild & Co · ${label}: tap to read the note`}
        className="relative block w-[92px] h-[92px] md:w-[132px] md:h-[132px] rounded-full rotate-[-12deg] hover:rotate-[-6deg] transition-transform"
        style={{ color: tint, boxShadow: `inset 0 0 0 3px ${tint}, inset 0 0 0 7px transparent, inset 0 0 0 8.5px ${tint}cc`, filter: "drop-shadow(0 1px 2px rgba(0,0,0,.65))" }}>
        <svg viewBox="0 0 132 132" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs><path id="sr" d="M66 66 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" /><filter id="worn"><feTurbulence baseFrequency="1.4" numOctaves="1" seed="3" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.6" /><feComposite in="SourceGraphic" operator="in" /></filter></defs>
          <g filter="url(#worn)" fill="currentColor" style={{ fontFamily: "ui-monospace, monospace" }}>
            <g className="jw-spin"><text fontSize="9.5" letterSpacing="2.6"><textPath href="#sr" startOffset="0">{`JAMES WILD & CO · ${label.toUpperCase()} ·`}</textPath></text></g>
            <text x="66" y="60" textAnchor="middle" fontSize="24" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>JW</text>
            <line x1="40" y1="68" x2="92" y2="68" stroke="currentColor" strokeWidth="1" />
            <text x="66" y="81" textAnchor="middle" fontSize="8" letterSpacing="1.5">{where.toUpperCase().slice(0, 16)}</text>
            <text x="66" y="92" textAnchor="middle" fontSize="8" letterSpacing="1.5">{(sub ?? year).toUpperCase()}</text>
          </g>
        </svg>
      </button>
      {!open && !seen && (
        <button type="button" onClick={() => { setOpen(true); setSeen(true); }} className="jw-nudge absolute left-[74px] top-[70px] md:left-auto md:right-[116px] md:top-[98px] flex md:flex-row-reverse items-end gap-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,.85)]" style={{ color: tint }} aria-label={`Read ${nudge ?? (label === "The verdict" ? "the founder's take" : "the note from the house")}`}>
          {/* hand-drawn arrow: its tip sits on the stamp's lower edge (up-left on phones, up-right on desktop) */}
          <svg viewBox="0 0 44 40" className="w-9 h-8 md:w-11 md:h-10 -scale-x-100 md:scale-x-100 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 37 C 14 36, 30 28, 39 5" />
            <path d="M31 8 L 39.5 4 L 41 13" />
          </svg>
          <span className="mb-[-6px] text-[15px] md:text-[19px] leading-none whitespace-nowrap -rotate-[4deg]" style={{ fontFamily: "'Homemade Apple', cursive" }}>{nudge ?? (label === "The verdict" ? "the founder's take" : "a note from the house")}</span>
        </button>
      )}
      {open && (
        <div className="absolute left-0 md:left-auto md:right-0 top-[100px] md:top-[140px] w-[260px] md:w-[290px] bg-[#fdfcf8] text-[#2b2622] border border-[#e7e1d4] p-4 shadow-[0_12px_28px_-12px_rgba(0,0,0,.55)]">
          <p className="ledger-eyebrow !text-[9.5px] !text-[#8b3a2e]">{label} · {where} · {when}</p>
          {script && <p className="mt-2 text-[15px] text-[#3b2716] -rotate-[2deg]" style={{ fontFamily: "'Homemade Apple', cursive" }}>{script}</p>}
          <p className="mt-2 ledger-display italic text-[1rem] leading-snug">&ldquo;{line}&rdquo;</p>
          <a href={href} className="mt-3 inline-block text-[10.5px] tracking-[0.16em] uppercase underline underline-offset-4">{cta ?? (href === "#verdict" ? "Read the full note ↓" : "Read why it's here ↓")}</a>
        </div>
      )}
    </div>
  );
}

function TapedNote({ line, where, when }: Omit<P, "style">) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute left-4 md:left-auto md:right-10 top-[118px] md:top-[226px] z-20">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className={`relative block text-left bg-[#fdfcf8] text-[#2b2622] rotate-[3deg] hover:rotate-[1deg] transition-all duration-500 shadow-[0_10px_22px_-10px_rgba(0,0,0,.6)] ${open ? "w-[250px] md:w-[280px] p-4" : "w-[138px] md:w-[168px] px-3 py-2.5"}`}>
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#e9dfcb]/90 rotate-[-3deg]" aria-hidden="true" />
        <span className="block ledger-eyebrow !text-[9px] !text-[#8b3a2e]">The verdict</span>
        <span className={`ledger-display italic leading-snug mt-1 ${open ? "block text-[1rem]" : "text-[0.85rem] md:text-[0.92rem] line-clamp-2"}`}>&ldquo;{line}&rdquo;</span>
        <span className="mt-1.5 flex items-center justify-between text-[9px] tracking-[0.14em] uppercase text-ink-faint"><span className="truncate">{open ? `${where} · ${when}` : when}</span><span className="ledger-display normal-case italic text-[13px] text-[#3b2716] tracking-normal">JW</span></span>
        {open && <a href="#verdict" onClick={(e) => e.stopPropagation()} className="mt-3 inline-block text-[10.5px] tracking-[0.16em] uppercase underline underline-offset-4">Read the full note ↓</a>}
      </button>
    </div>
  );
}

export default function HeroMark(p: P) {
  const [style, setStyle] = useState<MarkStyle>(p.style);
  useEffect(() => { const m = new URLSearchParams(location.search).get("mark"); if (m === "post" || m === "tag" || m === "stamp" || m === "note") setStyle(m); }, []);
  if (style === "post") return <PostMark line={p.line} where={p.where} when={p.when} image={p.image} script={p.script ?? "Worth your time. JW"} label={p.label} href={p.href} />;
  if (style === "stamp") return <Stamp {...p} />;
  if (style === "note") return <TapedNote {...p} />;
  return <LuggageTag {...p} />;
}
