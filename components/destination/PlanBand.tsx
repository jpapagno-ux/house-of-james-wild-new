import Link from "next/link";
import TravelNotesForm from "@/components/TravelNotesForm";
import { Headshot } from "@/components/advisor/Desk";
import FadeNote from "@/components/record/FadeNote";
import Scroller from "./Scroller";
import { ADVISORS, DEFAULT_ADVISOR, advisorsFor, type Advisor } from "@/lib/content/advisors";
import type { Volume } from "@/lib/content/advisor-desk";
import { founderOceanForCountry } from "@/lib/content/founder-ocean";

// The close of every destination page: the advisors who know the place, as a sideways strip of
// cards (James, 3 Nov 2026: "a scrolling card ... showing basic information and pic ... what they
// specialise in"), then Travel Notes.
//
// Advisor-led (James, 31 Oct 2026): James heads every strip while the house is in testing and
// "Plan … with James" writes to him. Beside him, the real advisors who know the place, ranked by the
// book (lib/advisors/rank.ts). Stand-ins never appear on the public site (#226). The last card
// is always "bring your own advisor": the house works with them.
// Each card shows only what is approved and true: portrait, name, role, availability, up to three
// approved specialties (those nearest this place first), and the advisor's own marks here.
export type PlanWhere = { countrySlug?: string | null; regionSlug?: string | null; volume?: Volume; ledgerId?: string | null };

// Words that tie an approved specialty to the kind of trip this place is known for.
const NEAR: Record<Volume, RegExp> = {
  voyages: /ship|sail|yacht|island|reef|ocean|dive|surf/i,
  safaris: /safari|reserve|wildlife|bush/i,
  stays: /island|villa|beach|stay|escape/i,
  gatherings: /famil|gather/i,
  overland: /road|trail|hike|route|overland/i,
  europe: /europe|town|ital|franc|spain|portug/i,
};
const AVAIL: Record<string, { label: string; dot: string }> = {
  open: { label: "Taking new journeys", dot: "bg-[#11705A]" },
  waitlist: { label: "Waitlist", dot: "bg-[#8C8277]" },
};
// Handwritten asides under the strip, one place at a time; each true and James's own.
const NOTE: Record<string, string> = {
  indonesia: "Anthony and I sailed Raja Ampat together, November 2024. JW",
};

function cardFacts(a: Advisor, where?: PlanWhere) {
  const entries = (a.desk?.entries ?? []).filter((e) => (where?.countrySlug ? e.countrySlug === where.countrySlug : where?.regionSlug ? e.regionSlug === where.regionSlug : where?.ledgerId ? e.ledgerId === where.ledgerId : false));
  const vols = new Set<Volume>(entries.map((e) => e.volume as Volume));
  // The specialties nearest this place; only if none match, their first three.
  const all = [...(a.dna?.specialties ?? a.specialties)];
  const near = all.filter((s) => [...vols].some((v) => NEAR[v]?.test(s)));
  const specs = (near.length ? near : all).slice(0, 3);
  const been = entries.filter((e) => e.theirs).slice(0, 2).map((e) => `${e.theirs!.mark} · ${e.name}${e.theirs!.when ? ` · ${e.theirs!.when}` : ""}`);
  return { specs, been };
}

export default function PlanBand({ place, compassHref = "#compass", where }: { place: string; compassHref?: string; where?: PlanWhere }) {
  const lead = ADVISORS.find((a) => a.slug === DEFAULT_ADVISOR)!;
  const others = where ? advisorsFor(where).advisors.filter((a) => a.slug !== DEFAULT_ADVISOR && !a.sample).slice(0, 4) : [];
  const people = [lead, ...others];
  const q = encodeURIComponent(place);
  const planHref = (a: Advisor) => `/plan?advisor=${a.slug}&q=${q}`;
  const note = where?.countrySlug ? NOTE[where.countrySlug] : undefined;
  const card = "snap-start shrink-0 w-[84%] sm:w-[300px] bg-white border ledger-border p-5 flex flex-col";

  return (
    <section id="plan" className="mt-20 md:mt-28 border-t ledger-rule pt-10" aria-label={`Plan ${place}`}>
      <p className="ledger-eyebrow ledger-crimson">Advisors who know {place}</p>
      <h2 className="ledger-display text-[1.6rem] md:text-[2rem] mt-2 mb-6 max-w-2xl">Pick the person you&rsquo;d enjoy planning {place} with.</h2>
      <Scroller label={`Advisors who know ${place}`} count={people.length + 1}>
        {people.map((a) => {
          const { specs, been } = cardFacts(a, where);
          const av = a.dna ? AVAIL[a.dna.availability] : undefined;
          const ocean = a.slug === DEFAULT_ADVISOR ? founderOceanForCountry(where?.countrySlug) : null;
          return (
            <article key={a.slug} role="listitem" data-card className={card}>
              <div className="flex items-center gap-4">
                <Headshot a={a} size={72} className="shrink-0" />
                <div className="min-w-0">
                  <p className="ledger-display text-[1.3rem] leading-tight">{a.name}</p>
                  {a.roleApproved && <p className="ledger-eyebrow !text-[10px] mt-1">{a.role}</p>}
                </div>
              </div>
              {av && <p className="mt-3 text-[13px] flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${av.dot}`} aria-hidden="true" />{av.label}</p>}
              {specs.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Known for">
                  {specs.map((s) => <li key={s} className="house-chip !text-[10px] !px-2 !py-1">{s}</li>)}
                </ul>
              )}
              {(been.length > 0 || ocean) && (
                <div className="mt-3 text-[13.5px] ledger-muted grid gap-1">
                  {ocean && <p>{ocean}</p>}
                  {been.map((b) => <p key={b}>{b}</p>)}
                </div>
              )}
              <div className="mt-auto pt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link href={planHref(a)} className="ledger-btn">Plan with {a.firstName}</Link>
                {a.profileHref && <Link href={a.profileHref} className="text-[13px] underline underline-offset-4 decoration-[#CFC8BF]">About {a.firstName}</Link>}
              </div>
            </article>
          );
        })}
        <article role="listitem" data-card className={`${card} bg-[#F4F2EF]`}>
          <p className="ledger-display text-[1.3rem] leading-tight">Already have an advisor?</p>
          <p className="mt-3 text-[14.5px] ledger-muted">The house works with them. Your advisor keeps you; James and the house bring the places, the hosts and the planning.</p>
          <p className="mt-3 text-[14.5px] ledger-muted">Every enquiry is read by a person.</p>
          <div className="mt-auto pt-5 flex flex-wrap items-center gap-4">
            <Link href={`/plan?q=${q}&with=my-advisor`} className="ledger-btn">Bring your advisor</Link>
            <a href={compassHref} className="ledger-btn-ghost">Or take the Compass</a>
          </div>
        </article>
      </Scroller>
      {note && <div className="mt-2"><FadeNote>{note}</FadeNote></div>}

      <div className="mt-12 ledger-paper p-6 md:p-8 grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
        <div>
          <p className="ledger-eyebrow ledger-crimson">Travel Notes</p>
          <p className="ledger-display text-2xl mt-2">Hear when we file something new in {place}.</p>
          <p className="mt-3 text-[15px] ledger-muted">New stays and ships before they&rsquo;re announced, plus the stay-longer offers. One letter a month.</p>
        </div>
        <TravelNotesForm source={`destination:${place}`} />
      </div>
    </section>
  );
}
