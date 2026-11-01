import { SIGNAL_LABEL, type ExceptionalFew } from "@/lib/content/exceptional-few";

// Exceptional signals: the few words that say why a place is hard to replicate
// (Place, Privacy, Design, Access, Humanity, Rarity). Only the signals the house
// selected render, each with its one-line reason. Never a score: no stars, no
// number, no order of merit. The icons are plain line glyphs, one per signal.
const GLYPH: Record<string, string> = {
  place: "M3 17 L8 9 L12 14 L15 11 L21 17 Z",
  privacy: "M5 5 h14 v14 h-14 z M9 9 h6 v6 h-6 z",
  design: "M4 6 h16 M4 12 h16 M4 18 h16",
  access: "M4 18 L12 6 L20 18 M8 14 h8",
  humanity: "M12 12 a3 3 0 1 0 0 -6 a3 3 0 1 0 0 6 M6 20 c0 -4 3 -6 6 -6 s6 2 6 6",
  rarity: "M12 3 l2.4 6 6.6 .6 -5 4.4 1.6 6.6 -5.6 -3.4 -5.6 3.4 1.6 -6.6 -5 -4.4 6.6 -.6z",
};

export default function EFSignals({ ef, compact = false, id = "signals" }: { ef: ExceptionalFew; compact?: boolean; id?: string }) {
  if (!ef.signals.length) return null;
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={compact ? "" : "mt-10"}>
      <h3 id={`${id}-h`} className="ledger-eyebrow ef-eyebrow">At a glance</h3>
      <ul className={`mt-3 ${compact ? "grid grid-cols-2 gap-x-6 gap-y-3" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5"}`}>
        {ef.signals.map((s) => (
          <li key={s.key} className="flex items-start gap-3">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="shrink-0 mt-0.5 text-ef-earth"><path d={GLYPH[s.key]} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" /></svg>
            <div>
              <p className="text-[15px] leading-snug">{SIGNAL_LABEL[s.key]}</p>
              {!compact && s.line && <p className="mt-0.5 text-[13.5px] leading-relaxed ef-caption">{s.line}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
