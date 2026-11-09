import type { ShipRecord } from "@/lib/content/ships/types";
import type { Activity } from "@/lib/content/ships/registry";
import { Glyph, IconLegend, dayMarks, type GlyphKey } from "./VoyageGlyphs";
import { eitherSideFor } from "@/lib/content/ships/either-side";

// "At a glance" on a cruise page, as The Exceptional Few lays out its signals (EFSignals.tsx): a few line glyphs, each
// with its one plain line, read only from the record (the operator's own facts, the house's traits and James's proof
// line). Never a score: no stars, no number of merit. Under it, the legend for every icon the page uses.

type Signal = { k: GlyphKey; label: string; line: string };

const ACTIVITY_GLYPH: Record<Activity, GlyphKey> = { wildlife: "wildlife", diving: "diving", snorkelling: "snorkelling", kayaking: "kayaking", hiking: "hiking", culture: "culture", slow: "slow", sailing: "sailing" };
const ACTIVITY_LINE: Record<Activity, string> = {
  wildlife: "Wildlife sets the days", diving: "Diving on the voyage", snorkelling: "Snorkelling from the ship or the shore", kayaking: "Kayaks aboard",
  hiking: "Walks and hikes ashore", culture: "Villages and sacred sites ashore", slow: "Unhurried days aboard", sailing: "Masts and sails",
};

export function voyageSignals(s: ShipRecord, activities: Activity[] = [], charter = false): Signal[] {
  const out: Signal[] = [];
  const proof = s.proofLine?.split(" · ") ?? [];
  if (/^(Founder sailed|Field verified)$/i.test(proof[0] ?? "")) out.push({ k: "founder", label: proof[0], line: proof.slice(-1)[0] ?? "" });
  const guests = s.facts.find(([k]) => /^guests$/i.test(k))?.[1];
  if (guests) out.push({ k: "guests", label: `${guests} guests`, line: `Guests aboard, as ${s.operator} publishes` });
  if (s.cabins.length > 1 && s.cabins.every((c) => /suite/i.test(c.type))) out.push({ k: "suites", label: "All suites", line: "Every cabin is a suite" });
  const inc = s.inclusions.join(" ");
  if (/\bMarina\b/.test(inc)) out.push({ k: "marina", label: "Marina at anchor", line: "Swim, kayak and paddleboard from the stern" });
  if (/Destination Discovery|Feast|Beach Party/i.test(inc)) out.push({ k: "event", label: "Signature evening", line: "A shore event for the ship's guests only" });
  if (/dining|meals|full board/i.test(inc)) out.push({ k: "dining", label: "Dining included", line: "Meals aboard are in the fare" });
  for (const a of activities) if (!(a === "sailing" && out.some((x) => x.k === "sailing"))) out.push({ k: ACTIVITY_GLYPH[a], label: a === "slow" ? "Slow days" : a === "sailing" ? "Under sail" : a[0].toUpperCase() + a.slice(1), line: ACTIVITY_LINE[a] });
  if (charter) out.push({ k: "charter", label: "Whole ship", line: "She can be chartered by one party" });
  return out.slice(0, 9);
}

/** Every glyph a ship page shows: its signals, the marks on its day log and the band either side of the voyage. */
export function pageGlyphs(s: ShipRecord, signals: Signal[], waters: string): GlyphKey[] {
  const days = s.itineraries.flatMap((i) => i.days.flatMap(dayMarks));
  const band: GlyphKey[] = eitherSideFor(s.slug, waters) ? ["arrive", "sail", "stay-on", "add-night", "package"] : [];
  return [...signals.map((x) => x.k), ...days, ...band];
}

export default function VoyageSignals({ ship, activities = [], charter = false, waters }: { ship: ShipRecord; activities?: Activity[]; charter?: boolean; waters: string }) {
  const sig = voyageSignals(ship, activities, charter);
  if (sig.length < 3) return null;
  return (
    <section id="at-a-glance" aria-labelledby="at-a-glance-h" className="mt-12 md:mt-16">
      <h2 id="at-a-glance-h" className="ledger-eyebrow" data-sechead>At a glance</h2>
      <ul className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-5">
        {sig.map((x) => (
          <li key={x.k} className="flex items-start gap-3">
            <Glyph k={x.k} size={24} className="mt-0.5 jw-glyph" />
            <div className="min-w-0">
              <p className="text-[15px] leading-snug">{x.label}</p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed ledger-muted">{x.line}</p>
            </div>
          </li>
        ))}
      </ul>
      <IconLegend keys={pageGlyphs(ship, sig, waters)} className="mt-8" />
    </section>
  );
}
