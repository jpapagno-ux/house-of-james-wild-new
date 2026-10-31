"use client";

import Link from "next/link";
import { FLAGS } from "@/lib/booking-live/flags";
import { useEffect, useState } from "react";
import { Menu, X, Phone, Search } from "lucide-react";
import { JwcoSeal } from "./Marks";
import { REGION_DATA } from "@/lib/content/regions";
import SearchPanel from "./SearchPanel";
import HouseMenu from "./HouseMenu";
import CompassSpin from "./CompassSpin";
import { MAIN_EXTRA as ALL_EXTRA, PLAN_CTA, REGIONS as ALL_REGIONS, SITE, UTILITY_NAV as ALL_UTILITY, VOLUMES as ALL_VOLUMES, type MegaMenu } from "@/lib/site";
import { GUARD_ON, isBuilt, live } from "@/lib/routes";

// Link guard: in production only built pages appear in the menus.
const VOLUMES = live(ALL_VOLUMES).map((v) => ({ ...v, browse: live(v.browse), ledger: live(v.ledger) }));
const REGIONS = live(ALL_REGIONS).map((r) => ({ ...r, countries: live(r.countries) }));
const UTILITY_NAV = live(ALL_UTILITY);
const MAIN_EXTRA = live(ALL_EXTRA);
const SHOW_DESTINATIONS = !GUARD_ON || isBuilt("/destinations");

// SiteHeader — utility row + main bar with the five volumes.
// overlay: the header floats transparent over a full-screen hero (home film)
// and settles onto Ledger paper once the element #hero-end scrolls past.
// Every menu link is a plain <a> rendered on the server and kept in the DOM
// (panels are shown with CSS on hover/focus), so crawlers read every link.

