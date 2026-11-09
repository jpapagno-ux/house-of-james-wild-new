import type { CSSProperties } from "react";

// The voyage icon set (James, 9 Nov 2026: "a comprehensive icon legend ... like The Exceptional Few now uses"): plain
// line glyphs drawn the way The Exceptional Few draws its signals (EFSignals.tsx), 24px box, 1.3 stroke, no fill,
// in the record's ink. One set for every cruise page: the "At a glance" signals, the marks on the day log, the
// "Either side of the voyage" band and the legend that explains them. A glyph never carries a score or a colour of
// its own; its meaning is always printed beside it or in the legend.

export type GlyphKey =
  | "arrive" | "sail" | "stay-on" | "add-night" | "package"
  | "embark" | "at-sea" | "overnight" | "marina" | "event"
  | "founder" | "guests" | "suites" | "dining"
  | "snorkelling" | "diving" | "wildlife" | "kayaking" | "hiking" | "culture" | "slow" | "sailing" | "charter" | "flight";

export const GLYPH: Record<GlyphKey, string> = {
  arrive: "M2.5 20h19 M4 14.6l3.2.9 2.9-5.7 1.9.5-.9 6 5.4 1.5c1 .3 1.2 1.6.1 1.6L4.6 16.6z",
  flight: "M3 13.5l7-2 3.2-7.6 1.8.4-1 7.2 6-1.4 1 1.4-7 3.1-.9 4.4-1.6-.1-.2-3.7-3.1.9z",
  sail: "M12 3v13 M12 4.5L19 15h-7 M10.8 7L6 15h4.8 M3 17.5h18l-2.2 3H5.2z",
  "stay-on": "M13 21c0-5 .6-8.6 1.4-11.6 M14.4 9.4c-1.8-2.6-5.4-3-7.6-1.2 M14.4 9.4c2-2.4 5.6-2.4 7.4-.4 M14.4 9.4c-.6-3-3.4-4.8-6.2-4.4 M14.4 9.4c1-2.9 3.9-4.4 6.6-3.8 M7 21h12",
  "add-night": "M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z M17 3.5v3 M15.5 5h3",
  package: "M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z M10 7v10",
  embark: "M4 20h16 M8 20V9l4-4 4 4v11 M12 5v-2 M10.5 14h3",
  "at-sea": "M2.5 12.5h19 M3.5 16.5c2.4 0 2.4-1.8 4.7-1.8s2.4 1.8 4.7 1.8 2.4-1.8 4.7-1.8 2.4 1.8 2.9 1.8 M8.5 12.5a3.5 3.5 0 0 1 7 0",
  overnight: "M12 5.2a1.6 1.6 0 1 0 0-.1 M12 6.8V20 M7.5 11h9 M5 15.5c1.2 2.8 4 4.5 7 4.5s5.8-1.7 7-4.5 M19.5 4.5a3 3 0 1 1-3 3 2.3 2.3 0 0 0 3-3z",
  marina: "M3 16c2 0 2-1.5 4.5-1.5S10 16 12 16s2-1.5 4.5-1.5S19 16 21 16 M3 20c2 0 2-1.5 4.5-1.5S10 20 12 20s2-1.5 4.5-1.5S19 20 21 20 M9 3.5V13 M15 3.5V13 M9 6.5h6 M9 9.8h6",
  event: "M12 21c-3.8 0-6-2.8-6-6 0-3.8 3.6-5.6 3.6-9.6 2 1.6 3.2 3.6 3.2 5.8.9-.8 1.4-1.8 1.4-2.9 2.2 1.8 3.8 4.3 3.8 6.7 0 3.2-2.2 6-6 6z",
  founder: "M12 3l2.1 1.6 2.6-.2.9 2.4 2.3 1.3-.6 2.6.6 2.6-2.3 1.3-.9 2.4-2.6-.2L12 19l-2.1-1.6-2.6.2-.9-2.4-2.3-1.3.6-2.6-.6-2.6 2.3-1.3.9-2.4 2.6.2z M9 11.3l2 2 4-4",
  guests: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3.5 20c0-3.6 2.4-6 5.5-6s5.5 2.4 5.5 6 M16 11a2.6 2.6 0 1 0 0-5.2 M17 14c2.3.5 3.6 2.6 3.6 6",
  suites: "M3 18.5V11h18v7.5 M3 15h18 M5.5 11V7.5h5.5V11 M3 18.5V21 M21 18.5V21",
  dining: "M7 3v8 M5 3v4.8a2 2 0 0 0 4 0V3 M7 11v10 M16.5 3c-2 1.2-2.6 4.2-2.6 7.4h2.6V21",
  snorkelling: "M3.5 9h17v5a2 2 0 0 1-2 2h-3.2l-1.6-2.2h-3.4L8.7 16H5.5a2 2 0 0 1-2-2z M18.5 9V3.5",
  diving: "M8 17.5a3 3 0 1 0 0 .1 M14.5 10.5a2.2 2.2 0 1 0 0 .1 M18.5 4.8a1.3 1.3 0 1 0 0 .1",
  wildlife: "M3 18.5c4.4 0 8-1.6 10-6.4 1.1-2.8 3-5.6 7-6.6-1.1 4.2-.8 9 1 13 M2 18.5h20",
  kayaking: "M3 14.5c4.2 2.2 13.8 2.2 18 0 M5 7.5l14 11 M3.6 6.7l1.6-1.1 1 1.6-1.6 1.1z M18.8 17.2l1.6 1.1-1 1.6-1.6-1.1z",
  hiking: "M3 19l6-10 4 6 2-3 6 7z M9 9V4.5",
  culture: "M3.5 20h17 M6 20v-9 M18 20v-9 M3.5 11L12 4l8.5 7 M10 20v-5h4v5",
  slow: "M12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  sailing: "M12 3v13 M12 4.5L19 15h-7 M10.8 7L6 15h4.8 M3 17.5h18l-2.2 3H5.2z",
  charter: "M8 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M11.5 12H21 M18 12v3 M15 12v2",
};

