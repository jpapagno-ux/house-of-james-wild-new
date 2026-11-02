// The Verdict: advisory and witty, in James Wild's voice, the seasoned
// traveller's call on a place (rewritten 26 Oct 2026 from James's field
// notes so it advises rather than reminisces). Only places James has
// stayed get a verdict; the card stays off everywhere else. Verdicts and
// sign-off lines approved by James on the Ledger Proofs sheet, 27 Oct 2026.
export type VerdictTag = "Worth your time?" | "Look closer" | "After dark" | "Unexpected beauty" | "Curiosity" | "The dead end";
export type Verdict = { where: string; when: string; text: string[]; tags: VerdictTag[]; signoff?: string; sketch?: "cheetah"; approvedOn?: string };
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

  // Founder verdicts, 2 Nov 2026. James: "Verdicts are all exceptional and I would go back, but most
  // important is as an advisor I'm confident to send clients." Each says all three, in his voice, using
  // only facts on the stay's own page. A stay card shows only while its house_status is a founder
  // status (stayVerdict below); the Indonesia records render once their status sync lands.
  "stay:wilderness-dumatau": { approvedOn: "2026-11-02", where: "Linyanti, Botswana", when: "May 2026", tags: ["Worth your time?", "After dark"], text: ["Exceptional, and built for the Linyanti: elephant corridors on one side, the waterways on the other, and wildlife walking through camp while you sit and watch.", "I would go back in a heartbeat, and I send clients here with total confidence. Boat the channels by day, drive by night."] },
  "stay:wilderness-mombo-luxury-camp": { approvedOn: "2026-11-02", where: "Okavango Delta, Botswana", when: "May 2026", tags: ["Worth your time?", "Look closer"], text: ["Mombo earns its name as the place of plenty: exceptional big game, expert guiding and real comfort deep in the Okavango.", "I would go back without a second thought. As an advisor, this is a camp I recommend with complete confidence, for photographers, families and anyone who wants the Delta at its best."] },
  "stay:kwando-lebala": { approvedOn: "2026-11-02", where: "Kwando, Botswana", when: "2012", tags: ["Look closer", "Worth your time?"], text: ["Lebala is exceptional floodplain country on the Kwando, in a reserve shared by only two camps, so the sightings feel like your own.", "I would go back for the space alone. I'm confident sending clients who want a remote, uncrowded safari with guides who know the marsh."] },
  "stay:kwando-lagoon": { approvedOn: "2026-11-02", where: "Kwando River, Botswana", when: "2012", tags: ["After dark", "Worth your time?"], text: ["Lagoon is exceptional predator country on the Kwando River, with night drives and a double-decker boat to work the waterways.", "I would go back, and when lions are the point of the trip, this is where I send clients with confidence."] },
  "stay:kwando-kwara": { approvedOn: "2026-11-02", where: "Okavango Delta, Botswana", when: "2012", tags: ["Worth your time?", "Look closer"], text: ["Kwara is the complete Delta in one camp: exceptional land and water safaris on a private concession, with permanent water close by.", "I would go back tomorrow. As an advisor I'm confident putting clients here year round, especially anyone keen on big cats and a mokoro in season."] },
  "stay:singita-faru-faru-lodge": { approvedOn: "2026-11-02", where: "Grumeti River, Tanzania", when: "2012 and 2018", tags: ["Worth your time?", "Unexpected beauty"], text: ["Faru Faru sits on the Grumeti River with a playful, contemporary design, and it is exceptional from the first game drive to the last swim.", "I have been back once already and would go again. I send families and couples here with complete confidence, above all for the migration."] },
  "stay:singita-sasakwa": { approvedOn: "2026-11-02", where: "Grumeti, Tanzania", when: "2018", tags: ["Unexpected beauty", "Worth your time?"], text: ["Sasakwa is a turn-of-the-century manor above the Serengeti plains, and the views alone make it exceptional.", "I would go back without hesitation. I'm confident sending clients who want a refined safari and a cottage with its own pool to come home to."] },
  "stay:beckon-longitude-131": { approvedOn: "2026-11-02", where: "Uluṟu, Australia", when: "2011", tags: ["Unexpected beauty", "Curiosity"], text: ["Longitude 131° is exceptional for the view from your pavilion: Uluṟu across the red dunes, changing colour through the day.", "I would go back to the Red Centre for it. I'm confident sending clients who want the Outback's culture and silence with real comfort."] },
  "stay:beckon-silky-oaks-lodge": { approvedOn: "2026-11-02", where: "Mossman River, Australia", when: "2011", tags: ["Unexpected beauty", "Worth your time?"], text: ["Silky Oaks puts you in a treehouse above the Mossman River, inside ancient rainforest, and it is exceptional at doing very little very well.", "I would go back. I'm confident sending couples who want the rainforest close and the spa closer."] },
  "stay:baymanhi-exuma": { approvedOn: "2026-11-02", where: "Stocking Island, Exuma", when: "2023", tags: ["Worth your time?", "Unexpected beauty"], text: ["A private island off Exuma, with bungalows on the beach and the lagoon, and water that is exceptional even by Bahamian standards.", "I would go back for the water alone. I'm confident sending clients who want their days on kayaks, sandbars and the Exuma Cays."] },
  "stay:tongabezi": { approvedOn: "2026-11-02", where: "The Zambezi, Zambia", when: "2012", tags: ["Worth your time?", "After dark"], text: ["Tongabezi is the Zambezi at its gentlest, twelve kilometres above Victoria Falls, and it is exceptional from the first boat ride to dinner on the island.", "I would go back tomorrow, and I send honeymooners and families here with complete confidence. Pair it with the Falls and a safari."] },
  "stay:governors-camp": { approvedOn: "2026-11-02", where: "Masai Mara, Kenya", when: "2012", tags: ["Look closer", "Worth your time?"], text: ["Governors' sits on its original Mara River site beside Musiara Marsh, home ground of the Marsh Pride, and it is still exceptional.", "I would go back for the game drives alone. I'm confident sending first-time safari travellers and families here, especially from July to October when the migration comes through."] },
  "stay:como-shambhala-estate": { approvedOn: "2026-11-02", where: "Ubud, Bali", when: "November 2024", tags: ["Worth your time?", "Curiosity"], text: ["COMO Shambhala is exceptional at what it sets out to do: real renewal above the Ayung River, with a wellness path built around you.", "I would go back for a proper reset. I'm confident sending clients who want wellness to be the point of the trip, not an add-on."] },
  "stay:como-uma-canggu": { approvedOn: "2026-11-02", where: "Canggu, Bali", when: "November 2024", tags: ["Worth your time?"], text: ["COMO Canggu brings COMO calm to Echo Beach, with surf lessons, a beach club and a lagoon pool, and it is exceptional on all three.", "I would go back, and I'm confident sending families here: Play by COMO takes ages 4 to 12, and beginners can learn to surf with Tropicsurf."] },
  "stay:tanah-gajah": { approvedOn: "2026-11-02", where: "Ubud, Bali", when: "November 2024", tags: ["Unexpected beauty", "Look closer"], text: ["Tanah Gajah was once a private estate and still feels like one: art everywhere, rice paddies as far as you can see, and exceptional calm near Ubud.", "I would go back in a heartbeat. I'm confident sending couples and families who want Bali's culture close and the crowds far away."] },
  "stay:kayumanis-jimbaran-private-estates": { approvedOn: "2026-11-02", where: "Jimbaran, Bali", when: "November 2024", tags: ["Worth your time?"], text: ["Twenty private pool villas under the palms, an easy walk from Jimbaran Beach, and the privacy is exceptional.", "I would go back for the space. I'm confident sending honeymooners and families who want a villa and a butler of their own."] },
  "stay:kayumanis-nusa-dua": { approvedOn: "2026-11-02", where: "Nusa Dua, Bali", when: "November 2024", tags: ["Worth your time?"], text: ["A walled garden villa with its own pool and a butler on call, a short walk from the white sand of Nusa Dua. Exceptional at quiet.", "I would go back. When the brief is privacy with resort service, I send honeymooners and families here with confidence."] },
  "stay:kayumanis-sanur": { approvedOn: "2026-11-02", where: "Sanur, Bali", when: "November 2024", tags: ["Worth your time?"], text: ["Kayumanis Sanur feels like a Balinese village of your own: a walled garden, a private pool and a butler around the clock, in Sanur's relaxed beach village.", "Exceptional and easy to love. I would go back, and I'm confident sending couples and families who want a private villa within reach of the beach."] },
  "stay:kayumanis-ubud": { approvedOn: "2026-11-02", where: "Ubud, Bali", when: "November 2024", tags: ["Unexpected beauty"], text: ["Private pool villas in the forest above the Ayung River, with the spa raised over the water. The seclusion is exceptional.", "I would go back for the stillness. I'm confident sending honeymooners and families who want privacy away from the busy side of Ubud."] },
  "stay:viceroy-bali": { approvedOn: "2026-11-02", where: "Ubud, Bali", when: "November 2024", tags: ["Worth your time?", "After dark"], text: ["Viceroy is a family-run retreat above an Ubud valley, every villa with its own heated pool and that view, and the service is exceptional.", "I would go back, and I'm confident sending honeymooners and couples here. Book dinner at Apéritif, and arrive by helicopter if you can."] },
  "stay:ungasan-clifftops": { approvedOn: "2026-11-02", where: "Uluwatu, Bali", when: "November 2024", tags: ["Worth your time?", "Unexpected beauty"], text: ["Spectacular service. One of my favorites, tucked away with amazing views of Uluwatu and a beach bar that just keeps you coming back.", "Exceptional, and I would go back tomorrow. As an advisor, I'm confident sending couples, families and groups who want a clifftop villa and long afternoons at Sundays Beach Club."] },
  "stay:soori-bali": { approvedOn: "2026-11-02", where: "South-west Bali", when: "November 2024", tags: ["Unexpected beauty", "Look closer"], text: ["Soori sits between rice terraces and a black sand beach on Bali's quieter south-west coast, and the architecture is exceptional.", "I would go back for the calm. I'm confident sending couples, families and groups who want design-led privacy and a sunrise at Tanah Lot."] },
  "stay:nihi": { approvedOn: "2026-11-02", where: "Sumba, Indonesia", when: "November 2024", tags: ["Worth your time?", "Curiosity"], text: ["NIHI is Sumba at its wildest: Occy's Left for the surfers, Sandalwood ponies in the sea and the Spa Safari up in the rice valleys. Exceptional, all of it.", "I would go back in a heartbeat. I'm confident sending surfers, riders, couples and families who are happy to travel a little further for it."] },
  "stay:capella-ubud": { approvedOn: "2026-11-02", where: "Keliki Valley, Bali", when: "November 2024", tags: ["Curiosity", "After dark"], text: ["A tented camp in the Keliki Valley forest, built without cutting a single tree, and exceptional from the tents to the open-fire dinners at Api Jiwa.", "I would go back tomorrow. I'm confident sending couples and families who want life under canvas with village culture and real comfort."] },
  "stay:wilderness-qorokwe": { approvedOn: "2026-11-02", where: "Okavango Delta, Botswana", when: "May 2026", tags: ["Worth your time?", "After dark"], text: ["Qorokwe is a solar-powered tented camp on a hippo lagoon, in a concession bordering Moremi, and it is exceptional from the infinity pool to the night drives.", "A founder favourite, and I would go back tomorrow. I'm confident sending families and anyone who wants land and water in one stay, with mokoro and boating when the water allows."] },
  // Ulum Moab: James confirmed 2025 (2 Nov 2026); the Ledger date was corrected the same day.
  "stay:ulum-moab": { approvedOn: "2026-11-02", where: "Moab, Utah", when: "2025", tags: ["Worth your time?", "After dark"], text: ["Ulum puts canvas suites in Utah's red rock country, close to Arches and Canyonlands, and it is exceptional for families.", "My favorite family stay, and I would go back. I'm confident sending families who want the national parks by day and the desert stars by night."] },
  "stay:bambu-indah": { approvedOn: "2026-11-02", where: "Sayan Ridge, Bali", when: "November 2024", tags: ["Curiosity", "Look closer"], text: ["Bambu Indah is a working family experiment on the Sayan Ridge: antique Javanese houses, rice from the paddy below and spring-fed pools by the Ayung River. Exceptional, and like nowhere else on the island.", "I would go back. I'm confident sending couples, families and wellness travellers who are happy with open-air rooms and a lot of nature."] },
};

