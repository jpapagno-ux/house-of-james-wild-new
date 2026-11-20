// JWC-STYLE-01, the Modern Journal design pilot (James approved the wireframes, 20 Nov 2026). One flag for the whole
// pilot. OFF unless NEXT_PUBLIC_JOURNAL_STYLE is exactly "on": flag off = the site exactly as it is today.
// A page opts in by asking journalStyle(searchParams); nothing changes for a page that never asks.
//
// The preview switch: ?journal=1 turns the new layout on for one request, ?journal=0 turns it off (for a before and
// after of the same page). The switch works on Vercel previews and local builds only; in production it is ignored,
// so the live site changes only when James sets the flag by hand.
// Import-free so plain Node can test it; same pattern as lib/content/pathways/flag.ts and lib/atlas/flag.ts.
type Env = Record<string, string | undefined>;
type Params = URLSearchParams | Record<string, string | string[] | undefined> | null | undefined;

export function readJournalFlag(env: Env): boolean {
  return env.NEXT_PUBLIC_JOURNAL_STYLE === "on";
}

/** Whether ?journal= may be honoured: never on the production deployment. */
export function journalSwitchAllowed(env: Env): boolean {
  return env.VERCEL_ENV !== "production" && env.NEXT_PUBLIC_VERCEL_ENV !== "production";
}

/** The ?journal= value on this request: true (1), false (0) or null (not given, or not understood). */
export function readJournalSwitch(params: Params): boolean | null {
  if (!params) return null;
  const raw = params instanceof URLSearchParams ? params.get("journal") : params.journal;
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "1" || v === "on") return true;
  if (v === "0" || v === "off") return false;
  return null;
}

export function resolveJournalStyle(env: Env, params?: Params): boolean {
  const asked = journalSwitchAllowed(env) ? readJournalSwitch(params) : null;
  return asked ?? readJournalFlag(env);
}

const ENV: Env = {
  NEXT_PUBLIC_JOURNAL_STYLE: process.env.NEXT_PUBLIC_JOURNAL_STYLE,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
};

/** The flag alone (no request). */
export const JOURNAL_STYLE_ON = readJournalFlag(ENV);
export const JOURNAL_SWITCH_ALLOWED = journalSwitchAllowed(ENV);

/** What a page asks: pass the page's searchParams so the ?journal=1 preview switch is honoured. */
export function journalStyle(params?: Params): boolean {
  return resolveJournalStyle(ENV, params);
}
