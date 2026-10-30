import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import JsonLd from "@/components/ledger/JsonLd";
import { LEGAL, LEGAL_UPDATED, legalBySlug } from "@/lib/content/legal";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /legal/[doc]: Terms, Privacy and Booking conditions. SAMPLE text for the
// lawyer's review, flagged on the page; noindex until counsel signs off.

export const dynamicParams = false;
export function generateStaticParams() { return LEGAL.map((d) => ({ doc: d.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }) {
  const d = legalBySlug((await params).doc);
  if (!d) return {};
  return buildMetadata({ title: `${d.title}`, description: d.description, path: `/legal/${d.slug}`, noindex: true });
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const d = legalBySlug((await params).doc);
  if (!d) notFound();
  const path = `/legal/${d.slug}`;
  const slug = (h: string) => h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: d.title, path }]} /></div>
          <div className="grid lg:grid-cols-[230px_1fr] gap-10 lg:gap-14">
            <aside className="lg:sticky lg:top-28 self-start">
              <nav aria-label="Legal pages" className="space-y-1.5">
                {LEGAL.map((x) => <Link key={x.slug} href={`/legal/${x.slug}`} aria-current={x.slug === d.slug ? "page" : undefined} className={`block text-[15px] ${x.slug === d.slug ? "ledger-crimson" : "hover:ledger-crimson"}`}>{x.title}</Link>)}
              </nav>
              <nav aria-label="On this page" className="hidden lg:block mt-8 border-t ledger-rule pt-4 space-y-1">
                {d.sections.map((s) => <a key={s.h} href={`#${slug(s.h)}`} className="block text-[13.5px] ledger-muted hover:ledger-crimson">{s.h}</a>)}
              </nav>
            </aside>
            <article className="max-w-3xl">
              <p role="note" className="border border-dashed border-rust bg-rust-wash text-rust px-4 py-3 text-[14.5px]"><strong>Sample for legal review.</strong> This draft is not in force. Bracketed items are for James Wild &amp; Co and its counsel to complete.</p>
              <h1 className="ledger-display text-[2.2rem] md:text-[3rem] leading-tight mt-6">{d.title}</h1>
              <p className="ledger-eyebrow mt-2">{LEGAL_UPDATED}</p>
              {d.sections.map((s) => (
                <section key={s.h} id={slug(s.h)} className="mt-9 scroll-mt-32 lg:scroll-mt-40">
                  <h2 className="ledger-display text-[1.45rem]">{s.h}</h2>
                  {s.p.map((t) => <p key={t.slice(0, 30)} className="mt-3 text-[16.5px] leading-relaxed">{t}</p>)}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>
      <JsonLd data={graph({ "@type": "WebPage", "@id": absoluteUrl(`${path}#page`), url: absoluteUrl(path), name: d.title, publisher: { "@id": ids.house } })} />
    </>
  );
}
