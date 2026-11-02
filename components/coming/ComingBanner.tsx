import Link from "next/link";
import ComingTicker from "./ComingTicker";
import ComingStamp from "./ComingStamp";
import { comingOn, whenLabel } from "@/lib/content/whats-coming";
import { countdown, sortComing, viewStatus } from "@/lib/content/coming-view";
import { today } from "@/lib/dates";
import { DEEP_SEA } from "@/lib/palette";

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
  const others = sortComing(all.filter((x) => x.slug !== slug && x.regionSlug && x.regionSlug === c.regionSlug), "soonest");
  return (
    <aside aria-label={`${c.name}: ${headline}`} className="text-white" style={{ background: `linear-gradient(100deg, ${DEEP_SEA.navy.fill}, ${DEEP_SEA.teal.fill})` }}>
      <div className="max-w-ledger mx-auto px-5 md:px-10 py-6 md:py-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
        <div className="hidden md:block shrink-0"><ComingStamp status={c.status} date={c.date} id={`banner-${c.slug}`} size={104} rotate={-6} /></div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10.5px] tracking-[0.26em] uppercase text-white/75">What&rsquo;s coming &middot; {c.country}</p>
          <p className="ledger-display text-[2rem] md:text-[2.8rem] leading-[1.02] mt-1.5">{headline}</p>
          {left && <p className="mt-2 font-mono text-[12px] tracking-[0.18em] uppercase text-white/85">{left}</p>}
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link href={`/plan?from=whats-coming&trip=${encodeURIComponent(`${c.name}: hold a place`)}${c.countrySlug ? `&destination=${c.countrySlug}` : ""}`} className="ledger-btn !border-white !text-white hover:!bg-white hover:!text-ink">Ask James to hold a place</Link>
          <Link href={`/whats-coming#${c.slug}`} className="ledger-btn !border-white/50 !text-white/90 hover:!bg-white hover:!text-ink">All that&rsquo;s coming</Link>
        </div>
      </div>
      {others.length > 0 && <ComingTicker items={others} label={`Also coming in ${c.regionSlug!.charAt(0).toUpperCase()}${c.regionSlug!.slice(1).replace(/-/g, " ")}`} compact />}
    </aside>
  );
}
