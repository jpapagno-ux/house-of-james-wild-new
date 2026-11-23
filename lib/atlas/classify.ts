import type { Category, ConditionKind, Interest } from "./match.ts";
import { CATEGORIES } from "./match.ts";

// Atlas categories (James, 20 Nov 2026, Step 02; Wilderness Lodges added 23 Nov 2026): twelve product categories read only from confirmed attributes: what
// the library files the record as, its volume assignments, its reserve, the ship registry's type and the vessel's kind.
// A rule either confirms a category or holds the record for editorial review; nothing is guessed in between.
//
// A record held for review has NO Atlas category in search (`category: null`): it is found by name, place, dates and
// interests, and by no category filter, until an editor files a decision in lib/atlas/category-decisions.json
// (keyed by Ledger ID or slug). Hotels and resorts that only *might* be a villa or residence keep their filed category.
// Pure and import-free so the tests load it with plain Node.

export type Verdict = { category: Category | null; proposed: Category; review: boolean; reason: string };
const ok = (category: Category, reason: string): Verdict => ({ category, proposed: category, review: false, reason });
const hold = (proposed: Category, reason: string): Verdict => ({ category: null, proposed, review: true, reason });

export type StayFacts = { filed: string | null; africa: boolean; volumes: string[]; primaryPathway: string | null; inReserve: boolean; isReserve: boolean };
export function classifyStay(s: StayFacts): Verdict {
  const cat = s.filed ?? "none", safaris = s.volumes.includes("safaris"), lodge = cat === "lodge" || cat === "camp";
  if (s.isReserve) return ok("private-safaris", "Filed as a reserve with its own reserve page");
  if (s.inReserve) return ok("safari-camps-and-lodges", "Camp or lodge inside a filed reserve");
  if (s.africa && safaris && lodge) return ok("safari-camps-and-lodges", "Africa, Safaris volume, filed as lodge or camp");
  // Never automatic: an African hotel is not a safari camp because of where it is (James, Step 02).
  if (s.africa && safaris) return hold("safari-camps-and-lodges", `On the Safaris volume but filed as ${cat}: confirm camp or lodge, or keep as ${cat}`);
  if (s.africa && lodge && s.primaryPathway === "PATH-04") return hold("safari-camps-and-lodges", "African lodge or camp on the wildlife pathway but not on the Safaris volume");
  if (cat === "private_house") return ok("private-residences", "Filed as a private house");
  if (cat === "villa") return ok("villas", "Filed as a villa");
  if (cat === "resort") return ok("resorts", "Filed as a resort");
  if (cat === "hotel" || cat === "guesthouse") return ok("hotels", `Filed as ${cat}`);
  // Wilderness Lodges (James, 23 Nov 2026): a lodge outside Africa where the place itself is the reason to go. Proposed
  // for every lodge or camp filed outside the safari rule, and confirmed stay by stay: a town lodge is a Hotel.
  if (lodge) return hold("wilderness-lodges", `Filed as ${cat} outside the safari rule: confirm Wilderness Lodge, or Hotel or Resort`);
  return hold("hotels", "No usable category on the record");
}

export function classifyReserveCamp(kind: "camp" | "residence" | "suite"): Verdict {
  return kind === "camp" ? ok("safari-camps-and-lodges", "Camp or lodge inside a filed reserve") : hold("private-residences", `A ${kind} inside a reserve: a Private Residence within a safari, confirm`);
}

const SMALL = new Set(["yacht", "motor-yacht", "phinisi", "catamaran", "trimaran", "bangka", "schooner"]);
export function classifyShip(types: string[], kind: string): Verdict {
  if (types.includes("river")) return ok("river-voyages", "Registry type river");
  if (types.includes("expedition") && kind === "expedition-ship") return ok("expedition-voyages", "Registry type expedition, expedition ship");
  if (types.includes("expedition") && SMALL.has(kind)) return hold("expedition-voyages", `Typed expedition but the vessel is a ${kind}: Expedition Voyage or Ocean Voyages and Yachts`);
  if (types.some((t) => t === "sailing" || t === "yacht")) return ok("ocean-voyages-and-yachts", `Registry type ${types.join(", ")}`);
  return hold("ocean-voyages-and-yachts", `Registry types ${types.join(", ") || "none"}`);
}

export function classifyRoute(kind: "overland" | "voyage", inSafariCountry: boolean): Verdict {
  if (kind === "voyage") return hold("ocean-voyages-and-yachts", "Voyage route file: takes its ship's category, confirm");
  if (inSafariCountry) return hold("private-safaris", "Overland route in a safari country: Private Safari, Land Journey, or both");
  return ok("land-journeys", "Designed land route between filed stays");
}

