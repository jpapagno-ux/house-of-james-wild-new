"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

// The Ledger's running count for a place: each figure rolls up like an
// odometer when it comes into view. The final numbers are in the server HTML
// (search engines and no-JS readers see them); the roll is only a flourish.
export type Count = { label: string; n: number; note?: string };

function Digits({ n, go, delay }: { n: number; go: boolean | null; delay: number }) {
  const ds = String(n).split("").map(Number);
  return (
    <span className="inline-flex tabular-nums" aria-hidden="true">
      {ds.map((d, i) => {
        // two passes of 0-9 so every digit makes at least one full turn
        const stop = d + 10;
        const y = go === false ? 0 : stop;
        return (
          <span key={i} className="relative inline-block h-[1.15em] overflow-hidden" style={{ width: "0.6em" }}>
            <span className="absolute inset-x-0 top-0 flex flex-col"
              style={{ transform: `translateY(-${y * 1.15}em)`, transition: go ? `transform ${1.4 + i * 0.25}s cubic-bezier(.16,1,.3,1) ${delay + i * 0.08}s` : "none" }}>
              {Array.from({ length: 20 }, (_, k) => <span key={k} className="h-[1.15em] leading-[1.15em] text-center">{k % 10}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function LedgerCounter({ place, counts }: { place: string; counts: Count[] }) {
  const reduce = useReducedMotionSafe();
  // null: server/first paint at final values; false: armed at zero; true: rolling to final
  const [go, setGo] = useState<boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduce || !ref.current) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) { setGo(false); requestAnimationFrame(() => requestAnimationFrame(() => setGo(true))); return; }
    setGo(false);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  return (
    <div ref={ref} className="mt-6 border-t border-b ledger-rule grid grid-cols-2 sm:grid-cols-4" aria-label={`The Ledger in ${place}, live count`}>
      {counts.map((c, i) => (
        <div key={c.label} className={`py-4 pr-3 ${i % 2 ? "pl-4 sm:pl-5" : ""} ${i > 0 ? "sm:border-l ledger-rule sm:pl-5" : ""} ${i === 1 ? "border-l ledger-rule" : ""} ${i === 3 ? "border-l ledger-rule" : ""} ${i >= 2 ? "border-t sm:border-t-0 ledger-rule" : ""}`}>
          <p className={`ledger-display text-[2.3rem] md:text-[2.8rem] leading-none ${c.n ? "" : "ledger-muted/50"}`}>
            <span className="sr-only">{c.n}</span>
            {c.n ? <Digits n={c.n} go={go} delay={i * 0.12} /> : <span aria-hidden="true" className="text-[1.4rem] italic ledger-muted">filing</span>}
          </p>
          <p className="ledger-eyebrow mt-2">{c.label}</p>
          {c.note && <p className="text-[12.5px] ledger-muted mt-0.5">{c.note}</p>}
        </div>
      ))}
    </div>
  );
}
