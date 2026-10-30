// The house field guides (James Wild & Co., Cloudinary wildco/voyages/field-guides and the PDFs
// beside them). Each place has a full field guide and, for most, a four-page quick guide.
// Both are offered free for an email address (GuideOffer + /api/guides); the address goes to
// Klaviyo once the keys are in Vercel. Placement: `places` lists every page key the guide
// belongs on — a country slug, a guide slug, a region slug or a trip id.
const C = "https://res.cloudinary.com/jhlnq5h5";

export type GuideFile = { url: string; pages?: number; mb: number };
export type FieldGuide = {
  key: string;
  title: string; // printed on the card
  edition?: string; // "Field Guide No. 03"
  place: string; // the place it covers, for the card and the sign-up record
  blurb: string;
  full: GuideFile;
  quick?: GuideFile;
  print?: GuideFile; // a print-resolution edition, when there is one
  cover?: string; // page one as an image (Cloudinary renders PDF pages); omitted for raw files
  places: string[];
};

const pdf = (v: string, id: string) => `${C}/image/upload/${v}/${id}.pdf`;
const cover = (v: string, id: string) => `${C}/image/upload/pg_1,w_480,c_limit,q_auto,f_jpg/${v}/${id}.jpg`;

export const FIELD_GUIDES: FieldGuide[] = [
  {
    key: "costa-rica", title: "Costa Rica, the Long Way Round", edition: "Field Guide No. 03", place: "Costa Rica",
    blurb: "Both coasts, the volcano and the cloud forest: when to go, how to move between them, and the places James sends people.",
    full: { url: pdf("v1792935741", "costa-rica-field-guide-james-wild-co"), pages: 24, mb: 4.3 },
    quick: { url: pdf("v1792935742", "costa-rica-quick-guide-james-wild-co"), pages: 4, mb: 1.8 },
    print: { url: pdf("v1792871349", "costa-rica-field-guide-james-wild-co-print"), pages: 24, mb: 10.5 },
    cover: cover("v1792935741", "costa-rica-field-guide-james-wild-co"),
    places: ["costa-rica", "central-america", "two-oceans-one-volcano", "the-original-costa-route-7-days", "the-original-costa-route-10-days", "the-original-costa-route-coast-to-coast"],
  },
  {
    key: "belize", title: "Belize", place: "Belize",
    blurb: "The reef, the cayes and the Maya rainforest, with the months to go and the way between them.",
    full: { url: `${C}/raw/upload/v1792940189/belize-field-guide-james-wild-co.pdf`, mb: 4.3 },
    quick: { url: `${C}/raw/upload/v1792940191/belize-quick-guide-james-wild-co.pdf`, mb: 1.7 },
    places: ["belize", "central-america"],
  },
  {
    key: "galapagos", title: "The Galápagos Islands", place: "Galápagos",
    blurb: "Which islands, which yacht, which months: the wildlife calendar and how the small ships move between the islands.",
    full: { url: pdf("v1792935746", "galapagos-field-guide-james-wild-co"), pages: 19, mb: 4.1 },
    quick: { url: pdf("v1792935748", "galapagos-quick-guide-james-wild-co"), pages: 4, mb: 1.9 },
    cover: cover("v1792935746", "galapagos-field-guide-james-wild-co"),
    places: ["ecuador-galapagos", "south-america"],
  },
  {
    key: "indonesia", title: "Indonesia by Sea", place: "Indonesia",
    blurb: "The islands by small ship: Raja Ampat, Komodo and the Spice Islands, the seasons for each, and how to reach them.",
    full: { url: pdf("v1792935735", "indonesia-field-guide-james-wild-co"), pages: 19, mb: 4.7 },
    quick: { url: pdf("v1792935737", "indonesia-quick-guide-james-wild-co"), pages: 4, mb: 2.3 },
    cover: cover("v1792935735", "indonesia-field-guide-james-wild-co"),
    places: ["indonesia", "asia"],
  },
  {
    key: "raja-ampat-komodo-bali", title: "Raja Ampat, Komodo and Bali", place: "Raja Ampat, Komodo and Bali",
    blurb: "The two great voyages of eastern Indonesia, and a few nights in Bali either side.",
    full: { url: pdf("v1792654524", "raja-ampat-komodo-bali-field-guide-james-wild-co"), pages: 19, mb: 6.4 },
    quick: { url: pdf("v1792935737", "indonesia-quick-guide-james-wild-co"), pages: 4, mb: 2.3 },
    cover: cover("v1792654524", "raja-ampat-komodo-bali-field-guide-james-wild-co"),
    places: ["raja-ampat", "komodo", "10-day-raja-ampat-north", "5-day-komodo-island"],
  },
  {
    key: "iceland", title: "Iceland", place: "Iceland",
    blurb: "Fire, ice and the long light: the seasons, the roads and the places worth the drive.",
    full: { url: pdf("v1792937444", "iceland-field-guide-james-wild-co"), pages: 20, mb: 4.4 },
    quick: { url: pdf("v1792937445", "iceland-quick-guide-james-wild-co"), pages: 4, mb: 1.8 },
    cover: cover("v1792937444", "iceland-field-guide-james-wild-co"),
    places: ["iceland", "polar-arctic"],
  },
  {
    key: "greenland", title: "Greenland", place: "Greenland",
    blurb: "The ice sheet, the fjords and the small ships that reach them, month by month.",
    full: { url: pdf("v1792937451", "greenland-field-guide-james-wild-co"), pages: 20, mb: 4.6 },
    quick: { url: pdf("v1792937453", "greenland-quick-guide-james-wild-co"), pages: 4, mb: 2.1 },
    cover: cover("v1792937451", "greenland-field-guide-james-wild-co"),
    places: ["greenland", "polar-arctic"],
  },
];

/** The guides that belong on a page, by its key (country, guide, region or trip id). */
export const guidesFor = (...keys: string[]) => FIELD_GUIDES.filter((g) => keys.some((k) => g.places.includes(k)));
export const guideByKey = (key: string) => FIELD_GUIDES.find((g) => g.key === key);
