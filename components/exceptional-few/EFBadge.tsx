import { collectionNo } from "@/lib/content/exceptional-few";
import { padFilter } from "@/components/ledger/VolumeKit";

const CRIMSON = "#8B2525";
const SERIF = "'Cormorant Garamond', Georgia, serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

/** The approval stamp, pressed in House Crimson from the same distressed ink pad as the Ledger stamps: a
 *  portfolio page stamped "approved". Double frame, the number large, "Hand-numbered · Signed J.W." beneath. */
export function EFStamp({ no, size = 220, rotate = -5, seed = 23, className = "", onPhoto = false }: { no: number; size?: number; rotate?: number; seed?: number; className?: string; /** pressed in white ink over a photograph */ onPhoto?: boolean }) {
  const label = collectionNo(no);
  const id = `efst${no}`;
  const star = (x: number) => `<path d="M${x} 118 l1.8 4.6 4.6 1.8 -4.6 1.8 -1.8 4.6 -1.8 -4.6 -4.6 -1.8 4.6 -1.8z" fill="currentColor"/>`;
  const svg = `<svg viewBox="0 0 240 150" width="${size}" height="${Math.round(size * 150 / 240)}" role="img" aria-label="The Exceptional Few, ${label}, approved and signed J.W." style="color:${onPhoto ? "#FFFFFF" : CRIMSON};overflow:visible;${onPhoto ? "filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))" : ""}"><defs>${padFilter(id + "f", seed).replace("-3.4 0 0 0 2.55", "-1.9 0 0 0 2.05")}</defs><g filter="url(#${id}f)" fill="none" stroke="currentColor">
<rect x="4" y="4" width="232" height="142" stroke-width="3.6"/><rect x="11" y="11" width="218" height="128" stroke-width="1"/>
<text x="120" y="30" text-anchor="middle" font-family="${MONO}" font-size="9" textLength="188" lengthAdjust="spacingAndGlyphs" fill="currentColor" stroke="none">JAMES WILD &amp; CO · THE LEDGER</text>
<path d="M28 38 H212" stroke-width="1"/>
<text x="120" y="60" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="20" textLength="192" lengthAdjust="spacingAndGlyphs" fill="currentColor" stroke="none">THE EXCEPTIONAL FEW</text>
<text x="120" y="103" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="42" textLength="150" lengthAdjust="spacingAndGlyphs" fill="currentColor" stroke="none">${label.toUpperCase()}</text>
<path d="M28 112 H212" stroke-width="1"/>${star(40)}${star(200)}
<text x="120" y="130" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-weight="600" font-size="14" textLength="140" lengthAdjust="spacingAndGlyphs" fill="currentColor" stroke="none">Hand-numbered · Signed J.W.</text>
</g></svg>`;
  return <span className={`jw-press ${className}`} style={{ display: "inline-flex", flex: "none", transform: `rotate(${rotate}deg)`, mixBlendMode: onPhoto ? "normal" : "multiply", ["--jw-rot" as string]: `${rotate}deg` }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

// The Exceptional Few badge: a hand-numbered tag, the way a gallery numbers a limited print and the artist
// signs it. White card, a fine double keyline, a row of crimson stitching down the left edge (the white glove),
// the number in House Crimson and "Signed J.W." in italic. Unique to James Wild & Co: it is never a star, a
// score or a coloured ribbon, and it prints only for a live designation.
//   size "sm": on cards, search and country pages. size "lg": the collection page and record heroes.
export default function EFBadge({ no, size = "sm", className = "" }: { no: number; size?: "sm" | "lg"; className?: string }) {
  const label = collectionNo(no);
  if (size === "sm") {
    return (
      <span className={`ef-badge inline-flex items-stretch bg-white text-ink border border-[#CFC8BF] shadow-[0_1px_0_#DCD7D0] ${className}`} aria-label={`The Exceptional Few, ${label}, signed J.W.`}>
        <span aria-hidden="true" className="w-[5px] border-r border-dashed border-[#8B2525]/70" />
        <span className="flex items-baseline gap-2 px-2.5 py-1.5">
          <span className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-[#2E2B28]">The Exceptional Few</span>
          <span className="font-display text-[15px] leading-none text-house">{label}</span>
        </span>
      </span>
    );
  }
  return (
    <div className={`ef-badge relative inline-flex bg-white text-ink border border-[#CFC8BF] p-[5px] ${className}`} role="img" aria-label={`The Exceptional Few, ${label}, signed J.W.`}>
      <div className="relative flex items-center gap-5 border border-[#CFC8BF] pl-6 pr-6 py-4">
        <span aria-hidden="true" className="absolute left-[9px] top-3 bottom-3 border-l border-dashed border-[#8B2525]/80" />
        <div>
          <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#6B635A]">James Wild &amp; Co</p>
          <p className="font-display text-[1.35rem] leading-tight mt-1">The Exceptional Few<span className="align-super text-[0.6em]">&trade;</span></p>
          <p className="font-display italic text-[15px] text-[#6B635A] mt-1">Hand-numbered · Signed J.W.</p>
        </div>
        <div className="border-l border-[#CFC8BF] pl-5 text-center">
          <p className="font-mono text-[9px] tracking-[0.24em] uppercase text-[#6B635A]">No.</p>
          <p className="font-display text-[2.1rem] leading-none text-house mt-1">{label.replace("No. ", "")}</p>
        </div>
      </div>
    </div>
  );
}