// Written but NOT published (2 Nov 2026): nothing reads this map on a page. Each waits on one thing.
//   Casa Koko: its stay page is not live yet (site_status coming_soon).
export const DRAFT_VERDICTS: Record<string, Verdict & { hold: string }> = {
  "stay:casa-koko": { hold: "Stay page not live", where: "Punta Mita, Mexico", when: "September 2025", tags: ["Worth your time?"], text: ["One house, nine bedrooms, a staff of twenty and a surf break out front in Punta Mita. Exceptional for three generations under one roof.", "I would go back, and I'm confident sending families who want the whole house to themselves. Ask me about the whale shark swim."] },
};

export const verdictFor = (key: string) => VERDICTS[key];

// A founder's verdict on a stay shows only while the stay's house_status says he has been: stayed,
// returned or inspected. The words can be filed ahead of the status; they appear once it is set.
const FOUNDER_STATUSES = new Set(["founder_visited", "founder_returned", "founder_vetted"]);
export const stayVerdict = (slug: string, status?: string | null) => (status && FOUNDER_STATUSES.has(status) ? VERDICTS[`stay:${slug}`] : undefined);

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
  "stay:wilderness-dumatau": "Mind the elephants. JW",
  "stay:wilderness-mombo-luxury-camp": "The place of plenty. JW",
  "stay:kwando-lebala": "Watch the reeds. JW",
  "stay:kwando-lagoon": "Predator country. JW",
  "stay:kwando-kwara": "Land and water. JW",
  "stay:singita-faru-faru-lodge": "Worth the return. JW",
  "stay:singita-sasakwa": "A manor in the wild. JW",
  "stay:beckon-longitude-131": "Wake to Uluṟu. JW",
  "stay:beckon-silky-oaks-lodge": "Into the canopy. JW",
  "stay:baymanhi-exuma": "Leave it at the dock. JW",
  "stay:tongabezi": "The Zambezi, slowly. JW",
  "stay:governors-camp": "Where the Mara began. JW",
  "stay:como-shambhala-estate": "Come for the reset. JW",
  "stay:como-uma-canggu": "Surf first. JW",
  "stay:tanah-gajah": "Art among the rice. JW",
  "stay:kayumanis-jimbaran-private-estates": "Under the palms. JW",
  "stay:kayumanis-nusa-dua": "Quiet by the sea. JW",
  "stay:kayumanis-sanur": "A village of your own. JW",
  "stay:kayumanis-ubud": "Above the Ayung. JW",
  "stay:viceroy-bali": "Dinner at Apéritif. JW",
  "stay:ungasan-clifftops": "Keep coming back. JW",
  "stay:soori-bali": "Between rice and sea. JW",
  "stay:nihi": "The edge of wildness. JW",
  "stay:capella-ubud": "Under canvas. JW",
  "stay:bambu-indah": "Rice from the paddy. JW",
  "stay:wilderness-qorokwe": "Over the lagoon. JW",
  "stay:ulum-moab": "Red rock, all day. JW",
};
