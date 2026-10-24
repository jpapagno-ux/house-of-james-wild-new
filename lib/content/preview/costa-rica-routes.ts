// Costa Rica Overland drafts for the Compass trip step (24 Oct 2026).
//
// DRAFTS for James to correct: transfer times are typical door-to-door
// estimates in good conditions (roads and rain change them), and the three
// routes are written in the LandItinerary shape so they can be filed as
// ITN-LAND records once signed off. Stays are the Ledger's own Costa Rica
// records; the Compass picks one per leg by traveller type.

export type NodeId = "sjo" | "lir" | "arenal" | "monteverde" | "pacuare" | "caribbean" | "manuel" | "ballena" | "osa";
export type MustDo = "volcano" | "cloud" | "wildlife" | "beach" | "rafting" | "wellness" | "culture";

export const NODES: Record<NodeId, { label: string; lat: number; lng: number }> = {
  sjo: { label: "San José (SJO)", lat: 9.9939, lng: -84.2088 },
  lir: { label: "Liberia (LIR)", lat: 10.5933, lng: -85.5444 },
  arenal: { label: "Arenal & La Fortuna", lat: 10.4925, lng: -84.6739 },
  monteverde: { label: "Monteverde", lat: 10.3096, lng: -84.8218 },
  pacuare: { label: "Pacuare River", lat: 10.1821, lng: -83.6048 },
  caribbean: { label: "South Caribbean", lat: 9.6432, lng: -82.7203 },
  manuel: { label: "Manuel Antonio", lat: 9.4018, lng: -84.1655 },
  ballena: { label: "Costa Ballena", lat: 9.1686, lng: -83.7398 },
  osa: { label: "Osa Peninsula", lat: 8.4243, lng: -83.302 },
};

// Draft transfer table. minutes = typical; mode = how the house would do it.
export const TRANSFERS: { a: NodeId; b: NodeId; minutes: number; mode: "drive" | "fly" | "drive + raft" | "jeep-boat-jeep"; note?: string }[] = [
  { a: "sjo", b: "arenal", minutes: 180, mode: "drive" },
  { a: "lir", b: "arenal", minutes: 150, mode: "drive" },
  { a: "sjo", b: "monteverde", minutes: 210, mode: "drive", note: "last stretch on mountain roads" },
  { a: "lir", b: "monteverde", minutes: 150, mode: "drive" },
  { a: "arenal", b: "monteverde", minutes: 180, mode: "jeep-boat-jeep", note: "or about 3.5 hours round the lake by road" },
  { a: "sjo", b: "pacuare", minutes: 240, mode: "drive + raft", note: "2 hours to the put-in, then the river is the road in" },
  { a: "arenal", b: "pacuare", minutes: 270, mode: "drive + raft" },
  { a: "pacuare", b: "caribbean", minutes: 150, mode: "drive", note: "from the take-out" },
  { a: "sjo", b: "caribbean", minutes: 240, mode: "drive", note: "or fly to Limón and drive an hour" },
  { a: "caribbean", b: "arenal", minutes: 330, mode: "drive" },
  { a: "sjo", b: "manuel", minutes: 180, mode: "drive", note: "or a 25-minute flight to Quepos" },
  { a: "monteverde", b: "manuel", minutes: 210, mode: "drive" },
  { a: "arenal", b: "manuel", minutes: 270, mode: "drive", note: "or a short charter flight to Quepos" },
  { a: "manuel", b: "ballena", minutes: 60, mode: "drive" },
  { a: "arenal", b: "ballena", minutes: 300, mode: "drive", note: "or fly to Quepos and drive an hour" },
  { a: "sjo", b: "ballena", minutes: 210, mode: "drive" },
  { a: "ballena", b: "osa", minutes: 150, mode: "drive", note: "to Puerto Jiménez" },
  { a: "sjo", b: "osa", minutes: 50, mode: "fly", note: "to Puerto Jiménez; about 7 hours by road" },
];

export function transfer(a: NodeId, b: NodeId) {
  return TRANSFERS.find((t) => (t.a === a && t.b === b) || (t.a === b && t.b === a));
}
export function fmtTransfer(a: NodeId, b: NodeId) {
  const t = transfer(a, b);
  if (!t) return null;
  const h = Math.floor(t.minutes / 60), m = t.minutes % 60;
  const dur = t.minutes < 60 ? `${t.minutes} min` : `${h}${m ? `h${String(m).padStart(2, "0")}` : " hours"}`;
  return `${dur} ${t.mode === "fly" ? "flight" : t.mode} from ${NODES[a].label}${t.note ? ` · ${t.note}` : ""}`;
}

