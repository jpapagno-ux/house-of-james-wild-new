"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Desk navigation. Desktop and tablet: a quiet left rail. Phones: one scrolling tab
// row under the masthead. Items for later stages are listed, labelled, not linked.

export type RailItem = { href: string; label: string; count?: number; soon?: string };

export default function Rail({ items, later, house }: { items: RailItem[]; later: RailItem[]; house: boolean }) {
  const path = usePathname() ?? "";
  const isActive = (href: string) => (href === "/partner" ? path === "/partner" : path === href || path.startsWith(`${href}/`));
  return (
    <>
      {/* phones */}
      <nav aria-label="Partner Desk" className="md:hidden -mx-5 px-5 border-b ledger-rule overflow-x-auto">
        <ul className="flex gap-5 min-w-max">
          {items.map((i) => (
            <li key={i.href}>
              <Link href={i.href} aria-current={isActive(i.href) ? "page" : undefined}
                className={`ledger-eyebrow inline-flex items-center gap-1.5 py-3 border-b-2 ${isActive(i.href) ? "ledger-crimson ledger-crimson-border" : "border-transparent"}`}>
                {i.label}{i.count ? <span className="tabular-nums">· {i.count}</span> : null}
              </Link>
            </li>
          ))}
          {house && <li><Link href="/desk/review" className="ledger-eyebrow inline-block py-3 border-b-2 border-transparent">House review</Link></li>}
        </ul>
      </nav>
      {/* tablet and desktop */}
      <nav aria-label="Partner Desk" className="hidden md:block">
        <ul className="border-t ledger-rule">
          {items.map((i) => {
            const on = isActive(i.href);
            return (
              <li key={i.href} className="border-b ledger-border">
                <Link href={i.href} aria-current={on ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 py-2.5 pl-3 pr-2 text-[14px] border-l-2 transition-colors ${on ? "ledger-crimson-border ledger-crimson font-medium bg-paper-card" : "border-transparent hover:bg-paper-card"}`}>
                  <span>{i.label}</span>
                  {i.count ? <span className="text-[11px] tabular-nums border ledger-border px-1.5 leading-5" aria-label={`${i.count} open`}>{i.count}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
        {house && (
          <Link href="/desk/review" className="mt-5 block border ledger-crimson-border ledger-crimson px-3 py-2.5 text-[13px] hover:bg-paper-card">House review queue →</Link>
        )}
        <p className="ledger-eyebrow mt-8">Arriving next</p>
        <ul className="mt-2">
          {later.map((i) => (
            <li key={i.label} className="flex items-center justify-between gap-3 py-1.5 pl-3 text-[13.5px] ledger-muted">
              <span>{i.label}</span><span className="shrink-0 whitespace-nowrap text-[10px] tracking-[0.14em] uppercase">{i.soon}</span>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
