// A note from James for every region and country page, shown beside the
// "In short" answer, in James Wild's voice; approved by James 2026-10-26. Costa
// Rica and the Caribbean (the Bahamas) carry origin notes: that's where the
// house began. When a Captain's Log post exists for a place, add it as `blog`
// and the note links to it.
export type PlaceNote = { line: string; origin?: boolean; blog?: { title: string; href: string } };

export const REGION_NOTES: Record<string, PlaceNote> = {
  africa: { line: "Africa doesn't do half measures, so neither should your itinerary. Three camps, not five. You'll thank me at the second sundowner." },
  asia: { line: "Asia rewards the curious and punishes the over-scheduled. Leave one day blank; it fills itself." },
  "usa-canada": { line: "These wild places are bigger than they look on the map. Pack layers, and drive less than you think you should." },
  "central-america": { origin: true, line: "Costa Rica is where the house began. Two coasts, one volcano and more birds than adjectives. Start here; most people come back." },
  "caribbean-mexico": { origin: true, line: "It all started on Eleuthera in 1983, with friends who wanted to surf. The Bahamas are coming to the Ledger; Mexico holds the fort till then." },
  oceania: { line: "Fly far once, then slow right down. Tahiti taught me that, and Taha'a made sure it stuck." },
  "south-america": { line: "The Andes, Patagonia, the Galápagos: pick two per trip. The continent will wait for the third." },
  europe: { line: "Europe needs no introduction. Just a better hotel and an earlier ferry." },
  "polar-antarctica": { line: "Antarctica keeps its own timetable. Pack patience; the ice is worth the wait." },
  "polar-arctic": { line: "The Arctic runs on light, not clocks. Summer for the midnight sun, winter if you'd rather chase the lights." },
};

export const COUNTRY_NOTES: Record<string, PlaceNote> = {
  botswana: { line: "Botswana keeps its numbers low on purpose: fewer vehicles, more leopard. Fly between camps; the view is half the trip." },
  kenya: { line: "Kenya invented the safari postcard. Go beyond the Mara for the quiet and the walking." },
  madagascar: { line: "Nowhere else looks like Madagascar, because nowhere else is. Allow for slow roads and fast lemurs." },
  namibia: { line: "Namibia is space with a few lodges in it. Bring a wide lens and a long attention span." },
  rwanda: { line: "An hour with the gorillas, a lifetime telling people about it. Book the permits first, everything else second." },
  seychelles: { line: "The Seychelles is how a safari ends properly. Barefoot is the dress code." },
  "south-africa": { line: "Bush, wine and the Cape on one passport stamp. The trick is not trying to do it all in one week." },
  tanzania: { line: "Tanzania is the big-cat stage. Time the migration, then let the guide pick the seat." },
  zambia: { line: "Walking-safari country. Wear sensible shoes and let the guide carry the rifle." },
  zimbabwe: { line: "Zimbabwe has the guides other guides talk about. Go for them, stay for Hwange." },
  cambodia: { line: "Angkor at sunrise is crowded for a reason. Go back at sunset, when everyone else has left." },
  indonesia: { line: "Raja Ampat is the reef the others are measured against. Sail it; the boat is the hotel." },
  maldives: { line: "The Maldives is a choice of blues. Pick the house reef first and the villa second." },
  philippines: { line: "Seven thousand islands and you need about three. Dive, hop, repeat." },
  thailand: { line: "Thailand treats hospitality as a national sport. Skip one island; it'll keep." },
  arizona: { line: "Arizona changes colour by the hour. Get up for one sunrise; you won't need asking twice." },
  california: { line: "Three trips in one state: coast, desert or mountains. Choose; don't commute between them." },
  montana: { line: "Big sky, bigger breakfasts. Bring a rod even if you don't fish." },
  utah: { line: "My favourite family playground: red rock, dark skies and nobody asking for the Wi-Fi password." },
  wyoming: { line: "In Wyoming the bison have right of way, and they know it." },
  belize: { line: "Reef in the morning, ruins in the afternoon. Split the stay between coast and jungle." },
  "costa-rica": { origin: true, line: "This is where James Wild & Co started. Leave one afternoon empty; that's usually when Costa Rica shows off." },
  panama: { line: "Panama is more than a canal. The Pacific islands are the quiet secret." },
  mexico: { line: "Mexico rewards the curious eater. Book the table before the room." },
  australia: { line: "A continent pretending to be a country. Pick two regions and fly between them." },
  fiji: { line: "The Fijian welcome isn't a marketing line. Choose a small island and let it look after you." },
  "new-zealand": { line: "A continent of scenery on two islands. Drive less, stay longer." },
  tahiti: { line: "My favourite since 1996, and Taha'a my favourite part of it. Go slow; the lagoon sets the pace." },
  argentina: { line: "Steak, Malbec and Patagonia, in that order of pace." },
  chile: { line: "Long enough to need two climates in one suitcase. Atacama and Patagonia, ideally not the same week." },
  "ecuador-galapagos": { line: "The animals haven't learned to be afraid; don't teach them. Choose the boat carefully, it's your whole trip." },
  peru: { line: "Machu Picchu, yes. But give the Sacred Valley and Lima's tables their own days." },
  greece: { line: "Choose islands by the ferry timetable, not the photographs." },
  "arctic-cruises": { line: "Arctic voyages live by the ice report. Flexible minds see more bears." },
  iceland: { line: "Iceland's weather changes its mind every ten minutes. So should your plans." },
};
