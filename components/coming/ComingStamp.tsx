import { HORIZON } from "@/lib/volumes";
import { viewStatus } from "@/lib/content/coming-view";

// The What's Coming stamp: cut in the On the Horizon line (components/ledger/HorizonMark.tsx), a 4-weight
// outer ring, a hairline, compass ticks and mono ring lettering, with the status and the date set in the
// field in Plex Mono figures (the house's ledger type for dates). Inked in the onDark HORIZON set on a deep disc so it reads over any photograph.
const MONO = "IBM Plex Mono, ui-monospace, monospace";
const SERIF = "Cormorant Garamond, Georgia, serif";
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export default function ComingStamp({ status, date, size = 132, id, rotate = -8 }: { status: string; date: string | null; size?: number; id: string; rotate?: number }) {
  const t = HORIZON.onDark;
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
    return `<line x1="${(100 + r1 * Math.cos(a)).toFixed(1)}" y1="${(100 + r1 * Math.sin(a)).toFixed(1)}" x2="${(100 + r2 * Math.cos(a)).toFixed(1)}" y2="${(100 + r2 * Math.sin(a)).toFixed(1)}" stroke="${t.ink}" stroke-width="${major ? 1.6 : 0.9}"/>`;
  }).join("");
  const k = `cs-${id}`;
  const svg = `<svg viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true">
<circle cx="100" cy="100" r="96" fill="${t.ground}" opacity="0.82"/>
<circle cx="100" cy="100" r="93" fill="none" stroke="${t.ink}" stroke-width="4"/><circle cx="100" cy="100" r="88" fill="none" stroke="${t.ink}" stroke-width="1"/>${ticks}
<defs><path id="${k}t" d="M 34 100 A 66 66 0 0 1 166 100"/><path id="${k}b" d="M 26 100 A 74 74 0 0 0 174 100"/></defs>
<text font-family="${MONO}" font-size="9.5" letter-spacing="2.6" fill="${t.ink}"><textPath href="#${k}t" startOffset="50%" text-anchor="middle">WHAT'S COMING</textPath></text>
<text font-family="${MONO}" font-size="8" letter-spacing="2" fill="${t.ink}"><textPath href="#${k}b" startOffset="50%" text-anchor="middle">JAMES WILD &amp; CO</textPath></text>
<circle cx="100" cy="100" r="58" fill="none" stroke="${t.ink}" stroke-width="1.4"/>
<text x="100" y="66" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="2.4" fill="${t.sun}">${word}</text>
<line x1="70" y1="74" x2="130" y2="74" stroke="${t.sea}" stroke-width="1"/>
${lines.map((l) => `<text x="100" y="${l.dy}" text-anchor="middle" font-family="${l.font}" font-size="${l.size}" ${l.spacing ? `letter-spacing="${l.spacing}"` : ""} fill="#FFFFFF">${l.text}</text>`).join("")}
</svg>`;
  return <span className="inline-flex drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]" style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
