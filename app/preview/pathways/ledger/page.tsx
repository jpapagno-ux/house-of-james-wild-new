import Link from "next/link";
import { Lock, Users, Eye } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { PreviewNote } from "@/components/record/Sections";
import { PathwayChips } from "@/components/pathways/Pathway";
import { pathwayStays } from "@/lib/content/pathways";
import { pathwayPreviewHref, stayPreviewHref } from "@/lib/content/pathways/preview";
import { IMPACT_STATUS_LABEL } from "@/lib/pathways";
import { VOLUME_STYLES } from "@/lib/volumes";
import { buildMetadata } from "@/lib/seo";

// PREVIEW · pathway colour in the Traveler and Trade Ledgers (brief §5,
// addendum §6). Same Pathway IDs and chips as the Stays pages, laid over
// the shape of the existing Booking Live Folio page (app/account/folios/[id])
// without re-theming it. Static sample data: no Supabase call, no sign-in;
// privacy and permission states are shown as the words and icons the live
// pages would print, independent of colour. Noindex.

export const metadata = buildMetadata({ title: "Pathway colour in the Ledgers (preview)", description: "Traveler and Trade Ledger preview with Wild Pathways chips.", path: "/preview/pathways/ledger", noindex: true });

export default function LedgerPathwaysPreview() {
  const recs = pathwayStays({ includeDrafts: true });
  const journey = recs.filter((r) => ["leeu-estates", "monwana-thornybush", "tengile-mala-mala-kirkmans-kamp"].includes(r.slug));
  const favourites = recs.filter((r) => ["tswalu-reserve", "wilderness-mombo-luxury-camp"].includes(r.slug));
  const Shell = ({ children, eyebrow, title, line }: { children: React.ReactNode; eyebrow: string; title: string; line: string }) => (
    <article className="border ledger-border p-6 md:p-8 grid gap-8 bg-paper">
      <header><p className="ledger-eyebrow">{eyebrow}</p><h2 className="ledger-display text-[2rem] mt-2 leading-[1.1]">{title}</h2><p className="text-[14px] ledger-muted mt-2 max-w-xl">{line}</p></header>
      {children}
    </article>
  );

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Previews", path: "/preview/pathways" }, { name: "Ledgers", path: "/preview/pathways/ledger" }]} />
          <header className="mt-6 max-w-3xl">
            <p className="ledger-eyebrow ledger-crimson">The Living Ledger · Wild Pathways preview</p>
            <h1 className="ledger-display text-[2.3rem] md:text-[3.3rem] leading-[1.1] mt-3">One Pathway Colour, Three Ledgers</h1>
            <p className="mt-4 text-[18px] ledger-muted leading-relaxed">A saved stay carries its pathway chips from the Stays page into a traveller&rsquo;s journey and an advisor&rsquo;s folio. The interfaces keep the House palette; only the chips are coloured. Who may see what is printed in words.</p>
          </header>
          <div className="mt-6"><PreviewNote>Static sample over the Booking Live Folio layout. No account data is read; the live <code>/account</code> pages and their flags are untouched. The Trade folio is a Phase 2 shape (advisor desk), shown here only for colour and permission wording.</PreviewNote></div>

          <div className="mt-10 grid lg:grid-cols-2 gap-6 items-start">
            {/* Traveler Ledger */}
            <Shell eyebrow="Traveler Ledger · Journeys · owner" title="Cape and Kruger, May" line="A journey is a plan, not a booking. Nothing here holds a room or charges a card.">
              <section>
                <h3 className="ledger-eyebrow flex items-center gap-2"><Lock className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> In this journey · private to you and 1 invited editor</h3>
                <ol className="mt-3 divide-y ledger-rule border-y ledger-rule">
                  {journey.map((r) => (
                    <li key={r.slug} className="py-4 grid gap-2">
                      <div className="flex flex-wrap justify-between gap-3">
                        <Link href={stayPreviewHref(r.slug)} className="ledger-display text-[19px] hover:ledger-crimson">{r.stay.name}</Link>
                        <span className="font-mono text-[11px] ledger-muted self-center">{r.ledgerId}</span>
                      </div>
                      <PathwayChips primary={r.primary} secondary={r.secondary} hrefFor={(p) => pathwayPreviewHref(p.key)} />
                      <p className="text-[13px] ledger-muted">{r.stay.country} · Vol {r.volumes.map((v) => VOLUME_STYLES[v].roman).join(" & ")}</p>
                    </li>
                  ))}
                </ol>
              </section>
              <section>
                <h3 className="ledger-eyebrow flex items-center gap-2"><Eye className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Saved stays · only you</h3>
                <ul className="mt-3 grid gap-3">
                  {favourites.map((r) => (
                    <li key={r.slug} className="flex flex-wrap items-center justify-between gap-3 border ledger-border p-3">
                      <Link href={stayPreviewHref(r.slug)} className="ledger-display text-[17px] hover:ledger-crimson">{r.stay.name}</Link>
                      <PathwayChips primary={r.primary} secondary={[]} />
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[13px] ledger-muted">Compass readings join this list only when you choose to keep them.</p>
              </section>
            </Shell>

            {/* Trade Ledger */}
            <Shell eyebrow="Trade Ledger · Advisor folio · client authorised" title="Folio: the Hendersons, May 2027" line="Advisor view. Client authorisation recorded; partner intelligence stays on this side of the glass.">
              <section>
                <h3 className="ledger-eyebrow flex items-center gap-2"><Users className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Shortlist · shared with client as read-only</h3>
                <div className="mt-3 overflow-x-auto"><table className="w-full text-[13.5px] border-t ledger-rule">
                  <thead><tr className="text-left ledger-eyebrow"><th className="py-2 pr-3">Record</th><th className="py-2 pr-3">Pathways</th><th className="py-2 pr-3">Suitability</th><th className="py-2">Impact</th></tr></thead>
                  <tbody>
                    {journey.map((r) => (
                      <tr key={r.slug} className="border-t ledger-border align-top">
                        <td className="py-2.5 pr-3"><Link href={stayPreviewHref(r.slug)} className="font-medium hover:text-crimson">{r.stay.name}</Link><br /><span className="font-mono text-[11px] ledger-muted">{r.ledgerId}</span></td>
                        <td className="py-2.5 pr-3 min-w-[15rem]"><PathwayChips primary={r.primary} secondary={r.secondary} /></td>
                        <td className="py-2.5 pr-3">{r.suitability.map((s) => s.replace(/_/g, " ")).join(", ")}</td>
                        <td className="py-2.5 min-w-[13rem]">{r.impact.map((s) => <span key={s.kind} className="block whitespace-nowrap">{s.kind} · {IMPACT_STATUS_LABEL[s.status]}</span>)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </section>
              <section className="border-l-2 border-crimson pl-4">
                <h3 className="ledger-eyebrow ledger-crimson flex items-center gap-2"><Lock className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Advisor only · not shared</h3>
                <p className="mt-2 text-[14px]">Partner notes, net rates and commission terms live here in Phase 2 and never render on a traveller&rsquo;s page. Permission state is carried by role and authorisation, never by colour.</p>
              </section>
            </Shell>
          </div>
        </div>
      </main>
    </>
  );
}
