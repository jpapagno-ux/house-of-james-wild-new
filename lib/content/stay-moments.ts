// Photographs (and, where James has signed off a line, a note) for the
// "what sets it apart" and "how to fill the days" rows on a stay page.
// Matched by the row's wording; rows with no match borrow from the stay's own photographs.

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
// e_upscale only for originals under 4.2 megapixels (the wide panoramas are big enough already)
const pic = (id: string, up = true) => `${CLD}/${up ? "e_upscale/" : ""}c_fill,g_auto,ar_16:10,w_1600/q_auto:good/f_jpg/${id}`;
const MON = "wildco/south-africa/monwana-thornybush";
const KK = "wildco/south-africa/sabi-sand/kirkmans-kamp";
const LS = "gatherings";
const WF = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";
const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474";
const LEEU = "wildco/south-africa/leeu-estates-franschhoek";

type Moment = { match: RegExp; image: string; alt: string; note?: string };

// Notes are DRAFTED in James Wild's voice for review.
export const MOMENTS: Record<string, Moment[]> = {
  "leeu-estates": [
    { match: /wine/i, image: pic(`${LEEU}/mullineux-leeu-wine-studio`), alt: "The garden walk to the Mullineux & Leeu wine studio, Leeu Estates", note: "Book the studio tasting early in the stay. You'll spend the rest of it knowing what to order." },
    { match: /wellness|spa/i, image: pic(`${LEEU}/leeu-spa-lily-pond`), alt: "The Leeu Spa lily pond above the Franschhoek valley", note: "The spa looks over the vines. Nobody has ever regretted the extra hour." },
    { match: /award|restaurant/i, image: pic(`${LEEU}/leeu-estates-dining-room-conservatory`), alt: "The conservatory dining room at Leeu Estates", note: "Breakfast in the conservatory sets the tone. Linger; it's allowed." },
    { match: /fine dining|dining/i, image: pic(`${LEEU}/la-petite-colombe-cuisine-leeu-estates`), alt: "A course at La Petite Colombe, Leeu Estates", note: "La Petite Colombe is the dinner people fly in for. You only have to walk." },
    { match: /\bart\b|gallery/i, image: pic(`${LEEU}/everard-read-gallery-leeu-estates`), alt: "The Everard Read gallery at Leeu Estates", note: "Everard Read on the estate: serious art, no velvet rope. Go before lunch." },
    { match: /garden/i, image: pic(`${LEEU}/leeu-locally-grown-gardens`), alt: "Harvesting in the kitchen gardens at Leeu Estates", note: "Walk the kitchen gardens in the morning and you'll recognise dinner." },
    { match: /franschhoek exploration|explor/i, image: pic(`${LEEU}/leeu-estates-manor-house-aerial-franschhoek`), alt: "Leeu Estates and the Franschhoek valley from the air", note: "The village is five minutes away. Go once, then come back to the lawn." },
    { match: /estate setting/i, image: pic(`${LEEU}/leeu-estates-manor-house-morning`), alt: "The Leeu Estates Manor House in morning light", note: "A working wine estate under the mountains, not a hotel pretending to be one." },
    { match: /country house|boutique/i, image: pic(`${LEEU}/leeu-estates-franschhoek-02`, false), alt: "The Manor House lounge and bar at Leeu Estates", note: "It runs like a private house: they learn your name and your drink by day two." },
    { match: /views/i, image: pic(`${LEEU}/leeu-estates-franschhoek-04`), alt: "The Leeu Estates lawn under the Franschhoek peaks", note: "Every chair faces the mountains. Choose one and stay put." },
    { match: /complimentary|experiences/i, image: pic(`${LEEU}/leeu-estates-manor-house-deck-sundowners`), alt: "Sundowners on the Manor House deck at Leeu Estates", note: "The estate experiences come with the room. Say yes to most of them." },
  ],
  "monwana-thornybush": [
    { match: /intimate|private reserve/i, image: pic(`${MON}/elephant-thornybush-monwana`), alt: "An elephant bull on the Thornybush reserve near Monwana", note: "Tucked away on Thornybush, with the neighbours you came for. They don't knock." },
    { match: /suites/i, image: pic(`${MON}/monwana-game-lodge`), alt: "A Monwana suite opening onto its deck and plunge pool", note: "Modern where it should be, African where it counts. You'll want the outdoor shower more than you think." },
    { match: /infinity pool/i, image: pic(`${MON}/monwana-villa-pool-elephants`), alt: "Elephants at the waterhole beyond the Monwana pool", note: "The pool faces the waterhole. Swim slowly; the elephants are in no hurry either." },
    { match: /guides/i, image: pic(`${MON}/monwana-tracker-safari-vehicle`, false), alt: "A Monwana tracker on the front seat of the game vehicle", note: "Your own guide and tracker set the pace. Tell them what you want to see, then let them surprise you." },
    { match: /cuisine|wine cellar/i, image: pic(`${MON}/monwana-dining-deck`), alt: "Dinner laid on the Monwana deck at dusk", note: "The kitchen is serious and the bar is large. Both are used responsibly, mostly." },
    { match: /eco/i, image: pic(`${MON}/owls-monwana`), alt: "A pair of owls in a tree at Monwana", note: "Built light on the land. The owls approved the plans." },
    { match: /game drives/i, image: pic(`${MON}/monwana-safari-drive`), alt: "Guests watching game from an open vehicle at Monwana", note: "Two drives a day, dawn and dusk. Say yes to the early one; that's when the leopard is out." },
    { match: /bush walks/i, image: pic(`${MON}/young-rangers-waterhole-monwana`), alt: "Two young rangers spotting game by the waterhole at Monwana", note: "On foot you notice the small things. The children usually notice them first." },
    { match: /birdwatching/i, image: pic(`${MON}/owls-monwana`), alt: "A pair of owls in a tree at Monwana", note: "Even the sceptics come home with a bird list. Ask the guide for the owls." },
    { match: /photographic/i, image: pic(`${MON}/leopard-thornybush-monwana`), alt: "A leopard watching through the grass on Thornybush", note: "Bring the long lens. The leopards here are camera-shy only in theory." },
    { match: /wellness/i, image: pic(`${MON}/monwana-villa-pool-elephants`), alt: "The pool and waterhole at Monwana", note: "Book the treatment for the afternoon gap between drives. The view is part of the therapy." },
    { match: /wine tasting/i, image: pic(`${MON}/monwana-dining-deck`), alt: "The Monwana dining deck set for dinner", note: "The cellar is better than it has any right to be this deep in the bush. Let them choose." },
    { match: /bush dining|dining/i, image: pic(`${MON}/monwana-fire-pit`, false), alt: "Evening around the fire pit at Monwana", note: "Dinner under the stars, then the fire pit. Nobody checks a phone; nobody misses it." },
    { match: /stargazing/i, image: pic(`${MON}/monwana-fire-pit`, false), alt: "The Monwana fire pit under the night sky", note: "No light pollution, plenty of sky. The guides know their constellations; the bar knows its nightcaps." },
  ],
  "tengile-mala-mala-kirkmans-kamp": [
    { match: /1920s|homestead/i, image: pic(`${KK}/kirkmans-kamp-homestead`, false), alt: "The 1920s homestead at Kirkman's Kamp at sunset", note: "A 1920s cattle homestead turned safari camp. Old Africa, done properly, with better plumbing." },
    { match: /sand river/i, image: pic(`${KK}/kirkmans-kamp-sand-river`, false), alt: "The Sand River winding through the bush below Kirkman's Kamp", note: "The Sand River runs below the camp. Most of the drama happens along it; book a seat with a view." },
    { match: /suites/i, image: pic(`${KK}/kirkmans-kamp-cottage-bedroom`, false), alt: "A cottage suite at Kirkman's Kamp opening to the veranda", note: "Twelve cottages, each with its own veranda. Ask for one facing the river." },
    { match: /pool/i, image: pic(`${KK}/kirkmans-kamp-pool-dusk`, false), alt: "Kirkman's Kamp and its pool at dusk", note: "The pool is for the long afternoon between drives. Treat it as compulsory." },
    { match: /verandah|veranda/i, image: pic(`${KK}/kirkmans-kamp-veranda-lounge`, false), alt: "The veranda lounge at Kirkman's Kamp in the late sun", note: "The veranda is where the stories get told. Arrive early for the good chair." },
    { match: /family/i, image: pic(`${KK}/kirkmans-kamp-sitting-room`, false), alt: "The sitting room at Kirkman's Kamp", note: "Grandparents, parents, children: the camp handles them all. The guides handle the questions." },
    { match: /wildlife viewing/i, image: pic(`${KK}/kirkmans-kamp-elephant-bull`, false), alt: "An elephant bull close to the vehicle near Kirkman's Kamp", note: "This is the MalaMala game; the Big Five aren't a promise, they're a habit." },
    { match: /hospitality/i, image: pic(`${KK}/kirkmans-kamp-boma-night`, false), alt: "Dinner in the boma at Kirkman's Kamp at night", note: "Boma nights, white tablecloths and a fire. The heritage safari, from the people who perfected it." },
    { match: /big five|drives/i, image: pic(`${KK}/kirkmans-kamp-elephants-drive`, false), alt: "A guide watching elephants from the game vehicle at Kirkman's Kamp", note: "The guides here know the animals by name. Trust the route they choose." },
    { match: /photograph/i, image: pic(`${KK}/kirkmans-kamp-lion-yawn`, false), alt: "A lion yawning beside a lioness near Kirkman's Kamp", note: "Bring more memory cards than you think. Then one more." },
    { match: /bird/i, image: pic(`${KK}/kirkmans-kamp-veranda-view`, false), alt: "The view over the bush from a Kirkman's Kamp veranda", note: "Coffee on the veranda counts as birdwatching. Nobody will tell." },
    { match: /bush walk|walk/i, image: pic(`${KK}/kirkmans-kamp-sand-river`, false), alt: "The Sand River and the bush around Kirkman's Kamp", note: "On foot, the reserve feels twice the size. Follow the ranger; he's done this before." },
    { match: /stargazing|star/i, image: pic(`${KK}/kirkmans-kamp-boma-night`, false), alt: "The boma at Kirkman's Kamp under the night sky", note: "After the boma, look up. The Southern Cross is easier to find than the bar, just." },
    { match: /heritage/i, image: pic(`${KK}/kirkmans-kamp-main-house`, false), alt: "The main house at Kirkman's Kamp under the trees", note: "Old photographs, older trees and a guest book worth reading. This is where the safari story started." },
  ],
  "camp:lion-sands/ivory-lodge": [
    { match: /treehouse/i, image: pic(`${LS}/lion-sands-treehouses/lion-sands-treehouse-night`), alt: "A Lion Sands treehouse lit above the bush at dusk", note: "Sleep out in a treehouse one night. You'll talk about it longer than the lion sighting." },
    { match: /private suite pool|suite pool/i, image: `${WF}/6945ac54fdf8703497327a1b_Lion%20Sands%20Ivory%20Lodge%20-%20%20Couple%20Suite%20Pool%20-%20Medium.webp`, alt: "A private suite pool at Ivory Lodge above the Sabie River", note: "Every suite has its own pool facing the river. Honeymooners rarely leave it; we understand." },
    { match: /night game|game drives/i, image: pic(`${LS}/lion-sands-wildlife/leopard-lion-sands-sabi-sand`, false), alt: "A leopard resting in a tree on Lion Sands", note: "After dark the reserve changes shift. The leopards start work; so should you." },
    { match: /stargazing/i, image: `${WF}/6945ac5413a80aed9c786fbd_Lion%20Sands%20Ivory%20Lodge%20-%20Suite%20Evening%20pool%20-%20Medium.webp`, alt: "An Ivory Lodge suite and pool at evening", note: "Switch off the deck lights and look up. The river does the soundtrack." },
    { match: /all inclusive|fine dining|kosher/i, image: pic(`${LS}/lion-sands-treehouses/treehouse-dining-lion-sands`), alt: "Lunch for two on a Lion Sands treehouse deck", note: "Everything's included, so order the second glass. Kosher dining is done properly, not as an afterthought." },
    { match: /deck/i, image: `${WF}/6945ac54ed5d0deacdc769b3_Lion%20Sands%20Ivory%20Lodge%20-%20Suite%20Pool%202%20-%20Medium.webp`, alt: "A private deck and plunge pool at Ivory Lodge", note: "The deck faces the Sabie River. Elephants stop by for a drink; you can stay in the pool." },
    { match: /celebration/i, image: `${WF}/6945ac5413a80aed9c786fbd_Lion%20Sands%20Ivory%20Lodge%20-%20Suite%20Evening%20pool%20-%20Medium.webp`, alt: "An Ivory Lodge suite lit for the evening", note: "Anniversaries, proposals, birthdays: they've seen them all and still make each one feel like the first." },
    { match: /community/i, image: `${WF}/6945ac54aa861da6b9c8b9ff_Lion%20Sands%20Ivory%20Lodge%20-%20Suite%202%20-%20Medium.webp`, alt: "An Ivory Lodge suite at Lion Sands", note: "Ask about the community visit. It's the part of the trip you'll explain best when you get home." },
    { match: /artist/i, image: `${WF}/6945ac545c3a3652f404f766_Lion%20Sands%20Ivory%20Lodge%20-%20Suite%203%20-%20Medium.webp`, alt: "An Ivory Lodge suite at Lion Sands", note: "There's an artist in residence. Ask to see the studio; it's another way of seeing the bush." },
    { match: /wi-?fi/i, image: `${WF}/6945ac54959ffd820b821274_Lion%20Sands%20Ivory%20Lodge%20-%20Suite%20Bedroom%20-%20Medium.webp`, alt: "An Ivory Lodge suite bedroom", note: "Yes, there's Wi-Fi. Send one photo home, then put the phone in the safe." },
    { match: /morning bush walk|bush walk/i, image: pic(`${LS}/lion-sands-wildlife/wildlife-lion-sands-2`, false), alt: "A young leopard on Lion Sands", note: "The morning walk is for the tracks and the small stuff. The big stuff tends to find you anyway." },
    { match: /game drives/i, image: pic(`${LS}/lion-sands-wildlife/lion-sands-game-reserve`), alt: "A leopard on Lion Sands Game Reserve", note: "Mornings for the light, nights for the leopards. Do both; sleep at lunch." },
    { match: /kosher|fine dining/i, image: pic(`${LS}/lion-sands-treehouses/treehouse-dining-lion-sands`), alt: "A table for two on a Lion Sands treehouse deck", note: "Kosher dining is done properly here, not as an afterthought. Say so when you book and the kitchen does the rest." },
  ],
  "ellerman-house": [
    { match: /villa|exclusiv/i, image: `${B44}/34f1c8e06_52680f0f9_694b0ebccc2fad7ac7a3142e_Ellerman_House_Exterior.jpg`, alt: "Ellerman House on the slopes above Bantry Bay, Cape Town", note: "For a family or a group, take a villa and let the house look after you." },
    { match: /\bart\b/i, image: `${B44}/cba6ff11c_2623a8b85_694b0ee3b3f5f6003a2ba5c0_Ellerman_House_Lounge.jpg`, alt: "The Ellerman House lounge hung with South African art", note: "One of the great private collections of South African art, and you can sit beside it with a drink." },
    { match: /wine/i, image: `${B44}/2534113a7_a0d3d4385_694b10705b7c0eb8703ee112_Ellerman_House_Wine_Cellar.jpg`, alt: "The Ellerman House wine gallery and cellar", note: "Thousands of South African labels below stairs. Ask for the tasting; then ask for their favourite." },
    { match: /dining|culinary/i, image: `${B44}/271ef56bb_8512946e7_694b11a9212ec6a0aee995df_Ellerman_House_Dining.jpg`, alt: "The dining room at Ellerman House", note: "Dine in at least once. White-glove service, without the stiff collar." },
    { match: /spa|garden|wellness/i, image: `${B44}/b2d0eefc7_74e8b959e_694b0f0ff35ddeab6f3886bc_Ellerman_House_Spa.jpg`, alt: "The spa at Ellerman House above the Atlantic", note: "The spa looks at the Atlantic. The hardest decision of the day is which way to face." },
    { match: /bar roc|champagne|sundowner/i, image: `${B44}/cec4097ac_dae8b3011_694b0f25f703099825b3e3d5_Ellerman_House_Bar.jpg`, alt: "BAR ROC at Ellerman House", note: "Be at BAR ROC for sunset. The sun sets into the sea and the champagne does the rest." },
    { match: /concierge|cape town/i, image: `${B44}/47851c04d_58273fd12_694b0ee3fbda8620f785633d_Ellerman_House_View.jpg`, alt: "The view over Bantry Bay from Ellerman House", note: "They'll open Cape Town's doors for you. Make it your base, not just your first night." },
    { match: /indigenous|stroll/i, image: `${B44}/a69ea5ee9_e843f4e96_694b0eac021864ade3c6e7b8_Ellerman_House_Aerial.jpg`, alt: "Ellerman House and its terraced gardens from the air", note: "The gardens step down toward the sea. Walk them early, before Cape Town wakes up." },
    { match: /art tour/i, image: `${B44}/cba6ff11c_2623a8b85_694b0ee3b3f5f6003a2ba5c0_Ellerman_House_Lounge.jpg`, alt: "Art in the Ellerman House lounge", note: "Take the art tour. The stories behind the walls beat the label cards." },
    { match: /wine cellar/i, image: `${B44}/2534113a7_a0d3d4385_694b10705b7c0eb8703ee112_Ellerman_House_Wine_Cellar.jpg`, alt: "The wine cellar at Ellerman House", note: "Go down to the cellar before dinner. You'll come back up with an opinion." },
    { match: /culinary|workshop/i, image: `${B44}/271ef56bb_8512946e7_694b11a9212ec6a0aee995df_Ellerman_House_Dining.jpg`, alt: "The dining room at Ellerman House", note: "Book the kitchen session. You eat what you make, which concentrates the mind." },
    { match: /spa/i, image: `${B44}/b2d0eefc7_74e8b959e_694b0f0ff35ddeab6f3886bc_Ellerman_House_Spa.jpg`, alt: "The spa at Ellerman House", note: "Ninety minutes in the spa undoes a long-haul flight better than any pill." },
    { match: /sundowner/i, image: `${B44}/47851c04d_58273fd12_694b0ee3fbda8620f785633d_Ellerman_House_View.jpg`, alt: "Bantry Bay at sunset from Ellerman House", note: "The bay goes gold, then pink, then it's time for dinner. Don't be late for the gold." },
  ],
};

