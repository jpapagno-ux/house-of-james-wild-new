"use client";

import { useEffect, useState } from "react";

// Board 3, the homepage in five acts (James approved, 3 Nov 2026). A quiet roman-numeral rail on wide screens that
// marks the act in view and jumps between them. Phones read the acts in order without it.
export const ACTS: [string, string][] = [["act-1", "The house"], ["act-2", "The volumes"], ["act-3", "On now"], ["act-4", "The Ledger"], ["act-5", "Go deeper"]];
const ROMAN = ["I", "II", "III", "IV", "V"];

export default function ActRail() {
  const [on, setOn] = useState("act-1");
  useEffect(() => {
    const els = ACTS.map(([id]) => document.getElementById(id)).filter((x): x is HTMLElement => !!x);
    let t = 0;
    const pick = () => { let cur = "act-1"; for (const el of els) if (el.getBoundingClientRect().top <= window.innerHeight * 0.4) cur = el.id; setOn(cur); };
    const onScroll = () => { if (!t) t = window.setTimeout(() => { t = 0; pick(); }, 80); };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);
  return (
    <nav aria-label="The homepage in five acts" className="hidden min-[1680px]:block fixed left-6 top-1/2 -translate-y-1/2 z-20">
      <ol className="flex flex-col gap-1">
        {ACTS.map(([id, label], i) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={on === id ? "location" : undefined} className="group flex items-center gap-3 min-h-[36px]">
              <span className={`ledger-eyebrow w-6 transition-colors ${on === id ? "!text-[#8B2525]" : ""}`}>{ROMAN[i]}</span>
              <span className={`h-px transition-all ${on === id ? "w-8 bg-[#8B2525]" : "w-4 bg-[#CFC8BF]"}`} aria-hidden="true" />
              <span className={`ledger-eyebrow transition-opacity ${on === id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