/** What each glyph means, word for word as the legend prints it. */
export const GLYPH_MEANING: Record<GlyphKey, [string, string]> = {
  arrive: ["Arrive", "A night or two in the gateway before you board"],
  flight: ["Flight", "A scheduled or charter flight on the journey"],
  sail: ["Sail", "The voyage itself, as the operator publishes it"],
  "stay-on": ["Stay on", "A stay from the house's own collection after you leave the ship"],
  "add-night": ["Add a night", "One extra night worth selling, before, after or mid-journey"],
  package: ["Operator package", "The cruise line's own land and cruise package, priced by them"],
  embark: ["Embark or disembark", "Boarding or leaving the ship"],
  "at-sea": ["At sea", "A day under way, no port"],
  overnight: ["Overnight in port", "The ship stays the night, so the evening is ashore"],
  marina: ["Marina open", "Swim, kayak or paddleboard from the stern at anchor"],
  event: ["Signature event", "A shore evening the operator hosts for its guests only"],
  founder: ["Founder sailed or stayed", "James has been aboard or stayed himself"],
  guests: ["Guests", "How many guests she carries"],
  suites: ["All suites", "Every cabin is a suite"],
  dining: ["Dining included", "Meals aboard are in the fare"],
  snorkelling: ["Snorkelling", "Snorkelling on the voyage, as the operator describes it"],
  diving: ["Diving", "Scuba diving on the voyage"],
  wildlife: ["Wildlife", "Wildlife sets the itinerary"],
  kayaking: ["Kayaking", "Kayaks aboard"],
  hiking: ["Hiking", "Walks and hikes ashore"],
  culture: ["Culture", "Villages, sacred sites and local hosts ashore"],
  slow: ["Slow days", "Unhurried days, spa or wellness aboard"],
  sailing: ["Under sail", "A sailing ship: masts and sails"],
  charter: ["Whole ship", "She can be chartered by one party"],
};

export function Glyph({ k, size = 22, className = "", style, title }: { k: GlyphKey; size?: number; className?: string; style?: CSSProperties; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden={title ? undefined : true} role={title ? "img" : undefined} className={`shrink-0 ${className}`} style={style}>
      {title && <title>{title}</title>}
      <path d={GLYPH[k]} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** The marks on a day of the log, read from the day's own words (never added by hand). */
export function dayMarks(d: { title: string; place: string; summary: string }): GlyphKey[] {
  const t = `${d.title} ${d.summary}`;
  const out: GlyphKey[] = [];
  if (/\b(embark|disembark|board from)\b/i.test(t)) out.push("embark");
  if (/^at sea$/i.test(d.place.trim()) || /\bday at sea\b/i.test(t)) out.push("at-sea");
  if (/\bovernight\b/i.test(t)) out.push("overnight");
  if (/\bMarina\b/.test(t)) out.push("marina");
  if (/Feast|Destination Discovery|Beach Party/i.test(t)) out.push("event");
  if (/\b(fly|flight|flies)\b/i.test(t)) out.push("flight");
  return out;
}

/** The legend: every glyph the page uses, with what it means. */
export function IconLegend({ keys, className = "", title = "How to read the icons", open = true }: { keys: GlyphKey[]; className?: string; title?: string; open?: boolean }) {
  const list = [...new Set(keys)];
  if (!list.length) return null;
  return (
    <details open={open} className={`jw-legend group border-t ledger-rule pt-4 ${className}`}>
      <summary className="cursor-pointer list-none inline-flex items-center gap-2 min-h-[44px] ledger-eyebrow">
        <span aria-hidden="true" className="inline-block w-4 text-center transition-transform group-open:rotate-45">+</span>{title}
      </summary>
      <ul className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((k) => (
          <li key={k} className="flex items-start gap-3">
            <Glyph k={k} size={20} className="mt-0.5 jw-glyph" />
            <p className="text-[14px] leading-snug"><span className="font-medium">{GLYPH_MEANING[k][0]}</span><span className="ledger-muted"> · {GLYPH_MEANING[k][1]}</span></p>
          </li>
        ))}
      </ul>
    </details>
  );
}
