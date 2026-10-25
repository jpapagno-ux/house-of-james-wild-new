// Central America region page: snapshot of the library (Region
// 6a870f0728bd3be6ea1c818d, its Destinations and their live Stays), 25 Oct
// 2026. Counts are what passes the Ledger gate today; notes list the gaps.
import { COSTA_RICA } from "./costa-rica";
import type { Door } from "@/components/destination/Doors";

const WF = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";
const B44 = "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474";
const cr = COSTA_RICA.ledger.items;

export const CENTRAL_AMERICA = {
  name: "Central America",
  slug: "central-america",
  tagline: "Rainforest, reef and two coasts, a short flight apart",
  hero: { url: `${WF}/682509a054e5689f9892c0fb_GettyImages-1204864484.jpg`, alt: "Central America: rainforest meeting the sea" },
  answer:
    "Central America in the James Wild & Co Ledger is three countries. Costa Rica has 13 stays mapped from Arenal to the Osa Peninsula and three Overland routes. Belize has 14 stays across the Maya inland and the barrier-reef cayes, a country James has designed journeys for since 1992. Panama has private-island stays at Islas Secas and Bocas del Toro. Most of the region is driest from December to April; Costa Rica's Caribbean coast is often best in September and October.",
  doors: [
    { name: "Costa Rica", href: "/destinations/central-america/costa-rica", image: `${WF}/6863018671b62ea7c452cea0_CostaRicaMAHero1.jpg`, line: "Volcano, cloud forest and two coasts, mapped stay by stay from Arenal to the Osa.", stays: cr.length, routes: 3, bestMonths: "December to April; the Caribbean coast in September and October", compass: true },
    { name: "Belize", href: "/destinations/central-america/belize", image: `${WF}/68255840f3cf49a9b92d7770_GettyImages-2203385205.jpg`, line: "A few nights inland among waterfalls and Maya caves, then the cayes of the barrier reef.", stays: 14, note: "Stays and five routes are being given their own pages." },
    { name: "Panama", href: "/destinations/central-america/panama", image: `${B44}/a06ad2a60_e405209d4_69f1c2e93b417f4de707f382_10.jpg`, line: "Private islands on both coasts: Islas Secas in the Pacific, Bocas del Toro in the Caribbean.", stays: 2 },
  ] as Door[],
  pins: [
    ...cr.filter((s) => s.lat != null).map((s) => ({ name: s.name, lat: s.lat as number, lng: s.lng as number, country: "Costa Rica" })),
    { name: "Nayara Bocas del Toro", lat: 9.352, lng: -82.2106, country: "Panama" },
    { name: "Islas Secas", lat: 7.2095, lng: -82.3235, country: "Panama" },
    { name: "Thatch Caye Resort", lat: 16.874528, lng: -88.121583, country: "Belize" },
    { name: "Blancaneaux Lodge", lat: 17.03651, lng: -88.95317, country: "Belize" },
  ],
  months: [
    { area: "Costa Rica · Pacific & central", note: "Arenal, Monteverde, Manuel Antonio, the Osa", months: ["best", "best", "best", "best", "good", "good", "good", "good", "wet", "wet", "wet", "best"] },
    { area: "Costa Rica · Caribbean coast", note: "Puerto Viejo, Cahuita, the Pacuare", months: ["good", "best", "best", "best", "good", "good", "good", "good", "best", "best", "good", "good"] },
    { area: "Belize", note: "Inland and the cayes", months: ["best", "best", "best", "best", "best", "good", "good", "good", "wet", "wet", "good", "best"] },
    { area: "Panama", note: "Pacific islands", months: ["best", "best", "best", "best", "good", "good", "good", "good", "wet", "wet", "wet", "best"] },
  ] as { area: string; note: string; months: ("best" | "good" | "wet")[] }[],
  airports: [
    ["San José, Costa Rica (SJO)", "The central valley; every Costa Rica route starts or ends here"],
    ["Liberia, Costa Rica (LIR)", "Closer to Arenal and the north"],
    ["Belize City (BZE)", "Small planes on to the cayes and the south"],
    ["Panama City (PTY)", "Connections on to the islands"],
  ] as [string, string][],
  transfers: [
    ["SJO → Arenal", "3 hours by road"],
    ["SJO → Manuel Antonio", "3 hours, or a 25-minute flight"],
    ["SJO → Osa Peninsula", "50-minute flight"],
    ["SJO → South Caribbean", "4 hours by road"],
  ] as [string, string][],
  notes: [
    "Belize: 14 live stays and 5 approved routes have no web address (slug) yet, and most stays have no coordinates; only Blancaneaux and Thatch Caye can be pinned.",
    "Panama: Islas Secas is filed twice (\"Isla Secas\" and \"Isla Secas - Panama\"); Isla Palenque is linked to Costa Rica but sits in Panama.",
    "Honduras is in the library with no live stays, so it has no door yet. The region's own months and facts fields are empty; the month band uses general climate and the approved Costa Rica notes.",
  ],
};
