// Stays that also have a house page on the Wild & Co Gatherings site (the
// family and group showcase). The stay page links across with a short invite;
// the Gatherings page links back. Paths come from the Gatherings Airtable
// "Page path" field. Add a row when a stay gains a Gatherings house page.
export const GATHERINGS_SITE = "https://wildco-gatherings1.vercel.app";

export const GATHERINGS_LINKS: Record<string, { path: string; entry: string; line: string }> = {
  "vermejo-ted-turner-reserve": { path: "/houses/vermejo-ted-turner-reserve", entry: "G-005", line: "Casa Grande, the cottages and cabins, or the whole reserve: Vermejo for a family that wants a mountain range to itself." },
  "ladder-ted-turner-reserve": { path: "/houses/ladder-ted-turner-reserve", entry: "G-006", line: "One Country House for up to eight, with a private chef and guide, and 156,000 acres around it." },
  "armendaris-ted-turner-reserve": { path: "/houses/armendaris-ted-turner-reserve", entry: "G-007", line: "The Hacienda for up to eight, with a private chef and guides, in 360,000 acres of desert." },
  "sierra-grande-ted-turner-reserve": { path: "/houses/sierra-grande-ted-turner-reserve", entry: "G-008", line: "Seventeen rooms on the hot springs: the easy base for a family day at Ladder or Armendaris." },
};
