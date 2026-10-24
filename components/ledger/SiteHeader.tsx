"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight, Phone } from "lucide-react";
import { MAIN_EXTRA, PLAN_CTA, REGIONS, SITE, UTILITY_NAV, VOLUMES, type MegaMenu } from "@/lib/site";

// SiteHeader — utility row + main bar with the five volumes.
// overlay: the header floats transparent over a full-screen hero (home film)
// and settles onto Ledger paper once the element #hero-end scrolls past.
// Every menu link is a plain <a> rendered on the server and kept in the DOM
// (panels are shown with CSS on hover/focus), so crawlers read every link.

function VolumeMenu({ v, light }: { v: MegaMenu; light: boolean }) {
  return (
    <li className="group relative">
      <Link href={v.href} className={`ledger-eyebrow !text-[11px] !tracking-[0.2em] py-3 inline-block hover:opacity-60 ${light ? "!text-white" : "!text-ink"}`}>
        {v.label}
      </Link>
      <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition duration-200 absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
        <div className="w-[560px] ledger-page border ledger-border shadow-[0_12px_40px_rgba(45,42,38,0.18)] grid grid-cols-[1fr_1fr] gap-6 p-6 text-ink">
          <div>
            <p className="ledger-eyebrow ledger-crimson">{v.label}</p>
            <p className="ledger-display text-lg leading-snug mt-2">{v.intro}</p>
            <Link href={v.href} className="ledger-btn mt-5">Enter {v.label}</Link>
          </div>
          <div className="space-y-4">
            <div>
              <p className="ledger-eyebrow">Browse</p>
              <ul className="mt-2 space-y-1.5">
                {v.browse.map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-[15px] hover:ledger-crimson">{l.label}</Link></li>
                ))}
              </ul>
            </div>
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

function DestinationsMenu({ light }: { light: boolean }) {
  return (
    <li className="group relative">
      <Link href="/destinations" className={`ledger-eyebrow !text-[11px] !tracking-[0.2em] py-3 inline-block hover:opacity-60 ${light ? "!text-white" : "!text-ink"}`}>
        Destinations
      </Link>
      <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition duration-200 absolute right-0 top-full pt-2 z-50">
        <div className="w-[420px] ledger-page border ledger-border shadow-[0_12px_40px_rgba(45,42,38,0.18)] p-6 text-ink">
          <p className="ledger-eyebrow ledger-crimson">The ten regions</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
            {REGIONS.map((r) => (
              <li key={r.href}><Link href={r.href} className="text-[15px] hover:ledger-crimson">{r.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [solid, setSolid] = useState(!overlay);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => {
      const end = document.getElementById("hero-end");
      setSolid(end ? end.getBoundingClientRect().top <= 104 : window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [overlay]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const light = overlay && !solid && !open;
  const mainItem = `ledger-eyebrow !text-[11px] !tracking-[0.2em] py-3 inline-block hover:opacity-60 ${light ? "!text-white" : "!text-ink"}`;

  return (
    <>
    <header
      className={`${overlay ? "fixed" : "sticky"} top-0 inset-x-0 z-40 transition-colors duration-500 ${
        light ? "bg-transparent text-white" : "bg-paper/95 backdrop-blur border-b ledger-border text-ink"
      }`}
    >
      {/* Utility row */}
      <div className={`hidden lg:block border-b ${light ? "border-white/20" : "ledger-border"}`}>
        <div className="max-w-ledger mx-auto px-5 md:px-10 h-8 flex items-center justify-end gap-6">
          {UTILITY_NAV.map((l) => (
            <Link key={l.href} href={l.href} className={`ledger-eyebrow !text-[10px] hover:opacity-60 ${light ? "!text-white/85" : ""}`}>{l.label}</Link>
          ))}
          <a href={`tel:${SITE.phone.tel}`} className={`ledger-eyebrow !text-[10px] hover:opacity-60 ${light ? "!text-white/85" : ""}`}>{SITE.phone.display}</a>
          <a href={SITE.booking.url} className={`ledger-eyebrow !text-[10px] inline-flex items-center gap-1 hover:opacity-60 ${light ? "!text-white/85" : ""}`}>
            {SITE.booking.label} <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only">(opens the booking site)</span>
          </a>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-ledger mx-auto px-5 md:px-10 h-[72px] flex items-center justify-between gap-6">
        <Link href="/" className="flex flex-col leading-none shrink-0" aria-label={`${SITE.name}, home`}>
          <span className="ledger-display text-xl md:text-2xl">James Wild &amp; Co.</span>
          <span className={`ledger-eyebrow !text-[9px] mt-1 ${light ? "!text-white/75" : "ledger-crimson"}`}>{SITE.homeOf}</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {VOLUMES.map((v) => <VolumeMenu key={v.href} v={v} light={light} />)}
            <DestinationsMenu light={light} />
            {MAIN_EXTRA.filter((l) => l.href !== "/destinations").map((l) => (
              <li key={l.href}><Link href={l.href} className={mainItem}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={PLAN_CTA.href}
            className={`hidden sm:inline-flex items-center h-10 px-5 border ledger-eyebrow !text-[10.5px] transition-colors ${
              light ? "border-white/80 !text-white hover:bg-white hover:!text-ink" : "border-crimson !text-crimson hover:bg-crimson hover:!text-paper"
            }`}
          >
            {PLAN_CTA.label}
          </Link>
          <button type="button" className="lg:hidden p-2 -mr-2" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X className="w-6 h-6" strokeWidth={1.25} /> : <Menu className="w-6 h-6" strokeWidth={1.25} />}
          </button>
        </div>
      </div>

    </header>
      {/* Mobile menu: full screen, volumes first */}
      <div className={`lg:hidden fixed inset-x-0 top-[72px] bottom-0 z-40 ledger-page overflow-y-auto transition-opacity duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <nav aria-label="Mobile" className="px-5 py-6 text-ink">
          <p className="ledger-eyebrow ledger-crimson">The five volumes</p>
          <ul className="mt-3 border-t ledger-rule">
            {VOLUMES.map((v) => (
              <li key={v.href} className="border-b ledger-border">
                <Link href={v.href} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-4">
                  <span className="ledger-display text-2xl">{v.label}</span>
                  <span className="text-sm ledger-muted text-right max-w-[55%]">{v.intro}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {[...MAIN_EXTRA, ...UTILITY_NAV].map((l) => (
              <li key={l.href}><Link href={l.href} onClick={() => setOpen(false)} className="text-[17px]">{l.label}</Link></li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={PLAN_CTA.href} onClick={() => setOpen(false)} className="ledger-btn">{PLAN_CTA.label}</Link>
            <a href={`tel:${SITE.phone.tel}`} className="ledger-btn"><Phone className="w-3.5 h-3.5" strokeWidth={1.5} /> {SITE.phone.display}</a>
          </div>
        </nav>
      </div>
    </>
  );
}
