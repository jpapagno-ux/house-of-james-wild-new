import type { ShipRecord } from "./types";
import { undash } from "./types";
import type { Offer } from "@/lib/content/offers/offers";

// "Think twice if" for a ship (James, 11 Nov 2026: "Think twice if items such as Wi-Fi not being included"). Read only
// from the record's own exclusions, FAQ answers and children policy, never written fresh; at most three. Where a live
// partner offer covers the gap (Windstar's all-inclusive: drinks, Wi-Fi, gratuities) the line says so and when it ends.
const first = (t: string) => (t.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? t).trim();

export function shipThinkTwice(s: ShipRecord, offers: Offer[] = []): string[] {
  const out: string[] = [];
  const ex = s.exclusions ?? [];
  const cover = (re: RegExp) => offers.find((o) => re.test(`${o.headline} ${o.conditions ?? ""}`));
  const until = (o: Offer) => new Date(`${o.travel.to}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const rules: [RegExp, string][] = [
    [/wi-?fi|internet/i, "You need Wi-Fi in the fare"],
    [/alcohol|drinks|wine|beverage/i, "You want drinks in the fare"],
    [/gratuit|tips/i, "You expect gratuities in the fare"],
  ];
  for (const [re, lead] of rules) {
    const x = ex.find((e) => re.test(e));
    if (!x) continue;
    const o = cover(re);
    out.push(`${lead}. Not included: ${undash(x).replace(/\.$/, "")}.${o ? ` Included free with ${o.partner === "windstar" ? "Windstar's" : "the"} offer if you book by ${until(o)}.` : ""}`);
  }
  const sail = (s.faqs ?? []).find(([q, a]) => /sailing ship|under sail|does she sail/i.test(q) && /^no\b/i.test(a.trim()));
  if (sail) out.push(`You want to be under sail: ${first(undash(sail[1]))}`);
  const age = (s.children ?? "").match(/(?:minimum age|aged?|over|from)\s+(\d{1,2})/i);
  if (age && Number(age[1]) >= 6) out.push(`You travel with children under ${age[1]}: ${first(undash(s.children!))}`);
  return out.slice(0, 3);
}
