import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { FIELD_NOTES, SPECIES_PAGES, WILDLIFE_REGIONS } from "@/lib/field-notes/notes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /wildlife: the index of species pages (James, 23 Nov 2026), grouped by region. Each card is the Field Note's
// own watercolour and opens its species page. No outbound links.
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const TITLE = "Wildlife: Where and How to See It";
const ANSWER = `James Wild & Co keeps a Field Note on ${Object.keys(SPECIES_PAGES).length} animals and plants across Africa, Madagascar, the Amazon, the Galápagos, Alaska, Antarctica, the Arctic and Indonesia. Each page says where the species lives, when to go, what to look and listen for, how to photograph it, and which stays or ships in the Ledger reach it.`;

export const metadata = buildMetadata({ title: TITLE, description: ANSWER, path: "/wildlife" });

export default function WildlifeIndex() {
  const pages = Object.values(SPECIES_PAGES).map((p) => ({ p, note: FIELD_NOTES[p.noteId] }));
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Wildlife", path: "/wildlife" }]} /></div>
          <header className="max-w-3xl">
            <p className="ledger-eyebrow text-house">Field Notes · {pages.length} species</p>
            <h1 className="ledger-display text-[2.1rem] md:text-[3.1rem] leading-[1.08] mt-2">{TITLE}</h1>
          </header>
          <div className="mt-8"><AnswerBlock>{ANSWER}</AnswerBlock></div>

          {WILDLIFE_REGIONS.map((region) => {
            const set = pages.filter((x) => x.note.region === region);
            if (!set.length) return null;
            const id = `region-${region.toLowerCase().replace(/[^a-z]+/g, "-")}`;
            return (
              <section key={region} className="mt-14 border-t ledger-rule pt-8" aria-labelledby={id}>
                <p className="ledger-eyebrow ledger-crimson">{set.length} Field Notes</p>
                <h2 id={id} className="ledger-display text-[1.75rem] md:text-4xl mt-2">{region}</h2>
                <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {set.map(({ p, note }) => (
                    <li key={p.noteId} className="border border-[color:var(--jw-hairline)] bg-white">
                      <Link href={`/wildlife/${p.noteId}`} className="block p-5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`${CLD}/w_700,f_auto,q_auto/v${note.image.version}/${note.image.publicId}`} width={note.image.width} height={note.image.height} alt={note.image.alt} loading="lazy" className="w-full h-auto" />
                        <span className="block mt-3 font-display text-[24px] leading-tight text-graphite">{note.title}</span>
                        <span className="block mt-1 font-display italic text-[15px] text-stone-text">{note.latin}</span>
                        <span className="block mt-3 text-[14px] leading-snug text-graphite">{p.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <div className="mt-14 flex flex-wrap gap-5">
            <Link href="/plan" className="ledger-btn ledger-btn--house">Plan with James</Link>
            <Link href="/destinations" className="ledger-btn-ghost">All destinations</Link>
          </div>
        </div>
      </main>
      <JsonLd data={graph(
        { "@type": "CollectionPage", "@id": absoluteUrl("/wildlife#page"), url: absoluteUrl("/wildlife"), name: TITLE, description: ANSWER },
        { "@type": "ItemList", "@id": absoluteUrl("/wildlife#list"), itemListElement: pages.map(({ p }, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: absoluteUrl(`/wildlife/${p.noteId}`) })) },
      )} />
    </>
  );
}
