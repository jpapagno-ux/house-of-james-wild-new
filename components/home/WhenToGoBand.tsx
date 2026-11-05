"use client";

import Link from "next/link";
import { useState } from "react";

// Board 9, "Where is best in …" (James approved, 3 Nov 2026). Pick a month; the countries whose filed best months
// include it light up. The months are the same lines that sit on each country page; nothing is added here.
export type WhenPlace = { name: string; href: string; areas: { area: string; best: number[] }[] };
const N = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function WhenToGoBand({ places }: { places: WhenPlace[] }) {
  const [m, setM] = useState(() => new Date().getMonth());
  const best = places.map((p) => ({ ...p, now: p.areas.filter((a) => a.best.includes(m)) })).filter((p) => p.now.length);
  return (
    <section className="mt-16 md:mt-24" aria-labelledby="when-band-h">
      <p className="ledger-eyebrow ledger-crimson">When to go</p>
      <h2 id="when-band-h" className="ledger-display text-[1.9rem] md:text-[2.6rem] leading-tight mt-2">Where Is Best in <span className="italic">{N[m]}</span></h2>
      <div className="mt-6 grid grid-cols-6 md:grid-cols-12 gap-1.5" role="group" aria-label="Choose a month">
        {N.map((n, k) => (
          <button key={n} type="button" aria-pressed={k === m} onClick={() => setM(k)} className={`house-chip min-h-[44px] justify-center ${k === m ? "!bg-ink !text-paper !border-ink" : ""}`}>{n.slice(0, 3)}</button>
        ))}
      </div>
      {best.length ? (
        <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {best.slice(0, 12).map((p) => (
            <li key={p.href}>
              <Link href={`${p.href}#when`} className="block h-full border ledger-border bg-paper p-5 hover:border-ink transition-colors">
                <span className="ledger-eyebrow ledger-crimson">Best now</span>
                <span className="block ledger-display text-[1.5rem] leading-tight mt-1">{p.name}</span>
                <span className="block text-[14px] ledger-muted mt-2">{p.now.map((a) => a.area).join(" · ")}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="mt-6 text-[15px] ledger-muted">No country page files {N[m]} as a best month yet. Ask James.</p>}
      <p className="mt-4 text-[13px] ledger-muted">Best months as filed on each country page.</p>
    </section>
  );
}
