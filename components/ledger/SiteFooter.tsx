import { VOLUME_ORDER, volumeInk, volumeLightInk } from "@/lib/volumes";
import Link from "next/link";
import { FLAGS } from "@/lib/booking-live/flags";
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
// Each volume's light ink for the tabs on a dark footer, from the one palette (lib/volumes.ts).
const LIGHT: Record<string, string> = Object.fromEntries(VOLUME_ORDER.map((k) => [volumeInk(k), volumeLightInk(k)]));


// Footer tones (James, 30 Oct 2026): the crimson block read too dark, so the
// footer takes a light, warm ground that sits with all six volume colours.
// Linen is the house default; the others stay for comparison.
export type FooterTone = "linen" | "parchment" | "stone" | "crimson";
const TONES: Record<FooterTone, { bg: string; ink: string; muted: string; accent: string; rule: string; btn: string; tabBg: string; tabHover: string; seal: "ink" | "light"; field: string; label: string }> = {
  linen: { bg: "linear-gradient(180deg, #F3EEE6 0%, #EAE3D7 100%)", ink: "#2D2A26", muted: "rgba(45,42,38,0.68)", accent: "#8B2525", rule: "rgba(45,42,38,0.16)", btn: "#8B2525", tabBg: "rgba(255,255,255,0.55)", tabHover: "rgba(255,255,255,0.9)", seal: "ink", field: "rgba(45,42,38,0.35)", label: "Linen" },
  parchment: { bg: "linear-gradient(180deg, #F8F4EC 0%, #EFE8DB 100%)", ink: "#2D2A26", muted: "rgba(45,42,38,0.68)", accent: "#8B2525", rule: "rgba(45,42,38,0.14)", btn: "#8B2525", tabBg: "rgba(255,255,255,0.6)", tabHover: "rgba(255,255,255,0.95)", seal: "ink", field: "rgba(45,42,38,0.3)", label: "Parchment" },
  stone: { bg: "linear-gradient(180deg, #E9E5DE 0%, #DDD7CC 100%)", ink: "#2F4034", muted: "rgba(47,64,52,0.72)", accent: "#8B2525", rule: "rgba(47,64,52,0.18)", btn: "#2F4034", tabBg: "rgba(255,255,255,0.5)", tabHover: "rgba(255,255,255,0.85)", seal: "ink", field: "rgba(47,64,52,0.35)", label: "Stone" },
  crimson: { bg: "linear-gradient(180deg, #8B2525 0%, #6E1C1C 55%, #4F1414 100%)", ink: "#F4F1ED", muted: "rgba(244,241,237,0.75)", accent: "#E8A598", rule: "rgba(244,241,237,0.18)", btn: "#F4F1ED", tabBg: "rgba(244,241,237,0.05)", tabHover: "rgba(244,241,237,0.1)", seal: "light", field: "rgba(244,241,237,0.4)", label: "Crimson" },
};
const DEFAULT_TONE: FooterTone = "linen";

