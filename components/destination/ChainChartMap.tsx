"use client";

import { useState, type ReactNode } from "react";
import LedgerChartMap, { type MapItem } from "./LedgerChartMap";
import type { MapCategory } from "@/lib/ledger/categories";

// ChainChartMap: a country of island chains (Indonesia, James 2 Nov 2026: "zoom in on the island
// chains with some textures"). A small control above the chart flies between closer charts, one per
// chain, each with its own pins; the last tab steps back out to the whole archipelago. Each view is
// the ordinary LedgerChartMap, so the legend, the filter, the pin drop and the linked list behave
// exactly as on every other country page.

export type ChainView = {
  key: string;
  label: string;
  /** One line under the control: what is in this frame. */
  sub: string;
  chart: ReactNode;
  width: number;
  height: number;
  items: MapItem[];
  /** Where on the whole-country chart this chain sits ("62% 71%"): the fly-in grows from there. */
  origin?: string;
};

const ORDER: MapCategory[] = ["stay", "vessel", "residence", "reserve"];

export default function ChainChartMap({ country, views, initial }: { country: string; views: ChainView[]; initial?: string }) {
  const [key, setKey] = useState(initial ?? views[0]?.key);
  const [moved, setMoved] = useState(false);
  const v = views.find((x) => x.key === key) ?? views[0];
  if (!v) return null;
  const counts = Object.fromEntries(ORDER.map((k) => [k, v.items.filter((i) => i.category === k).length])) as Record<MapCategory, number>;
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={`Island chains of ${country}`}>
        {views.map((x) => {
          const on = x.key === v.key;
          return (
            <button key={x.key} type="button" role="tab" aria-selected={on} aria-controls="chain-panel" onClick={() => { setKey(x.key); setMoved(true); }}
              className={`px-3 py-2 border text-[13.5px] leading-tight transition-colors ${on ? "border-ink bg-ink text-paper" : "ledger-border bg-paper hover:border-crimson/60"}`}>
              {x.label} <span className={on ? "opacity-70" : "ledger-muted"}>({x.items.length})</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 mb-4 text-[14.5px] ledger-muted max-w-3xl" aria-live="polite">{v.sub}</p>
      <div id="chain-panel" role="tabpanel" key={v.key} className={`chain-fly${moved ? " quick" : ""}`} style={v.origin ? ({ "--chain-origin": v.origin } as React.CSSProperties) : undefined}>
        <LedgerChartMap legend="below" country={`${country}, ${v.label}`} chart={v.chart} width={v.width} height={v.height} items={v.items} counts={counts} />
      </div>
    </div>
  );
}
