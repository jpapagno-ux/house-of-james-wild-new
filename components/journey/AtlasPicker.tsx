"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

declare global { interface Window { chartRoute?: (k: string, scroll?: boolean) => void } }

// The atlas route picker (James, 2 Nov 2026): a sideways row of ship chips (ships that sail
// identical routes share one chip, e.g. "Ecoventura fleet"), then the selected ship's route
// chips with short labels. Sentence case, 44px targets. Picking a route tells the chart engine
// (window.chartRoute, jw-chart's own API) to fly to it; the engine's own stacked route buttons
// are hidden on atlases (globals.css, .jw-atlas).
export type PickerGroup = { label: string; href: string; members?: { name: string; href: string }[]; routes: { key: string; label: string }[] };

export default function AtlasPicker({ groups, ink }: { groups: PickerGroup[]; ink: string }) {
  const [g, setG] = useState(0);
  const [r, setR] = useState(groups[0]?.routes[0]?.key ?? "R0");
  const pick = (key: string) => { setR(key); window.chartRoute?.(key, false); };
  const group = groups[g];
  const chip = (on: boolean) => `shrink-0 inline-flex items-center min-h-[44px] px-4 border text-[14px] whitespace-nowrap transition-colors ${on ? "text-paper" : "ledger-border hover:border-current"}`;
  if (!group) return null;
  return (
    <div className="mt-5">
      <div role="group" aria-label="Choose a ship" className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-5 px-5 md:mx-0 md:px-0 pb-1">
        {groups.map((x, i) => (
          <button key={x.label} type="button" aria-pressed={i === g} onClick={() => { setG(i); pick(x.routes[0].key); }} className={chip(i === g)} style={i === g ? { background: ink, borderColor: ink } : undefined}>
            {x.label}<span className="ml-2 text-[12px] opacity-75">{x.routes.length}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div role="group" aria-label={`Routes for ${group.label}`} className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-5 px-5 md:mx-0 md:px-0">
          {group.routes.map((x) => (
            <button key={x.key} type="button" aria-pressed={x.key === r} onClick={() => pick(x.key)} className={`shrink-0 inline-flex items-center min-h-[44px] px-3 text-[14px] border-b-2 whitespace-nowrap ${x.key === r ? "" : "border-transparent ledger-muted hover:text-ink"}`} style={x.key === r ? { borderColor: ink, color: ink } : undefined}>{x.label}</button>
          ))}
        </div>
        <p className="ml-auto text-[14px] flex flex-wrap gap-x-4">
          {(group.members ?? [{ name: group.label, href: group.href }]).map((m) => (
            <Link key={m.href} href={m.href} className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline" style={{ color: ink }}>{m.name}<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link>
          ))}
        </p>
      </div>
    </div>
  );
}
