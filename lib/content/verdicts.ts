// The Verdict: advisory and witty, in James Wild's voice, the seasoned
// traveller's call on a place (rewritten 26 Oct 2026 from James's field
// notes so it advises rather than reminisces). Only places James has
// stayed get a verdict; the card stays off everywhere else.
export type VerdictTag = "Worth your time?" | "Look closer" | "After dark" | "Unexpected beauty" | "Curiosity" | "The dead end";
export type Verdict = { where: string; when: string; text: string[]; tags: VerdictTag[]; signoff?: string };

// Sign-off lines James has approved. Drafts stay out until he says yes.
export const SIGNOFFS = ["Never look back. Time is on your side."];

export const VERDICTS: Record<string, Verdict> = {
  "stay:leeu-estates": { where: "Franschhoek", when: "May 2026", tags: ["Worth your time?"], text: ["Come as you are. Leeu has turned service into an art form, and the view does the rest of the talking.", "The food is the real reason to linger. Begin a Cape journey here; just know everything after it will be measured against breakfast."] },
  "stay:monwana-thornybush": { where: "Thornybush", when: "May 2026", tags: ["Worth your time?", "After dark"], text: ["Tucked away in the Thornybush, Monwana gets the safari trinity right: the wildlife, the guides, the service.", "Then there's the bar, the long kind you come home to after the evening drive. Plan on using it. One for anyone's shortlist of Africa's best."] },
  "camp:lion-sands/ivory-lodge": { where: "Lion Sands, Sabie River", when: "May 2026", tags: ["After dark", "Worth your time?"], text: ["Book it for the river; stay for the service and the kitchen.", "Half the guests seem to be on honeymoon. You needn't be. The sundowners taste just as good when you've been married a while."] },
  "stay:tengile-mala-mala-kirkmans-kamp": { where: "MalaMala, Sabi Sand", when: "May 2026", tags: ["Look closer"], text: ["If you want old Africa rather than a polished impression of it, this is the address.", "Heritage safari, done by people who mean it: the views, the guides, the whole unhurried rhythm. Pack the khaki; you'll feel underdressed without it."] },
  "stay:ellerman-house": { where: "Cape Town", when: "2026", tags: ["Unexpected beauty", "Worth your time?"], text: ["A view that makes the rest of Cape Town look like the warm-up act, and white-glove service from a staff that notices before you ask.", "Make it your base. Everything else in the city starts to feel like a day trip."] },
  "stay:tswalu-reserve": { where: "The Kalahari", when: "2012", tags: ["Unexpected beauty", "Curiosity"], text: ["Go for the silence. Tswalu is the Kalahari untouched, laid out for anyone patient enough to sit and look.", "Fair warning: people fall in love with Africa here and never quite recover. Ask James how he knows."] },
};

export const verdictFor = (key: string) => VERDICTS[key];