export default function SiteFooter({ tone = DEFAULT_TONE }: { tone?: FooterTone }) {
  const year = new Date().getFullYear();
  const T = TONES[tone];
  const dark = tone === "crimson";
  return (
    <footer className="mt-20 pb-16 lg:pb-0" style={{ background: T.bg, color: T.ink }}>
      {/* statement + sign-up */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-14 md:pt-20 pb-10 grid lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-16 items-end">
        <div>
          <p className="ledger-eyebrow" style={{ color: T.accent }}>The House of James Wild &amp; Co · Exploring since {SITE.exploringSince}</p>
          <p className="ledger-h1 mt-3">James knows a place.</p>
          <p className="mt-5 text-[16px] max-w-xl leading-relaxed" style={{ color: T.muted }}>Forty-four years on the road, written into one Ledger. Six volumes. Nothing listed that hasn&rsquo;t been slept in, walked or sailed, and a named advisor for every journey.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={PLAN_CTA.href} className="ledger-btn" style={{ borderColor: T.btn, color: T.btn }}>{PLAN_CTA.label}</Link>
            <a href={`tel:${SITE.phone.tel}`} className="ledger-btn" style={{ borderColor: T.rule, color: T.ink }}>{SITE.phone.display}</a>
          </div>
        </div>
        <form action="/plan" method="get" className="border p-6 md:p-7 flex flex-col gap-3" style={{ borderColor: T.rule, background: dark ? "transparent" : "rgba(255,255,255,0.45)" }}>
          <p className="ledger-eyebrow" style={{ color: T.accent }}>I Know a Place · the weekly entry</p>
          <p className="ledger-display text-[1.5rem] leading-tight">One secret, one new place, one saving. Every week.</p>
          <div className="flex gap-2 mt-1">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input id="footer-email" name="email" type="email" required placeholder="Your email" className="flex-1 h-11 bg-transparent border px-3.5 text-[14px] outline-none" style={{ borderColor: T.field, color: T.ink }} />
            <button type="submit" className="h-11 px-5 ledger-eyebrow !text-[10.5px]" style={{ background: T.btn, color: dark ? "#6E1C1C" : "#F4F1ED" }}>Sign me up</button>
          </div>
          <p className="ledger-eyebrow !text-[9px]" style={{ color: T.muted }}>Traveller · Trade · Press — pick one on the next step</p>
        </form>
      </div>

      {/* the six volumes as tabs */}
      <nav aria-label="The volumes" className="max-w-[1400px] mx-auto px-5 md:px-10">
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0.5">
          {VOLUMES.map((v, i) => (
            <li key={v.href}>
              <Link href={v.href} className="block h-full p-4 transition-colors" style={{ background: T.tabBg, borderTop: `3px solid ${dark ? LIGHT[v.tone ?? ""] ?? "#E8A598" : v.tone ?? "#8B2525"}` }}>
                <span className="ledger-eyebrow !text-[9px]" style={{ color: T.muted }}>Volume {NUM[i]}</span>
                <span className="block ledger-display text-[1.35rem] leading-none mt-1.5">{v.label}</span>
                <span className="block text-[12.5px] leading-snug mt-2 line-clamp-2" style={{ color: T.muted }}>{v.intro}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* columns */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        <nav aria-label="Destinations">
          <p className="ledger-eyebrow" style={{ color: T.accent }}>Destinations</p>
          <ul className="mt-3 space-y-1.5">
            {REGIONS.map((r) => <li key={r.href}><Link href={r.href} className="text-[14.5px] hover:underline underline-offset-4">{r.label}</Link></li>)}
          </ul>
        </nav>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="ledger-eyebrow" style={{ color: T.accent }}>{col.title}</p>
            <ul className="mt-3 space-y-1.5">
              {col.links.map((l) => <li key={l.href}><Link href={l.href} className="text-[14.5px] hover:underline underline-offset-4">{l.label}</Link></li>)}
            </ul>
          </nav>
        ))}
        <div>
          <p className="ledger-eyebrow" style={{ color: T.accent }}>Talk to the house</p>
          <ul className="mt-3 space-y-1.5 text-[14.5px]">
            <li><a href={`tel:${SITE.phone.tel}`} className="ledger-display text-[1.2rem] hover:underline underline-offset-4">{SITE.phone.display}</a></li>
            {SITE.email && <li><a href={`mailto:${SITE.email}`} className="hover:underline underline-offset-4">{SITE.email}</a></li>}
            <li className="pt-1"><Link href={FLAGS.accounts ? "/account" : "/folio"} className="hover:underline underline-offset-4">My Folio</Link></li>
          </ul>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
            {SITE.social.map((s) => <li key={s.url}><a href={s.url} rel="me noopener" className="ledger-eyebrow hover:underline underline-offset-4" style={{ color: T.muted }}>{s.label}</a></li>)}
          </ul>
        </div>
      </div>

      {/* credentials */}
      <div className="border-t" style={{ borderColor: T.rule }}>
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="ledger-eyebrow leading-relaxed" style={{ color: T.muted }}>{SITE.credentials.map((c) => `${c.label} ${c.value}`).join(" · ")} · {SITE.memberships.join(" · ")} · {SITE.name} LLC, {SITE.address.locality}, Florida</p>
          <span className="hidden md:block opacity-90"><JwcoSeal size={44} tone={T.seal} /></span>
        </div>
      </div>
      <div className="border-t" style={{ borderColor: T.rule }}>
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="ledger-eyebrow" style={{ color: T.muted }}>© {year} {SITE.name} · Ledgered, not crowded</p>
          <div className="flex items-center gap-4">
            {LEGAL_NAV.map((l) => <Link key={l.href} href={l.href} className="ledger-eyebrow hover:underline underline-offset-4" style={{ color: T.muted }}>{l.label}</Link>)}
            <a href="/llms.txt" className="ledger-eyebrow hover:underline underline-offset-4" style={{ color: T.muted }}>llms.txt</a>
            <span className="ledger-hand text-xl" style={{ color: T.accent }}>J.W.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