// The six rows travellers care about most, in this order, per section.
// "apart" = What sets it apart, "days" = How to fill the days.
const PICKS: Record<string, { apart?: RegExp[]; days?: RegExp[] }> = {
  "leeu-estates": { apart: [/estate setting/i, /dining/i, /spa/i, /wine/i, /gallery/i, /complimentary/i] },
  "monwana-thornybush": { days: [/game drives/i, /bush walks/i, /photographic/i, /bush dining/i, /wellness/i, /stargazing/i] },
  "tengile-mala-mala-kirkmans-kamp": { apart: [/1920s|homestead/i, /sand river/i, /wildlife viewing/i, /verandah|veranda/i, /suites/i, /family/i] },
  "camp:lion-sands/ivory-lodge": { apart: [/suite pool/i, /treehouse/i, /night game/i, /bush walk/i, /all inclusive/i, /stargazing/i] },
  "ellerman-house": { apart: [/villa|exclusiv/i, /\bart\b/i, /wine/i, /dining/i, /spa|garden/i, /bar roc/i] },
};
// Rows travellers rarely choose a place for sink to the bottom.
const LOW = /wi-?fi|internet|parking|laundry|housekeeping|air.?con|room service|24.?hour|front desk|concierge|transfer/i;
export const MAX_ROWS = 6;