function VolumeMenu({ v, light }: { v: MegaMenu; light: boolean }) {
  return (
    <li className="group relative">
      <Link href={v.href} className={`ledger-eyebrow !text-[11px] !tracking-[0.2em] py-3 inline-flex items-center gap-2 whitespace-nowrap hover:opacity-60 ${light ? "!text-white" : "!text-ink"}`}>
        {v.tone && <span className="w-1.5 h-1.5 rounded-full" style={{ background: light ? "rgba(255,255,255,.85)" : v.tone }} aria-hidden="true" />}
        {v.label}
        <svg className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 group-hover:translate-y-px transition" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m2 3.5 3 3 3-3" /></svg>
      </Link>
      <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition duration-200 absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
        <div className="w-[600px] ledger-page border ledger-border shadow-[0_18px_50px_rgba(45,42,38,0.18)] grid grid-cols-[1.1fr_1fr] gap-8 p-7 text-ink" style={v.tone ? { borderTop: `3px solid ${v.tone}` } : undefined}>
          <div>
            <p className="ledger-eyebrow" style={v.tone ? { color: v.tone } : undefined}>{v.label}</p>
            <p className="ledger-display text-[1.35rem] leading-snug mt-2">{v.intro}</p>
            <Link href={v.href} className="ledger-btn mt-5" style={v.tone ? { borderColor: v.tone, color: v.tone } : undefined}>Enter {v.label}</Link>
          </div>
          <div className="space-y-4">
            {v.browse.length > 0 && <div>
              <p className="ledger-eyebrow">Browse</p>
              <ul className="mt-2 space-y-1.5">
                {v.browse.map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-[15px] hover:ledger-crimson">{l.label}</Link></li>
                ))}
              </ul>
            </div>}
            {v.ledger.length > 0 && (
              <div>
                <p className="ledger-eyebrow">From the Ledger</p>
                <ul className="mt-2 space-y-1.5">
                  {v.ledger.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[15px] hover:ledger-crimson">{l.label}</Link>
                      {l.note && <span className="ledger-eyebrow ml-2">{l.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

const REGION_HERO: Record<string, string | null> = Object.fromEntries(REGION_DATA.map((r) => [r.slug, r.hero]));

function DestinationsMenu({ light }: { light: boolean }) {
  // Image-led: the photograph on the right changes with the region under the
  // pointer (house chrome, 30 Oct 2026). Every link stays a plain <a> in the DOM.
  const [pick, setPick] = useState<string>(REGIONS[0]?.slug ?? "africa");
  const cls = `ledger-eyebrow !text-[11px] !tracking-[0.2em] py-3 inline-block hover:opacity-60 ${light ? "!text-white" : "!text-ink"}`;
  if (!REGIONS.length) return <li><Link href="/destinations" className={cls}>Destinations</Link></li>;
  const hero = REGION_HERO[pick];
  const picked = REGIONS.find((r) => r.slug === pick);
  return (
    <li className="group relative">
      <Link href="/destinations" className={`${cls} !inline-flex items-center gap-2`}>Destinations<svg className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m2 3.5 3 3 3-3" /></svg></Link>
      <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition duration-200 absolute left-0 top-full pt-2 z-50">
        <div className="w-[960px] ledger-page border ledger-border border-t-[3px] border-t-crimson shadow-[0_18px_50px_rgba(45,42,38,0.18)] grid grid-cols-[1.25fr_1fr] text-ink">
          <div className="p-6">
            <div className="flex items-baseline justify-between">
              <p className="ledger-eyebrow ledger-crimson">The ten regions</p>
              <Link href="/destinations" className="ledger-eyebrow hover:ledger-crimson">All destinations</Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4" onMouseLeave={() => setPick(REGIONS[0]?.slug ?? "africa")}>
              {REGIONS.map((r) => (
                <div key={r.href} onMouseEnter={() => setPick(r.slug)} onFocus={() => setPick(r.slug)}>
                  <Link href={r.href} className={`ledger-display text-[18px] leading-tight hover:ledger-crimson ${pick === r.slug ? "ledger-crimson" : ""}`}>{r.label}</Link>
                  {r.countries.length > 0 && (
                    <p className="mt-0.5 text-[13px] ledger-muted leading-snug">
                      {r.countries.slice(0, 5).map((c, i) => (
                        <span key={c.href}>{i > 0 && " · "}<Link href={c.href} className="hover:ledger-crimson">{c.label}</Link></span>
                      ))}
                      {r.countries.length > 5 && <span> · <Link href={r.href} className="hover:ledger-crimson">+{r.countries.length - 5}</Link></span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Link href={picked?.href ?? "/destinations"} className="relative block bg-ink text-white overflow-hidden min-h-[380px]" aria-label={picked ? `${picked.label}, all destinations` : "Destinations"}>
            {REGIONS.map((r) => {
              const src = REGION_HERO[r.slug];
              return src ? <img key={r.slug} src={src} alt="" loading="lazy" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${pick === r.slug ? "opacity-100" : "opacity-0"}`} /> : null;
            })}
            {!hero && <span className="absolute inset-0 bg-coast-deep" />}
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <span className="absolute left-6 right-6 bottom-5">
              <span className="block ledger-eyebrow !text-white/75">Vetted country by country</span>
              <span className="block ledger-display text-[2rem] leading-none mt-1">{picked?.label}</span>
            </span>
          </Link>
        </div>
      </div>
    </li>
  );
}

export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [solid, setSolid] = useState(!overlay);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  // "/" or Ctrl/⌘+K opens search from anywhere (not while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setSearching(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => {
      const end = document.getElementById("hero-end");
      setSolid(end ? end.getBoundingClientRect().top <= 164 : window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [overlay]);


  const light = overlay && !solid && !open;
  const mainItem = `ledger-eyebrow !text-[11px] !tracking-[0.2em] py-3 inline-block hover:opacity-60 ${light ? "!text-white" : "!text-ink"}`;

  return (
    <>
    <header
      className={`${overlay ? "fixed" : "sticky"} top-0 inset-x-0 z-40 transition-colors duration-500 ${
        light ? "bg-transparent text-white" : "bg-gradient-to-b from-paper via-paper to-[#FBF5F4] backdrop-blur border-b ledger-border text-ink"
      }`}
    >
      {!light && <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #6E1C1C, #8B2525 40%, #C0574A 70%, #8B2525)" }} aria-hidden="true" />}
      {/* The band (house chrome, 30 Oct 2026): the seal and wordmark centred on
          their own line, search left, the reader's tools right; the six volumes
          on one centred line beneath. Transparent over a film, paper once scrolled. */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-[76px] lg:h-[116px] grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center gap-3 lg:gap-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setOpen(true)} className={`inline-flex items-center gap-3 h-10 ledger-eyebrow !text-[11px] !tracking-[0.24em] hover:opacity-60 ${light ? "!text-white" : "!text-ink"}`} aria-label="Open menu" aria-expanded={open}>
            <span className="flex flex-col gap-[5px]" aria-hidden="true"><span className="block w-6 h-px bg-current" /><span className="block w-6 h-px bg-current" /></span>
            <span className="hidden sm:inline">Menu</span>
          </button>
          <button
            type="button"
            onClick={() => setSearching(true)}
            className={`hidden lg:inline-flex items-center gap-2.5 h-10 pl-3 pr-3.5 border transition-colors ${light ? "border-white/50 text-white hover:bg-white/10" : "ledger-border hover:border-crimson"}`}
            aria-label="Search the Ledger"
          >
            <Search className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            <span className="ledger-eyebrow !text-[10.5px] !text-current">Where to?</span>
            <kbd className="hidden xl:inline text-[10px] opacity-60 border border-current/40 px-1 leading-4">⌘K</kbd>
          </button>
        </div>

        {/* The lockup: the oxblood seal large beside the wordmark, Cormorant 700,
            with the house line beneath. Cream over a film. On phones the lockup
            is centred between Menu and Plan, the seal at 40, the wordmark at
            1.35rem and only "Exploring since 1982" beneath (mobile pass, 31 Oct 2026). */}
        <Link href="/" className="flex items-center gap-2.5 md:gap-4 lg:gap-5 leading-none shrink-0 justify-self-center min-w-0" aria-label={`${SITE.name}, home`}>
          <span className={`block lg:hidden ${light ? "opacity-95" : ""}`}><JwcoSeal size={40} tone={light ? "light" : "ink"} /></span>
          <span className={`hidden lg:block ${light ? "opacity-95" : ""}`}><JwcoSeal size={78} tone={light ? "light" : "ink"} /></span>
          <span className="flex flex-col min-w-0">
            <span className="font-display font-bold text-[1.35rem] md:text-[2.1rem] lg:text-[2.6rem] tracking-[-0.02em] leading-none whitespace-nowrap">James Wild &amp; Co.</span>
            <span className={`ledger-eyebrow !text-[8.5px] md:!text-[10px] !tracking-[0.28em] md:!tracking-[0.32em] mt-1.5 md:mt-2 whitespace-nowrap ${light ? "!text-white/80" : "!text-crimson"}`}>Exploring since {SITE.exploringSince}<span className="hidden md:inline"> · {SITE.homeOf}</span></span>
          </span>
        </Link>

        <div className="flex items-center justify-end gap-3">
          <ul className="hidden lg:flex items-center gap-4 mr-1">
            {MAIN_EXTRA.filter((l) => l.href !== "/destinations").map((l) => (
              <li key={l.href}><Link href={l.href} className={mainItem}>{l.label}</Link></li>
            ))}
            {/* The founder's Compass rose, turning (James, 30 Oct 2026: approved site-wide) */}
            <li><Link href="/compass" className={`${mainItem} !inline-flex items-center gap-2`}><CompassSpin size={18} light={light} />Compass</Link></li>
            {FLAGS.accounts && <li><Link href="/account" className={mainItem}>My Folio</Link></li>}
          </ul>
          <Link
            href={PLAN_CTA.href}
            className={`inline-flex items-center whitespace-nowrap h-10 px-3.5 sm:px-5 border ledger-eyebrow !text-[10.5px] transition-colors ${
              light ? "border-white/80 !text-white hover:bg-white hover:!text-ink" : "border-crimson !text-crimson hover:bg-crimson hover:!text-paper"
            }`}
          >
            <span className="sm:hidden">Plan</span><span className="hidden sm:inline">{PLAN_CTA.label}</span>
          </Link>
        </div>
      </div>

      {/* The six volumes, one centred line */}
      <nav aria-label="Main" className={`hidden lg:block border-t ${light ? "border-white/20" : "ledger-border"}`}>
        <ul className="max-w-[1400px] mx-auto px-10 h-12 flex items-center justify-center gap-8 xl:gap-11">
          {SHOW_DESTINATIONS && <DestinationsMenu light={light} />}
          {VOLUMES.map((v) => <VolumeMenu key={v.href} v={v} light={light} />)}
        </ul>
      </nav>
    </header>
      <SearchPanel open={searching} onClose={() => setSearching(false)} />
      <HouseMenu open={open} onClose={() => setOpen(false)} onSearch={() => setSearching(true)} />
    </>
  );
}
