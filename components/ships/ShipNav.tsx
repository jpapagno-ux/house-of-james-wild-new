"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// The sticky "On this page" bar for ship pages (voyages audit, 1 Nov 2026): every link a
// 44px tap target, and a scroll-spy that lights the section in view and scrolls its tab
// into view on phones, so the bar never shows "Overview" deep in the page. On phones the
// site header tucks away while reading down (SiteHeader `tuck`), and the bar rises to the top.

export default function ShipNav({ items, cta, ctaHref, house = false }: { items: [string, string][]; cta: string; ctaHref: string; house?: boolean }) {
  const [active, setActive] = useState<string>(items[0]?.[1] ?? "");
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = items.map(([, id]) => document.getElementById(id)).filter((x): x is HTMLElement => !!x);
    if (!els.length || !("IntersectionObserver" in window)) return;
    const seen = new Map<string, number>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) { if (e.isIntersecting) seen.set(e.target.id, e.boundingClientRect.top); else seen.delete(e.target.id); }
      // The last section whose top has passed the reading line wins.
      const order = items.map(([, id]) => id);
      const on = order.filter((id) => seen.has(id)).pop();
      if (on) setActive(on);
    }, { rootMargin: "-30% 0px -60% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  useEffect(() => {
    const r = rail.current;
    const a = r?.querySelector<HTMLElement>(`[data-nav="${active}"]`);
    if (!r || !a) return;
    const left = a.offsetLeft - r.clientWidth / 2 + a.clientWidth / 2;
    r.scrollTo({ left: Math.max(0, left), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [active]);

  const go = (e: React.MouseEvent, id: string) => {
    const t = document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    history.replaceState(null, "", `#${id}`);
    setActive(id);
    t.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav data-subnav aria-label="On this page" data-ship-nav className="border-b ledger-rule bg-paper/95 backdrop-blur sticky top-[76px] [html[data-chrome=tucked]_&]:top-0 lg:top-[164px] z-30 transition-[top] duration-300">
      <div className="max-w-ledger mx-auto px-5 md:px-10 flex items-center gap-5">
        <div ref={rail} className="flex-1 min-w-0 flex items-stretch gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_90%,transparent)] -ml-3">
          {items.map(([label, id]) => (
            <a key={id} href={`#${id}`} data-nav={id} onClick={(e) => go(e, id)} aria-current={active === id ? "true" : undefined}
              className={`ledger-eyebrow inline-flex items-center min-h-[48px] px-3 border-b-2 transition-colors ${active === id ? "border-crimson ledger-crimson" : "border-transparent hover:ledger-crimson"}`}>
              {label}
            </a>
          ))}
        </div>
        <Link href={ctaHref} className={`hidden max-sm:!hidden sm:inline-flex items-center min-h-[44px] ledger-btn shrink-0${house ? " ledger-btn--house" : ""}`}>{cta}</Link>
      </div>
    </nav>
  );
}