/** An editor's filed decision wins over every rule. An unknown category in the file is ignored, never guessed. */
export function decided(v: Verdict, keys: (string | null | undefined)[], decisions: Record<string, string>): Verdict {
  for (const k of keys) {
    const d = k ? decisions[k] : undefined;
    if (d && (CATEGORIES as readonly string[]).includes(d)) return { category: d as Category, proposed: d as Category, review: false, reason: "Editorial decision on file" };
  }
  return v;
}

// ---- interests -----------------------------------------------------------------------------------------------------
// Read from approved fields only (Step 02, section 2). A record with no data for an interest does not carry it; that
// never makes the record unsuitable, it only means the interest filter cannot find it.

const TAG = (t: string) => t.toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "");
const FAMILY = new Set(["family", "families", "group_exclusive_use"]), ROMANCE = new Set(["honeymoon", "honeymooners", "couples"]);
export function stayInterests(s: { pathways: string[]; tags: string[]; setting: string | null; filed: string | null }): Interest[] {
  const p = new Set(s.pathways), t = new Set(s.tags.map(TAG)), out = new Set<Interest>();
  if (p.has("PATH-04") || t.has("wildlife_photography") || t.has("conservation") || t.has("first_safari")) out.add("wildlife");
  if (p.has("PATH-05") || t.has("wellness")) out.add("wellness");
  if (p.has("PATH-02")) out.add("water");
  if ((p.has("PATH-02") && /island/i.test(s.setting ?? "")) || /private[_ ]island/i.test(s.filed ?? "")) out.add("islands");
  if (p.has("PATH-08") || t.has("culture") || t.has("food") || t.has("wine") || t.has("food_and_wine")) out.add("culture");
  if (t.has("adventure") || p.has("PATH-03") || p.has("PATH-06") || p.has("PATH-09")) out.add("adventure");
  if ([...t].some((x) => ROMANCE.has(x))) out.add("romance");
  if ([...t].some((x) => FAMILY.has(x)) || p.has("PATH-07")) out.add("family");
  return [...out];
}

const ISLAND_WATERS = new Set(["galapagos", "indonesia", "tahiti", "fiji", "seychelles", "caribbean", "bahamas", "philippines"]);
export function shipInterests(s: { types: string[]; waters: string[]; activities: string[]; couples: boolean; publishesChildPolicy: boolean }): Interest[] {
  const a = new Set(s.activities), out = new Set<Interest>(["water"]);
  if (a.has("wildlife")) out.add("wildlife");
  if (a.has("slow")) out.add("wellness");
  if (s.waters.some((w) => ISLAND_WATERS.has(w))) out.add("islands");
  if (a.has("culture") || s.types.includes("river")) out.add("culture");
  if (s.types.includes("expedition") || a.has("hiking") || a.has("kayaking")) out.add("adventure");
  if (s.couples) out.add("romance");
  if (s.publishesChildPolicy) out.add("family");
  return [...out];
}

// ---- offers ----------------------------------------------------------------------------------------------------------
// An offer's conditions are filed as free text. The Atlas never prints or interprets the text itself: it reads only
// what KIND of condition it is, so a card can say why an offer "may apply", and the shortest stay it names.

export function conditionKind(text: string | null | undefined): ConditionKind | null {
  const t = (text ?? "").toLowerCase().trim();
  if (!t) return null;
  if (/honeymoon|anniversar|birthday|babymoon|celebrat|newlywed|wedding|marriage|spouse/.test(t)) return "occasion";
  if (/stayed .{0,40}before|returning guest|repeat guest|past guest/.test(t)) return "returning";
  if (/no single supplement|single supplement (is )?waived|^single cabins/.test(t)) return "single";
  // "Not combinable with other offers" is not a combination: only wording that asks for two places or sailings is.
  if (/\bcombin(e|ing) (\d|[a-z']+ (house|camp|lodge))|any combination of|book(ed)? .{0,60}\btogether\b|two or more|at least (two|2|three|3) [a-z& ]{0,30}propert|nights? (or more )?across |across \d+ to \d+ |across two |with at least \d+ nights? at another|as an extension to/.test(t)) return "combination";
  if (/^children |youngest child|children under \d|kids (stay|go|sail) free|family (tent|package)/.test(t)) return "family";
  return "other";
}

const NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
/** "Minimum stay 2 nights", "Four consecutive nights required", "a five night minimum": the nights asked, else null. */
export function conditionMinStay(text: string | null | undefined): number | null {
  const t = (text ?? "").toLowerCase();
  const m = t.match(/minimum (?:stay )?(?:of )?(\d{1,2}|[a-z]+)[- ]nights?/) ?? t.match(/\b(\d{1,2}|[a-z]+)[- ](?:consecutive )?nights? (?:required|minimum)/) ?? t.match(/\b(\d{1,2}|[a-z]+) consecutive nights/);
  if (!m) return null;
  const n = /^\d+$/.test(m[1]) ? Number(m[1]) : NUM[m[1]];
  return n && n > 0 && n < 60 ? n : null;
}
