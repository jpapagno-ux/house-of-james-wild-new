import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import JsonLd from "@/components/ledger/JsonLd";
import ComingCard from "@/components/coming/ComingCard";
import { COMING, statusLine } from "@/lib/content/whats-coming";

const lower = (x: string) => x.charAt(0).toLowerCase() + x.slice(1); // "opens 11 December 2026", months kept
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /whats-coming — lodges announced, opening or being rebuilt, filed before
// they open (James, 31 Oct 2026). Facts from the brand's own site only; the
// house's mark comes after the first visit.
const PATH = "/whats-coming";
export const metadata = buildMetadata({
  title: "What's Coming: New and Rebuilt Lodges, Filed Before They Open",
  description: `${COMING.map((c) => `${c.name} (${lower(statusLine(c))})`).join(", ")}. The house holds a place; James vets on opening.`,
  path: PATH,
  noindex: false,
});

export default function WhatsComingPage() {
  const answer = `What's coming at James Wild & Co: ${COMING.map((c) => `${c.name} in ${c.country ?? "the Ledger"}, ${lower(statusLine(c))}`).join("; ")}. Each is filed from the brand's own announcement, pencilled until James has stayed; the house can hold a place before opening.`;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "What's coming", path: PATH }]} /></div>
          <header className="max-w-3xl">
            <p className="ledger-eyebrow ledger-crimson">What&rsquo;s coming</p>
            <h1 className="ledger-h1 mt-2">Filed before they open.</h1>
            <p className="mt-4 text-[18px] ledger-muted leading-relaxed">New lodges and rebuilt ones, from the brands&rsquo; own announcements. Each is pencilled in the Ledger: a page and a number, no mark until James has slept there. If you want to be first, the house holds the place.</p>
          </header>
          <div className="mt-10"><AnswerBlock>{answer}</AnswerBlock></div>
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {COMING.map((c) => <li key={c.slug}><ComingCard c={c} /></li>)}
          </ul>
          <section className="mt-16 border-t ledger-rule pt-8 grid md:grid-cols-3 gap-8" aria-labelledby="how-heading">
            <div><p className="ledger-eyebrow ledger-crimson">How it works</p><h2 id="how-heading" className="ledger-display text-[1.6rem] mt-2">Pencilled, then marked.</h2></div>
            <ol className="md:col-span-2 grid sm:grid-cols-3 gap-6">
              {[["01", "Filed", "A lodge is announced or rebuilt; the house files it from the brand's own site, with a Ledger ID."], ["02", "Held", "Ask James to hold a place for the opening season. Nothing is booked until you approve a quote."], ["03", "Marked", "James stays. The pencil becomes a mark, with the year, or the page is quietly taken down."]].map(([n, t, l]) => <li key={n} className="border-t-2 border-crimson pt-3"><span className="font-mono text-[13px] ledger-crimson">{n}</span><h3 className="ledger-display text-[1.25rem] mt-1">{t}</h3><p className="mt-1.5 text-[15px] ledger-muted leading-relaxed">{l}</p></li>)}
            </ol>
          </section>
          <p className="mt-10 text-[15px] ledger-muted">Looking for places already marked? <Link href="/safaris" className="underline underline-offset-4">The Safaris volume</Link> · <Link href="/stays" className="underline underline-offset-4">The Ledger of stays</Link></p>
        </div>
      </main>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "What's coming", description: answer, publisher: { "@id": ids.house }, hasPart: COMING.map((c) => ({ "@type": "LodgingBusiness", name: c.name, ...(c.href ? { url: absoluteUrl(c.href) } : {}), ...(c.country ? { address: { "@type": "PostalAddress", addressCountry: c.country } } : {}), ...(c.ledgerId ? { identifier: { "@type": "PropertyValue", propertyID: "Ledger ID", value: c.ledgerId } } : {}), ...(c.source ? { sameAs: c.source } : {}) })) })} />
    </>
  );
}
