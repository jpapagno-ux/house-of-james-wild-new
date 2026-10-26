// The Verdict: James's own words on a place, from his field notes (dictated
// 26 Oct 2026, lightly edited for punctuation only). Only places James has
// stayed get a verdict; the card stays off everywhere else.
export type VerdictTag = "Worth your time?" | "Look closer" | "After dark" | "Unexpected beauty" | "Curiosity" | "The dead end";
export type Verdict = { where: string; when: string; text: string[]; tags: VerdictTag[]; signoff?: string };

// Sign-off lines James has approved. Drafts stay out until he says yes.
export const SIGNOFFS = ["Never look back. Time is on your side."];

export const VERDICTS: Record<string, Verdict> = {
  "stay:leeu-estates": { where: "Franschhoek", when: "May 2026", tags: ["Worth your time?"], text: ["Come as you are. They have mastered the art of service. Great view, great food.", "What a wonderful place to begin a journey."] },
  "stay:monwana-thornybush": { where: "Thornybush", when: "May 2026", tags: ["Worth your time?", "After dark"], text: ["Tucked away in the Thornybush, and we really enjoyed this place: the wildlife, the guides, the service, the ambiance.", "That large bar to come home to every night was worth it, worth every moment. One of our favourite stays in Africa."] },
  "camp:lion-sands/ivory-lodge": { where: "Lion Sands, on the Sabie River", when: "May 2026", tags: ["After dark", "Worth your time?"], text: ["Set along the river: the service, the food. We even had a great time celebrating with other couples who were on their honeymoon.", "We were not on our honeymoon, and we enjoyed a fine party with new friends made along the way. Great service."] },
  "stay:tengile-mala-mala-kirkmans-kamp": { where: "MalaMala, Sabi Sand", when: "May 2026", tags: ["Look closer"], text: ["You feel like you're in old Africa. The views, the people, the guides, the area.", "They are the masters of the heritage safari. We greatly enjoyed it."] },
  "stay:ellerman-house": { where: "Cape Town", when: "2026", tags: ["Unexpected beauty", "Worth your time?"], text: ["The epitome of absolutely beautiful views, and five-star, white-glove service. All the hosts, all the staff, very attentive.", "It was the highlight of our Cape Town visit."] },
  "stay:tswalu-reserve": { where: "The Kalahari", when: "2012", tags: ["Unexpected beauty", "Curiosity"], text: ["Wow. Silence and grandeur amongst this amazing, untouched landscape, sitting there for all to view. I was mesmerised. That was the moment I fell in love with Africa.", "And along the way I met Joffers. We have been friends ever since, and together we created Wild & Co Safaris, an alliance built on our love, respect and care for the wildlife and the nature Africa offers. An awe-inspiring place."] },
};
export const verdictFor = (key: string) => VERDICTS[key];
