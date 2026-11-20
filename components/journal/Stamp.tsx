import { useId } from "react";

// JWC-STYLE-01 primitive. A round ink stamp: two rings, a line of small capitals round the top and the bottom, and
// one or two words across the middle. House Crimson on Paper by default (count it as one of the screen's crimson
// touches); Graphite for a quiet mark; Paper for a stamp over a photograph.
type Props = {
  /** The words across the middle; a second line is allowed. */
  main: string;
  sub?: string;
  top?: string;
  bottom?: string;
  tone?: "crimson" | "graphite" | "paper";
  size?: number;
  rotate?: number;
  /** Read out instead of the separate words. */
  label?: string;
  className?: string;
};

const TONE = { crimson: "var(--jw-crimson)", graphite: "var(--jw-graphite)", paper: "var(--jw-paper)" } as const;

export default function Stamp({ main, sub, top, bottom, tone = "crimson", size = 104, rotate = -6, label, className = "" }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ink = TONE[tone];
  return (
    <svg role="img" aria-label={label ?? [top, main, sub, bottom].filter(Boolean).join(", ")} viewBox="0 0 120 120" width={size} height={size} className={className} style={{ transform: `rotate(${rotate}deg)`, color: ink }}>
      <defs>
        <path id={`${id}t`} d="M 60 60 m -43 0 a 43 43 0 1 1 86 0" />
        <path id={`${id}b`} d="M 60 60 m -47 0 a 47 47 0 0 0 94 0" />
      </defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="60" cy="60" r="52.5" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.5 2.5" />
      {top && <text fill="currentColor" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontSize="6.4" letterSpacing="1.6"><textPath href={`#${id}t`} startOffset="50%" textAnchor="middle">{top.toUpperCase()}</textPath></text>}
      {bottom && <text fill="currentColor" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontSize="6.4" letterSpacing="1.6"><textPath href={`#${id}b`} startOffset="50%" textAnchor="middle">{bottom.toUpperCase()}</textPath></text>}
      <text x="60" y={sub ? 59 : 64.5} textAnchor="middle" fill="currentColor" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="14" fontWeight="500" letterSpacing="0.6">{main}</text>
      {sub && <text x="60" y="73" textAnchor="middle" fill="currentColor" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="12" fontWeight="500" letterSpacing="0.4">{sub}</text>}
    </svg>
  );
}
