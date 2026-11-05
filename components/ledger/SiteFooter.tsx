import { VOLUME_STYLES, volumeForHref, volumeLeather } from "@/lib/volumes";
import KnowsStrip from "./KnowsStrip";
import Link from "next/link";
import Image from "next/image";
import { FLAGS } from "@/lib/booking-live/flags";
import { FOOTER_COLUMNS as ALL_COLUMNS, LEGAL_NAV as ALL_LEGAL, PLAN_CTA, REGIONS as ALL_REGIONS, SITE, LINKED_VOLUMES, HOUSE_LINE } from "@/lib/site";
import { defaultAdvisor } from "@/lib/content/advisors";
import { live } from "@/lib/routes";
import { FOOTER } from "@/lib/palette";
import { JwcoSeal } from "./Marks";

// The House Standard footer (James, 2 Nov 2026), in two parts:
// 1. "James knows a place" / Talk to the house (HouseInvitation, on the homepage just above the footer): a Stone Mist band, James's portrait (4:5) with a
//    5px crimson tab and the round JW seal, the headline, THE SEAL (Plan with James, used once) and the phone, three facts.
// 2. The footer: a warm Ink ground, ivory and stone type, Plex Mono labels in soft crimson, five columns (The Volumes
//    with a 3x14px tab in each Heritage pigment, Destinations, The House, Before You Go, Talk to the House), then
//    the credentials and legal line. Every existing link and credential is kept, only regrouped: "For the trade"
//    sits under The House. The volume cards strip that sat above the columns is gone: the Volumes column carries the
//    same links on every page, and the homepage has its own volume strip.
// Link guard: in production only built pages are listed; empty columns drop. Name, address and phone match the
// Organization schema. Volume colours come only from lib/volumes.ts.
const COL = Object.fromEntries(ALL_COLUMNS.map((c) => [c.title, live(c.links)]));
const HOUSE_LINKS = [...(COL["The House"] ?? []), ...(COL["For the trade"] ?? [])];
const BEFORE_LINKS = COL["Before You Go"] ?? [];
const LEGAL_NAV = live(ALL_LEGAL);
const REGIONS = live(ALL_REGIONS);
// The linked volumes, each with its Heritage tab (Gatherings is named in the house line, never linked).
const VOLUME_LINKS = live(LINKED_VOLUMES).map((v) => { const k = volumeForHref(v.href); return { label: v.label, href: v.href, roman: k ? VOLUME_STYLES[k].roman : "", tab: k ? volumeLeather(k) : "#8C8277" }; });

// Kept for the footer-tones preview page; the House Standard has one footer.
export type FooterTone = "ink" | "linen" | "parchment" | "stone" | "crimson";

const F = FOOTER; // lib/palette.ts
const label = "font-mono text-[10.5px] uppercase tracking-[0.22em]";

