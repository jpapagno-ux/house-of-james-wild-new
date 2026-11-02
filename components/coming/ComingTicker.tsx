import Link from "next/link";
import type { BoardEntry } from "@/lib/content/coming-view";
import LookScript from "./LookScript";
import s from "./coming.module.css";

// The departures board (James, 2 Nov 2026: "a ticker should scroll on the destination page and perhaps the
// actual stay page", then "add updated specials and savings for the ticker"). Openings (a sun mark) and live
// offers (a % tag) in one row, PLACE · PROPERTY · OPENS 11 DEC 2026 or STAY 4 NIGHTS, SAVE 10% · BOOK BY
// 31 MAR 2027, scrolling slowly; it pauses on hover or focus and stands still (a scrollable row) for reduced
// motion. The first set of entries is the real one; the loop's repeats are aria-hidden and out of the tab order.
// Colours live in coming.module.css: concept B (house: graphite band, crimson rule, crimson dots for openings,
// a blush % for offers) by default, concept A (Deep Sea navy, aqua sun) under html[data-look="a"].
export default function ComingTicker({ entries, label = "What's coming", compact = false, more = true }: { entries: BoardEntry[]; label?: string; compact?: boolean; more?: boolean }) {
  if (!entries.length) return null;
  const per = Math.max(1, Math.ceil(8 / entries.length)); // each half of the loop holds at least eight entries
  const dur = Math.max(28, entries.length * per * 5.5);
  const opens = entries.filter((e) => e.kind === "opening").length, offers = entries.length - opens;
  const summary = [opens ? `${opens} ${opens === 1 ? "opening" : "openings"}` : "", offers ? `${offers} ${offers === 1 ? "offer" : "offers"}` : ""].filter(Boolean).join(" and ");
  const row = (hidden: boolean) => entries.map((e) => (
    <li key={e.key} className="flex items-center shrink-0">
      <Link href={e.href} tabIndex={hidden ? -1 : undefined} className={`group flex items-center gap-3 md:gap-4 ${compact ? "px-5 py-3" : "px-6 md:px-8 py-4"} font-mono uppercase whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white`}>
        {e.kind === "opening" ? <><span className={`${s.odot} ${s.onlyB}`} aria-hidden="true" /><Sun /></> : <span className={s.pct} aria-hidden="true">%</span>}
        <span className="sr-only">{e.kind === "opening" ? "Opening:" : "Offer:"}</span>
        <span className={`${s.place} text-[10.5px] md:text-[11px] tracking-[0.22em]`}>{e.place ?? "The Ledger"}</span>
        <span className={`${compact ? "text-[12.5px]" : "text-[13px] md:text-[14px]"} tracking-[0.14em] ${s.bname} group-hover:underline underline-offset-4`}>{e.name}</span>
        <span className={`${s.flap} ${e.kind === "offer" ? s.flapOffer : ""} text-[11px] md:text-[11.5px] tracking-[0.16em]`}>{e.flap}</span>
        {e.tail && <span className={`${s.tail} text-[10.5px] md:text-[11px] tracking-[0.18em]`}>{e.tail}</span>}
      </Link>
      <span aria-hidden="true" className={`${s.diamond} text-[10px]`}>&#9670;</span>
    </li>
  ));
  return (
    <>
      <LookScript />
      <section aria-label={`${label}: ${summary}`} className={s.board} style={{ ["--board-dur" as string]: `${dur}s` }}>
        <div className="flex items-stretch">
          <div className={`${s.boardLabel} shrink-0 hidden sm:flex items-center gap-3 pl-5 md:pl-10 pr-5`}>
            <span className={s.dot} aria-hidden="true" />
            <span className="font-mono text-[10.5px] tracking-[0.26em] uppercase whitespace-nowrap">{label}</span>
          </div>
          <div className={`${s.viewport} flex-1 min-w-0`}>
            <div className={s.track}>
              {Array.from({ length: per * 2 }, (_, k) => (
                <ul key={k} className={s.group} aria-hidden={k > 0 ? true : undefined}>{row(k > 0)}</ul>
              ))}
            </div>
          </div>
          {more && (
            <div className={`${s.boardMore} shrink-0 hidden md:flex items-stretch`}>
              <Link href="/whats-coming" className="flex items-center px-5 font-mono text-[10.5px] tracking-[0.22em] uppercase whitespace-nowrap">What&rsquo;s coming</Link>
              {offers > 0 && <Link href="/offers" className="flex items-center px-5 font-mono text-[10.5px] tracking-[0.22em] uppercase whitespace-nowrap">On the Horizon</Link>}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// The opening mark: a small sun rising over a horizon line.
function Sun() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 14" className={`${s.sun} ${s.onlyA} w-[18px] h-[13px] shrink-0`}>
      <path d="M4 11a6 6 0 0 1 12 0" fill="currentColor" />
      {[[10, 1, 10, 3], [3.6, 3.8, 5, 5.2], [16.4, 3.8, 15, 5.2], [1, 8, 3, 8], [17, 8, 19, 8]].map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />)}
      <line x1="0" y1="12.4" x2="20" y2="12.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
