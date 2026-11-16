import { withActiveDepartures } from "@/lib/dates";
import type { ShipRecord } from "../types";
import FourSeasonsI from "./four-seasons-i.json";
import Amangati from "./amangati.json";
import SeaDreamI from "./seadream-i.json";
import SeaDreamII from "./seadream-ii.json";
import SeaDreamIII from "./seadream-iii.json";

// Timeless Voyages (James, 13 Nov 2026): Four Seasons Yachts' Four Seasons I, in service since 20 March 2026. She winters
// in the Caribbean and the Bahamas and summers in the Mediterranean; filed here under her winter waters. Facts, fares and
// images only from fourseasonsyachts.com and press.fourseasons.com, read 13 Nov 2026. Every image is the brand's own
// rendering and is labelled so. Fares are per suite for the voyage (fareUnit "suite"), shown as published and never
// converted to per person. Each sailing carries its lowest published fare; fares by suite follow from the brand's fare sheet.
const live = (x: unknown) => withActiveDepartures(x as ShipRecord);
export const CARIBBEAN_SHIPS: { data: ShipRecord; offerRefs: string[]; credit?: string }[] = [
  { data: live(FourSeasonsI), offerRefs: [], credit: "Four Seasons Yachts (renderings)" },
  // Aman at Sea (14 Nov 2026): Amangati, maiden voyage 7 May 2027. All images are the brand's renderings.
  { data: live(Amangati), offerRefs: [], credit: "Aman at Sea (renderings)" },
  // SeaDream Yacht Club (Preferred & Vetted partner; James, 15 and 16 Nov 2026): the twin yachts and SeaDream III, who
  // sails from 10 July 2029. Records are written by scripts/partners/seadream-build.mjs from seadream.com; every sailing
  // links to its own voyage page (lib/content/ships/seadream). Photographs: SeaDream Yacht Club. No picture of SeaDream III
  // is published yet; hers are captioned as what they are.
  { data: live(SeaDreamI), offerRefs: [], credit: "SeaDream Yacht Club" },
  { data: live(SeaDreamII), offerRefs: [], credit: "SeaDream Yacht Club" },
  { data: live(SeaDreamIII), offerRefs: [], credit: "SeaDream Yacht Club" },
];
