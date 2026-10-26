// House notes: the postmark line (in James's hand) and the tap-to-read note
// for every stay, camp, residence and reserve without a personal verdict.
// Written in James Wild's voice, the seasoned traveller's shorthand, built
// from the record's own facts (best months, airport, rooms, the travel types
// it suits) so each one is about the place in front of you. Lines rotate by
// place so neighbouring pages never repeat. Pure and import-free.

export type NoteInput = { key: string; name: string; bestMonths?: string | null; airport?: string | null; suited: string[]; rooms?: string[] };
export type HouseNote = { script: string; line: string };

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const MONTH = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/i;
const firstMonth = (s?: string | null) => { const m = s?.match(MONTH); return m ? m[0][0].toUpperCase() + m[0].slice(1).toLowerCase() : null; };

const SCRIPT_BY_TYPE: Record<string, string[]> = {
  "Big Five safari": ["Early drive, late lunch.", "Trust the tracker.", "Mind the sundowners.", "Binoculars, not selfies."],
  "Food & wine lovers": ["Wine first, plans later.", "Book the long lunch."],
  "Beach & ocean": ["Swimsuit, then everything else.", "Barefoot is a dress code."],
  "Wellness seekers": ["Book the spa first.", "Slow is the point."],
  "Families & generations": ["Bring the grandparents.", "Kids first, then the view."],
  "Couples & honeymooners": ["Order the second bottle.", "Two chairs, one view."],
  "Private groups (exclusive use)": ["Take the whole place.", "Bring your people."],
  "Walkers & the active": ["Boots on before breakfast.", "Walk it. You'll see more."],
  "Photographers": ["Golden hour waits for no one.", "Pack the long lens."],
  "Conservation-minded": ["Leave it wilder.", "Ask the rangers. Listen."],
};
const SCRIPT_ANY = ["Three nights, not two.", "Pack less. Linger more.", "Leave the watch at home.", "Say yes to the detour.", "Unpack. Stay a while.", "The best seat is outside.", "Arrive curious. Leave late.", "Ask the staff, not the app."];
const lc = (t: string) => (t.startsWith("Big Five") ? t : t.charAt(0).toLowerCase() + t.slice(1));

export function houseNote(n: NoteInput): HouseNote {
  const h = hash(n.key);
  const month = firstMonth(n.bestMonths);
  const typed = n.suited.slice(0, 2).flatMap((t) => SCRIPT_BY_TYPE[t] ?? []);
  const pool = [...typed, ...(month ? [`Go in ${month}. Trust me.`] : []), ...SCRIPT_ANY];
  const script = `${pool[h % pool.length]} JW`;

  const room = (n.rooms ?? []).find((r) => r.length > 3 && r.length < 40);
  const lines = [
    ...(n.bestMonths ? [`Experienced travellers book ${n.name} for ${n.bestMonths.replace(/\s*\|.*$/, "")}. Everyone else finds out why the hard way.`] : []),
    ...(n.airport ? [`Fly into ${n.airport.replace(/\s*\(.*?\)\s*$/, "").slice(0, 60)} and let the house handle the last stretch. It's the part people end up talking about.`] : []),
    ...(n.suited.length ? [`Built for ${n.suited.slice(0, 2).map(lc).join(" and ")}. If that's you, you'll know within an hour of arriving.`] : []),
    ...(room ? [`Ask about the ${room}. Seasoned travellers ask what's best, not what's available.`] : []),
    `Three nights, not two. The second morning is when a place starts telling you its secrets.`,
  ];
  return { script, line: lines[(h >>> 3) % lines.length] };
}
