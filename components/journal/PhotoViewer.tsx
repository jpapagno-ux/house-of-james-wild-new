"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lockScroll } from "@/lib/scroll-lock";
import { PHOTOS_EVENT, setTrip, type PhotosAsk } from "@/lib/journal-style/bus";

// JWC-STYLE-01. The photograph viewer: every photograph of the stay, by section. Tabs across the top (each with
// its own thumbnail, and only the sections that have photographs), a tight grid beneath (three across on a phone),
// and one photograph full screen on a tap, swiped sideways. One button stays put over the photographs: Check
// dates; on a room photograph it carries that room into the request. Opened from anywhere on the page with
// openPhotos() (lib/journal-style/bus.ts). A dialog: Escape closes it, the page behind does not scroll, and focus
// returns to where it was.
export type ViewerPhoto = { url: string; alt: string; section: string | null; room?: string };
type Props = { slug: string; name: string; photos: ViewerPhoto[]; sections: { key: string; label: string }[]; credit?: string | null; reserveHref: string };

export default function PhotoViewer({ slug, name, photos, sections, credit, reserveHref }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<string>("all");
  const [at, setAt] = useState<number | null>(null); // index within the shown list, when one photograph is up
  const closeBtn = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLElement | null>(null);
  const rail = useRef<HTMLDivElement>(null);

  const tabs = useMemo(() => [{ key: "all", label: "All photographs", list: photos }, ...sections.map((s) => ({ ...s, list: photos.filter((p) => p.section === s.key) })).filter((s) => s.list.length > 0)], [photos, sections]);
  const shown = tabs.find((t) => t.key === tab)?.list ?? photos;

  useEffect(() => {
    const on = (e: Event) => {
      const ask = (e as CustomEvent<PhotosAsk>).detail ?? {};
      const t = ask.tab && tabs.some((x) => x.key === ask.tab) ? ask.tab : "all";
      back.current = document.activeElement as HTMLElement | null;
      setTab(t);
      const list = tabs.find((x) => x.key === t)?.list ?? photos;
      const i = ask.src ? list.findIndex((p) => p.url === ask.src) : -1;
      setAt(i >= 0 ? i : null);
      setOpen(true);
    };
    window.addEventListener(PHOTOS_EVENT, on);
    return () => window.removeEventListener(PHOTOS_EVENT, on);
  }, [tabs, photos]);

  const close = useCallback(() => { setOpen(false); setAt(null); back.current?.focus?.(); }, []);
  useEffect(() => {
    if (!open) return;
    const release = lockScroll();
    closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (at !== null) setAt(null); else close(); }
      if (at !== null && e.key === "ArrowRight") setAt((i) => (i === null ? i : Math.min(shown.length - 1, i + 1)));
      if (at !== null && e.key === "ArrowLeft") setAt((i) => (i === null ? i : Math.max(0, i - 1)));
    };
    window.addEventListener("keydown", key);
    return () => { release(); window.removeEventListener("keydown", key); };
  }, [open, at, close, shown.length]);

  // one photograph up: bring it into view in the sideways rail; a swipe updates the count
  useEffect(() => { if (at !== null && rail.current) { const el = rail.current.children[at] as HTMLElement | undefined; if (el && Math.abs(rail.current.scrollLeft - el.offsetLeft) > 4) rail.current.scrollTo({ left: el.offsetLeft }); } }, [at]);
  const onRail = () => { const r = rail.current; if (!r || at === null) return; const i = Math.round(r.scrollLeft / r.clientWidth); if (i !== at && i >= 0 && i < shown.length) setAt(i); };

  if (!open) return null;
  const one = at !== null ? shown[at] : null;
  const check = () => { if (one?.room) setTrip(slug, { room: one.room }); close(); window.location.hash = reserveHref.replace(/^#/, ""); };

  return (
    <div role="dialog" aria-modal="true" aria-label={`Photographs of ${name}`} className="fixed inset-0 z-[80] flex flex-col bg-white text-graphite">
      <div className="flex items-center gap-3 border-b border-[color:var(--jw-hairline)] px-4 md:px-8 py-3">
        <button ref={closeBtn} type="button" onClick={() => (at !== null ? setAt(null) : close())} className="house-chip !px-3 !py-2 font-semibold !text-[10.5px] tracking-[0.18em] uppercase">
          <span aria-hidden>←</span>{at !== null ? "All in this section" : "Back to the stay"}
        </button>
        <p className="min-w-0 flex-1 truncate font-display text-[19px] md:text-[22px]">{name}</p>
        <p className="shrink-0 font-mono text-[10px] tracking-[0.18em] uppercase text-stone-text">{at !== null ? `${at + 1} of ${shown.length}` : `${shown.length} photographs`}</p>
      </div>

      {at === null && (
        <div role="tablist" aria-label="Sections" className="flex gap-2.5 overflow-x-auto border-b border-[color:var(--jw-hairline)] px-4 md:px-8 py-3 [scrollbar-width:none]">
          {tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={t.key === tab} onClick={() => setTab(t.key)}
              className={`relative h-14 w-40 md:w-48 shrink-0 overflow-hidden border-2 text-left ${t.key === tab ? "border-[color:var(--jw-graphite)]" : "border-transparent"}`}>
              <Image src={t.list[0].url} alt="" fill sizes="192px" className="object-cover" />
              <span aria-hidden className="absolute inset-0 bg-[rgba(26,24,22,0.48)]" />
              <span className="absolute inset-0 flex items-center justify-between gap-2 px-3 font-body font-semibold text-[11px] tracking-[0.14em] uppercase text-white"><span className="truncate">{t.label}</span><span className="font-mono text-[10px] opacity-85">{t.list.length}</span></span>
            </button>
          ))}
        </div>
      )}

      {at === null ? (
        <div role="tabpanel" className="flex-1 overflow-y-auto px-4 md:px-8 pt-3 pb-28">
          <ul className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-1.5 md:gap-2.5">
            {shown.map((p, i) => (
              <li key={p.url}>
                <button type="button" onClick={() => setAt(i)} aria-label={`Open photograph ${i + 1}: ${p.alt}`} className="relative block w-full overflow-hidden bg-[color:var(--jw-mist)]" style={{ aspectRatio: "1 / 1" }}>
                  <Image src={p.url} alt={p.alt} fill sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 33vw" className="object-cover transition-transform duration-300 hover:scale-[1.03] motion-reduce:transition-none" />
                </button>
              </li>
            ))}
          </ul>
          {credit && <p className="mt-4 font-mono text-[10px] tracking-[0.16em] uppercase text-stone-text">Photographs courtesy of {credit}</p>}
        </div>
      ) : (
        <div className="relative flex-1 min-h-0 bg-ink-deep">
          <div ref={rail} onScroll={onRail} className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]">
            {shown.map((p, i) => (
              <figure key={p.url} className="relative h-full w-full shrink-0 snap-center">
                {Math.abs(i - at) <= 1 && <Image src={p.url} alt={p.alt} fill sizes="100vw" className="object-contain" priority={i === at} />}
              </figure>
            ))}
          </div>
          {at > 0 && <button type="button" onClick={() => setAt(at - 1)} aria-label="Previous photograph" className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center border border-white/60 text-white hover:bg-white/10">←</button>}
          {at < shown.length - 1 && <button type="button" onClick={() => setAt(at + 1)} aria-label="Next photograph" className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center border border-white/60 text-white hover:bg-white/10">→</button>}
          <p className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(26,24,22,0),rgba(26,24,22,0.85))] px-5 md:px-8 pt-10 pb-24 text-[13.5px] leading-snug text-white" aria-live="polite">{one?.alt}</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button type="button" onClick={check} className="pointer-events-auto flex-nowrap ledger-btn ledger-btn--house ledger-btn--compact bg-white shadow-[0_10px_30px_-12px_rgba(26,24,22,0.6)]">{one?.room ? `Check dates for the ${one.room}` : "Check dates"}</button>
      </div>
    </div>
  );
}
