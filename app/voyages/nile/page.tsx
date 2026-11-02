import Link from "next/link";
import { HubSection } from "@/components/hub/Hub";
import VoyageHub from "@/components/ships/VoyageHub";
import { watersHub } from "@/lib/content/ships/hubs";
import { shipsOn } from "@/lib/content/ships";
import { factOf, fromPrice, nightsLabel, priceLine, routeOf, undash } from "@/lib/content/ships/types";
import { buildMetadata } from "@/lib/seo";

// /voyages/nile: the Nile waters hub (Egypt) on the shared hub frame (VoyageHub). Lists the
// A&K Sanctuary ships from the registry and answers "Which Nile cruise should I choose?" from
// the ships' own data only, then compares them side by side.
const H = watersHub("nile");
const PATH = H.path;
const ships = shipsOn("nile");
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const low = Math.min(...ships.map((s) => fromPrice(s) ?? Infinity));

export const metadata = buildMetadata({
  title: "Nile Cruises in Egypt: A&K Sanctuary Ships Compared",
  description: `${ships.length} A&K Sanctuary ships on the Nile, Luxor to Aswan and on to Abu Simbel, compared by nights, guests and cabins${Number.isFinite(low) ? `, with cruise fares from ${usd(low)} per person` : ""}. Plan your Egypt river voyage with James Wild & Co.`,
  path: PATH,
  image: ships[0] ? { url: ships[0].hero.url, alt: ships[0].hero.alt } : undefined,
});

function answer() {
  const parts = ships.map((s) => {
    const g = factOf(s, /guest/i);
    return `${s.name} (${s.type === "dahabiya" ? "a dahabiya" : "a riverboat"}${g ? ` for ${g} guests` : ""}, ${nightsLabel(s)}${s.status !== "sailing" ? `, ${s.status}` : ""}${s.suits[0] ? `; best for ${s.suits[0].who.charAt(0).toLowerCase()}${s.suits[0].who.slice(1)}` : ""})`;
  });
  return `Abercrombie & Kent sails ${ships.length} A&K Sanctuary ships on the Nile: ${parts.join(". ")}. Each ship below lists its cabins, deck plan, day by day and published fares${Number.isFinite(low) ? `; cruise-only fares start at ${usd(low)} per person` : ""}.`;
}

const FAQS = [
  { q: "Riverboat or dahabiya on the Nile?", a: `A riverboat carries more guests with more cabin choice and a pool; the dahabiya, ${ships.filter((s) => s.type === "dahabiya").map((s) => `${s.name} (${factOf(s, /guest/i)} guests)`).join(", ")}, is a traditional Nile sailing boat sold as a private charter or by the cabin inside A&K journeys.` },
  { q: "How long is a Nile cruise?", a: `${ships.map((s) => `${s.name}: ${nightsLabel(s)}`).join("; ")}, between Luxor and Aswan.` },
  { q: "How are the Nile fares shown?", a: "As Abercrombie & Kent publishes them: per person, two sharing, by season and cabin, with past seasons removed automatically. Where A&K sells a ship only inside a land and cruise journey, the page says so and labels the fare." },
];

export default function NileHub() {
  return (
    <VoyageHub {...H} answer={answer()} faqs={FAQS} after={<>
        <HubSection eyebrow="Side by side" title="How Do the Nile Ships Compare?" id="nile-compare">
          <div className="hidden md:block overflow-x-auto border ledger-border">
            <table className="w-full text-[14px] border-collapse min-w-[760px]">
              <caption className="sr-only">The A&amp;K Sanctuary Nile ships compared</caption>
              <thead><tr className="bg-paper-card text-left">{["Ship", "Route", "Nights", "Guests", "Ages", "Cabins", "From", "What the fare covers"].map((h) => <th key={h} scope="col" className="ledger-eyebrow font-normal px-3 py-3">{h}</th>)}</tr></thead>
              <tbody>
                {ships.map((s) => {
                  const p = priceLine(s);
                  const cabins = s.cabins.reduce((a, c) => a + (c.count ?? 0), 0);
                  return (
                    <tr key={s.slug} className="border-t ledger-border align-top">
                      <th scope="row" className="px-3 py-3 text-left font-normal"><Link href={`/voyages/ships/${s.slug}`} className="ledger-display text-[17px] underline-offset-4 hover:underline">{s.name}</Link><span className="block text-[12px] ledger-muted">{s.type === "dahabiya" ? "Dahabiya" : "Riverboat"}{s.status !== "sailing" ? ` · ${s.status}` : ""}</span></th>
                      <td className="px-3 py-3">{routeOf(s)}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{nightsLabel(s)}</td>
                      <td className="px-3 py-3">{factOf(s, /guest/i) ?? "To confirm"}</td>
                      <td className="px-3 py-3">{undash(factOf(s, /child|age/i) ?? "Ask us")}</td>
                      <td className="px-3 py-3">{cabins || s.cabins.length}</td>
                      <td className="px-3 py-3 whitespace-nowrap"><span className="ledger-eyebrow block">{p.label}</span><span className="ledger-display ledger-crimson text-[16px]">{p.amount}</span></td>
                      <td className="px-3 py-3 text-[13px] ledger-muted max-w-[16rem]">{p.kind === "cruise" ? "Cruise only, per person, two sharing" : p.basis.replace(/^per person for /, "Per person, ")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ul className="md:hidden space-y-3">
            {ships.map((s) => {
              const p = priceLine(s);
              const rows: [string, string][] = [["Route", routeOf(s)], ["Nights", nightsLabel(s)], ["Guests", factOf(s, /guest/i) ?? "To confirm"], ["Ages", undash(factOf(s, /child|age/i) ?? "Ask us")], ["Cabins", String(s.cabins.reduce((a, c) => a + (c.count ?? 0), 0) || s.cabins.length)], [p.label, `${p.amount}${p.kind === "journey" ? " (full A&K journey)" : ""}`]];
              return (
                <li key={s.slug} className="border ledger-border p-4">
                  <Link href={`/voyages/ships/${s.slug}`} className="ledger-display text-[19px] underline-offset-4 hover:underline">{s.name}</Link>
                  <dl className="mt-2 text-[14px]">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-1.5 border-t ledger-rule"><dt className="ledger-eyebrow pt-0.5">{k}</dt><dd className="text-right">{v}</dd></div>)}</dl>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[12.5px] ledger-muted">Fares as published by Abercrombie &amp; Kent on 1 November 2026; we confirm them live when you ask.</p>
        </HubSection>
    </>} />
  );
}
