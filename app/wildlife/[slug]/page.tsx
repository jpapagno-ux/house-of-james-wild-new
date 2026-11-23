import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import JsonLd from "@/components/ledger/JsonLd";
import FieldNoteCard from "@/components/field-notes/FieldNoteCard";
import { FIELD_NOTES, SPECIES_PAGES } from "@/lib/field-notes/notes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /wildlife/[slug]: one species, written as questions and answers (James, 23 Nov 2026). The Field Note first,
// then how to see it, how to photograph it and which ships in the Ledger reach its waters. No outbound links.
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(SPECIES_PAGES).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = SPECIES_PAGES[(await params).slug];
  if (!p) return {};
  return buildMetadata({ title: p.title, description: p.answer, path: `/wildlife/${p.noteId}` });
}

export default async function SpeciesPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = SPECIES_PAGES[(await params).slug];
  if (!p) notFound();
  const note = FIELD_NOTES[p.noteId];
  const path = `/wildlife/${p.noteId}`;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, ...(p.parent ?? [{ name: "Voyages", path: "/voyages" }, { name: "The Amazon", path: "/voyages/amazon" }]), { name: note.title, path }]} /></div>
          <header className="max-w-3xl">
            <p className="ledger-eyebrow text-house">Field Note · {note.region}</p>
            <h1 className="ledger-display text-[2.1rem] md:text-[3.1rem] leading-[1.08] mt-2">{p.title}</h1>
          </header>
          <div className="mt-8"><AnswerBlock>{p.answer}</AnswerBlock></div>
          <div className="mt-10"><FieldNoteCard note={note} onOwnPage /></div>

          <section className="mt-14 border-t ledger-rule pt-8 max-w-3xl" aria-labelledby="qa-h">
            <p className="ledger-eyebrow ledger-crimson">Plain answers</p>
            <h2 id="qa-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">What Travellers Ask</h2>
            <dl className="mt-6">
              {p.qa.map((x) => (
                <div key={x.q} className="py-5 border-b border-[color:var(--jw-hairline)]">
                  <dt className="font-display text-[22px] leading-snug text-graphite">{x.q}</dt>
                  <dd className="mt-2 text-[15.5px] leading-relaxed text-graphite">{x.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-14 border-t ledger-rule pt-8 max-w-3xl" aria-labelledby="photo-h">
            <p className="ledger-eyebrow ledger-crimson">For photographers</p>
            <h2 id="photo-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">How to Photograph Them</h2>
            <ol className="mt-6 space-y-3 text-[15.5px] leading-relaxed text-graphite list-decimal pl-5">{p.photo.map((t) => <li key={t}>{t}</li>)}</ol>
          </section>

          <section className="mt-14 border-t ledger-rule pt-8" aria-labelledby="reach-h">
            <p className="ledger-eyebrow ledger-crimson">From the Ledger</p>
            <h2 id="reach-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">{p.reachTitle ?? "Small Ships on These Rivers"}</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.reach.map((r) => (
                <li key={r.href} className="border border-[color:var(--jw-hairline)] bg-white p-5">
                  <Link href={r.href} className="font-display text-[23px] text-graphite">{r.name}</Link>
                  <p className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-stone-text">{r.line}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-5">
              <Link href="/plan" className="ledger-btn ledger-btn--house">Plan with James</Link>
              <Link href="/wildlife" className="ledger-btn-ghost">All wildlife</Link>
              {p.parent ? <Link href={p.parent[p.parent.length - 1].path} className="ledger-btn-ghost">All of {p.parent[p.parent.length - 1].name}</Link> : <Link href="/voyages/amazon" className="ledger-btn-ghost">All Amazon ships</Link>}
            </div>
          </section>
        </div>
      </main>
      <JsonLd data={graph(
        { "@type": "WebPage", "@id": absoluteUrl(`${path}#page`), url: absoluteUrl(path), name: p.title, description: p.answer },
        { "@type": "FAQPage", "@id": absoluteUrl(`${path}#faq`), mainEntity: p.qa.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
      )} />
    </>
  );
}