/** Pick the top six rows: James's order where set, else rows with a photo and note first, everyday amenities last. */
export function topRows(slug: string, items: string[], section: "apart" | "days") {
  const pick = PICKS[slug]?.[section];
  const list = MOMENTS[slug] ?? [];
  const score = (t: string, i: number) => {
    if (pick) { const p = pick.findIndex((r) => r.test(t)); if (p >= 0) return p; }
    return 100 + (LOW.test(t) ? 200 : 0) + (list.some((m) => m.match.test(t)) ? 0 : 50) + i;
  };
  return items.map((t, i) => ({ t, s: score(t, i) })).sort((a, b) => a.s - b.s).slice(0, MAX_ROWS).map((x) => x.t);
}

export function momentsFor(slug: string, rows: string[], fallback: { url: string; alt: string }[], offset = 0, taken: { note?: string }[] = []) {
  const list = MOMENTS[slug] ?? [];
  const items = topRows(slug, rows, taken.length ? "days" : "apart");
  // entries already shown in the other section are skipped, so the two sections never repeat a note
  const used = new Set<number>(list.map((m, j) => (taken.some((t) => t.note && t.note === m.note) ? j : -1)).filter((j) => j >= 0));
  return items.map((title, k) => {
    const i = list.findIndex((m, j) => !used.has(j) && m.match.test(title));
    if (i >= 0) { used.add(i); const m = list[i]; return { title, image: m.image, alt: m.alt, note: m.note }; }
    const f = fallback.length ? fallback[(k + offset) % fallback.length] : undefined;
    return { title, image: f?.url, alt: f ? f.alt : undefined };
  });
}

/** Rows for a section: the record's items, or a short comma list in its paragraph split into rows. */
export function rowsFrom(items: string[], paras: string[]) {
  if (items.length) return items;
  const p = (paras[0] ?? "").trim();
  // only a plain list: one sentence, no brackets
  if (!p || p.length > 260 || (p.match(/,/g) ?? []).length < 3 || /\.\s+\S/.test(p) || /[()]/.test(p)) return [];
  return p.replace(/\.$/, "").split(/,\s*(?:and\s+)?|\s+and\s+(?=[^,]*$)/).map((x) => x.trim()).filter((x) => x && x.length < 48).map((x) => x[0].toUpperCase() + x.slice(1));
}
