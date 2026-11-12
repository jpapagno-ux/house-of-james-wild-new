// What a photograph shows, and what a line of copy talks about, in one shared vocabulary
// (James, 12 Nov 2026: "when you say there's an experience or an activity ... actually place the photo that
// represents that statement"). A row on a stay page ("Hot air balloon adventure") only gets a photograph whose own
// description (its alt text, or its Cloudinary public id) names the same subject. A room photograph never stands in
// for an activity; when nothing matches, the row shows no photograph rather than the wrong one.

export type Subject =
  | "balloon" | "spa" | "yoga" | "pool" | "dining" | "cooking" | "bar" | "wine" | "beach" | "diving" | "boat" | "watersport" | "surf"
  | "wildlife" | "bird" | "walk" | "rice" | "culture" | "art" | "kids" | "golf" | "tennis" | "stars" | "fitness" | "room"
  | "view" | "garden" | "flight" | "fishing" | "ski" | "horse" | "bike" | "library" | "shop";

// Each subject: the words a line of copy uses, and the words a photograph's description uses.
const VOCAB: Record<Subject, [RegExp, RegExp]> = {
  balloon: [/balloon/i, /balloon/i],
  spa: [/\bspa\b|massage|treatment|wellness|holistic|healing|hammam|sauna|steam|thermal|onsen|bath(?:ing)? ritual|facial|therap/i, /\bspa\b|massage|treatment|wellness|hammam|sauna|steam|thermal|onsen|therap/i],
  yoga: [/yoga|meditat|pilates|breathwork|mindful/i, /yoga|meditat|pilates/i],
  pool: [/\bpool|swim|jacuzzi|hot tub|plunge/i, /\bpool|swim|jacuzzi|plunge/i],
  dining: [/dining|dinner|lunch|breakfast|brunch|restaurant|cuisine|chef|culinar|gastronom|picnic|\bfood|\bmeal|\bboma\b|barbecue|bbq|tasting menu|degustation|osteria|trattoria|bistro|caf[eé]\b|tapas/i, /dining|dinner|lunch|breakfast|restaurant|cuisine|chef|culinar|picnic|\bfood|\bdish|\bmeal|\bboma\b|barbecue/i],
  cooking: [/cooking|cookery|kitchen|baking/i, /cooking|cookery|kitchen|chef/i],
  bar: [/\bbar\b|cocktail|sundowner|champagne|\bgin\b|whisk(?:e)?y|rum\b|mixolog|\bdrinks?\b/i, /\bbar\b|cocktail|sundowner|champagne|drink/i],
  wine: [/wine|vineyard|vines|cellar|sommelier|vintage/i, /wine|vineyard|vines|cellar/i],
  beach: [/beach|\bsand\b|shore|coast|cove|bay\b/i, /beach|\bsand\b|shore|cove/i],
  diving: [/snorkel|\bdiv(?:e|es|ing)\b|scuba|reef|underwater|manta|turtle|whale shark|marine/i, /snorkel|\bdiv(?:e|er|ers|ing)\b|scuba|reef|underwater|manta|marine|coral/i],
  boat: [/\bboat|sail|cruise|yacht|canoe|dhow|jukung|mokoro|catamaran|speedboat|river trip|island hopping|zodiac/i, /\bboat|\bsail(?:ing|boat)?\b|cruise|yacht|canoe|dhow|jukung|mokoro|catamaran|zodiac/i],
  watersport: [/kayak|paddle|\bsup\b|windsurf|kite ?surf|water ?ski|wakeboard|jet ?ski|watersport/i, /kayak|paddle|windsurf|kite ?surf|water ?ski|wakeboard|jet ?ski/i],
  surf: [/\bsurf/i, /\bsurf/i],
  wildlife: [/game drive|safari|wildlife|elephant|\blion|leopard|rhino|buffalo|giraffe|cheetah|hippo|tracking|gorilla|chimp|whale|dolphin|penguin|orangutan|komodo|monkey|\bbig five\b|night drive|game viewing|sea lion|camel/i, /game drive|wildlife|elephant|\blion|leopard|rhino|buffalo|giraffe|cheetah|hippo|gorilla|chimp|whale|dolphin|penguin|orangutan|komodo|monkey|vehicle|zebra|antelope|\bowls?\b|sea lion|camel/i],
  bird: [/\bbird|birding|ornitholog|raptor|eagle|flamingo/i, /\bbird|eagle|flamingo|owl|heron|kingfisher|bee-?eater|hornbill/i],
  walk: [/\bwalk|hik(?:e|es|ing)\b|\btrek|trail|nature|on foot|bush walk|forest bath/i, /\bwalk|hik(?:e|er|ing)|\btrek|trail|path\b/i],
  rice: [/\brice\b|padd(?:y|ies)|subak/i, /\brice\b|padd(?:y|ies)/i],
  culture: [/dance|kecak|temple|cultur|ceremon|village|community|craft|heritage|histor|tradition|ritual|blessing|museum|market|local life|weaving|batik|offering|kava|meke|lovo/i, /dance|kecak|temple|cultur|ceremon|village|community|craft|heritage|tradition|ritual|blessing|museum|market|weaving|batik|offering|kava|meke/i],
  art: [/\bart\b|\barts\b|artist|gallery|collection|sculpture|paint/i, /\bart\b|artwork|artist|gallery|sculpture|painting/i],
  kids: [/\bkids?\b|child|family|families|young (?:explorer|ranger)/i, /\bkids?\b|child|family|ranger/i],
  golf: [/\bgolf/i, /\bgolf/i],
  tennis: [/tennis|padel|pickleball/i, /tennis|padel|court/i],
  stars: [/\bstar(?:s|gazing|lit)?\b|astronom|night sky|observatory|milky way/i, /\bstar|astronom|night sky|observatory|milky way/i],
  fitness: [/\bgym\b|fitness|workout|personal train/i, /\bgym\b|fitness/i],
  room: [/\bsuites?\b|\bvillas?\b|\brooms?\b|bedroom|bathroom|\bbeds?\b|accommodation|residence|\btents?\b|chalet|bungalow|pavilion|cottage|cabin|treehouse|living room/i, /\bsuites?\b|\bvillas?\b|\brooms?\b|bedroom|bathroom|\bbed\b|living|lounge|residence|\btent\b|chalet|bungalow|pavilion|cottage|cabin|treehouse|interior|\bdeck\b|terrace|bathtub|shower|daybed/i],
  view: [/\bviews?\b|panoram|sunset|sunrise|vista|cliff|clifftop|overlook|horizon|lagoon|river|desert|dune|lake|plains|valley|mountain|ocean|wilderness|remote|secluded|isolat/i, /\bview|panoram|sunset|sunrise|dusk|vista|cliff|aerial|horizon|island|lagoon|river|desert|dune|lake|plains|hills|mountain|valley|savann?ah?|ocean|seascape|landscape/i],
  garden: [/garden|grounds|orchard|estate|hectare|acre|landscape|setting|private island|location/i, /garden|grounds|orchard|aerial|exterior|landscape|estate|entrance|arrival|lobby/i],
  flight: [/helicopter|heli|seaplane|scenic flight|light aircraft|airstrip|\bflight/i, /helicopter|heli\b|seaplane|aircraft|airstrip|plane/i],
  fishing: [/fishing|\bfly[- ]fish|angling/i, /fishing|angler/i],
  ski: [/\bski|snowboard|snow\b|heli-?ski/i, /\bski|snow/i],
  horse: [/horse|riding|equestrian|polo/i, /horse|riding|equestrian|polo/i],
  bike: [/bicycl|\bbikes?\b|cycling|e-?bike|mountain bik/i, /bicycl|\bbikes?\b|cycling/i],
  library: [/library|books|reading room/i, /library|books/i],
  shop: [/boutique|\bshop/i, /boutique|\bshop/i],
};
const SUBJECTS = Object.keys(VOCAB) as Subject[];
// the place itself, as opposed to things to do or have there
const SETTING: Subject[] = ["view", "garden", "beach", "rice"];
// (a row that is only about the setting, "views over the lagoon", takes a setting photograph)

