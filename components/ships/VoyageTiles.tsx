import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { volumeInk } from "@/lib/volumes";

// Tiles for the Voyages landing and hubs: a type or a waters, its ship count and its lowest
// published "from". Each tile is one 44px+ link. `external` opens another house site
// (the polar card goes to Polar Crossings).
export type Tile = { key: string; name: string; href: string; line: string; count?: number; from?: string | null; external?: boolean; note?: string };

export default function VoyageTiles({ tiles, cols = 4 }: { tiles: Tile[]; cols?: 3 | 4 | 5 }) {
  const ink = volumeInk("voyages");
  const grid = cols === 5 ? "lg:grid-cols-5" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 ${grid}`}>
      {tiles.map((t) => {
        const body = (
          <>
            <p className="ledger-eyebrow" style={{ color: ink }}>{t.external ? "Another house site" : t.count ? `${t.count} ${t.count === 1 ? "ship" : "ships"}` : t.note ?? "Ships being added"}</p>
            <h3 className="ledger-display text-[24px] leading-tight mt-1">{t.name}</h3>
            <p className="mt-1.5 text-[14.5px] ledger-muted leading-snug flex-1">{t.line}</p>
            <p className="mt-4 pt-3 border-t ledger-rule flex items-center justify-between gap-3 text-[14px]">
              <span>{t.from ? <><span className="ledger-eyebrow">From </span><span className="ledger-display ledger-crimson text-[18px]">{t.from}</span></> : <span className="ledger-muted">{t.external ? "polarcrossings.com" : "Fares as filed"}</span>}</span>
              {t.external ? <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} aria-hidden="true" />}
            </p>
          </>
        );
        const cls = "group h-full min-h-[44px] flex flex-col ledger-paper border ledger-border p-5 hover:border-crimson/60 transition-colors";
        return (
          <li key={t.key}>
            {t.external
              ? <a href={t.href} className={cls} style={{ borderTopColor: ink, borderTopWidth: 3 }} target="_blank" rel="noopener">{body}</a>
              : <Link href={t.href} className={cls} style={{ borderTopColor: ink, borderTopWidth: 3 }}>{body}</Link>}
          </li>
        );
      })}
    </ul>
  );
}
