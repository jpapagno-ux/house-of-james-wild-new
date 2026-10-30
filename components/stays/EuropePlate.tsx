// EuropePlate — the "old Europe" art treatment for Volume V stays, ported from
// James's Not So Wild · Europe sample in Stay Studio (Renaissance set): a
// watercolour plate of the property (AI-painted on Cloudinary from the house's
// own hero photograph), a double-line engraved frame, an azulejo-star divider,
// swash flourishes and a line-art emblem. Design layer only: it sits inside
// the normal stay page and changes none of its data or logic.

import type { ReactNode } from "react";

const INK = "#4A3628";
const TERRA = "#A65B33";

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} aria-hidden="true">
      <span className="block h-px flex-1 max-w-[70px]" style={{ background: `${TERRA}8C` }} />
      <svg viewBox="0 0 220 40" className="w-[150px] md:w-[200px] h-9" style={{ color: INK }} fill="currentColor">
        <path d="M2 24c8-8 18-4 26 2 6 4 12 4 16 1-3 5-10 7-16 5 3 4 2 9-3 10-3-4-5-8-5-11-7 1-14-2-18-7z" />
        <path d="M44 27c-6 5-14 4-18-1 4 0 8-2 10-5 3 3 6 5 8 6z" />
        <circle cx="52" cy="22" r="2.4" />
        <path d="M218 24c-8-8-18-4-26 2-6 4-12 4-16 1 3 5 10 7 16 5-3 4-2 9 3 10 3-4 5-8 5-11 7 1 14-2 18-7z" />
        <path d="M176 27c6 5 14 4 18-1-4 0-8-2-10-5-3 3-6 5-8 6z" />
        <circle cx="168" cy="22" r="2.4" />
        <path d="M58 23h44v3H58zM118 23h44v3h-44z" />
        <path d="M110 5l4.8 12.2L127 22l-12.2 4.8L110 39l-4.8-12.2L93 22l12.2-4.8z" />
        <circle cx="110" cy="22" r="2.6" fill="#6E7248" />
      </svg>
      <span className="block h-px flex-1 max-w-[70px]" style={{ background: `${TERRA}8C` }} />
    </div>
  );
}

function SwashPair() {
  return (
    <svg viewBox="0 0 200 44" className="w-32 h-8" style={{ color: TERRA }} fill="currentColor" aria-hidden="true">
      <path d="M98 12C70 12 40 22 28 40 22 30 14 26 4 28c8 2 12 7 14 14 18 4 48-8 62-18 6-4 12-8 18-12z" opacity="0.9" />
      <path d="M102 12c28 0 58 10 70 28 6-10 14-14 24-12-8 2-12 7-14 14-18 4-48-8-62-18-6-4-12-8-18-12z" opacity="0.9" />
      <path d="M96 36c2-6 6-10 12-12-2 5-3 9-3 12h-9zM104 36c-2-6-6-10-12-12 2 5 3 9 3 12h9z" />
    </svg>
  );
}

export function EngravedFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative bg-white" style={{ border: `1px solid ${TERRA}99` }}>
      <div className="absolute inset-[4px] pointer-events-none" style={{ border: `1px solid ${TERRA}40` }} />
      {children}
    </div>
  );
}

function Stork({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 72" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
      <path d="M18 40c8-12 22-18 34-16 10 2 20 8 26 16" />
      <path d="M52 24c2-8 8-14 16-16-4 6-6 12-6 18" />
      <path d="M62 26c6-2 12-1 16 3-5 0-9 2-12 5" />
      <path d="M78 29l10-3-9 6" />
      <path d="M48 28c-4 10-4 20 0 30" />
      <path d="M48 58l-4 10M48 58l5 10" />
      <path d="M30 44c-4 2-8 2-12 0 4-2 8-3 12 0zM66 44c4 2 8 2 12 0-4-2-8-3-12 0z" />
      <path d="M10 66c12-4 26-6 38-4 12 2 26 2 38-2" opacity="0.6" />
    </svg>
  );
}

function Medallion({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 84" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M12 80V34c0-11 9-20 20-20s20 9 20 20v46" />
      <path d="M6 80h52" />
      <path d="M32 56V22" />
      <path d="M32 30c-4-5-9-6-14-4 5 1 10 2 14 4zM32 30c4-5 9-6 14-4-5 1-10 2-14 4z" />
      <path d="M32 44c-4-5-9-6-14-4 5 1 10 2 14 4zM32 44c4-5 9-6 14-4-5 1-10 2-14 4z" />
    </svg>
  );
}

const dms = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`;

export type Plate = { url: string; caption: string; emblem?: "stork" | "arch"; emblemNote?: string; no?: string };

export default function EuropePlate({ plate, name, place, coords }: { plate: Plate; name: string; place?: string | null; coords?: { lat: number; lng: number } | null }) {
  const where = [coords ? `${dms(coords.lat, "N", "S")} | ${dms(coords.lng, "E", "W")}` : null, place].filter(Boolean).join(" · ");
  return (
    <section className="mt-14 md:mt-20" aria-label={`Watercolour plate of ${name}`}>
      <Ornament className="mb-8" />
      <div className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-center">
        <EngravedFrame>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={plate.url} alt={`Watercolour plate of ${name}: ${plate.caption}`} loading="lazy" className="w-full h-64 md:h-96 object-cover" style={{ mixBlendMode: "multiply" }} />
          <div className="py-3 text-center" style={{ borderTop: `1px solid ${TERRA}66` }}>
            <p className="font-display text-[11px] tracking-[0.26em] uppercase" style={{ color: TERRA }}>{plate.caption} · Plate {plate.no ?? "I"}</p>
            {where && <p className="mt-1 text-[11px] tracking-[0.28em] uppercase" style={{ color: "#737373" }}>{where}</p>}
          </div>
        </EngravedFrame>
        <div className="flex flex-col items-center gap-3" style={{ color: INK }}>
          <SwashPair />
          {plate.emblem === "stork" ? <Stork className="w-20 md:w-24" /> : <Medallion className="w-14 md:w-16" />}
          {plate.emblemNote && <p className="font-display text-[11px] tracking-[0.26em] uppercase text-center max-w-[160px]" style={{ color: TERRA }}>{plate.emblemNote}</p>}
          <SwashPair />
        </div>
      </div>
      <p className="mt-3 text-[12px] ledger-muted">Watercolour plate painted for the Ledger from the house&apos;s photograph.</p>
    </section>
  );
}
