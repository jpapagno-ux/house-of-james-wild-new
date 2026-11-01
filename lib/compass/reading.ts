// A loosely-typed reading (query string, JSON from Iggi, a form) → the adapter's
// Reading. Unknown values are dropped and reported in `ignored`, never guessed
// into a neighbour. Import-free beyond the adapter's vocabulary so plain Node
// can test it (Stage 4, D24).
// Import-free at runtime: only types come from the adapter.
import type { Reading, Party, Setting, Pace, Privacy, Season } from "./pathway-adapter";

const PARTIES: Party[] = ["couple", "family", "friends", "solo", "group"];
// Mirrors SETTING_TO_PATHWAY in the adapter (a test asserts it); listed here so this file has no runtime imports.
const SETTINGS: Setting[] = ["rainforest", "ocean", "mountain", "wildlife", "wellness", "hidden", "private", "heritage"];
const PACES: Pace[] = ["unhurried", "balanced", "full"];
const PRIVACIES: Privacy[] = ["any", "private_house", "small_camp"];
const SEASONS: Season[] = ["dry", "green", "any"];

const pick = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined => (typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : undefined);
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : typeof v === "string" ? v.split(",") : []).map((s) => s.trim().toLowerCase()).filter(Boolean);
const flag = (v: unknown) => v === true || v === "1" || v === "true" || v === "yes";

/** Validate loosely-typed input into the adapter's Reading; unknown values are dropped, never guessed. */
export function toReading(raw: Record<string, unknown>): { reading: Reading; ignored: string[] } {
  const ignored: string[] = [];
  const settings = list(raw.settings).filter((s) => { const ok = (SETTINGS as string[]).includes(s); if (!ok) ignored.push(`settings:${s}`); return ok; }) as Setting[];
  const party = pick(raw.party, PARTIES); if (raw.party && !party) ignored.push(`party:${raw.party}`);
  const pace = pick(raw.pace, PACES); if (raw.pace && !pace) ignored.push(`pace:${raw.pace}`);
  const privacy = pick(raw.privacy, PRIVACIES); if (raw.privacy && !privacy) ignored.push(`privacy:${raw.privacy}`);
  const season = pick(raw.season, SEASONS); if (raw.season && !season) ignored.push(`season:${raw.season}`);
  const reading: Reading = {
    ...(party ? { party } : {}), ...(settings.length ? { settings } : {}), ...(pace ? { pace } : {}), ...(privacy ? { privacy } : {}), ...(season ? { season } : {}),
    ...(list(raw.interests).length ? { interests: list(raw.interests).slice(0, 8) } : {}),
    ...(flag(raw.conservation) ? { conservation: true } : {}), ...(flag(raw.culture) ? { culture: true } : {}),
  };
  return { reading, ignored };
}

