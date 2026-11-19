// Founder lines (James, 11 Nov 2026: "quotes for me across some of these stays and cruises"). Short verdicts for the
// places James has slept on or sailed, drafted from what he has told the house and marked by him in the Voice Bank
// ("Verdicts, round 2", artifact JW8ybHnhwER5BgXmk5xet6, collection `picks`, ids vr-*). Only lines he marked "Use it"
// or rewrote "my way" are copied here; nothing is ever written for him. Keyed by page: "stay:<slug>" or "ship:<slug>".
// They fill the verdict column of the why / who / verdict band where there is no full Ledger verdict yet.

export type FounderLine = { line: string; where: string; when: string };

export const FOUNDER_LINES: Record<string, FounderLine> = {
  // filled from James's marks in the Voice Bank
  // Hermes and Amandira (19 Nov 2026): the notes James approved for each ship on 4 Nov 2026, word for word. They sat on
  // the ships' Exceptional Few entrance until the collection became stays only; they move here so his words stay on the page.
  "ship:hermes-galapagos": { line: "I send people to Hermes when they want the Galápagos without giving up a good night's sleep. Twenty guests, twenty crew, a butler on every deck. You'll be looked after before you know you needed it. Bringing the family or a group of friends? Take the whole ship.", where: "Galápagos", when: "The Ledger, 2026" },
  "ship:amandira": { line: "Amandira is for the family that wants Indonesia to themselves. Ten guests, fourteen crew, two chefs and a dive master, and the whole boat bends around your day. Put an Aman on land at either end and ask me which route.", where: "Indonesia", when: "The Ledger, 2026" },
};

export const founderLine = (key: string): FounderLine | undefined => FOUNDER_LINES[key];
