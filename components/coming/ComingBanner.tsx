import ComingTicker from "./ComingTicker";
import ComingStamp from "./ComingStamp";
import { comingOn, whenLabel } from "@/lib/content/whats-coming";
import { stayBoard } from "@/lib/content/board";
import { countdown, sortComing, viewStatus } from "@/lib/content/coming-view";
import { today } from "@/lib/dates";
import s from "./coming.module.css";
import Link from "next/link";

// On a stay page that is itself coming (Singita Elela): "Opening 11 December 2026", the days to go, and
// the board of the other openings in its region. Renders nothing for a stay that is open.
export default function ComingBanner({ slug }: { slug: string }) {
  const day = today();
  const all = comingOn(day);
  const c = all.find((x) => x.slug === slug);
  if (!c) return null;
  const back = viewStatus(c.status) === "rebuilding";
  const when = whenLabel(c.date);
  const headline = back ? (when ? `Reopening ${when}` : "Being reimagined") : when ? `Opening ${when}` : "Opening soon";
  const left = countdown(c.date, day);
  const board = stayBoard(sortComing(all, "soonest"), c, day);
  return (
    <aside aria-label={`${c.name}: ${headline}`} className={`${s.banner} jw-gradient text-white`}>
      <div className="max-w-ledger mx-auto px-5 md:px-10 py-6 md:py-8 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-10">
        <div className="hidden lg:block shrink-0"><ComingStamp status={c.status} date={c.date} id={`banner-${c.slug}`} size={104} rotate={-6} /></div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10.5px] tracking-[0.26em] uppercase text-white/75">What&rsquo;s coming &middot; {c.country}</p>
          <p className="ledger-display text-[2rem] md:text-[2.8rem] leading-[1.02] mt-1.5">{headline}</p>
          {left && <p className="mt-2 font-mono text-[12px] tracking-[0.18em] uppercase text-white/85">{left}</p>}
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-8 gap-y-3 lg:shrink-0">
          <Link href={`/plan?from=whats-coming&trip=${encodeURIComponent(`${c.name}: hold a place`)}${c.countrySlug ? `&destination=${c.countrySlug}` : ""}`} className="ledger-btn ledger-btn--solid"><span className="sm:hidden">Hold a place</span><span className="hidden sm:inline">Ask James to hold a place</span></Link>
          <Link href={`/whats-coming#${c.slug}`} className="ledger-btn min-h-[44px] inline-flex items-center">All that&rsquo;s coming</Link>
        </div>
      </div>
      {board.length > 0 && <ComingTicker entries={board} label={c.regionSlug ? `Also in ${c.regionSlug.charAt(0).toUpperCase()}${c.regionSlug.slice(1).replace(/-/g, " ")}` : "Also coming"} compact />}
    </aside>
  );
}
