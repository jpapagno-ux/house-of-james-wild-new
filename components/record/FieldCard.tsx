import { InkStamp } from "@/components/ledger/VolumeKit";
import type { ReactNode } from "react";
import { entryNo, type VolumeKey } from "@/lib/volumes";

// The field card (James, 12 Nov 2026: "make it more attractive, more designed ... taking some of the tints and the
// colors and blending in through the whole page"). The record's facts at a glance, on a soft wash of the page's own
// colour: The Exceptional Few's light earth (--ef-earth) on a designated stay, the stay's pathway ink (--tone-path) on a
// house-entrance stay, Graphite elsewhere. Small, tight labels; values in the serif; the Ledger ID in crimson beside its
// ink stamp; "Best suited to" as squared chips; the way in drawn as a route. Still a <dl>, so every fact stays plain
// text for search and answer engines.

const ink = "var(--ef-earth, var(--tone-path, #2E2B28))";

/** "Sumbawa Besar (SWQ), then a 45 minute speedboat" → ["SWQ", "45 min speedboat"]; null when the line isn't that shape. */
export function routeOf(airport: string): string[] | null {
  const code = airport.match(/\(([A-Z]{3})\)/)?.[1];
  if (!code) return null;
  const legs = airport.split(/,\s*then\s+(?:an?\s+)?|;\s*then\s+(?:an?\s+)?|\s+then\s+(?:an?\s+)?/i).slice(1)
    .map((l) => l.replace(/\bminutes?\b/i, "min").replace(/\bhours?\b/i, "hr").replace(/\.$/, "").trim()).filter(Boolean);
  return legs.length ? [code, ...legs] : null;
}

// the record's own code, shown in crimson beside its stamp, whatever the volume calls it
const CODE = /^(Ledger ID|Journey code|Voyage code|Route code|Record)$/i;
// the way in or the way through, drawn as a route: a stay's airport line, a journey's "In · Out", a voyage's ports
const ROUTE = /^(In · Out|Embark · Disembark|From · To|Ports|Route)$/i;

/** "Belize City (BZE) · Belize City (BZE)" → ["Belize City (BZE)", "Belize City (BZE)"]; "Papeete to Papeete" likewise. */
function legsOf(v: string): string[] | null {
  const legs = v.split(/\s+·\s+|\s+to\s+|\s*→\s*/).map((x) => x.trim()).filter(Boolean);
  return legs.length > 1 && legs.length <= 7 && legs.every((l) => l.length < 48) ? legs : null;
}

export default function FieldCard({ facts, name, ledgerId, volume = "stays", render = (v) => v }: { facts: [string, string][]; name: string; ledgerId?: string | null;
  /** whose stamp sits beside the code */
  volume?: VolumeKey;
  /** how a value is shown (the journey pages mark anything still [to confirm]) */
  render?: (v: string) => ReactNode }) {
  if (!facts.length) return null;
  const no = entryNo(ledgerId ?? facts.find(([k]) => CODE.test(k))?.[1] ?? null);
  return (
    <dl className="relative overflow-hidden px-5 md:px-7 py-2 text-[15px]" aria-label={`${name} at a glance`}
      style={{ background: `color-mix(in srgb, ${ink} 10%, #FFFFFF)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${ink} 22%, transparent)` }}>
      <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: ink, opacity: 0.55 }} />
      {facts.map(([k, v]) => {
        const route = k === "Airport" ? routeOf(v) : null;
        const legs = !route && ROUTE.test(k) ? legsOf(v) : null;
        return (
          <div key={k} className="grid grid-cols-[7.5rem_1fr] md:grid-cols-[9rem_1fr] gap-4 py-3.5 border-b last:border-0 items-baseline" style={{ borderColor: `color-mix(in srgb, ${ink} 16%, transparent)` }}>
            <dt className="text-[10.5px] tracking-[0.14em] uppercase font-medium" style={{ color: `color-mix(in srgb, ${ink} 80%, #6B635A)` }}>{k}</dt>
            <dd className="ledger-display text-[1.12rem] md:text-[1.2rem] leading-snug">
              {CODE.test(k) ? (
                <span className="flex items-center justify-between gap-3"><span className="text-house tabular-nums whitespace-nowrap text-[1rem] md:text-[1.2rem]">{v}</span>{no && <span aria-hidden="true" className="-my-3 shrink-0"><InkStamp volume={volume} no={no} size={52} rotate={-8} /></span>}</span>
              ) : k === "Best suited to" ? (
                <span className="flex flex-wrap gap-1.5 font-sans">{v.split(/,\s*/).map((x) => <span key={x} className="text-[12px] leading-none px-2.5 py-1.5 border" style={{ borderColor: `color-mix(in srgb, ${ink} 35%, transparent)` }}>{x}</span>)}</span>
              ) : route ? (
                <span className="block">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {[...route, name].map((r, i) => <span key={r + i} className="flex items-center gap-2">{i > 0 && <span aria-hidden="true" style={{ color: ink }}>&rarr;</span>}<span className={i === 0 ? "tabular-nums tracking-[0.04em]" : ""}>{r}</span></span>)}
                  </span>
                  <span className="block mt-1 font-sans text-[12.5px] ledger-muted">{v}</span>
                </span>
              ) : legs ? (
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">{legs.map((r, i) => <span key={r + i} className="flex items-center gap-2">{i > 0 && <span aria-hidden="true" style={{ color: ink }}>&rarr;</span>}{render(r)}</span>)}</span>
              ) : render(v)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
