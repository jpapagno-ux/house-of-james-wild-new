import Image from "next/image";

/** The perforated house stamp with a round postmark and wavy cancellation, for paper backgrounds (postcards, emails). */
export default function HouseStamp({ image, label, place, date, ink = "#8b3a2e" }: { image: string; label: string; place: string; date: string; ink?: string }) {
  const id = `hs-${place.replace(/\W+/g, "").toLowerCase()}`;
  return (
    <span className="absolute inset-0 pointer-events-none" aria-label={`Stamped "${label}", postmarked ${place}, ${date}`} role="img">
      <span className="absolute right-0 top-0 w-[66px] h-[80px] md:w-[86px] md:h-[104px] rotate-[4deg] drop-shadow-[0_3px_6px_rgba(40,30,15,.35)]"
        style={{ background: "#f6efdf", padding: 4, WebkitMask: "radial-gradient(circle, transparent 2.6px, #000 3px) -4px -4px / 8px 8px, linear-gradient(#000 0 0) content-box", WebkitMaskComposite: "source-over", mask: "radial-gradient(circle, transparent 2.6px, #000 3px) -4px -4px / 8px 8px, linear-gradient(#000 0 0) content-box", maskComposite: "add" }}>
        <span className="absolute inset-[6px] md:inset-[7px] border-2 border-[#2f4a34] bg-[#f6efdf] flex flex-col">
          <span className="text-center font-mono text-[5.5px] md:text-[6.5px] tracking-[0.04em] whitespace-nowrap text-[#2f4a34] leading-[1.7] border-b border-[#2f4a34]">JAMES WILD &amp; CO</span>
          <span className="relative flex-1 overflow-hidden">
            <Image src={image} alt="" fill sizes="90px" className="object-cover grayscale contrast-125 sepia-[.35]" />
            <span className="absolute inset-0 bg-[#2f4a34] mix-blend-color opacity-70" />
            <span className="absolute left-1 top-0 ledger-display text-[12px] md:text-[15px] text-[#f6efdf]">JW</span>
          </span>
          <span className="text-center font-mono text-[5.5px] md:text-[6.5px] tracking-[0.12em] uppercase text-[#2f4a34] border-t border-[#2f4a34] leading-[1.7]">{label}</span>
        </span>
      </span>
      <svg viewBox="0 0 200 120" className="absolute right-[34px] md:right-[46px] top-[6px] md:top-[14px] w-[150px] h-[90px] md:w-[200px] md:h-[120px] overflow-visible opacity-80" aria-hidden="true">
        <defs>
          <path id={`${id}-t`} d="M60 60 m-38 0 a38 38 0 1 1 76 0" />
          <path id={`${id}-b`} d="M60 60 m-38 0 a38 38 0 1 0 76 0" />
          <filter id={`${id}-w`}><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="7" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.7 1.4" /><feComposite in="SourceGraphic" operator="in" /></filter>
        </defs>
        <g filter={`url(#${id}-w)`} fill="none" stroke={ink} transform="rotate(-12 60 60)">
          <circle cx="60" cy="60" r="47" strokeWidth="2.2" />
          <g fill={ink} stroke="none" style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
            <text fontSize="9" letterSpacing="2.4"><textPath href={`#${id}-t`} startOffset="50%" textAnchor="middle">{place.toUpperCase()}</textPath></text>
            <text fontSize="8" letterSpacing="2.4" dy="8"><textPath href={`#${id}-b`} startOffset="50%" textAnchor="middle">JAMES WILD &amp; CO</textPath></text>
            <text x="60" y="58" textAnchor="middle" fontSize="9" letterSpacing="0.8">{date.toUpperCase()}</text>
            <text x="60" y="70" textAnchor="middle" fontSize="6.5" letterSpacing="2">JW &amp; CO</text>
          </g>
          {[0, 1, 2, 3].map((i) => <path key={i} strokeWidth="1.8" d={`M112 ${40 + i * 10} q 11 -6 22 0 t 22 0 t 22 0 t 22 0`} />)}
        </g>
      </svg>
    </span>
  );
}
