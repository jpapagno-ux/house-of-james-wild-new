import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import DnaMatch, { type MatchCard } from "@/components/advisor/DnaMatch";
import { ADVISORS, countryOfRecord } from "@/lib/content/advisors";
import { COUNTRIES } from "@/lib/content/countries";
import type { AdvisorDnaLike } from "@/lib/dna/match";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /advisors/match: the traveller side of the shared DNA (James, 18 Nov 2026: "approved"). Six questions, the
// same six every advisor answers at onboarding and confirms on their desk; the match names the answers you
// share, never a percentage. Real advisors only, never stand-ins.

const PATH = "/advisors/match";
export const metadata = buildMetadata({
  title: "Find Your Travel Advisor Match: The James Wild DNA",
  description: "Answer six questions and James Wild & Co matches you with the advisor who shares your answers: the places they know first-hand, the journeys they plan and who they plan for.",
  path: PATH,
});

const FAQS = [
  { q: "What is the James Wild DNA?", a: "Six questions every James Wild & Co advisor answers when they join, and confirms on their desk: the Wild Pathways they carry, the countries they know first-hand, the volumes they plan, their specialties, who they plan for and the languages they plan in. You answer the same six, and the house shows you who shares your answers." },
  { q: "Why does a first-hand place count most?", a: "Because the house is built on places people have slept in, walked or sailed. An advisor who has marked a stay or a ship in your country on the Ledger knows it in a way a brochure cannot." },
  { q: "What if I don't know where to go yet?", a: "Leave the place blank. The match reads the kind of journey you are drawn to and who is travelling, and the advisor you choose will help you find the place." },
  { q: "Is my answer saved?", a: "Not on this page. When you choose Plan with an advisor, your answers travel with your enquiry so the advisor starts where you left off." },
];

export default function MatchPage() {
  const real = ADVISORS.filter((a) => !a.sample && a.dna);
  const pool: AdvisorDnaLike[] = real.map((a) => {
    const d = a.dna!;
    const marked = new Set<string>();
    for (const m of d.marks) { const c = countryOfRecord(m.ledgerId); if (c) marked.add(c); }
    for (const e of a.desk?.entries ?? []) if (e.theirs && e.countrySlug) marked.add(e.countrySlug);
    return { slug: a.slug, pathways: d.pathways, countries: d.countries, volumes: d.volumes, specialties: d.specialties, partyTypes: d.partyTypes, languages: d.languages, availability: d.availability, confirmed: !!d.confirmed, markedCountries: [...marked] };
  });
  const cards: MatchCard[] = real.map((a) => ({ slug: a.slug, name: a.name, firstName: a.firstName, role: a.roleApproved ? a.role : "Travel Advisor", ledgerId: a.ledgerId, portrait: a.portrait?.url ?? null, profileHref: a.profileHref, contact: a.contact ?? null, line: a.line ?? null }));
  const stated = new Set(pool.flatMap((p) => p.countries));
  const countries = COUNTRIES.filter((c) => stated.has(c.slug)).map((c) => ({ slug: c.slug, name: c.name })).sort((x, y) => x.name.localeCompare(y.name));
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "The team", path: "/about/team" }, { name: "Find your match", path: PATH }]} /></div>
          <p className="ledger-eyebrow ledger-crimson">The James Wild DNA</p>
          <h1 className="ledger-display text-[2.3rem] md:text-[3.2rem] leading-[1.08] mt-2 max-w-3xl">Find the Advisor Who Shares Your Answers</h1>
          <div className="mt-8"><AnswerBlock>Answer the same six questions every James Wild &amp; Co advisor answers when they join. The match shows the advisors who share your answers, and exactly which ones, with first-hand places counted first. Answer as many as you like; a place is optional.</AnswerBlock></div>
          <DnaMatch pool={pool} cards={cards} countries={countries} />
          <FaqBlock faqs={FAQS} title="Questions About the Match" />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "WebPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Find your travel advisor match", isPartOf: { "@id": ids.website }, about: { "@id": ids.house } })} />
    </>
  );
}
