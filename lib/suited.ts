// "Who it suits", one icon per kind of traveller (James, 4 Nov 2026: an icon set to show who trips are best for,
// voyages first, then overland). Each trip's own audience lines (its `suits`) are sorted into one of these by
// keyword; nothing is added to a trip that its page doesn't already say. Icons are lucide line icons, graphite.
export type SuitedKey =
  | "couples" | "honeymoon" | "families" | "generations" | "first" | "returning" | "divers" | "surfers" | "photographers"
  | "wildlife" | "wellness" | "food" | "friends" | "active" | "culture" | "solo" | "sailors" | "short-crossing" | "creative";

export const SUITED: Record<SuitedKey, { label: string; icon: string; hint: string }> = {
  couples: { label: "Couples", icon: "Heart", hint: "Two travelling together" },
  honeymoon: { label: "Honeymoons", icon: "Gem", hint: "A first trip together" },
  families: { label: "Families", icon: "Users", hint: "Parents and children; see the age line" },
  generations: { label: "Three generations", icon: "UsersRound", hint: "Grandparents, parents and children" },
  first: { label: "First visit", icon: "Compass", hint: "New to the place or the kind of trip" },
  returning: { label: "Returning", icon: "RotateCcw", hint: "Been once; going deeper" },
  divers: { label: "Divers & snorkellers", icon: "Fish", hint: "Time in the water every day" },
  surfers: { label: "Surfers", icon: "Waves", hint: "Breaks within reach" },
  photographers: { label: "Photographers", icon: "Camera", hint: "Light, time and a vehicle or boat to wait" },
  wildlife: { label: "Wildlife", icon: "Binoculars", hint: "Animals first" },
  wellness: { label: "Wellness", icon: "Leaf", hint: "Spa, slow days, rest" },
  food: { label: "Food & wine", icon: "Wine", hint: "Tables worth the trip" },
  friends: { label: "Friends", icon: "UsersRound", hint: "A group travelling together" },
  active: { label: "Active", icon: "Footprints", hint: "Walking, hiking, paddling" },
  culture: { label: "Culture", icon: "Landmark", hint: "Towns, ruins, people" },
  solo: { label: "Small circles", icon: "User", hint: "Solo or a few, led closely" },
  sailors: { label: "First-time sailors", icon: "Sailboat", hint: "New to life on a boat" },
  "short-crossing": { label: "Short crossing", icon: "Plane", hint: "Fly over the open sea" },
  creative: { label: "Creative", icon: "Sparkles", hint: "Time to make something" },
};

const RULES: [RegExp, SuitedKey][] = [
  [/honeymoon/i, "honeymoon"], [/three generations|grandparent/i, "generations"], [/famil|children|kids/i, "families"],
  [/couple/i, "couples"], [/divers?|snorkel/i, "divers"], [/surf/i, "surfers"], [/photograph|shoots/i, "photographers"],
  [/sailor/i, "sailors"], [/drake|dread|crossing/i, "short-crossing"], [/returning|second-time|second time/i, "returning"],
  [/culture/i, "culture"], [/creative/i, "creative"], [/first/i, "first"], [/wildlife|safari/i, "wildlife"], [/wellness|spa/i, "wellness"], [/food|wine/i, "food"],
  [/friends/i, "friends"], [/active|walker|hik/i, "active"], [/men who|between chapters|solo/i, "solo"],
];

export function suitedKey(label: string): SuitedKey | null {
  for (const [re, k] of RULES) if (re.test(label)) return k;
  return null;
}
