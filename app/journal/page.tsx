import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import { HubShell, HubSection } from "@/components/hub/Hub";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";
import Image from "next/image";
import Link from "next/link";
import { POST_LIST } from "@/lib/content/journal/posts";

// /journal: the house journal shell. Captain's Log (James's own stories),
// field notes and Travel Notes; first entries are written with James.
const PATH = "/journal";
export const metadata = buildMetadata({ title: "The Journal: Captain's Log and Field Notes", description: "Stories from James Wild's 44 years on the road, field notes from the Ledger and news of what's filed next.", path: PATH, noindex: false /* approved by James, 28 Oct 2026 */ });

const SHELVES = [
  { kicker: "Captain's Log", title: "Stranded at the Bottom of the World", line: "February 2020: James sails the Antarctic Peninsula aboard MS Roald Amundsen, and the world shuts down behind the ship.", status: "Being written" },
  { kicker: "Field notes", title: "From the Ledger", line: "Short, practical notes from the places in the Ledger: best months, what to pack, what to avoid.", status: "Coming" },
  { kicker: "Travel Notes", title: "New Stays, First", line: "A short monthly letter when a new stay or ship enters the Ledger, with the stay-longer offers before they go public.", status: "Coming" },
];

export default function JournalHub() {
  return (
    <>
      <SiteHeader />
      <HubShell name="Journal" path={PATH} eyebrow="From the house" title="The Journal: Read Before You Go" intro="James's stories from forty-four years on the road, and field notes from the Ledger."
        answer="The James Wild & Co Journal holds Captain's Log, James's own stories from forty-four years of exploring since 1982, alongside field notes from the Ledger and Travel Notes, the house's monthly letter on new stays, ships and stay-longer offers."
        filling="Journal entries are written with James and published one by one; each one links to the stays, ships and routes it mentions.">
        <HubSection eyebrow="Captain's Log" title="Latest Stories" id="latest-h">
          <ul className="grid md:grid-cols-2 gap-6">
            {POST_LIST.map((p) => (
              <li key={p.slug}>
                <Link href={`/journal/${p.slug}`} className="group block border ledger-border hover:border-crimson/60 transition-colors h-full">
                  <div className="relative aspect-[16/9] overflow-hidden"><Image src={p.hero.url} alt={p.hero.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover group-hover:scale-[1.02] transition-transform duration-700" /></div>
                  <div className="p-5 md:p-6"><p className="ledger-eyebrow ledger-crimson">{p.shelf} · {p.place}{p.film ? " · Film" : ""}</p><h3 className="ledger-display text-[1.45rem] leading-snug mt-2">{p.title}</h3><p className="mt-2 text-[15.5px] ledger-muted leading-relaxed">{p.dek}</p></div>
                </Link>
              </li>
            ))}
          </ul>
        </HubSection>
        <HubSection eyebrow="The shelves" title="What You'll Find Here" id="shelves-h">
          <ul className="grid md:grid-cols-3 gap-5">
            {SHELVES.map((s) => <li key={s.title} className="ledger-paper p-6"><p className="ledger-eyebrow ledger-crimson">{s.kicker}</p><h3 className="ledger-display text-[1.4rem] leading-snug mt-1">{s.title}</h3><p className="mt-2 text-[15.5px] ledger-muted leading-relaxed">{s.line}</p><p className="mt-4 ledger-eyebrow">{s.status}</p></li>)}
          </ul>
        </HubSection>
      </HubShell>
      <JsonLd data={graph({ "@type": "Blog", "@id": absoluteUrl(`${PATH}#blog`), url: absoluteUrl(PATH), name: "The James Wild & Co Journal", publisher: { "@id": ids.house }, author: { "@id": ids.founder }, blogPost: POST_LIST.map((p) => ({ "@id": absoluteUrl(`/journal/${p.slug}#article`) })) })} />
    </>
  );
}
