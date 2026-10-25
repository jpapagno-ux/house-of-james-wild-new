import Link from "next/link";
import { FOOTER_COLUMNS as ALL_COLUMNS, LEGAL_NAV as ALL_LEGAL, PLAN_CTA, SITE } from "@/lib/site";
import { live } from "@/lib/routes";

// Link guard: in production only built pages are listed; empty columns drop.
const FOOTER_COLUMNS = ALL_COLUMNS.map((c) => ({ ...c, links: live(c.links) })).filter((c) => c.links.length);
const LEGAL_NAV = live(ALL_LEGAL);

// SiteFooter — a closing call to plan, four link columns, then the
// credentials strip. Name, address and phone match the Organization schema.
export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 text-ink pb-16 lg:pb-0">
      <div className="ledger-card border-t ledger-rule">
        <div className="max-w-ledger mx-auto px-5 md:px-10 py-12 md:py-14 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <p className="ledger-eyebrow ledger-crimson">Every journey begins with a conversation</p>
            <p className="ledger-display text-2xl md:text-3xl mt-2">Tell me where you&rsquo;ve always meant to go.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={PLAN_CTA.href} className="ledger-btn">{PLAN_CTA.label}</Link>
            {SITE.email && <a href={`mailto:${SITE.email}`} className="ledger-btn !normal-case !tracking-normal">{SITE.email}</a>}
            <a href={`tel:${SITE.phone.tel}`} className="ledger-btn">{SITE.phone.display}</a>
          </div>
        </div>
      </div>

      <div className="max-w-ledger mx-auto px-5 md:px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="ledger-eyebrow ledger-crimson">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-[15px] hover:ledger-crimson">{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t ledger-rule">
        <div className="max-w-ledger mx-auto px-5 md:px-10 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="ledger-eyebrow leading-relaxed">
            {SITE.credentials.map((c) => `${c.label} ${c.value}`).join(" · ")} · {SITE.memberships.join(" · ")}
          </p>
          <ul className="flex flex-wrap gap-4">
            {SITE.social.map((s) => (
              <li key={s.url}><a href={s.url} rel="me noopener" className="ledger-eyebrow hover:ledger-crimson">{s.label}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t ledger-border">
        <div className="max-w-ledger mx-auto px-5 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="ledger-eyebrow">
            © {year} {SITE.name} · {SITE.homeOf} · {SITE.address.locality}, Florida · Exploring since {SITE.exploringSince}
          </p>
          <div className="flex items-center gap-4">
            {LEGAL_NAV.map((l) => (
              <Link key={l.href} href={l.href} className="ledger-eyebrow hover:ledger-crimson">{l.label}</Link>
            ))}
            <span className="ledger-hand text-lg">J.W.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
