"use client";

import { useEffect, useRef, useState } from "react";
import OnPageLink from "./OnPageLink";

// Board 5, the chapter rail (James approved, 3 Nov 2026; nav audit P2-1). The section in view is marked (crimson,
// a rule beneath, aria-current) and its link is kept in view inside the rail on phones. Links are 44px tall to tap.
export default function ChapterRail({ items }: { items: [string, string][] }) {
  const [on, setOn] = useState<string | null>(null);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = items.map(([, id]) => document.getElementById(id)).filter((x): x is HTMLElement => !!x);
    if (!els.length) return;
    const pick = () => {
      const nav = rail.current?.closest("nav")?.getBoundingClientRect();
      const line = (nav ? nav.bottom : 0) + 24;
      let cur: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id;
      setOn(cur);
    };
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(pick); };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [items]);

  useEffect(() => {
    if (!on || !rail.current) return;
    const a = rail.current.querySelector<HTMLElement>(`[data-ch="${on}"]`);
    if (!a) return;
    const r = rail.current, left = a.offsetLeft - (r.clientWidth - a.offsetWidth) / 2;
    r.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [on]);

  return (
    <div ref={rail} className="flex-1 min-w-0 flex items-center gap-5 xl:gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_92%,transparent)]">
      {items.map(([label, id]) => (
        <span key={id} data-ch={id} className="shrink-0">
          <OnPageLink id={id} current={on === id} className={`ledger-eyebrow min-h-[44px] inline-flex items-center border-b-2 hover:ledger-crimson ${on === id ? "!text-[#8B2525] border-[#8B2525]" : "border-transparent"}`}>{label}</OnPageLink>
        </span>
      ))}
    </div>
  );
}
