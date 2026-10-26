// Travel types a place is best suited to, read from the record's own words
// (tagline, why, rooms, features, experiences) and its Ledger best-for tags.
// Nothing is guessed beyond the text: a type appears only when the record
// says something that earns it. Pure, import-free, testable.

const RULES: [string, RegExp][] = [
  ["Families & generations", /\bfamil|\bkids?\b|children|generation|interleading|multi-gen/i],
  ["Couples & honeymooners", /honeymoon|\bcouples?\b|romanc|romantic|adults[- ]only/i],
  ["Big Five safari", /big[- ]?(five|5)|leopard|\blions?\b|game drive|safari/i],
  ["Wellness seekers", /\bspa\b|wellness|yoga|hot spring|restor/i],
  ["Food & wine lovers", /\bwine|vineyard|culinar|gastronom|\bchef|cuisine|tasting/i],
  ["Private groups (exclusive use)", /exclusive[- ]use|private villa|residence|sleeps up to|whole (house|villa)|groups? of/i],
  ["Photographers", /photo ?lab|photograph|photo studio|creative lab|hide\b/i],
  ["Conservation-minded", /conservation|rewild|regenerat|eco[- ]|sustainab|anti-poaching/i],
  ["Walkers & the active", /walking|bush ?walk|\bhik|\bsurf|\bdiv(e|ing)|kayak|zipline|canopy|rafting/i],
  ["Beach & ocean", /\bbeach|ocean|\breef|snorkel|lagoon|coast/i],
];
const TAG: Record<string, string> = { family: "Families & generations", honeymoon: "Couples & honeymooners", couples: "Couples & honeymooners", wellness: "Wellness seekers", solo: "Solo travellers", adventure: "Walkers & the active", conservation: "Conservation-minded", food: "Food & wine lovers", wildlife_photography: "Photographers" };

export function suitedTo(text: string, tags: string[] = [], max = 4): string[] {
  const out: string[] = [];
  for (const t of tags) { const m = TAG[t.toLowerCase()]; if (m && !out.includes(m)) out.push(m); }
  const scored = RULES.map(([name, re]) => [name, (text.match(new RegExp(re.source, "gi")) ?? []).length] as const).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  for (const [name] of scored) if (!out.includes(name)) out.push(name);
  return out.slice(0, max);
}