export type Leg = { at: NodeId; nights: number; stays: string[]; highlights: string[] };
export type Route = {
  id: string; name: string; eyebrow: string; nights: number; pace: "relaxed" | "balanced" | "active";
  start: NodeId; end: NodeId; bestMonths: string; seasons: ("dry" | "green")[];
  musts: MustDo[]; bestFor: string[]; line: string; legs: Leg[];
};

export const ROUTES: Route[] = [
  {
    id: "the-classic", name: "The Classic", eyebrow: "Volcano, cloud forest and the Pacific", nights: 8, pace: "balanced", start: "sjo", end: "sjo",
    bestMonths: "December to April", seasons: ["dry"], musts: ["volcano", "cloud", "wildlife", "beach"], bestFor: ["first_time_visitors", "honeymoon", "family"],
    line: "Costa Rica's three great landscapes in one easy loop: hot springs under Arenal, the misty bridges of Monteverde, then sloths and sea at Manuel Antonio.",
    legs: [
      { at: "arenal", nights: 3, stays: ["nayara-tented-camp", "nayara-gardens", "arenal-springs-camp-by-nayara", "amor-arenal", "tabacon-thermal-resort-spa", "noah-forest-by-tifakara"], highlights: ["Hot springs beneath the volcano", "Hanging bridges through the canopy", "Lava-field hike at dusk"] },
      { at: "monteverde", nights: 2, stays: ["senda-monteverde-lodge"], highlights: ["Cloud-forest walk at first light", "Night walk for tree frogs and sloths"] },
      { at: "manuel", nights: 3, stays: ["arenas-del-mar-resort"], highlights: ["Manuel Antonio National Park with a naturalist", "Beach days in the forest's edge"] },
    ],
  },
  {
    id: "two-coasts", name: "Two Coasts", eyebrow: "Caribbean, river and volcano", nights: 10, pace: "active", start: "sjo", end: "sjo",
    bestMonths: "February to April, or September and October", seasons: ["dry", "green"], musts: ["beach", "rafting", "volcano", "culture", "wellness"], bestFor: ["adventure", "honeymoon", "repeat_visitors"],
    line: "The Costa Rica most visitors miss: the Afro-Caribbean coast, a lodge you reach only by raft, then the volcano and the Pacific to finish.",
    legs: [
      { at: "caribbean", nights: 3, stays: ["aguas-claras"], highlights: ["Snorkel the reef at Cahuita", "Cacao with the Bribrí", "Theme nights at the beach club"] },
      { at: "pacuare", nights: 2, stays: ["pacuare-lodge"], highlights: ["Raft in on the Pacuare", "Canopy and waterfall walks"] },
      { at: "arenal", nights: 3, stays: ["nayara-tented-camp", "amor-arenal", "tabacon-thermal-resort-spa", "nayara-gardens", "arenal-springs-camp-by-nayara", "noah-forest-by-tifakara"], highlights: ["Hot springs beneath the volcano", "Hanging bridges through the canopy"] },
      { at: "ballena", nights: 2, stays: ["kura-boutique-resort", "the-art-villa"], highlights: ["Whale's Tail at Uvita at low tide", "Sunset over the Pacific"] },
    ],
  },
  {
    id: "wild-osa", name: "Wild Osa", eyebrow: "Volcano to the wildest peninsula", nights: 9, pace: "balanced", start: "sjo", end: "osa",
    bestMonths: "December to April", seasons: ["dry"], musts: ["wildlife", "beach", "volcano", "wellness"], bestFor: ["wildlife_photography", "adventure", "honeymoon"],
    line: "From Arenal to the Osa, where the rainforest meets the sea and the wildlife is the densest in the country. Fly home from Puerto Jiménez.",
    legs: [
      { at: "arenal", nights: 3, stays: ["nayara-tented-camp", "nayara-gardens", "amor-arenal", "tabacon-thermal-resort-spa", "arenal-springs-camp-by-nayara", "noah-forest-by-tifakara"], highlights: ["Hot springs beneath the volcano", "Birding at dawn"] },
      { at: "ballena", nights: 3, stays: ["kura-boutique-resort", "the-art-villa"], highlights: ["Humpback season in Marino Ballena", "Waterfalls inland from Uvita"] },
      { at: "osa", nights: 3, stays: ["lapa-rios-lodge"], highlights: ["Scarlet macaws and four monkey species", "Tracking with a naturalist near Corcovado"] },
    ],
  },
];

export const MUSTS: { id: MustDo; label: string }[] = [
  { id: "volcano", label: "Volcano & hot springs" },
  { id: "cloud", label: "Cloud forest" },
  { id: "wildlife", label: "Wildlife" },
  { id: "beach", label: "Beach days" },
  { id: "rafting", label: "Rafting" },
  { id: "wellness", label: "Wellness" },
  { id: "culture", label: "Local culture" },
];
