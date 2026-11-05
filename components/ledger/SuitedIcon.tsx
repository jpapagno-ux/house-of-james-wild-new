import { Binoculars, Camera, Compass, Fish, Footprints, Gem, Heart, Landmark, Leaf, Plane, RotateCcw, Sailboat, Sparkles, User, Users, UsersRound, Waves, Wine, type LucideIcon } from "lucide-react";
import { SUITED, type SuitedKey } from "@/lib/suited";

const ICONS: Record<string, LucideIcon> = { Heart, Gem, Users, UsersRound, Compass, RotateCcw, Fish, Waves, Camera, Binoculars, Leaf, Wine, Footprints, Landmark, User, Sailboat, Plane, Sparkles };

/** One "who it suits" mark: a squared graphite cell holding the line icon (House Standard). */
export function SuitedMark({ k, size = 18, best = false }: { k: SuitedKey; size?: number; best?: boolean }) {
  const I = ICONS[SUITED[k].icon];
  return (
    <span className={`inline-flex items-center justify-center shrink-0 border ${best ? "border-[#8B2525] text-[#8B2525]" : "border-[#CFC8BF] text-[#2E2B28]"} bg-paper`} style={{ width: size + 16, height: size + 16 }} aria-hidden="true">
      <I width={size} height={size} strokeWidth={1.4} />
    </span>
  );
}

/** A row of who-it-suits chips: icon plus the trip's own words, best suited first and marked in crimson. */
export function SuitedRow({ items, best }: { items: { label: string; k: SuitedKey }[]; best?: string }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Who it suits">
      {items.map(({ label, k }) => (
        <li key={label} className="inline-flex items-center gap-2 pr-3 border ledger-border bg-paper" title={SUITED[k].hint}>
          <SuitedMark k={k} size={16} best={label === best} />
          <span className="text-[13.5px]">{label}{label === best && <span className="sr-only"> (best suited)</span>}</span>
        </li>
      ))}
    </ul>
  );
}
