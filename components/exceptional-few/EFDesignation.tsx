import { collectionNo } from "@/lib/content/exceptional-few";

// The Exceptional Few™ designation: a typographic mark, never a stamp or a badge.
// Two forms. "line" is the hero eyebrow (THE EXCEPTIONAL FEW™ — No. 001).
// "seal" is the round mark from the approved comps (RECORDED & VETTED · THE
// EXCEPTIONAL FEW · JAMES WILD & CO) with the house compass star. The seal
// prints only when the designation is live AND the record carries a founder
// status, so it never claims what the Ledger hasn't recorded.
export default function EFDesignation({ no, form = "line", onDark = false, size = 148, className = "" }: { no: number; form?: "line" | "seal"; onDark?: boolean; size?: number; className?: string }) {
  if (form === "line") {
    return (
      <p className={`ledger-eyebrow ${onDark ? "!text-white/85" : "ef-eyebrow"} flex items-center gap-3 ${className}`}>
        <span>The Exceptional Few&trade;</span>
        <span aria-hidden="true" className={`h-px w-6 ${onDark ? "bg-white/60" : "bg-ef-sand"}`} />
        <span>{collectionNo(no)}</span>
      </p>
    );
  }
  const r = 46;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`The Exceptional Few, ${collectionNo(no)}, recorded and vetted by James Wild & Co`} className={className}>
      <defs>
        <path id="ef-ring-top" d={`M ${60 - r} 60 a ${r} ${r} 0 0 1 ${2 * r} 0`} />
        <path id="ef-ring-bottom" d={`M ${60 + r + 2} 60 a ${r + 2} ${r + 2} 0 0 1 -${2 * r + 4} 0`} />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.9" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
      <text fontSize="6.2" letterSpacing="1.6" fontFamily="Manrope, ui-sans-serif, system-ui" fill="currentColor" opacity="0.95">
        <textPath href="#ef-ring-top" startOffset="50%" textAnchor="middle">RECORDED &amp; VETTED</textPath>
      </text>
      <text fontSize="5.4" letterSpacing="1.4" fontFamily="Manrope, ui-sans-serif, system-ui" fill="currentColor" opacity="0.85">
        <textPath href="#ef-ring-bottom" startOffset="50%" textAnchor="middle">JAMES WILD &amp; CO</textPath>
      </text>
      <text x="60" y="51" textAnchor="middle" fontSize="7.4" letterSpacing="1.3" fontFamily="'Cormorant Garamond', Georgia, serif" fill="currentColor">THE</text>
      <text x="60" y="61" textAnchor="middle" fontSize="7.8" letterSpacing="1.1" fontFamily="'Cormorant Garamond', Georgia, serif" fill="currentColor">EXCEPTIONAL</text>
      <text x="60" y="71" textAnchor="middle" fontSize="7.4" letterSpacing="1.3" fontFamily="'Cormorant Garamond', Georgia, serif" fill="currentColor">FEW&trade;</text>
      <path d="M60 77 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6z" fill="currentColor" opacity="0.9" />
      <text x="60" y="97" textAnchor="middle" fontSize="5.2" letterSpacing="1.2" fontFamily="Manrope, ui-sans-serif, system-ui" fill="currentColor" opacity="0.8">{collectionNo(no).toUpperCase()}</text>
    </svg>
  );
}
