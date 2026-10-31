"use client";
import { useId, useState, type ReactNode } from "react";

// "Choose your way" (James, 31 Oct 2026): one row of tabs, one per volume, each in its volume's ink
// (lib/volumes.ts). A tab shows that volume's records and filters the map's pins to match. Every
// panel is in the HTML from the start (search engines and no-JS readers see all of them).
export type VolumeTab = { key: string; label: string; count: number; ink: string; pin?: string; content: ReactNode };

export default function VolumeTabs({ tabs, title, intro }: { tabs: VolumeTab[]; title: string; intro?: string }) {
  const id = useId();
  const [cur, setCur] = useState(tabs[0]?.key);
  if (!tabs.length) return null;
  const pick = (t: VolumeTab) => {
    setCur(t.key);
    window.dispatchEvent(new CustomEvent("jw:volume", { detail: t.pin ?? "all" }));
  };
  const active = tabs.find((t) => t.key === cur) ?? tabs[0];
  return (
    <section id="choose" className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby={`${id}-h`}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="ledger-eyebrow ledger-crimson">Choose your way</p>
          <h2 id={`${id}-h`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">{title}</h2>
        </div>
        {intro && <p className="text-[16px] ledger-muted max-w-md">{intro}</p>}
      </div>
      <div role="tablist" aria-label="By volume" className="mt-7 flex gap-1 overflow-x-auto [scrollbar-width:none] border-b ledger-border">
        {tabs.map((t) => {
          const on = t.key === active.key;
          return (
            <button key={t.key} role="tab" type="button" id={`${id}-t-${t.key}`} aria-selected={on} aria-controls={`${id}-p-${t.key}`} onClick={() => pick(t)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 md:px-5 py-3 -mb-px border-b-[3px] transition-colors ${on ? "bg-paper-card" : "border-transparent hover:bg-paper-card/60"}`}
              style={{ borderBottomColor: on ? t.ink : "transparent" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: t.ink }} aria-hidden="true" />
              <span className="ledger-eyebrow !text-[11px]" style={{ color: on ? t.ink : undefined }}>{t.label}</span>
              <span className="font-mono text-[11px] ledger-muted">{t.count}</span>
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div key={t.key} role="tabpanel" id={`${id}-p-${t.key}`} aria-labelledby={`${id}-t-${t.key}`} hidden={t.key !== active.key} className="pt-8">
          {t.content}
        </div>
      ))}
    </section>
  );
}
