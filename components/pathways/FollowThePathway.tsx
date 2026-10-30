import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RecordCard } from "@/components/hub/Hub";
import { PathwayChips } from "@/components/pathways/Pathway";
import type { Pathway } from "@/lib/pathways";
import type { PathwayStay } from "@/lib/content/pathways";
import { altFor } from "@/lib/content/stays";

// Follow the Pathway: on a record page, the pathways this stay sits on and
// a short rail of other Ledger records on its primary pathway. Records keep
// their own canonical URL (recordHref); this never makes a second page.

export default function FollowThePathway({ primary, secondary, related, pathwayHref, id = "pathway" }: { primary: Pathway; secondary: Pathway[]; related: PathwayStay[]; pathwayHref: (p: Pathway) => string; id?: string }) {
  return (
    <section id={id} className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[212px] border-t ledger-rule pt-8" aria-labelledby={`${id}-heading`}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="ledger-eyebrow ledger-crimson">Follow the pathway</p>
          <h2 id={`${id}-heading`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">More Along {primary.name}</h2>
          <p className="mt-2 text-[15.5px] ledger-muted max-w-xl">{primary.line}</p>
        </div>
        <div className="md:text-right">
          <p className="ledger-eyebrow mb-2">This stay sits on</p>
          <PathwayChips primary={primary} secondary={secondary} hrefFor={pathwayHref} />
        </div>
      </div>
      {related.length > 0 ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((r) => (
            <li key={r.slug}><RecordCard name={r.stay.name} id={r.ledgerId ?? r.slug} line={r.stay.tagline ?? r.primary.setting} image={{ url: r.stay.hero ?? "", alt: altFor(r.stay.hero ?? "", r.stay.name, r.stay.country) }} href={r.href} eyebrow={r.stay.country ?? undefined} /></li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-[15px] ledger-muted">The rest of this pathway fills as records are classified.</p>
      )}
      <p className="mt-6"><Link href={pathwayHref(primary)} className="ledger-btn-ghost inline-flex items-center gap-2">Every entry on {primary.name} <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></Link></p>
    </section>
  );
}
