import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { TRIPS, type Trip, type TripImg } from "./trips";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { SAMPLE_ALIIKAI } from "./preview/aliikai";

// Photos: TRIP_IMAGES below, plus any "images" map in the trip's own JSON, keyed by
// the photo label (days, lodges), the experience name or the feature title. Add one
// and it appears in its place on the page; labels without one keep the marked frame.
// Page plumbing for the route pages: which trip lives at which URL, the map
// figure, photos already in the library, and metadata. Pages stay noindex
// until James approves the copy (trip.copy_approved; the Ledger Proofs sheet).

export const byPath = (p: string): Trip | undefined => Object.values(TRIPS).find((t) => t.seo.path === p);
export const paramsFor = (kind: Trip["kind"]) => Object.values(TRIPS).filter((t) => t.kind === kind).map((t) => t.seo.path.split("/").filter(Boolean).slice(1));

// Empty when the waters have no engraved chart yet; the page then lists the stops without the map.
export function mapHtml(t: Trip) {
  const f = path.join(process.cwd(), "lib/content/trips", `${t.id}.map.html`);
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
}

export function tripMetadata(t: Trip): Metadata {
  const m = TRIP_IMAGES[t.id];
  const img = m?.hero ?? TRIP_SLIDES[t.id]?.[0] ?? (m ? Object.values(m.images)[0] : undefined) ?? Object.values(t.images ?? {})[0];
  const image = img ? { url: img.url.startsWith("/") ? absoluteUrl(img.url) : img.url, alt: img.alt } : undefined;
  return { ...buildMetadata({ title: t.seo.title, description: t.seo.description, path: t.seo.path, image, noindex: !t.copy_approved }), ...(t.seo.keywords ? { keywords: t.seo.keywords } : {}) };
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

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/";
// Tortuga Lodge's own photos (tortugalodge.com), re-hosted on Cloudinary and delivered through AI upscale + auto improve.
const TL = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1200,h_1200/e_upscale/e_improve/c_limit,w_2560/q_auto:good/f_jpg/wildco/costa-rica/tortuga-lodge/";
const KOM = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1200,h_1200/e_upscale/e_improve/c_limit,w_2560/q_auto:good/f_jpg/wildco/voyages/vessels/aliikai/komodo/";
const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474/";
const WF = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/";

// Hero slides: the place first, then the people and the water. Cloudinary
// originals where the house has them; Costa Rica has none for this route yet,
// so its slides come from the country page and the route's stays in the library.
const CAY = (id: string, up = false) => `https://res.cloudinary.com/jhlnq5h5/image/upload/${up ? "e_upscale/" : ""}c_limit,w_2560/q_auto:good/f_jpg/jwco/collections/cayuga-collection/${id}`;
export const TRIP_SLIDES: Record<string, TripImg[]> = {
  // Cayuga's own photos (cayugacollection.com gallery), re-hosted on Cloudinary with alt and place.
  "the-original-costa-route-7-days": [
    { url: CAY("senda-monteverde/senda-monteverde-04"), alt: "A balcony looking over the cloud forest at Senda Monteverde" },
    { url: CAY("gallery/wildlife-04"), alt: "A resplendent quetzal in flight among cloud-forest trees at Senda Monteverde" },
    { url: CAY("kura/kura-01", true), alt: "A guest in Kura's infinity pool above the Pacific coast at Uvita" },
    { url: CAY("offers/kura-offer"), alt: "Kura's infinity pool and open lounge lit at dusk above the forest at Uvita" },
    { url: CAY("gallery/wildlife-10", true), alt: "A humpback whale breaching beside a whale-watching boat" },
  ],
  "the-original-costa-route-10-days": [
    { url: CAY("senda-monteverde/senda-monteverde-04"), alt: "A balcony looking over the cloud forest at Senda Monteverde" },
    { url: CAY("arenas-del-mar/arenas-del-mar-01", true), alt: "A rainforest headland meeting a turquoise beach at Manuel Antonio, from the air" },
    { url: CAY("gallery/beachfront-05"), alt: "A mother and small child playing in the surf at sunset at Arenas del Mar" },
    { url: CAY("gallery/beachfront-08"), alt: "A forested island shore and calm sea from the air at Isla Palenque" },
    { url: CAY("gallery/beachfront-01"), alt: "A couple picnicking on a sandy beach with a basket of tropical fruit at Isla Palenque" },
  ],
  "the-original-costa-route-coast-to-coast": [
    { url: CAY("aguas-claras/aguas-claras-11", true), alt: "The Caribbean coast and reef near Playa Chiquita from the air" },
    { url: CAY("aguas-claras/aguas-claras-05"), alt: "A swimmer in a clear tide pool on the reef at Playa Chiquita, near Aguas Claras" },
    { url: CAY("senda-monteverde/senda-monteverde-04"), alt: "A balcony looking over the cloud forest at Senda Monteverde" },
    { url: CAY("arenas-del-mar/arenas-del-mar-01", true), alt: "A rainforest headland meeting a turquoise beach at Manuel Antonio, from the air" },
    { url: CAY("gallery/beachfront-02"), alt: "A rocky headland and calm bay in soft evening light at Arenas del Mar" },
  ],
  "5-day-komodo-island": [
    { url: `${KOM}padar-island-aerial`, alt: "Padar Island's ridges and crescent bays from the air, Komodo National Park" },
    { url: `${KOM}pink-beach`, alt: "A small boat in the shallows off the pink sand of a Komodo beach" },
    { url: `${KOM}tatawa-diving`, alt: "A diver over a coral reef full of fish at Tatawa, Komodo" },
    { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/wildco/voyages/vessels/aliikai/DJI_0472-1", alt: "Aliikai under full sail from the air" },
    { url: `${KOM}labuan-bajo-harbour`, alt: "Labuan Bajo harbour, Flores, with boats at anchor in turquoise water" },
  ],
  "10-day-raja-ampat-north": [
    { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/wildco/voyages/vessels/aliikai/DJI_0472-1", alt: "Aliikai under full sail from the air" },
    { url: `${CLD}wildco/voyages/home-hero/02-raja-ampat-lagoons`, alt: "Raja Ampat: the Wayag lagoons and karst islands from above" },
    { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1200,h_1200/e_upscale/e_improve/c_limit,w_2560/q_auto:good/f_jpg/wildco/voyages/vessels/aliikai/28LilyRose", alt: "Aliikai under sail on open water" },
    { url: `${CLD}wildco/voyages/home-hero/03-over-under-reef`, alt: "Raja Ampat: a snorkeller over the reef, half above and half below the water" },
    { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1200,h_1200/e_upscale/e_improve/c_limit,w_2560/q_auto:good/f_jpg/wildco/voyages/vessels/aliikai/21LilyRose", alt: "Evening on Aliikai's deck by lantern light" },
  ],
  "two-oceans-one-volcano": [
    { url: `${TL}tortuguero-river-mouth-aerial`, alt: "Tortuguero from the air: the river, the rainforest and the Caribbean beyond" },
    { url: `${B44}356ed0eb6_7e9d9df78_68536661a63c889514f5ad56_Aerial-NayaraResortSpaandGardens-CostaRica-CRHotel.webp`, alt: "Arenal Volcano over the rainforest, Costa Rica" },
    { url: `${WF}6863018671b62ea7c452cea0_CostaRicaMAHero1.jpg`, alt: "Sunset over Costa Rica's Pacific coast and rainforest" },
    { url: `${B44}c6d307bd2_a9c870409_6a3c14df1aa3fb323db7506e_DJI_0312copy-scaled.webp`, alt: "Hot pools in the Monteverde cloud forest, Costa Rica" },
    { url: `${B44}0f51b6743_0a26a5a99_6875d5616d30fc4f9eef2e66_6853672ce9dad04c6a2a841c_Nayara_2520Springs_Cielito_252.`, alt: "Nayara Springs, Arenal: the pool among the rainforest flowers" },
    { url: `${WF}69ea4b8595c2a2baa95a6699_Costa%20Rica%20-%20Section%201%20Image.jpg`, alt: "Arenal Volcano above the forest, Costa Rica" },
  ],
};

export const TRIP_IMAGES: Record<string, { hero?: TripImg; images: Record<string, TripImg> }> = {
  "5-day-komodo-island": {
    images: {
      "PHOTO · LABUAN BAJO HARBOUR": { url: `${KOM}labuan-bajo-harbour`, alt: "Labuan Bajo harbour, Flores, with boats at anchor in turquoise water" },
      "PHOTO · PADAR FROM ABOVE": { url: `${KOM}padar-island-aerial`, alt: "Padar Island's ridges and crescent bays from the air" },
      "PHOTO · PINK BEACH": { url: `${KOM}pink-beach`, alt: "A small boat in the shallows off the pink sand of a Komodo beach" },
      "PHOTO · ALIIKAI AT ANCHOR": { url: `${KOM}surfboard-lagoon`, alt: "A guest on a board in calm turquoise water, Aliikai at anchor beyond" },
      "The Padar climb": { url: `${KOM}padar-island-aerial`, alt: "Padar Island's three bays from above" },
      "Pink Beach": { url: `${KOM}pink-beach`, alt: "Pink sand and clear shallows on Komodo" },
      "Mantas at Manta Point": { url: `${KOM}tatawa-diving`, alt: "A diver over a Komodo reef full of fish" },
    },
  },
  "10-day-raja-ampat-north": {
    hero: SAMPLE_ALIIKAI.hero,
    images: {
      "PHOTO · ALIIKAI AT SORONG": SAMPLE_ALIIKAI.hero,
      "PHOTO · KRI REEF": { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/wildco/guides/raja-ampat-indonesia/destination/diver-fusiliers-reef", alt: "A diver among fusiliers on a Raja Ampat reef" },
      "PHOTO · WOFOH CORAL WALL": { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/wildco/voyages/home-hero/03-over-under-reef", alt: "A Raja Ampat reef and island, above and below the water" },
      "A handcrafted phinisi": SAMPLE_ALIIKAI.hero,
      "PHOTO · FAREWELL ON DECK": { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1200,h_1200/e_upscale/e_improve/c_limit,w_2560/q_auto:good/f_jpg/wildco/voyages/vessels/aliikai/19LilyRose", alt: "Aliikai at anchor at sunset" },
      "Dinner on deck": { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1200,h_1200/e_upscale/e_improve/c_limit,w_2560/q_auto:good/f_jpg/wildco/voyages/vessels/aliikai/21LilyRose", alt: "Dinner on Aliikai's deck by lantern light" },
      "Dive deck with Nitrox": A.dive,
      "Kayaks and paddleboards": A.sup,
      "Dining on deck": A.deck,
      "PHOTO · PENEMU LOOKOUT": A.trek,
      "PHOTO · WAYAG KARSTS": { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/wildco/voyages/home-hero/02-raja-ampat-lagoons", alt: "The Wayag lagoons and karst islands from above" },
      "The Wayag peak": A.islands,
      "Guided diving with Nitrox": A.dive,
      "Snorkelling, kayaks and paddleboards": A.sup,
      "Mantas at Arborek": A.snork,
    },
  },
  "two-oceans-one-volcano": {
    images: {
      "PHOTO · TORTUGUERO FROM THE AIR": { url: `${TL}tortuguero-river-aerial`, alt: "Tortuguero from the air: the river and Tortuga Lodge in the rainforest" },
      "PHOTO · CANAL AT DAWN": { url: `${TL}tortuguero-canal`, alt: "A Tortuguero canal through the rainforest" },
      "PHOTO · GREEN TURTLE AT NIGHT": { url: `${TL}sea-turtle-hatchling`, alt: "A sea turtle hatchling on the sand at Tortuguero" },
      "Turtle nesting walk": { url: `${TL}sea-turtle-hatchling`, alt: "A sea turtle hatchling on the sand at Tortuguero" },
      "Lodge from the river": { url: `${TL}tortuga-lodge-from-the-river`, alt: "Tortuga Lodge & Gardens from the river" },
      "Riverfront room": { url: `${TL}riverfront-room`, alt: "A riverfront room at Tortuga Lodge, opening onto the water" },
      "Canal dock at dawn": { url: `${TL}walkway-to-the-river-pool`, alt: "The walkway down to Tortuga Lodge's riverside pool" },
      "PHOTO · ARENAL FROM THE ROAD": { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/356ed0eb6_7e9d9df78_68536661a63c889514f5ad56_Aerial-NayaraResortSpaandGardens-CostaRica-CRHotel.webp", alt: "Arenal Volcano over the rainforest, Costa Rica" },
      "Villa plunge pool": { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/0f51b6743_0a26a5a99_6875d5616d30fc4f9eef2e66_6853672ce9dad04c6a2a841c_Nayara_2520Springs_Cielito_252.", alt: "Nayara Springs: a pool among the rainforest flowers" },
      "PHOTO · CLOUD FOREST": { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/cb713da7a_f961c2e03_6a3c155578b6a51b409e082e_7-Watch-the-Clouds-Blow-By.webp", alt: "The Monteverde cloud forest from a balcony" },
      "PHOTO · PLAYA GUIONES AT SUNSET": { url: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6863018671b62ea7c452cea0_CostaRicaMAHero1.jpg", alt: "Sunset over Costa Rica's Pacific coast" },
    },
  },
};
