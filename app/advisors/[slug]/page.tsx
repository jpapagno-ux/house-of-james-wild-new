import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import JsonLd from "@/components/ledger/JsonLd";
import AdvisorCard from "@/components/advisor/AdvisorCard";
import { DeskFolios, DeskIdCard, DeskSends, DeskSheet, DeskTies } from "@/components/advisor/DeskPage";
import { Prose, PlanClose } from "@/components/about/Parts";
import { ADVISORS, advisorBySlug } from "@/lib/content/advisors";
import IggiPanel from "@/components/iggi/IggiPanel";
import { IGGI_ON } from "@/lib/iggi/flag";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /advisors/[slug]: an advisor's profile. Built only for advisors with a bio
// on file (James's is /about/founder). Hero › in short › about › first-hand
// travel › ask about › plan with › the rest of the team. Noindex until the
// advisor's title and copy are approved.

export const dynamicParams = false;
export function generateStaticParams() {
  return ADVISORS.filter((a) => a.bio.length && a.slug !== "james-papagno").map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = advisorBySlug((await params).slug);
  if (!a) return {};
  return buildMetadata({
    title: `${a.name}, ${a.role} at James Wild & Co`,
    description: `${a.intro ?? ""} Plan your journey with ${a.firstName} from the Ledger of places James has vetted in person.`.trim(),
    path: `/advisors/${a.slug}`,
    image: a.portrait ?? undefined,
    noindex: true,
  });
}

export default async function AdvisorPage({ params }: { params: Promise<{ slug: string }> }) {
  const a = advisorBySlug((await params).slug);
  if (!a) notFound();
  const path = `/advisors/${a.slug}`;
  const others = ADVISORS.filter((x) => x.slug !== a.slug && (x.portrait || x.bio.length));
  const answer = `${a.name} is a ${a.role.toLowerCase()} with James Wild & Co, the founder-led travel house exploring since 1982. ${a.intro ?? ""} ${a.firstName} plans from the Ledger of stays, camps, ships and routes James has vetted in person, and you can start planning with ${a.firstName} directly.`;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "The team", path: "/about/team" }, { name: a.name, path }]} /></div>
          <header className="grid md:grid-cols-[minmax(0,320px)_1fr] gap-8 md:gap-12 items-end">
            <div className="relative aspect-[4/5] bg-paper-card overflow-hidden max-w-[320px]">
              {a.portrait && <Image src={a.portrait.url} alt={a.portrait.alt} fill priority sizes="320px" className="object-cover" />}
            </div>
            <div>
              <p className="ledger-eyebrow ledger-crimson">{a.role} · James Wild &amp; Co</p>
              <h1 className="ledger-display text-[2.3rem] md:text-[3.3rem] leading-[1.08] mt-2">{a.name}</h1>
              {a.intro && <p className="mt-4 text-[18px] md:text-[19px] ledger-muted max-w-xl leading-relaxed">{a.intro}</p>}
              <div className="mt-6 flex flex-wrap gap-4 items-center"><Link href={`/plan?advisor=${a.slug}`} className="ledger-btn ledger-btn--solid">Plan with {a.firstName}</Link><Link href="/about/team" className="ledger-btn-ghost">The whole team</Link></div>
            </div>
          </header>

          <div className="mt-12"><AnswerBlock>{answer}</AnswerBlock></div>

          {a.desk && (
            <>
              <div className="mt-10"><DeskIdCard a={a} /></div>
              <DeskSheet a={a} />
              <DeskSends a={a} />
              <DeskFolios a={a} />
            </>
          )}

          <section className="mt-10 grid lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-16" aria-labelledby="about-heading">
            <div>
              <p className="ledger-eyebrow ledger-crimson">About {a.firstName}</p>
              <h2 id="about-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">How {a.firstName} Travels</h2>
              <div className="mt-6"><Prose paragraphs={a.bio} /></div>
            </div>
            <aside className="space-y-6">
              {a.traveled.length > 0 && (
                <div className="ledger-paper p-6">
                  <p className="ledger-eyebrow">Been there, first-hand</p>
                  <ul className="mt-3 space-y-2 text-[16px]">{a.traveled.map((t) => <li key={t.place} className="flex gap-3"><span className="font-mono text-[13px] ledger-crimson pt-0.5">{t.year ?? "—"}</span>{t.place}</li>)}</ul>
                </div>
              )}
              {a.specialties.length > 0 && (
                <div className="ledger-paper p-6">
                  <p className="ledger-eyebrow">Ask {a.firstName} about</p>
                  <ul className="mt-3 flex flex-wrap gap-2">{a.specialties.map((s) => <li key={s} className="border ledger-border px-2.5 py-1 text-[14px]">{s}</li>)}</ul>
                </div>
              )}
              <div className="border-l-2 border-crimson pl-5">
                <p className="ledger-eyebrow">How it works</p>
                <p className="mt-2 text-[16px] ledger-muted leading-relaxed">Tell {a.firstName} where you&rsquo;re drawn and when. You&rsquo;ll get a drafted journey from the Ledger, a conversation to shape it, and a quote. Nothing is booked until you&rsquo;ve approved it.</p>
              </div>
            </aside>
          </section>

          {a.desk && <DeskTies a={a} />}

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="others-heading">
            <p className="ledger-eyebrow ledger-crimson">The rest of the house</p>
            <h2 id="others-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Also on the Team</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{others.map((o) => <li key={o.slug}><AdvisorCard a={o} n={ADVISORS.indexOf(o) + 1} /></li>)}</ul>
          </section>

          {IGGI_ON && (
            <IggiPanel
              ctx={{ entityType: "advisor", entitySlug: a.slug, sourcePage: path, advisor: a.slug }}
              heading={`Ask Iggi before you write to ${a.firstName}`}
              lead={`Iggi can sketch the journey from the Ledger first — places, seasons, what the house has actually vetted — so your first note to ${a.firstName} starts further along. Prices and bookings stay with ${a.firstName}.`}
            />
          )}

          <PlanClose title={`Start with ${a.firstName}.`} line={`Send ${a.firstName} the place you can't stop thinking about. You'll hear back from a person, not a form.`} />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "ProfilePage", "@id": absoluteUrl(`${path}#page`), url: absoluteUrl(path), name: a.name, mainEntity: { "@id": absoluteUrl(`${path}#person`) }, isPartOf: { "@id": ids.website } }, { "@type": "Person", "@id": absoluteUrl(`${path}#person`), name: a.name, ...(a.roleApproved ? { jobTitle: a.role } : {}), worksFor: { "@id": ids.house }, description: a.intro, ...(a.portrait ? { image: a.portrait.url } : {}), url: absoluteUrl(path) })} />
    </>
  );
}
