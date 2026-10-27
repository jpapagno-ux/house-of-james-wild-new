// The Verdict: advisory and witty, in James Wild's voice, the seasoned
// traveller's call on a place (rewritten 26 Oct 2026 from James's field
// notes so it advises rather than reminisces). Only places James has
// stayed get a verdict; the card stays off everywhere else. Verdicts and
// sign-off lines approved by James on the Ledger Proofs sheet, 27 Oct 2026.
export type VerdictTag = "Worth your time?" | "Look closer" | "After dark" | "Unexpected beauty" | "Curiosity" | "The dead end";
export type Verdict = { where: string; when: string; text: string[]; tags: VerdictTag[]; signoff?: string; sketch?: "cheetah" };
// Pencil sketches for the notes, drawn by a friend of James and used with
// his permission (26 Oct 2026).
export const SKETCHES = { cheetah: { src: "/brand/sketches/cheetah-pencil.png", w: 620, h: 984 } } as const;

// Sign-off lines, rotated so no two notes close the same way. The first is
// James's own; the rest are house drafts in his voice (26 Oct 2026).
export const SIGNOFFS = [
  "Never look back. Time is on your side.",
  "Leave a day unplanned. It's usually the one you'll talk about.",
  "Pack less. Stay longer.",
  "Go someplace new, then go around the corner.",
  "If the guide says wait, wait.",
  "The best seat in the house is usually outside.",
  "Book the trip. Lose the schedule.",
];
/** A different sign-off for each note, stable for each place. */
export function signoffFor(key: string) {
  const i = Object.keys(VERDICTS).indexOf(key);
  return SIGNOFFS[(i < 0 ? [...key].reduce((a, c) => a + c.charCodeAt(0), 0) : i) % SIGNOFFS.length];
}

export const VERDICTS: Record<string, Verdict> = {
  "stay:leeu-estates": { where: "Franschhoek", when: "May 2026", tags: ["Worth your time?"], text: ["Come as you are. Leeu has turned service into an art form, and the view does the rest of the talking.", "The food is the real reason to linger. Begin a Cape journey here; just know everything after it will be measured against breakfast."] },
  "stay:monwana-thornybush": { sketch: "cheetah", where: "Thornybush", when: "May 2026", tags: ["Worth your time?", "After dark"], text: ["Tucked away in the Thornybush, Monwana gets the safari trinity right: the wildlife, the guides, the service.", "Then there's the bar, the long kind you come home to after the evening drive. Plan on using it. One for anyone's shortlist of Africa's best."] },
  "camp:lion-sands/ivory-lodge": { sketch: "cheetah", where: "Lion Sands, Sabie River", when: "May 2026", tags: ["After dark", "Worth your time?"], text: ["Book it for the river; stay for the service and the kitchen.", "Half the guests seem to be on honeymoon. You needn't be. The sundowners taste just as good when you've been married a while."] },
  "stay:tengile-mala-mala-kirkmans-kamp": { sketch: "cheetah", where: "MalaMala, Sabi Sand", when: "May 2026", tags: ["Look closer"], text: ["If you want old Africa rather than a polished impression of it, this is the address.", "Heritage safari, done by people who mean it: the views, the guides, the whole unhurried rhythm. Pack the khaki; you'll feel underdressed without it."] },
  "stay:ellerman-house": { where: "Cape Town", when: "2026", tags: ["Unexpected beauty", "Worth your time?"], text: ["A view that makes the rest of Cape Town look like the warm-up act, and white-glove service from a staff that notices before you ask.", "Make it your base. Everything else in the city starts to feel like a day trip."] },
  "stay:tswalu-reserve": { sketch: "cheetah", where: "The Kalahari", when: "2012", tags: ["Unexpected beauty", "Curiosity"], text: ["Go for the silence. Tswalu is the Kalahari untouched, laid out for anyone patient enough to sit and look.", "Fair warning: people fall in love with Africa here and never quite recover. Ask James how he knows."] },
};

export const verdictFor = (key: string) => VERDICTS[key];

// The hero mark style per page while James compares: tag, stamp or note.
export const HERO_MARK: Record<string, "post" | "tag" | "stamp" | "note"> = {};
// The line in James's hand under the postmark, one per place.
export const SCRIPT: Record<string, string> = {
  "stay:leeu-estates": "Come as you are. JW",
  "stay:monwana-thornybush": "Mind the bar. JW",
  "camp:lion-sands/ivory-lodge": "For the river. JW",
  "stay:tengile-mala-mala-kirkmans-kamp": "Old Africa. JW",
  "stay:ellerman-house": "Make it your base. JW",
  "stay:tswalu-reserve": "Go for the silence. JW",
};