export function rowSubjects(text: string): Subject[] { return SUBJECTS.filter((k) => VOCAB[k][0].test(text)); }
// photograph words must start a word: "nomadetempleibiza" is a file name, not a temple
const PHOTO = Object.fromEntries(SUBJECTS.map((k) => [k, new RegExp(`\\b(?:${VOCAB[k][1].source})`, "i")])) as Record<Subject, RegExp>;
export function photoSubjects(desc: string): Subject[] { const d = subjectOf(desc); return SUBJECTS.filter((k) => PHOTO[k].test(d)); }

/** The part of an alt that describes the picture: "Pool at sunset at Kichwa Tembo, Kenya" → "Pool at sunset". The
 *  place name is left out (otherwise "Island" in a hotel's name reads as a view of an island); a numbered
 *  "photograph 3" describes nothing. */
export function subjectOf(alt: string): string {
  if (/:\s*photograph \d+$/i.test(alt)) return "";
  const i = alt.lastIndexOf(" at ");
  return i > 0 && /[A-Z&]/.test(alt.slice(i + 4)) ? alt.slice(0, i) : alt; // "at sunset" stays; "at andBeyond Lake Manyara" goes
}

// the subjects that are things to do or have, not the place itself
const DOING = (k: Subject) => !SETTING.includes(k) && k !== "room";

