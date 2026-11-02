import Link from "next/link";
import type { Coming } from "@/lib/content/whats-coming";
import { boardStatus } from "@/lib/content/coming-view";
import { DEEP_SEA, STAMP_AQUA } from "@/lib/palette";
import s from "./coming.module.css";

// The departures board (James, 2 Nov 2026: "a ticker should scroll on the destination page and perhaps
// the actual stay page"). One row of entries, COUNTRY · PROPERTY · STATUS DATE, scrolling slowly; it
// pauses on hover or focus and stands still (a scrollable row) for reduced motion. The first set of
// entries is the real one; the repeats that make the loop seamless are aria-hidden and out of the tab order.
export default function ComingTicker({ items, label = "What's coming", compact = false, more = true }: { items: Coming[]; label?: string; compact?: boolean; more?: boolean }) {
  if (!items.length) return null;
  const per = Math.max(1, Math.ceil(8 / items.length)); // each half of the loop holds at least eight entries
  const groups = per * 2;
  const dur = Math.max(24, items.length * per * 5.5);
  const href = (c: Coming) => c.href ?? `/whats-coming#${c.slug}`;
  const row = (hidden: boolean) => items.map((c) => (
    <li key={c.slug} className="flex items-center shrink-0">
      <Link href={href(c)} tabIndex={hidden ? -1 : undefined} className={`group flex items-center gap-3 md:gap-4 ${compact ? "px-5 py-3" : "px-6 md:px-8 py-4"} font-mono uppercase whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white`}>
        <span className="text-[10.5px] md:text-[11px] tracking-[0.22em]" style={{ color: STAMP_AQUA.onDark }}>{c.country ?? "The Ledger"}</span>
        <span className={`${compact ? "text-[12.5px]" : "text-[13px] md:text-[14px]"} tracking-[0.14em] text-white group-hover:underline underline-offset-4`}>{c.name}</span>
        <span className={`${s.flap} text-[11px] md:text-[11.5px] tracking-[0.16em] text-white/90`}>{boardStatus(c)}</span>
      </Link>
      <span aria-hidden="true" className="text-white/30 text-[10px]">&#9670;</span>
    </li>
  ));
  return (
    <section aria-label={`${label}: ${items.length} ${items.length === 1 ? "entry" : "entries"}`} className={s.board} style={{ background: DEEP_SEA.navy.fill, ["--board-sun" as string]: STAMP_AQUA.onDark, ["--board-dur" as string]: `${dur}s` }}>
      <div className="flex items-stretch">
        <div className="shrink-0 hidden sm:flex items-center gap-3 pl-5 md:pl-10 pr-5 border-r border-white/15">
          <span className={s.dot} aria-hidden="true" />
          <span className="font-mono text-[10.5px] tracking-[0.26em] uppercase text-white/80 whitespace-nowrap">{label}</span>
        </div>
        <div className={`${s.viewport} flex-1 min-w-0`}>
          <div className={s.track}>
            {Array.from({ length: groups }, (_, k) => (
              <ul key={k} className={s.group} aria-hidden={k > 0 ? true : undefined}>{row(k > 0)}</ul>
            ))}
          </div>
        </div>
        {more && (
          <Link href="/whats-coming" className="shrink-0 hidden md:flex items-center px-6 border-l border-white/15 font-mono text-[10.5px] tracking-[0.22em] uppercase text-white/85 hover:text-white whitespace-nowrap">All that&rsquo;s coming</Link>
        )}
      </div>
    </section>
  );
}
