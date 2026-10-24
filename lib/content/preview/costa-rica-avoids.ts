// "What we'd avoid": the house's field notes for the Costa Rica Compass,
// in the same spirit as the Overland "what to avoid" lines. Practical and
// a little dry; general field knowledge, not personal anecdotes. James's
// own first-hand lessons go in NOTEBOOK once he supplies them.

import type { Region, Season, Traveller } from "./costa-rica-compass";

export type Avoid = { avoid: string; instead: string };

export const AVOID_BY_REGION: Record<Region, Avoid[]> = {
  volcano: [
    { avoid: "Saving the volcano view for the afternoon.", instead: "Arenal wears a cloud hat by lunchtime most days. Look early, soak late." },
    { avoid: "Doing the hot springs as a day trip from somewhere else.", instead: "Sleep where the springs are and go in after dark, when the day buses have gone." },
  ],
  cloud: [
    { avoid: "Packing for the tropics only.", instead: "Monteverde is cool and damp. Bring the layer you'd wear on a Scottish hillside." },
    { avoid: "Walking the hanging bridges at midday with everyone else.", instead: "Go at opening. The birds keep early hours, and so should you." },
  ],
  caribbean: [
    { avoid: "Assuming the Caribbean keeps the Pacific's calendar.", instead: "September and October are often its driest months, just as the Pacific turns wet." },
    { avoid: "Over-planning Puerto Viejo.", instead: "It runs on Caribbean time. Plan fewer things and let the coast do the rest." },
  ],
  pacific: [
    { avoid: "Leaving your lunch unattended on a Manuel Antonio beach.", instead: "The capuchins have the grab-and-run down to an art. Keep bags zipped." },
    { avoid: "Driving to the Osa to save a flight.", instead: "It's about seven hours by road. The 50-minute flight buys back a whole day." },
  ],
  river: [
    { avoid: "Bringing a hard suitcase to the Pacuare.", instead: "The river is the road in. Pack a small soft bag for the lodge and leave the rest behind." },
  ],
};

export const AVOID_BY_SEASON: Record<Season, Avoid> = {
  dry: { avoid: "Booking Christmas, New Year or Easter late.", instead: "Those weeks fill the small lodges early. Hold the dates first, decide the details later." },
  green: { avoid: "Writing off the green season.", instead: "Mornings are usually bright; the rain tends to keep an afternoon appointment. Fewer people, greener everything." },
};

export const AVOID_BY_TRAVELLER: Partial<Record<Traveller, Avoid>> = {
  honeymoon: { avoid: "Changing hotels every other night.", instead: "Two nights is the least for anywhere you'll want to remember; three is better." },
  family: { avoid: "Stacking long drives back to back with children.", instead: "Three hours is a long morning. We break the big transfers with a stop worth making." },
  adventure: { avoid: "Filling every day with an activity.", instead: "The best sightings come on the unscheduled walk. Leave a gap each day." },
  wildlife: { avoid: "Going without a naturalist.", instead: "A good guide finds the sloth you walked past twice. It's the best money in the budget." },
  wellness: { avoid: "Booking a wellness stay at the end of a road trip.", instead: "Put the slow days first or in the middle, before the tiredness sets in." },
  solo: { avoid: "Choosing the biggest resort for company.", instead: "The small lodges are where the conversations happen, at one table." },
};

export const AVOID_BY_ROUTE: Record<string, Avoid> = {
  "the-classic": { avoid: "Driving Arenal to Manuel Antonio in one push.", instead: "Monteverde in the middle isn't a detour; it's the point." },
  "two-coasts": { avoid: "Crossing from the Caribbean to the Pacific in a single day.", instead: "It looks short on the map. It isn't. The river and the volcano are there to break it." },
  "wild-osa": { avoid: "Packing more than a small plane will take.", instead: "Flights to Puerto Jiménez have tight bag limits. Soft bags, light loads." },
};

// James's own first-hand lessons, to be filed from his notes.
export const NOTEBOOK: Avoid[] = [];

export function avoidsFor(region: Region | "any", season: Season | "any", who: Traveller) {
  const out: Avoid[] = [];
  if (region !== "any") out.push(AVOID_BY_REGION[region][0]);
  else out.push(AVOID_BY_REGION.volcano[0]);
  if (season !== "any") out.push(AVOID_BY_SEASON[season]);
  const t = AVOID_BY_TRAVELLER[who];
  if (t) out.push(t);
  if (region !== "any" && AVOID_BY_REGION[region][1] && out.length < 3) out.push(AVOID_BY_REGION[region][1]);
  return out.slice(0, 3);
}
