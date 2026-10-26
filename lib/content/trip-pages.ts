import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { TRIPS, type Trip, type TripImg } from "./trips";
import { buildMetadata } from "@/lib/seo";
import { SAMPLE_ALIIKAI } from "./preview/aliikai";

// Page plumbing for the route pages: which trip lives at which URL, the map
// figure, photos already in the library, and metadata. Pages stay noindex
// until James marks prices final (trip.prices_final).

export const byPath = (p: string): Trip | undefined => Object.values(TRIPS).find((t) => t.seo.path === p);
export const paramsFor = (kind: Trip["kind"]) => Object.values(TRIPS).filter((t) => t.kind === kind).map((t) => t.seo.path.split("/").filter(Boolean).slice(1));

export function mapHtml(t: Trip) {
  return fs.readFileSync(path.join(process.cwd(), "lib/content/trips", `${t.id}.map.html`), "utf8");
}

export function tripMetadata(t: Trip): Metadata {
  return buildMetadata({ title: t.seo.title, description: t.seo.description, path: t.seo.path, noindex: !t.prices_final });
}

// Library photos (Aliikai's owner images, imported from wildearthstays.com),
// keyed by the photo labels in James's files. Labels without a match keep
// their marked "photo to come" frame.
const CDN = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";
const A = {
  dive: { url: `${CDN}/684792b32ba1312195bf8bbe_Aliikai-Diving.webp`, alt: "Diving a Raja Ampat reef from Aliikai" },
  snork: { url: `${CDN}/684792f157be66f5080ba354_Aliikai-Snorkeling.webp`, alt: "Snorkelling over coral from Aliikai" },
  sup: { url: `${CDN}/6847928005301fb963e4a458_Aliikai-Paddleboard.webp`, alt: "Stand-up paddle boarding in a Raja Ampat lagoon" },
  trek: { url: `${CDN}/68479362f1b8c50f5e581446_Aliikai-Trekking.webp`, alt: "Trekking to a viewpoint over Raja Ampat" },
  islands: { url: `${CDN}/6847945c5f59e88767340450_Aliikai-RemoteIslands.webp`, alt: "Limestone islands of Raja Ampat" },
  deck: { url: `${CDN}/68479470c30afaeff22d4c37_Aliikai-InformalSchedule.webp`, alt: "Sunset on Aliikai's deck" },
  reef: { url: `${CDN}/6847944508e422dca6ac9dfe_Aliikai-Wildlife%20(1).webp`, alt: "Reef life in Raja Ampat" },
} satisfies Record<string, TripImg>;

export const TRIP_IMAGES: Record<string, { hero?: TripImg; images: Record<string, TripImg> }> = {
  "10-day-raja-ampat-north": {
    hero: SAMPLE_ALIIKAI.hero,
    images: {
      "PHOTO · ALIIKAI AT SORONG": SAMPLE_ALIIKAI.hero,
      "PHOTO · KRI REEF": A.reef,
      "PHOTO · PENEMU LOOKOUT": A.trek,
      "PHOTO · WAYAG KARSTS": A.islands,
      "PHOTO · FAREWELL ON DECK": A.deck,
      "The Wayag peak": A.islands,
      "Guided diving with Nitrox": A.dive,
      "Snorkelling, kayaks and paddleboards": A.sup,
      "Mantas at Arborek": A.snork,
      "Dinner on deck": A.deck,
    },
  },
  "two-oceans-one-volcano": { images: {} },
};
