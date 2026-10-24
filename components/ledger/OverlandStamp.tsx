"use client";

import { useId } from "react";

// OverlandStamp — James's corner stamp in distressed ink. The words follow the
// truth of the record: "Field tested" + year only where James travelled the
// route; "Designed by" where he built it but has not travelled it himself.
type Props = { tested?: boolean; year?: number; bottom?: string; footer?: string; className?: string; rotate?: number };

export default function OverlandStamp({ tested = true, year, bottom, footer, className = "", rotate = -11 }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const top = `top-${uid}`;
  const bot = `bot-${uid}`;
  const ink = `ink-${uid}`;
  const bottomText = bottom || (tested ? "OVERLAND · FIELD TESTED" : "OVERLAND · DESIGNED BY");
  const footerText = footer || (tested ? (year ? String(year) : "") : "THE ROUTE");

  return (
    <svg
      viewBox="0 0 200 200"
      className={`ledger-crimson ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      role="img"
      aria-label={tested ? `James Wild & Co. overland stamp: field tested by J.W.${year ? ` in ${year}` : ""}` : "James Wild & Co. overland stamp: route designed by J.W."}
    >
      <defs>
        <path id={top} d="M 34,100 A 66,66 0 0 1 166,100" />
        <path id={bot} d="M 22,100 A 78,78 0 0 0 178,100" />
        <filter id={ink} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={2.2} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves={1} seed={3} result="m" />
          <feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.75" result="mask" />
          <feComposite in="d" in2="mask" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${ink})`} fill="none" stroke="currentColor" opacity={0.88}>
        <circle cx="100" cy="100" r="92" strokeWidth="3.2" />
        <circle cx="100" cy="100" r="84" strokeWidth="1.1" />
        <circle cx="100" cy="100" r="52" strokeWidth="0.9" strokeDasharray="1.5 3.5" />
        <g fill="currentColor" stroke="none" fontFamily="Georgia, 'Times New Roman', serif">
          <text fontSize="15" letterSpacing="3.2"><textPath href={`#${top}`} startOffset="50%" textAnchor="middle">JAMES WILD &amp; CO.</textPath></text>
          <text fontSize="11.5" letterSpacing="2.4"><textPath href={`#${bot}`} startOffset="50%" textAnchor="middle">{bottomText}</textPath></text>
          <text x="31" y="104" fontSize="10" textAnchor="middle">★</text>
          <text x="169" y="104" fontSize="10" textAnchor="middle">★</text>
        </g>
        <path d="M 78,82 C 88,70 98,92 108,78 S 120,74 124,70" strokeWidth="1.6" strokeDasharray="2 3" strokeLinecap="round" />
        <circle cx="78" cy="82" r="2.4" fill="currentColor" stroke="none" />
        <path d="M 124,64 l 0,10 M 124,64 l 7,3 l -7,3" strokeWidth="1.4" strokeLinejoin="round" />
        <line x1="62" y1="92" x2="138" y2="92" strokeWidth="0.9" />
        <text x="100" y="118" textAnchor="middle" fontSize="27" fontStyle="italic" fill="currentColor" stroke="none" fontFamily="Georgia, 'Times New Roman', serif">J.W.</text>
        <line x1="62" y1="126" x2="138" y2="126" strokeWidth="0.9" />
        {footerText && (
          <text x="100" y="141" textAnchor="middle" fontSize="12" letterSpacing="2.5" fill="currentColor" stroke="none" fontFamily="Georgia, 'Times New Roman', serif">{footerText}</text>
        )}
      </g>
    </svg>
  );
}
