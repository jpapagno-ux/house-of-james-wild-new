import Link from "next/link";
import { FOOTER_COLUMNS as ALL_COLUMNS, LEGAL_NAV as ALL_LEGAL, PLAN_CTA, REGIONS as ALL_REGIONS, SITE, VOLUMES as ALL_VOLUMES } from "@/lib/site";
import { live } from "@/lib/routes";
import { JwcoSeal } from "./Marks";

// SiteFooter — the Chart footer (house chrome, 30 Oct 2026), in the house crimson
// (the seal's oxblood, deepening down the page):
// the statement and the weekly sign-up, the six volumes as tabs with their
// tones, the link columns, the credentials strip, the legal row. Link guard:
// in production only built pages are listed; empty columns drop. Name,
// address and phone match the Organization schema.
const FOOTER_COLUMNS = ALL_COLUMNS.filter((c) => c.title !== "The Volumes").map((c) => ({ ...c, links: live(c.links) })).filter((c) => c.links.length);
const LEGAL_NAV = live(ALL_LEGAL);
const VOLUMES = live(ALL_VOLUMES);
const REGIONS = live(ALL_REGIONS);
const NUM = ["I", "II", "III", "IV", "V", "VI"];
const LIGHT: Record<string, string> = { "#8B2525": "#F4D3CB", "#A5692A": "#D9A464", "#405A45": "#9DBB9F", "#1E5F73": "#9CCFD8", "#94512F": "#D8A082", "#5B3A5E": "#C9A7CD" };

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 text-paper pb-16 lg:pb-0" style={{ background: "linear-gradient(180deg, #8B2525 0%, #6E1C1C 55%, #4F1414 100%)" }}>
      {/* statement + sign-up */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-14 md:pt-20 pb-10 grid lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-16 items-end">
        <div>
          <p className="ledger-eyebrow !text-crimson-light">The House of James Wild &amp; Co · Exploring since {SITE.exploringSince}</p>
          <p className="ledger-h1 mt-3">James knows a place.</p>
          <p className="mt-5 text-[16px] text-paper/80 max-w-xl leading-relaxed">Forty-four years on the road, written into one Ledger. Six volumes. Nothing listed that hasn&rsquo;t been slept in, walked or sailed, and a named advisor for every journey.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={PLAN_CTA.href} className="ledger-btn !border-paper !text-paper hover:!bg-paper hover:!text-crimson-deep">{PLAN_CTA.label}</Link>
            <a href={`tel:${SITE.phone.tel}`} className="ledger-btn !border-paper/60 !text-paper hover:!bg-paper hover:!text-crimson-deep">{SITE.phone.display}</a>
          </div>
        </div>
        <form action="/plan" method="get" className="border border-paper/25 p-6 md:p-7 flex flex-col gap-3">
          <p className="ledger-eyebrow !text-crimson-light">I Know a Place · the weekly entry</p>
          <p className="ledger-display text-[1.5rem] leading-tight">One secret, one new place, one saving. Every week.</p>
          <div className="flex gap-2 mt-1">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input id="footer-email" name="email" type="email" required placeholder="Your email" className="flex-1 h-11 bg-transparent border border-paper/40 px-3.5 text-[14px] text-paper placeholder:text-paper/50 outline-none focus:border-paper" />
            <button type="submit" className="h-11 px-5 bg-paper text-crimson-deep ledger-eyebrow !text-[10.5px] !text-crimson-deep hover:bg-white">Sign me up</button>
          </div>
          <p className="ledger-eyebrow !text-[9px] !text-paper/55">Traveller · Trade · Press — pick one on the next step</p>
        </form>
      </div>

      {/* the six volumes as tabs */}
      <nav aria-label="The volumes" className="max-w-[1400px] mx-auto px-5 md:px-10">
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0.5">
          {VOLUMES.map((v, i) => (
            <li key={v.href}>
              <Link href={v.href} className="block h-full p-4 bg-paper/[0.04] hover:bg-paper/[0.09] transition-colors" style={{ borderTop: `3px solid ${LIGHT[v.tone ?? ""] ?? "#E8A598"}` }}>
                <span className="ledger-eyebrow !text-[9px] !text-paper/55">Volume {NUM[i]}</span>
                <span className="block ledger-display text-[1.35rem] leading-none mt-1.5">{v.label}</span>
                <span className="block text-[12.5px] text-paper/65 leading-snug mt-2 line-clamp-2">{v.intro}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* columns */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        <nav aria-label="Destinations">
          <p className="ledger-eyebrow !text-crimson-light">Destinations</p>
          <ul className="mt-3 space-y-1.5">
            {REGIONS.map((r) => <li key={r.href}><Link href={r.href} className="text-[14.5px] text-paper/85 hover:text-paper">{r.label}</Link></li>)}
          </ul>
        </nav>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="ledger-eyebrow !text-crimson-light">{col.title}</p>
            <ul className="mt-3 space-y-1.5">
              {col.links.map((l) => <li key={l.href}><Link href={l.href} className="text-[14.5px] text-paper/85 hover:text-paper">{l.label}</Link></li>)}
            </ul>
          </nav>
        ))}
        <div>
          <p className="ledger-eyebrow !text-crimson-light">Talk to the house</p>
          <ul className="mt-3 space-y-1.5 text-[14.5px]">
            <li><a href={`tel:${SITE.phone.tel}`} className="ledger-display text-[1.2rem] hover:text-white">{SITE.phone.display}</a></li>
            {SITE.email && <li><a href={`mailto:${SITE.email}`} className="text-paper/85 hover:text-paper">{SITE.email}</a></li>}
            <li className="pt-1"><Link href="/account" className="text-paper/85 hover:text-paper">My Folio</Link></li>
          </ul>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
            {SITE.social.map((s) => <li key={s.url}><a href={s.url} rel="me noopener" className="ledger-eyebrow !text-paper/70 hover:!text-paper">{s.label}</a></li>)}
          </ul>
        </div>
      </div>

      {/* credentials */}
      <div className="border-t border-paper/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="ledger-eyebrow !text-paper/65 leading-relaxed">{SITE.credentials.map((c) => `${c.label} ${c.value}`).join(" · ")} · {SITE.memberships.join(" · ")} · {SITE.name} LLC, {SITE.address.locality}, Florida</p>
          <span className="hidden md:block opacity-80"><JwcoSeal size={40} tone="light" /></span>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="ledger-eyebrow !text-paper/60">© {year} {SITE.name} · {SITE.homeOf} · Ledgered, not crowded</p>
          <div className="flex items-center gap-4">
            {LEGAL_NAV.map((l) => <Link key={l.href} href={l.href} className="ledger-eyebrow !text-paper/60 hover:!text-paper">{l.label}</Link>)}
            <a href="/llms.txt" className="ledger-eyebrow !text-paper/60 hover:!text-paper">llms.txt</a>
            <span className="ledger-hand text-xl text-crimson-light">J.W.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
