import RateCardPanel from "./RateCardPanel";
import { cardFor, MORE } from "@/lib/content/rate-cards";

// Server wrapper: shows the rate-card booking panel on any page listed in the
// card's "pages" map (lib/content/rate-cards/more.json), or nothing.
const INCLUDED = ["Your room, suite or whole villa for the dates booked", "James Wild & Co trip support before and during your stay"];
const EXCLUDED = ["Flights and road or air transfers; James arranges them on request", "Anything the lodge's own rate excludes; confirmed with your quote"];
const POLICIES = [
  "Prices are estimates from MORE's published rates. The house confirms the exact price, what the rate includes, and the lodge's deposit and cancellation terms before anything is charged.",
  "Payment is not connected yet: checkout sends a Folio request only, and nothing is charged.",
];

export default function RateCardSection({ pageKey, name, photo, hostHref }: { pageKey: string; name: string; photo: string; hostHref?: string }) {
  const c = cardFor(pageKey);
  if (!c) return null;
  return <RateCardPanel name={name} partner="MORE" years={MORE.properties[c.property].years} rowKeys={c.rows.map((r) => r.key)} photo={photo} included={INCLUDED} excluded={EXCLUDED} policies={POLICIES} hostHref={hostHref} />;
}