/** "James knows a place": the Talk to the house band (Stone Mist), above the footer. */
export function HouseInvitation() {
  const james = defaultAdvisor();
  const facts: [string, string][] = [[String(SITE.exploringSince), "Exploring since"], ["44 years", "On the road"], ["J.W.", "Founder, goes first"]];
  return (
    <section className="jw-invitation bg-mist mt-16 md:mt-24" aria-labelledby="house-invitation-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-16 md:py-[110px] grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 md:gap-16 items-center">
        <figure className="relative max-w-[420px] w-full">
          <div className="relative aspect-[4/5] bg-paper overflow-hidden">
            {james?.portrait && <Image src={james.portrait.url} alt={james.portrait.alt} fill sizes="(min-width: 768px) 420px, 90vw" className="object-cover" />}
          </div>
          {/* the 5px crimson tab on the left edge, near the top */}
          <span className="absolute -left-[5px] top-10 w-[5px] h-20 bg-house" aria-hidden="true" />
          {/* the round JW seal in a double hairline, bottom right */}
          <span className="absolute -right-5 -bottom-5 w-[92px] h-[92px] rounded-full bg-paper grid place-items-center jw-round" style={{ boxShadow: "0 0 0 1px #DCD7D0, 0 0 0 4px #FFFFFF, 0 0 0 5px #DCD7D0" }} aria-hidden="true">
            <JwcoSeal size={64} tone="ink" />
          </span>
        </figure>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-house">Talk to the house</p>
          <h2 id="house-invitation-heading" className="font-display font-normal text-[3.2rem] md:text-[4.6rem] lg:text-[92px] leading-[0.95] tracking-[-0.01em] mt-4" style={{ color: "#1A1816" }}>James knows a place.</h2>
          <p className="mt-6 text-[16.5px] max-w-xl leading-relaxed" style={{ color: "#6B635A" }}>Forty-four years on the road, written into one Ledger. Six volumes. Nothing listed that hasn&rsquo;t been slept in, walked or sailed, and a named advisor for every journey.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
            {/* THE SEAL: the signature moment, used once on the site (button family, James 2 Nov 2026). */}
            <Link href={PLAN_CTA.href} className="jw-seal-cta" data-event="seal_plan_click">
              <span className="jw-seal-cta__seal" aria-hidden="true">JW</span>
              <span><span className="jw-seal-cta__label">{PLAN_CTA.label}</span><span className="jw-seal-cta__sub">He answers personally</span></span>
            </Link>
            <a href={`tel:${SITE.phone.tel}`} className="ledger-btn self-center">{SITE.phone.display}</a>
          </div>
          <dl className="mt-10 pt-6 border-t border-[#DCD7D0] grid grid-cols-3 gap-4 max-w-xl">
            {facts.map(([n, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="ledger-display text-[1.6rem] md:text-[2rem] leading-none" style={{ color: "#1A1816" }}>{n}</dd>
                <dd className="font-mono text-[10px] uppercase tracking-[0.18em] mt-2" style={{ color: "#6B635A" }}>{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <p className={label} style={{ color: F.label }}>{title}</p>
      <div className="mt-4">{children}</div>
    </nav>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function SiteFooter({ tone }: { tone?: FooterTone }) {
  const year = new Date().getFullYear();
  const link = "text-[14.5px] hover:underline underline-offset-4 inline-flex items-center min-h-[44px] lg:min-h-0";
  return (
    <>
      <KnowsStrip />
      <footer className="site-footer mt-20 pb-16 lg:pb-0" style={{ background: `linear-gradient(180deg, ${F.ground} 70%, ${F.groundEnd})`, color: F.body }}>
        {/* top row: the seal and the house name; the weekly entry on the right */}
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-14 md:pt-20 pb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 border-b" style={{ borderColor: F.rule }}>
          <div className="flex items-center gap-5">
            <span className="shrink-0 opacity-95"><JwcoSeal size={64} tone="light" /></span>
            <div>
              <p className="font-display font-medium text-[34px] md:text-[40px] leading-none text-white">James Wild &amp; Co.</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] mt-2.5" style={{ color: F.soft }}>Ledgered, not crowded · Exploring since {SITE.exploringSince}</p>
            </div>
          </div>
          <form action="/plan" method="get" className="w-full lg:w-auto lg:min-w-[420px]">
            <p className={label} style={{ color: F.label }}>I Know a Place · the weekly entry</p>
            <p className="text-[14px] mt-2" style={{ color: F.soft }}>One secret, one new place, one saving. Every week.</p>
            <div className="flex mt-3">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input id="footer-email" name="email" type="email" required placeholder="Your email" className="flex-1 min-w-0 h-11 bg-transparent border px-3.5 text-[14px] outline-none rounded-[2px] placeholder:text-[#8C8277] focus:border-[#B8AFA5]" style={{ borderColor: F.field, color: F.body }} />
              <button type="submit" className="h-11 px-5 -ml-px border rounded-[2px] font-display font-semibold uppercase tracking-[0.18em] text-[14px] text-white hover:bg-white/5" style={{ borderColor: F.field }}>Subscribe</button>
            </div>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] mt-2" style={{ color: F.legal }}>Traveller, trade or press: pick one on the next step</p>
          </form>
        </div>

        {/* five columns */}
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-10">
          <Column title="The Volumes">
            <ul className="space-y-0 lg:space-y-2">
              {VOLUME_LINKS.map((v) => (
                <li key={v.href}><Link href={v.href} className={`${link} inline-flex items-center gap-2.5`}><span className="w-[3px] h-[14px] shrink-0" style={{ background: v.tab }} aria-hidden="true" /><span className="font-mono text-[10px] w-5" style={{ color: F.legal }}>{v.roman}</span>{v.label}</Link></li>
              ))}
            </ul>
            {/* The house's lines in plain text; Gatherings is named, never linked (James, 2 Nov 2026). */}
            <p className="mt-4 text-[12.5px]" style={{ color: F.soft }}>{HOUSE_LINE.join(" · ")}</p>
          </Column>
          {REGIONS.length > 0 && <Column title="Destinations">
            <ul className="space-y-0 lg:space-y-2">{REGIONS.map((r) => <li key={r.href}><Link href={r.href} className={link}>{r.label}</Link></li>)}</ul>
          </Column>}
          {HOUSE_LINKS.length > 0 && <Column title="The House">
            <ul className="space-y-0 lg:space-y-2">{HOUSE_LINKS.map((l) => <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>)}</ul>
          </Column>}
          {BEFORE_LINKS.length > 0 && <Column title="Before You Go">
            <ul className="space-y-0 lg:space-y-2">{BEFORE_LINKS.map((l) => <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>)}</ul>
          </Column>}
          <Column title="Talk to the House">
            <ul className="space-y-2 text-[14.5px]">
              <li><a href={`tel:${SITE.phone.tel}`} className="font-display text-[26px] leading-none text-white hover:underline underline-offset-4">{SITE.phone.display}</a></li>
              {SITE.email && <li className="pt-1"><a href={`mailto:${SITE.email}`} className={link}>{SITE.email}</a></li>}
              <li><Link href={FLAGS.accounts ? "/account" : "/folio"} className={link}>My Folio</Link></li>
            </ul>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
              {SITE.social.map((s) => <li key={s.url}><a href={s.url} rel="me noopener" className="font-mono text-[10.5px] uppercase tracking-[0.18em] hover:underline underline-offset-4 inline-flex items-center min-h-[44px] lg:min-h-0" style={{ color: F.soft }}>{s.label}</a></li>)}
            </ul>
          </Column>
        </div>

        {/* credentials, then copyright and legal */}
        <div className="border-t" style={{ borderColor: F.rule }}>
          <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] leading-relaxed" style={{ color: F.legal }}>{SITE.credentials.map((c) => `${c.label} ${c.value}`).join(" · ")} · {SITE.memberships.join(" · ")} · {SITE.name} LLC, {SITE.address.locality}, Florida</p>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: F.rule }}>
          <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: F.legal }}>
            <p>© {year} {SITE.name} · Ledgered, not crowded</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {LEGAL_NAV.map((l) => <Link key={l.href} href={l.href} className="hover:underline underline-offset-4 inline-flex items-center min-h-[44px] lg:min-h-0">{l.label}</Link>)}
              <a href="/llms.txt" className="hover:underline underline-offset-4 inline-flex items-center min-h-[44px] lg:min-h-0">llms.txt</a>
              <span className="ledger-hand text-xl normal-case tracking-normal" style={{ color: F.soft }}>J.W.</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
