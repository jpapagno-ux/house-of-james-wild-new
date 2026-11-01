import Link from "next/link";
import TravelNotesForm from "@/components/TravelNotesForm";
import { Headshot } from "@/components/advisor/Desk";
import { ADVISORS, DEFAULT_ADVISOR, advisorsFor, type Advisor } from "@/lib/content/advisors";
import type { Volume } from "@/lib/content/advisor-desk";

// The close of every destination page: the advisors who know the place,
// and Travel Notes for news of what's filed next.
//
// Advisor-led (James, 31 Oct 2026): James is the advisor on every page while
// the house is in testing, so he heads the panel and "Plan … with James"
// writes to him. The advisors who have carried or slept in the place (stand-ins
// included, labelled) sit beside him from the book, each with their own Plan
// link, so the strip, this panel and Iggi all read the same advisor.
export type PlanWhere = { countrySlug?: string | null; regionSlug?: string | null; volume?: Volume; ledgerId?: string | null };

export default function PlanBand({ place, compassHref = "#compass", where }: { place: string; compassHref?: string; where?: PlanWhere }) {
  const lead = ADVISORS.find((a) => a.slug === DEFAULT_ADVISOR)!;
  const others = where ? advisorsFor(where).advisors.filter((a) => a.slug !== DEFAULT_ADVISOR).slice(0, 3) : [];
  const q = encodeURIComponent(place);
  const planHref = (a: Advisor) => `/plan?advisor=${a.slug}&q=${q}`;
  return (
    <section id="plan" className="mt-20 md:mt-28 grid md:grid-cols-2 gap-6 scroll-mt-32 lg:scroll-mt-[212px] border-t ledger-rule pt-10" aria-label={`Plan ${place}`}>
      <div className="ledger-paper p-6 md:p-8 h-full">
        <p className="ledger-eyebrow ledger-crimson">Advisors who know {place}</p>
        <div className="mt-4 flex items-center gap-4">
          <Headshot a={lead} size={64} />
          <div>
            <p className="ledger-display text-xl">{lead.name}</p>
            <p className="ledger-eyebrow">{lead.role}</p>
          </div>
        </div>
        {others.length > 0 && (
          <ul className="mt-5 flex flex-col gap-2.5" aria-label="Also in the book">
            {others.map((a) => (
              <li key={a.slug} className="flex items-center gap-3 text-[15px]">
                <Headshot a={a} size={32} />
                <span className="min-w-0">
                  <Link href={planHref(a)} className="underline underline-offset-4 decoration-[rgba(139,37,37,.35)] hover:decoration-crimson">{a.name}</Link>
                  <span className="ledger-muted"> · {a.specialties[0] ?? a.role}{a.sample ? " · stand-in" : ""}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-[15px] ledger-muted">Every enquiry is read by a person. Already have an advisor? The house works with them.</p>
        <div className="mt-5 flex flex-wrap items-center gap-4"><Link href={planHref(lead)} className="ledger-btn">Plan {place} with {lead.firstName}</Link><a href={compassHref} className="ledger-btn-ghost">Or take the Compass</a></div>
      </div>
      <div className="ledger-paper p-6 md:p-8 h-full">
        <p className="ledger-eyebrow ledger-crimson">Travel Notes</p>
        <p className="ledger-display text-2xl mt-2">Hear when we file something new in {place}.</p>
        <p className="mt-3 text-[15px] ledger-muted">New stays and ships before they&rsquo;re announced, plus the stay-longer offers. One letter a month.</p>
        <TravelNotesForm source={`destination:${place}`} className="mt-6" />
      </div>
    </section>
  );
}
