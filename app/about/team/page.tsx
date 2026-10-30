import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import AdvisorCard from "@/components/advisor/AdvisorCard";
import { LedBuilt } from "@/components/advisor/Desk";
import { Icon } from "@/components/ledger/Marks";
import { HouseLinks, PlanClose } from "@/components/about/Parts";
import { ADVISORS, FIELD_PARTNERS, TEAM } from "@/lib/content/advisors";
import Image from "next/image";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /about/team: the house's one team page, and the advisor directory ("Find
// an advisor" points here). Hero › in short › advisor cards › in the field
// with us (partner guides, studio, content) › match me ›
// join the house (new advisors) › FAQ › more about the house › plan. Noindex until titles and photos are
// approved.

const PATH = "/about/team";
export const metadata = buildMetadata({
  title: "Meet the Team: James Wild & Co Travel Advisors",
  description: "Meet founder James Papagno and the James Wild & Co advisors. Choose who you'd like to plan with, or let the house match you to the right person.",
  path: PATH,
  noindex: false /* approved by James, 28 Oct 2026 */,
});

export default function TeamPage() {
  const t = TEAM;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }, { name: "The team", path: PATH }]} /></div>
          <header className="max-w-3xl">
            <p className="ledger-eyebrow ledger-crimson">{t.eyebrow}</p>
            <h1 className="ledger-display text-[2.1rem] leading-[1.12] md:text-[3.1rem] mt-3">{t.title}</h1>
            <p className="mt-4 text-[18px] md:text-[19px] ledger-muted leading-relaxed">{t.subtitle}</p>
          </header>
          <AnswerBlock>{t.answer}</AnswerBlock>

          <section className="mt-10" aria-label="Advisor-led, advisor-built"><LedBuilt /></section>

          <section id="advisors" className="mt-10 scroll-mt-32" aria-labelledby="advisors-heading">
            <h2 id="advisors-heading" className="sr-only">Advisors</h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {ADVISORS.map((a, i) => <li key={a.slug}><AdvisorCard a={a} n={i + 1} /></li>)}
            </ul>
          </section>

          <section className="mt-16 md:mt-20 border-t ledger-rule pt-8" aria-labelledby="field-heading">
            <p className="ledger-eyebrow ledger-crimson">In the field with us</p>
            <h2 id="field-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">The Guides, Makers and Storytellers</h2>
            <p className="mt-3 text-[16.5px] ledger-muted max-w-2xl">Not booking advisors, but people the house travels and works with. Safari guides appear with their own affiliation; safaris are booked through Wild &amp; Co Safaris.</p>
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FIELD_PARTNERS.map((p) => (
                <li key={p.name} className="grid grid-cols-[84px_1fr] gap-4 items-start">
                  <span className="relative w-[84px] h-[84px] rounded-full overflow-hidden bg-paper-card"><Image src={p.portrait.url} alt={p.portrait.alt} fill sizes="84px" className="object-cover" /></span>
                  <div>
                    <h3 className="ledger-display text-[1.2rem] leading-tight">{p.name}</h3>
                    <p className="ledger-eyebrow mt-1">{p.role}</p>
                    <p className="text-[13px] ledger-crimson mt-0.5">{p.href ? <a href={p.href} className="hover:underline">{p.org}</a> : p.org}</p>
                    <p className="mt-2 text-[14.5px] ledger-muted leading-snug">{p.line}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 ledger-paper p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-5 items-center" aria-labelledby="match-heading">
            <div>
              <h2 id="match-heading" className="ledger-display text-[1.6rem] md:text-[2rem]">{t.match.title}</h2>
              <p className="mt-2 text-[17px] ledger-muted max-w-xl">{t.match.line}</p>
            </div>
            <div className="flex flex-wrap gap-4 items-center"><Link href="/plan?advisor=match" className="ledger-btn">Match me with an advisor</Link><Link href="/compass" className="ledger-btn-ghost">Or take the Compass</Link></div>
          </section>

          <section id="join" className="mt-16 md:mt-24 bg-coast-deep text-paper p-6 md:p-10 scroll-mt-32" aria-labelledby="join-heading">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-14 items-start">
              <div>
                <p className="ledger-eyebrow !text-coast-light">{t.join.eyebrow}</p>
                <h2 id="join-heading" className="ledger-display text-[1.8rem] md:text-[2.4rem] leading-tight mt-2">{t.join.title}</h2>
                <p className="mt-4 text-[17px] text-paper/85 leading-relaxed">{t.join.line}</p>
                <Link href={t.join.cta.href} className="mt-6 inline-flex ledger-btn ledger-btn--solid">{t.join.cta.label}</Link>
              </div>
              <ul className="grid gap-5">
                {t.join.points.map((p) => (
                  <li key={p.title} className="grid grid-cols-[44px_1fr] gap-4 border-t border-paper/25 pt-4">
                    <span className="text-coast-light"><Icon name={p.icon} size={38} /></span>
                    <div><h3 className="ledger-display text-[1.3rem]">{p.title}</h3><p className="mt-1 text-[15.5px] text-paper/80 leading-relaxed">{p.line}</p></div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <FaqBlock faqs={t.faqs} title="The team, answered" />
          <HouseLinks current="team" />
          <PlanClose title="One good conversation brings the whole trip into focus." />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "The James Wild & Co team", about: { "@id": ids.house }, mainEntity: { "@type": "ItemList", itemListElement: ADVISORS.map((a, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Person", ...(a.slug === "james-papagno" ? { "@id": ids.founder } : {}), name: a.name, ...(a.roleApproved ? { jobTitle: a.role } : {}), worksFor: { "@id": ids.house }, ...(a.profileHref ? { url: absoluteUrl(a.profileHref) } : {}), ...(a.portrait ? { image: a.portrait.url } : {}) } })) } })} />
    </>
  );
}
