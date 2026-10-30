import Link from "next/link";
import TravelNotesForm from "@/components/TravelNotesForm";

// The close of every destination page: the advisors who know the place,
// and Travel Notes for news of what's filed next.
export default function PlanBand({ place, compassHref = "#compass" }: { place: string; compassHref?: string }) {
  return (
    <section id="plan" className="mt-20 md:mt-28 grid md:grid-cols-2 gap-6 scroll-mt-32 lg:scroll-mt-[208px] border-t ledger-rule pt-10" aria-label={`Plan ${place}`}>
      <div className="ledger-paper p-6 md:p-8 h-full">
        <p className="ledger-eyebrow ledger-crimson">Advisors who know {place}</p>
        <div className="mt-4 flex items-center gap-4">
          <span className="w-16 h-16 rounded-full border ledger-rule flex items-center justify-center ledger-display text-2xl ledger-muted" aria-hidden="true">JP</span>
          <div>
            <p className="ledger-display text-xl">James Papagno</p>
            <p className="ledger-eyebrow">Founder &amp; Chief Expedition Officer</p>
          </div>
        </div>
        <p className="mt-4 text-[15px] ledger-muted">The advisor feed fills this panel from the library: each advisor&rsquo;s profile, the countries they know and how to reach them. Already have an advisor? The house works with them.</p>
        <div className="mt-5 flex flex-wrap items-center gap-4"><Link href="/plan" className="ledger-btn">Plan {place} with James</Link><a href={compassHref} className="ledger-btn-ghost">Or take the Compass</a></div>
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
