"use client";

import Image from "next/image";
import Link from "next/link";
import { FLAGS } from "@/lib/booking-live/flags";
import { useEffect, useRef, useState } from "react";
import { X, Search, Phone, ChevronRight } from "lucide-react";
import { MAIN_EXTRA, PLAN_CTA, REGIONS, SITE, UTILITY_NAV, LINKED_VOLUMES as VOLUMES, type MegaMenu } from "@/lib/site";
import { romanForHref } from "@/lib/volumes";
import { REGION_DATA } from "@/lib/content/regions";
import { HOME } from "@/lib/content/home";
import { live } from "@/lib/routes";
import { lockScroll } from "@/lib/scroll-lock";
import { JwcoSeal } from "./Marks";
import Wordmark from "./Wordmark";
import CompassSpin from "./CompassSpin";

// HouseMenu — the full-screen menu (house chrome, 30 Oct 2026). One "Menu"
// word in the bar opens it on every screen size. Left: the six volumes at
// display size, the one under the pointer previews on the right. Middle:
// the ten regions. Foot: the house (Compass, Ledger, Meet James, Advisors,
// Journal) and the phone. Every link is a plain <a> in the DOM when open.

const VOLS = live(VOLUMES) as MegaMenu[];
const REGS = live(REGIONS);
const EXTRA = live([...MAIN_EXTRA, ...UTILITY_NAV]);
// A volume keeps its own roman from lib/volumes.ts (Voyages is IV) even though Gatherings is not listed here.
const numOf = (v: { href: string }) => romanForHref(v.href);

function volumePhoto(v: MegaMenu): { url: string; alt: string } | null {
  const h = HOME.volumes.find((x) => x.path === v.href);
  if (h) return h.image;
  if (v.href === "/europe") { const r = REGION_DATA.find((x) => x.slug === "europe"); return r?.hero ? { url: r.hero, alt: "Other Europe" } : null; }
  return null;
}

