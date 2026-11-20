import type { ReactNode } from "react";

// JWC-STYLE-01, Stage 9. A card from the house: one approved line in James's hand on the left, a postmark, a stamp
// and three address lines on the right. The line is passed in from the house's approved voice bank; this component
// never writes one.
type Props = { line: string; signature?: ReactNode; place?: string | null; ledgerId?: string | null; postmark?: string | null };

export default function Postcard({ line, signature, place, ledgerId, postmark }: Props) {
  return (
    <aside aria-label="A card from the house" className="bg-white border border-[color:var(--jw-keyline)] shadow-[0_18px_30px_-22px_rgba(26,24,22,0.5)] md:-rotate-[0.6deg] grid md:grid-cols-[1.15fr_1fr]">
      <div className="px-6 py-7 md:px-9 md:py-9">
        <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-stone-text">A card from the house</p>
        <p className="mt-4 font-hand text-[30px] md:text-[34px] leading-[1.15] text-graphite">{line}</p>
        {signature && <div className="mt-4">{signature}</div>}
      </div>
      <div className="border-t md:border-t-0 md:border-l border-[color:var(--jw-graphite)] px-6 py-7 md:px-9 md:py-9">
        <div className="flex items-start justify-between gap-4">
          <svg aria-hidden viewBox="0 0 150 60" className="h-14 w-36 text-graphite" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="30" cy="30" r="27" /><circle cx="30" cy="30" r="20" />
            {[18, 26, 34, 42].map((y) => <path key={y} d={`M64 ${y} q10 -6 20 0 t20 0 t20 0 t20 0`} />)}
            {postmark && <text x="30" y="33" textAnchor="middle" stroke="none" fill="currentColor" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontSize="5.2" letterSpacing="0.6">{postmark.toUpperCase().slice(0, 12)}</text>}
          </svg>
          <div className="border border-dashed border-[color:var(--jw-graphite)] px-3 py-3 text-center">
            <p className="font-display text-[17px] text-house">JW &amp; Co</p>
            {ledgerId && <p className="font-mono text-[7.5px] tracking-[0.1em] text-stone-text mt-1">{ledgerId}</p>}
          </div>
        </div>
        <div className="mt-6 space-y-3 font-hand text-[22px] text-graphite">
          <p className="border-b border-[color:var(--jw-keyline)] pb-1">To: whoever is reading this</p>
          {place && <p className="border-b border-[color:var(--jw-keyline)] pb-1">{place}</p>}
          <p className="border-b border-[color:var(--jw-keyline)] pb-1">Reply to: the house</p>
        </div>
      </div>
    </aside>
  );
}
