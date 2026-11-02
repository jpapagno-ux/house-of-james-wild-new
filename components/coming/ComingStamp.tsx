import { HOUSE_LEDGER } from "@/lib/palette";
import { viewStatus } from "@/lib/content/coming-view";

// The What's Coming stamp, pressed like a ledger stamp (James, 2 Nov 2026: "transparent ... like stamping
// a ledger"): no disc, no drop shadow, one ink, and a stamp-pad texture (worn ink, tuned to stay
// legible at banner and card sizes). Cut in the On the Horizon line: a 4-weight outer ring, a hairline,
// compass ticks and mono ring lettering, with the status and the date in Plex Mono figures.
// Inks come from HOUSE_LEDGER (the What's Coming house look), never a volume or Deep Sea blue:
//   tone "dark"  ivory house ink, for the garnet banner and over photographs (a hairline ink shadow keeps
//                it legible on bright skies; the ground still shows through everywhere the ink does not)
//   tone "light" House Crimson, pressed into white pages and cards (multiply, like ink on paper)
const MONO = "IBM Plex Mono, ui-monospace, monospace";
const SERIF = "Cormorant Garamond, Georgia, serif";
// The stamp pad, worn but legible at banner and card sizes (the volume kit's padFilter is cut for large
// stamps and erodes small lettering): light speckle, soft blotches, a hair of edge wobble.
function stampInk(id: string, seed: number) {
  return `<filter id="${id}" x="-8%" y="-8%" width="116%" height="116%">
<feMorphology in="SourceGraphic" operator="dilate" radius="0.3" result="bl"/>
<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="${seed}" result="fine"/>
<feColorMatrix in="fine" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.5 0 0 0 1.55" result="fm"/>
<feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="${seed + 5}" result="coarse"/>
<feColorMatrix in="coarse" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.6 0 0 0 1.75" result="cm"/>
<feComposite in="bl" in2="fm" operator="in" result="a"/><feComposite in="a" in2="cm" operator="in" result="b"/>
<feDisplacementMap in="b" in2="coarse" scale="1.4" xChannelSelector="R" yChannelSelector="G"/></filter>`;
}

const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export default function ComingStamp({ status, date, size = 132, id, rotate = -8, tone = "dark" }: { status: string; date: string | null; size?: number; id: string; rotate?: number; tone?: "dark" | "light" }) {
  const ink = tone === "dark" ? HOUSE_LEDGER.ivory : HOUSE_LEDGER.crimson;
  const word = viewStatus(status) === "rebuilding" ? (date ? "REOPENS" : "REIMAGINED") : "OPENS";
  const [y, m, d] = (date ?? "").split("-");
  const lines: { text: string; size: number; font: string; dy: number; spacing?: number }[] = !date
    ? [{ text: "Date", size: 30, font: SERIF, dy: 98 }, { text: "to come", size: 22, font: SERIF, dy: 122 }]
    : d ? [{ text: String(Number(d)), size: 38, font: MONO, dy: 112 }, { text: `${MON[Number(m) - 1]} ${y}`, size: 11, font: MONO, dy: 132, spacing: 2 }]
    : m ? [{ text: MON[Number(m) - 1] ?? "", size: 30, font: MONO, dy: 108 }, { text: y, size: 13, font: MONO, dy: 130, spacing: 2.4 }]
    : [{ text: y, size: 32, font: MONO, dy: 114 }];
  const ticks = Array.from({ length: 48 }, (_, i) => {
    const a = ((i * 7.5 - 90) * Math.PI) / 180, major = i % 6 === 0;
    const r1 = major ? 79 : 82, r2 = 86;
    return `<line x1="${(100 + r1 * Math.cos(a)).toFixed(1)}" y1="${(100 + r1 * Math.sin(a)).toFixed(1)}" x2="${(100 + r2 * Math.cos(a)).toFixed(1)}" y2="${(100 + r2 * Math.sin(a)).toFixed(1)}" stroke="${ink}" stroke-width="${major ? 1.6 : 0.9}"/>`;
  }).join("");
  const k = `cs-${id.replace(/[^a-zA-Z0-9-]/g, "")}`;
  // A stable seed per stamp, so each one is pressed a little differently, like a real stamp.
  const seed = 11 + ([...k].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 70);
  const svg = `<svg viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true" style="overflow:visible">
<defs>${stampInk(`${k}f`, seed)}<path id="${k}t" d="M 34 100 A 66 66 0 0 1 166 100"/><path id="${k}b" d="M 26 100 A 74 74 0 0 0 174 100"/></defs>
<g filter="url(#${k}f)" opacity="0.92">
<circle cx="100" cy="100" r="93" fill="none" stroke="${ink}" stroke-width="4"/><circle cx="100" cy="100" r="88" fill="none" stroke="${ink}" stroke-width="1"/>${ticks}
<text font-family="${MONO}" font-size="9.5" letter-spacing="2.6" fill="${ink}"><textPath href="#${k}t" startOffset="50%" text-anchor="middle">WHAT'S COMING</textPath></text>
<text font-family="${MONO}" font-size="8" letter-spacing="2" fill="${ink}"><textPath href="#${k}b" startOffset="50%" text-anchor="middle">JAMES WILD &amp; CO</textPath></text>
<circle cx="100" cy="100" r="58" fill="none" stroke="${ink}" stroke-width="1.4"/>
<text x="100" y="66" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="2.4" fill="${ink}">${word}</text>
<line x1="70" y1="74" x2="130" y2="74" stroke="${ink}" stroke-width="1"/>
${lines.map((l) => `<text x="100" y="${l.dy}" text-anchor="middle" font-family="${l.font}" font-size="${l.size}" ${l.spacing ? `letter-spacing="${l.spacing}"` : ""} fill="${ink}">${l.text}</text>`).join("")}
</g></svg>`;
  return (
    <span className="inline-flex"
      style={{
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        // Light: pressed into the paper. Dark: a hairline shadow that hugs the ink only (no disc), so the
        // stamp stays legible over a bright photograph and the ground shows through everywhere else.
        mixBlendMode: tone === "light" ? "multiply" : undefined,
        filter: tone === "dark" ? "drop-shadow(0 0 1.2px rgba(20,12,12,0.55))" : undefined,
      }}
      dangerouslySetInnerHTML={{ __html: svg }} />
  );
}
