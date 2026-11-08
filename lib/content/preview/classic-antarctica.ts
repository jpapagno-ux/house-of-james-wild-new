// The Classic Antarctica Air-Cruise openings (previews A and B, James, 8 Nov 2026). Facts from the voyage record
// (lib/content/polar/voyages/classic-antarctica-air-cruise.json, Antarctica21's site); photographs from Cloudinary with
// their recorded credits: Antarctica21 partner images, licensed Getty images, and James's own March 2020 Peninsula
// photographs (another ship, so used only for the place, captioned as his).
import { photo, type OpeningGlance, type OpeningWhy } from "@/components/polar/VoyageOpening";
import type { HeroFrame } from "@/components/exceptional-few/ScrollHero";

const A21 = "Photograph courtesy of Antarctica21";
const GETTY = "Getty Images";
const JAMES = "James Papagno, March 2020";

export const CLASSIC = {
  designation: "Voyages · Air-Cruise · Antarctica21",
  title: "Classic Antarctica Air-Cruise",
  place: "Punta Arenas to the South Shetlands and the Antarctic Peninsula",
  line: "Eight days, and no Drake crossing: a two-hour flight to King George Island, then four days among the South Shetlands and the western Peninsula aboard a ship of 88 guests at most.",
  pathway: "PATH-04" as const,
  glance: [["Length", "8 days, 7 nights"], ["Flight", "About 2 hours each way"], ["Guests", "Up to 88"], ["From", "US$15,995 pp"]] as OpeningGlance,
  frames: [
    { ...photo("GettyImages-520530202", "A small boat and kayaks beneath a tidewater glacier face", GETTY), caption: "The Peninsula" },
    { ...photo("jwco/partners/antarctica21/aircraft-landing-king-george-island", "Antarctica21 charter flight landing on King George Island", A21), caption: "The way in: King George Island" },
    { ...photo("jwco/partners/antarctica21/aircraft-over-ship", "Aircraft flying low over snowy mountains and the sea with an expedition ship below", A21), caption: "Air and ship" },
  ] as HeroFrame[],
  why: [
    { title: "Fly over the Drake", line: "About two hours by air from Punta Arenas to King George Island, so the days go to the ice, not the crossing.", photo: photo("jwco/partners/antarctica21/aircraft-in-flight", "Four engine Antarctic charter aircraft in flight", A21, undefined, 1600) },
    { title: "Ashore every day", line: "Daily Zodiac landings led by guides among the South Shetlands and the western Peninsula, with talks on board.", photo: photo("jwco/partners/antarctica21/zodiac-among-ice", "Guests in an inflatable boat surrounded by ice", A21, undefined, 1600) },
    { title: "Eighty-eight guests, at most", line: "Magellan Explorer or Magellan Discoverer: a small ship, so more time ashore for everyone on board.", photo: photo("jwco/partners/antarctica21/adelie-penguins", "A group of Adelie penguins on ice in Antarctica", A21, undefined, 1600) },
  ] as OpeningWhy[],
  hero: photo("GettyImages-567085269", "Two walkers on snow below a cloud-wrapped peak", GETTY, "Ashore on the Peninsula"),
  close: { photo: photo("wildco/voyages/journal/captains-log-antarctica-2020/zodiac-between-giant-icebergs", "A Zodiac full of guests passes between two massive icebergs", JAMES, "A Zodiac between the bergs"), line: "James sailed the Peninsula in February and March 2020. This is the light he still talks about." },
};
