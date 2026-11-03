"use client";

// Where to stay on the new country page (James, 3 Nov 2026): founder favourites and vetted first (the order comes in),
// squared graphite chips by area, and on phones the first six with "Show all". Every card is in the served HTML; the
// chips and the phone limit only hide what is already there.
import { useState, type ReactNode } from "react";

export type StayItem = { key: string; area: string; node: ReactNode };
const PHONE = 6;

export default function StayFilter({ items, areas }: { items: StayItem[]; areas: string[] }) {
  const [area, setArea] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const shown = items.filter((x) => !area || x.area === area);
  return (
    <>
      {areas.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter the stays by area">
          {[null, ...areas].map((a) => (
            <button key={a ?? "all"} type="button" className="house-chip" aria-pressed={area === a} onClick={() => setArea(a)}>
              {a ?? "All"} <span className="font-mono text-[10.5px] opacity-70">{a ? items.filter((x) => x.area === a).length : items.length}</span>
            </button>
          ))}
        </div>
      )}
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((x) => {
          const i = shown.indexOf(x);
          const hide = i < 0 ? "hidden" : !all && i >= PHONE ? "max-sm:hidden" : "";
          return <li key={x.key} className={hide} data-area={x.area}>{x.node}</li>;
        })}
      </ul>
      {!all && shown.length > PHONE && (
        <button type="button" className="sm:hidden mt-6 house-chip w-full justify-center" onClick={() => setAll(true)}>Show all {shown.length}</button>
      )}
    </>
  );
}
