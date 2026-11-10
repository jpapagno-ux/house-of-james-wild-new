// "Think twice if" (James, 10 Nov 2026: "make sure that viewers understand who it's best suited for and not"): read
// only from what the brand itself states in the record (its FAQ answers, how to get there, airport directions), never
// invented. A rule fires only on a clear statement; anything less and the line is left out until James or an advisor
// files one by hand (THINK_TWICE below).

type Rec = { facts?: Record<string, string>; faqs?: { q: string; a: string }[]; airportDirections?: string | null; name: string };

/** Lines filed by hand by James or an advisor, by stay slug; they replace the derived ones. */
export const THINK_TWICE: Record<string, string[]> = {};

export function thinkTwice(slug: string, s: Rec): string[] {
  if (THINK_TWICE[slug]) return THINK_TWICE[slug];
  const faq = (s.faqs ?? []).map((f) => f.a).join(" ");
  const access = [s.facts?.how_to_get_there ?? "", s.airportDirections ?? ""].join(" ");
  const out: string[] = [];
  const age = faq.match(/\b(?:guests|children)?\s*(?:aged|ages)\s+(\d{1,2})\s+(?:and|or)\s+(?:over|above|older)\b/i) ?? faq.match(/\bminimum age (?:is |of )?(\d{1,2})\b/i);
  if (/\badults[- ]only\b/i.test(faq)) out.push("You're travelling with children: it is for adults only.");
  else if (age && Number(age[1]) >= 6) out.push(`You're travelling with children under ${age[1]}: the minimum age is ${age[1]}.`);
  if (/\b(light aircraft|charter flight|bush plane|fly-?in)\b/i.test(access)) out.push("Small planes aren't for you: the way in is by light aircraft.");
  const closed = faq.match(/\bclosed (?:from|between|each year from|annually from) ([^.;]{4,48})/i);
  if (closed) out.push(`Your dates fall in the closed season: it is closed from ${closed[1].trim()}.`);
  return out.slice(0, 3);
}