export default function HouseMenu({ open, onClose, onSearch }: { open: boolean; onClose: () => void; onSearch: () => void }) {
  const [pick, setPick] = useState<string>(VOLS[0]?.href ?? "/stays");
  const root = useRef<HTMLDivElement>(null);
  // Focus moves into the menu on open, Tab stays inside it, and Escape or Close returns focus to the button that
  // opened it (nav audit P2-4, 3 Nov 2026). On phones the menu is a bottom sheet in the thumb zone (board 6).
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const release = lockScroll();
    const visible = () => [...(root.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]):not([tabindex="-1"])') ?? [])].filter((el) => el.offsetParent !== null);
    const t = window.setTimeout(() => visible()[0]?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;
      const els = visible(); if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.clearTimeout(t); window.removeEventListener("keydown", onKey); release(); opener?.focus?.(); };
  }, [open, onClose]);

  const picked = VOLS.find((v) => v.href === pick) ?? VOLS[0];
  const photo = picked ? volumePhoto(picked) : null;

  return (
    <div ref={root} className={`fixed inset-0 z-[60] text-ink transition-opacity duration-300 motion-reduce:transition-none ${open ? "opacity-100 visible" : "opacity-0 invisible"}`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open}>
      {/* Phones: the thumb-zone sheet (board 6, James approved 3 Nov 2026). The six volumes within reach of the thumb,
          the regions and the house below them, Search and Plan with James pinned at the bottom. */}
      <div className="md:hidden absolute inset-0">
        <button type="button" tabIndex={-1} aria-hidden="true" onClick={onClose} className="absolute inset-0 w-full bg-ink/40" />
        <div className={`absolute inset-x-0 bottom-0 max-h-[88svh] flex flex-col bg-paper shadow-[0_-20px_50px_rgba(26,24,22,0.25)] transition-transform duration-300 motion-reduce:transition-none ${open ? "translate-y-0" : "translate-y-full"}`}>
          <span className="block w-9 h-[2px] bg-[#CFC8BF] mx-auto mt-3" aria-hidden="true" />
          <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-ink">
            <span className="inline-flex items-center gap-2.5"><JwcoSeal size={24} /><span className="ledger-eyebrow !text-ink">The volumes</span></span>
            <button type="button" onClick={onClose} aria-label="Close menu" className="w-11 h-11 inline-flex items-center justify-center border ledger-border"><X className="w-4 h-4" strokeWidth={1.3} aria-hidden="true" /></button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5">
            <nav aria-label="The volumes">
              <ul>
                {VOLS.map((v) => (
                  <li key={v.href} className="border-b ledger-border">
                    <Link href={v.href} onClick={onClose} className="min-h-[64px] flex items-center gap-4">
                      <span className="w-1.5 h-10 shrink-0" style={v.tone ? { background: v.tone } : undefined} aria-hidden="true" />
                      <span className="ledger-eyebrow w-7 shrink-0">{numOf(v)}</span>
                      <span className="ledger-display text-[1.6rem] leading-tight flex-1">{v.label}</span>
                      <ChevronRight className="w-4 h-4 ledger-muted shrink-0" strokeWidth={1.2} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Destinations and the house" className="py-5">
              <p className="ledger-eyebrow ledger-crimson">The ten regions</p>
              <ul className="mt-2 grid grid-cols-2 gap-x-4">
                {REGS.map((r) => <li key={r.href}><Link href={r.href} onClick={onClose} className="min-h-[44px] flex items-center text-[15px]">{r.label}</Link></li>)}
                <li><Link href="/destinations" onClick={onClose} className="min-h-[44px] flex items-center text-[15px]">All destinations</Link></li>
              </ul>
              <p className="ledger-eyebrow ledger-crimson mt-4">The house</p>
              <ul className="mt-2 grid grid-cols-2 gap-x-4">
                {EXTRA.filter((l) => l.href !== "/destinations").map((l) => <li key={l.href}><Link href={l.href} onClick={onClose} className="min-h-[44px] flex items-center text-[15px]">{l.label}</Link></li>)}
                <li><Link href={FLAGS.accounts ? "/account" : "/folio"} onClick={onClose} className="min-h-[44px] flex items-center text-[15px]">My Folio</Link></li>
                <li><a href={`tel:${SITE.phone.tel}`} className="min-h-[44px] flex items-center gap-2 text-[15px]"><Phone className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />{SITE.phone.display}</a></li>
              </ul>
            </nav>
          </div>
          <div className="grid grid-cols-[52px_1fr] gap-2.5 px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] border-t ledger-border">
            <button type="button" onClick={() => { onClose(); onSearch(); }} aria-label="Search the house" className="house-chip h-[52px] w-[52px] inline-flex items-center justify-center"><Search className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></button>
            <Link href={PLAN_CTA.href} onClick={onClose} className="ledger-btn ledger-btn--house !h-[52px] justify-center whitespace-nowrap">{PLAN_CTA.label}</Link>
          </div>
        </div>
      </div>

      {/* Tablet and desktop: the full-screen house menu (30 Oct 2026). */}
      <div className="hidden md:block absolute inset-0 bg-paper">
      {/* bar */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-[72px] lg:h-[88px] flex items-center justify-between border-b ledger-border">
        <button type="button" onClick={onClose} className="inline-flex items-center gap-3 ledger-eyebrow !text-[11px] !text-ink hover:opacity-60" aria-label="Close menu">
          <X className="w-5 h-5" strokeWidth={1.25} aria-hidden="true" /> Close
        </button>
        <Link href="/" onClick={onClose} className="flex items-center gap-3" aria-label={`${SITE.name}, home`}>
          <JwcoSeal size={34} />
          <Wordmark style="editorial" size={0.6} rule={false} line={false} />
        </Link>
        <Link href={PLAN_CTA.href} onClick={onClose} className="ledger-btn hidden sm:inline-flex">{PLAN_CTA.label}</Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-[calc(100%-72px)] lg:h-[calc(100%-88px)] overflow-y-auto grid lg:grid-cols-[1.1fr_0.9fr_1fr] gap-x-12">
        {/* volumes */}
        <nav aria-label="The volumes" className="pt-8 lg:pt-12 pb-6">
          <p className="ledger-eyebrow ledger-crimson">The volumes</p>
          <ul className="mt-4 border-t ledger-rule">
            {VOLS.map((v) => (
              <li key={v.href} className="border-b ledger-border" onMouseEnter={() => setPick(v.href)} onFocus={() => setPick(v.href)}>
                <Link href={v.href} onClick={onClose} className="group flex items-baseline gap-5 py-3.5 lg:py-4">
                  <span className="ledger-eyebrow w-7 shrink-0 border-l-[5px] pl-1.5" style={v.tone ? { borderColor: v.tone } : undefined}>{numOf(v)}</span>
                  <span className={`ledger-display text-[2rem] lg:text-[2.6rem] leading-none whitespace-nowrap transition-colors ${pick === v.href ? "ledger-crimson" : ""}`}>{v.label}</span>
                  <span className="hidden xl:block ml-auto text-right text-[12.5px] ledger-muted max-w-[200px] leading-snug opacity-0 group-hover:opacity-100 transition">{v.intro}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => { onClose(); onSearch(); }} className="mt-6 w-full flex items-center gap-3 h-12 px-4 border ledger-rule text-left hover:border-crimson">
            <Search className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" />
            <span className="ledger-muted text-[15px]">Where to? A country, a camp, a ship, a feeling</span>
            <kbd className="ml-auto hidden lg:inline text-[10px] opacity-60 border border-current/40 px-1 leading-4">⌘K</kbd>
          </button>
        </nav>

        {/* regions + the house */}
        <nav aria-label="Destinations and the house" className="pt-2 lg:pt-12 pb-6">
          <p className="ledger-eyebrow ledger-crimson">The ten regions</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
            {REGS.map((r) => (
              <li key={r.href}><Link href={r.href} onClick={onClose} className="text-[16px] hover:ledger-crimson">{r.label}</Link></li>
            ))}
            <li><Link href="/destinations" onClick={onClose} className="ledger-eyebrow !text-[10px] hover:ledger-crimson">All destinations →</Link></li>
          </ul>
          <p className="ledger-eyebrow ledger-crimson mt-10">The house</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
            {EXTRA.filter((l) => l.href !== "/destinations").map((l) => (
              <li key={l.href}><Link href={l.href} onClick={onClose} className="text-[16px] hover:ledger-crimson inline-flex items-center gap-2">{l.href === "/compass" && <CompassSpin size={18} />}{l.label}</Link></li>
            ))}
            <li><Link href={FLAGS.accounts ? "/account" : "/folio"} onClick={onClose} className="text-[16px] hover:ledger-crimson">My Folio</Link></li>
          </ul>
          <div className="mt-10 flex flex-col gap-2 text-[15px]">
            <a href={`tel:${SITE.phone.tel}`} className="inline-flex items-center gap-2 hover:ledger-crimson"><Phone className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />{SITE.phone.display}</a>
            {SITE.email && <a href={`mailto:${SITE.email}`} className="hover:ledger-crimson">{SITE.email}</a>}
            <span className="ledger-eyebrow mt-1">Exploring since {SITE.exploringSince} · Ledgered, not crowded</span>
          </div>
        </nav>

        {/* preview */}
        <div className="hidden lg:block pt-12 pb-10">
          <Link href={picked?.href ?? "/"} onClick={onClose} className="relative block h-full min-h-[420px] bg-ink text-white overflow-hidden" aria-label={picked ? `Enter ${picked.label}` : "Enter"}>
            {VOLS.map((v) => { const p = volumePhoto(v); return p ? <Image key={v.href} src={p.url} alt="" fill sizes="33vw" className={`object-cover transition-opacity duration-500 ${pick === v.href ? "opacity-100" : "opacity-0"}`} /> : null; })}
            <span className="absolute inset-0 bg-gradient-to-t from-[rgba(38,20,22,0.88)] via-[rgba(38,20,22,0.15)] to-transparent" />
            <span className="absolute inset-x-0 top-0 h-1" style={{ background: picked?.tone ?? "var(--jw-accent-hex)" }} />
            <span className="absolute left-7 right-7 bottom-7">
              <span className="block ledger-eyebrow !text-white/75">Volume {picked ? numOf(picked) : ""}</span>
              <span className="block ledger-display text-[2.4rem] leading-none mt-2">{picked?.label}</span>
              <span className="block text-[14.5px] text-white/85 mt-3 max-w-sm leading-snug">{picked?.intro}</span>
              <span className="mt-4 inline-flex ledger-eyebrow !text-[11px] !text-white">Enter {picked?.label} →</span>
            </span>
            {!photo && <span className="absolute inset-0 bg-coast-deep" />}
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
