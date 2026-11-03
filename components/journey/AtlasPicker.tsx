"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

declare global { interface Window { chartRoute?: (k: string, scroll?: boolean) => void; chartFocus?: (keys: string[], name?: string) => void } }

// The atlas route picker (James, 2 Nov 2026): a sideways row of ship chips (ships that sail
// identical routes share one chip, e.g. "Ecoventura fleet"), then the selected ship's route
// chips with short labels. Picking a route tells the chart engine (window.chartRoute) to fly to it;
// the engine's own stacked route buttons are hidden on atlases (globals.css, .jw-atlas).
// Region first (map audit, 2 Nov 2026): on an atlas that spans several waters (the voyages atlas), a
// first row names the waters; pointing to or focusing a region chip flies the chart to that region
// (window.chartFocus) before anything plays, and tapping it narrows the ships to those waters.
// Chips are the house's squared graphite (.house-chip); the active route has the crimson underline (.jw-tab).
export type PickerGroup = { label: string; href: string; members?: { name: string; href: string }[]; section?: string; region?: string; routes: { key: string; label: string }[] };
// On a busy atlas (more than six ship chips across several operators, the Galápagos) a first row offers
// the operators, so the ship row stays short on a phone.
const BUSY = 6;
const ROW = "flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-5 px-5 md:mx-0 md:px-0 pb-1";
const CHIP = "house-chip shrink-0 min-h-[44px] !px-4 whitespace-nowrap";

export default function AtlasPicker({ groups }: { groups: PickerGroup[]; ink?: string }) {
  const regions = [...new Set(groups.map((x) => x.region).filter((x): x is string => !!x))];
  const regional = regions.length > 1;
  const [reg, setReg] = useState<string>("");
  const inReg = groups.map((x, i) => ({ x, i })).filter(({ x }) => !regional || !reg || x.region === reg);
  const sections = [...new Set(inReg.map(({ x }) => x.section).filter((x): x is string => !!x))];
  const sectioned = (!regional || !!reg) && sections.length > 1 && inReg.length > BUSY;
  const [g, setG] = useState(0);
  const [r, setR] = useState(groups[0]?.routes[0]?.key ?? "R0");
  const [sec, setSec] = useState(groups[0]?.section ?? "");
  const hover = useRef<number | null>(null);
  const pick = (key: string) => { setR(key); window.chartRoute?.(key, false); };
  const keysOf = (region: string) => groups.filter((x) => x.region === region).flatMap((x) => x.routes.map((y) => y.key));
  // hovering a region previews it after a short pause, so a pointer passing over the row does not jerk the chart
  const preview = (region: string) => { if (hover.current) window.clearTimeout(hover.current); hover.current = window.setTimeout(() => window.chartFocus?.(keysOf(region), region), 160); };
  const cancel = () => { if (hover.current) window.clearTimeout(hover.current); hover.current = null; };
  const chooseRegion = (region: string) => {
    cancel();
    setReg(region);
    const first = groups.findIndex((x) => x.region === region);
    if (first >= 0) { setG(first); setSec(groups[first].section ?? ""); setR(groups[first].routes[0].key); }
    window.chartFocus?.(keysOf(region), region);
  };
  const group = groups[g];
  const shown = inReg.filter(({ x }) => !sectioned || x.section === sec);
  if (!group) return null;
  return (
    <div className="mt-5">
      {regional && (
        <div role="group" aria-label="Choose the waters" className={`${ROW} mb-2`} onMouseLeave={cancel}>
          {regions.map((x) => (
            <button key={x} type="button" aria-pressed={x === reg} onMouseEnter={() => preview(x)} onFocus={() => preview(x)} onClick={() => chooseRegion(x)} className={CHIP}>
              {x}<span className="opacity-70">{groups.filter((y) => y.region === x).reduce((a, y) => a + y.routes.length, 0)}</span>
            </button>
          ))}
        </div>
      )}
      {sectioned && (
        <div role="group" aria-label="Choose an operator" className={`${ROW} mb-1`}>
          {sections.map((x) => {
            const first = groups.findIndex((y) => y.section === x && (!regional || !reg || y.region === reg));
            return <button key={x} type="button" aria-pressed={x === sec} onClick={() => { setSec(x); setG(first); pick(groups[first].routes[0].key); }} className={`jw-tab shrink-0 inline-flex items-center min-h-[44px] px-3 text-[12px] uppercase tracking-[0.12em] whitespace-nowrap ${x === sec ? "is-active text-ink" : "ledger-muted hover:text-ink"}`}>{x}<span className="ml-1.5 opacity-70">{inReg.filter(({ x: y }) => y.section === x).length}</span></button>;
          })}
        </div>
      )}
      {(!regional || reg) && (
        <div role="group" aria-label="Choose a ship" className={ROW}>
          {shown.map(({ x, i }) => (
            <button key={x.label} type="button" aria-pressed={i === g} onClick={() => { setG(i); pick(x.routes[0].key); }} className={CHIP}>
              {x.label}<span className="opacity-70">{x.routes.length}</span>
            </button>
          ))}
        </div>
      )}
      {(!regional || reg) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div role="group" aria-label={`Routes for ${group.label}`} className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-5 px-5 md:mx-0 md:px-0">
            {group.routes.map((x) => (
              <button key={x.key} type="button" aria-pressed={x.key === r} onClick={() => pick(x.key)} className={`jw-tab shrink-0 inline-flex items-center min-h-[44px] px-3 text-[14px] whitespace-nowrap ${x.key === r ? "is-active text-ink" : "ledger-muted hover:text-ink"}`}>{x.label}</button>
            ))}
          </div>
          <p className="ml-auto text-[14px] flex flex-wrap gap-x-4">
            {(group.members ?? [{ name: group.label, href: group.href }]).map((m) => (
              <Link key={m.href} href={m.href} className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline text-ink">{m.name}<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