// animals and named sports are specific: a whale shark photograph is not a Komodo dragon, a game vehicle is not an
// elephant, a paddleboarder is not a kitesurfer
const ANIMALS = /kite ?surf|paddle ?board|kayak|jet ?ski|water ?ski|windsurf|\bsurf|balloon|helicopter|seaplane|elephant|\blions?\b|leopard|rhino|buffalo|giraffe|cheetah|hippo|gorilla|chimp|whale shark|whales?\b|dolphin|penguin|orangutan|komodo|monkey|zebra|turtle|manta|shark|sea lion|camel|horse|wolf|bear|bison|elk|kangaroo|koala|crocodile|wild dog|hyena/gi;
const animals = (t: string) => new Set((t.toLowerCase().match(ANIMALS) ?? []).map((x) => x.replace(/\s+/g, "").replace(/s$/, "")));
const STOP = new Set(["private", "guests", "guest", "views", "every", "their", "above", "below", "under", "beside", "along", "island", "resort", "villas", "villa", "suite", "suites", "rooms", "around", "through", "there", "where", "which", "about", "local", "daily", "included", "with", "from", "each", "your", "that", "this", "over", "into", "them", "more", "most", "only", "also", "what", "when", "have", "they", "days", "stay"]);
const words = (t: string) => new Set(t.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !STOP.has(w)));

/** How well a photograph fits a row: 0 = it must not be used for that row. */
export function fit(row: string, desc: string): number {
  const want = rowSubjects(row);
  const d = subjectOf(desc);
  const has = photoSubjects(d);
  if (!has.length) return 0; // a photograph nobody has described is never placed beside a claim
  if (!want.length) return 0; // a line that names nothing a photograph can show (a butler, a guide) gets none
  const hits = want.filter((w) => has.includes(w));
  if (!hits.length) return 0;
  // a line about something to do needs a photograph of the first thing it names ("Diving ... by boat" is diving)
  const doing = want.filter(DOING).sort((a, b) => row.search(VOCAB[a][0]) - row.search(VOCAB[b][0]));
  if (doing.length && !hits.includes(doing[0])) return 0;
  const rw = words(row);
  const shared = [...words(d)].filter((w) => rw.has(w)).length;
  // a line about the place ("the confluence of the Ruak and Mekong") needs a photograph of that place, by name
  if (!doing.length && !want.includes("room") && !shared) return 0;
  // (so a bedroom photograph never stands in for the spa: it shares no subject a spa row names)
  const ra = animals(row);
  if (ra.size && ![...animals(d)].some((x) => ra.has(x))) return 0;
  return 10 * hits.length + 3 * shared - has.filter((h) => !want.includes(h)).length;
}
