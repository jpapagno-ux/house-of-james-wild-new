import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import ScrollHero, { type HeroFrame } from "@/components/exceptional-few/ScrollHero";
import { PATHWAYS, type PathwayId } from "@/lib/pathways";

// Two openings for a cruise page in the manner of The Exceptional Few (James, 8 Nov 2026: "blend that beautiful
// introduction with all those photos into the beginning of the cruises... using that tint and the colours assigned
// to the journeys, style and pathways"). Previews only (app/preview/voyages/*), chosen before any rollout.
//   A, "The Arrival": the EF three-frame scroll arrival (place, the way in, the name), then a pathway-ruled glance
//     and three "why this voyage" frames on Paper.
//   B, "Pathway Dusk": one strong frame on a slow drift, then the journey's own pathway colour as the surface
//     (as Amangiri Mock C used dusk plum), a line or two per screen, three frames, and a photographic close.
// Colour: the pathway accent comes from lib/pathways.ts, never written here; house crimson stays the one accent on
// the action. Every image is credited from its own record.

export type OpeningPhoto = { src: string; alt: string; caption?: string; credit: string };
export type OpeningWhy = { title: string; line: string; photo: OpeningPhoto };
export type OpeningGlance = [string, string][];

const cl = (id: string, w = 2560) => `https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto:best,c_limit,w_${w}/${id}`;
export const photo = (id: string, alt: string, credit: string, caption?: string, w?: number): OpeningPhoto => ({ src: cl(id, w), alt, credit, caption });

function Glance({ items, accent, onDark = false }: { items: OpeningGlance; accent: string; onDark?: boolean }) {
  return (
    <dl className={`grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 border-t pt-6 ${onDark ? "border-white/25" : "ledger-rule"}`} style={{ borderTopColor: onDark ? undefined : accent }}>
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className={`ledger-eyebrow ${onDark ? "!text-white/70" : ""}`}>{k}</dt>
          <dd className={`mt-1 ledger-display text-[20px] md:text-[22px] leading-snug ${onDark ? "text-white" : ""}`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function PathwayMark({ id, onDark = false }: { id: PathwayId; onDark?: boolean }) {
  const p = PATHWAYS[id];
  return (
    <span className={`house-chip ${onDark ? "!bg-transparent !text-white !border-white/45" : ""}`}>
      <span aria-hidden="true" className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: onDark ? "#FFFFFF" : p.accent }} />
      {p.name}
    </span>
  );
}

function WhyFrames({ why, onDark = false }: { why: OpeningWhy[]; onDark?: boolean }) {
  return (
    <ol className="grid gap-6 md:grid-cols-3">
      {why.map((w, i) => (
        <li key={w.title}>
          <figure>
            <div className="relative aspect-[4/5] overflow-hidden bg-ink">
              <Image src={w.photo.src} alt={w.photo.alt} fill sizes="(min-width: 768px) 32vw, 92vw" quality={85} className="object-cover transition-transform duration-[1600ms] hover:scale-[1.04]" />
            </div>
            <figcaption className={`mt-1.5 text-[11px] tracking-[0.04em] ${onDark ? "text-white/60" : "ledger-muted"}`}>{w.photo.credit}</figcaption>
          </figure>
          <p className={`mt-4 ledger-eyebrow ${onDark ? "!text-white/70" : ""}`}>{String(i + 1).padStart(2, "0")}</p>
          <h3 className={`mt-1 ledger-display text-[24px] leading-tight ${onDark ? "text-white" : ""}`}>{w.title}</h3>
          <p className={`mt-2 text-[15.5px] leading-relaxed ${onDark ? "text-white/85" : "ledger-muted"}`}>{w.line}</p>
        </li>
      ))}
    </ol>
  );
}

const Plan = ({ href, onDark = false }: { href: string; onDark?: boolean }) => (
  <Link href={href} className={`ledger-btn ledger-btn--house ${onDark ? "!bg-white !text-ink" : ""}`}>Plan with James</Link>
);

/** A: "The Arrival". */
export function OpeningArrival({ frames, designation, title, place, line, pathway, glance, why, planHref, note }: {
  frames: HeroFrame[]; designation: string; title: string; place: string; line: string; pathway: PathwayId; glance: OpeningGlance; why: OpeningWhy[]; planHref: string; note?: ReactNode;
}) {
  const accent = PATHWAYS[pathway].accent;
  return (
    <>
      <ScrollHero frames={frames} designation={designation} title={title} place={place} line={line} actions={<Plan href={planHref} onDark />} />
      <section className="bg-paper">
        <div className="max-w-ledger mx-auto px-5 md:px-10 py-14 md:py-20">
          <div className="flex flex-wrap items-center gap-3"><PathwayMark id={pathway} /><span className="ledger-eyebrow">Why this voyage</span></div>
          <div className="mt-6"><Glance items={glance} accent={accent} /></div>
          <div className="mt-12"><WhyFrames why={why} /></div>
          {note && <div className="mt-10 max-w-3xl">{note}</div>}
        </div>
      </section>
    </>
  );
}

/** B: "Pathway Dusk". */
export function OpeningDusk({ hero, designation, title, place, line, pathway, glance, why, close, planHref, note }: {
  hero: OpeningPhoto; designation: string; title: string; place: string; line: string; pathway: PathwayId; glance: OpeningGlance; why: OpeningWhy[]; close: { photo: OpeningPhoto; line: string }; planHref: string; note?: ReactNode;
}) {
  const accent = PATHWAYS[pathway].accent;
  // the pathway's own colour as the surface, darkened toward Ink so white text holds AA everywhere
  const surface = `linear-gradient(180deg, ${accent} 0%, color-mix(in srgb, ${accent} 62%, #1A1816) 100%)`;
  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden bg-ink text-white" aria-label={hero.caption ?? hero.alt}>
        <div className="absolute inset-0 ef-drift ef-drift-slow">
          <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" quality={88} className="object-cover" />
        </div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(26,24,22,.35) 0%, transparent 35%, color-mix(in srgb, ${accent} 70%, transparent) 100%)` }} aria-hidden="true" />
        <div className="relative min-h-[100svh] max-w-ledger mx-auto px-5 md:px-10 flex flex-col justify-end pb-12 md:pb-16 pt-32">
          <p className="ledger-eyebrow !text-white/85">{designation}</p>
          <h1 className="ledger-h1 mt-3">{title}</h1>
          <p className="ledger-display italic text-lg md:text-2xl text-white/90 mt-3">{place}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3"><Plan href={planHref} onDark /><PathwayMark id={pathway} onDark /></div>
        </div>
        <p className="absolute bottom-2 right-5 md:right-8 text-[10.5px] tracking-[0.08em] text-white/65">{hero.caption ? `${hero.caption} · ` : ""}{hero.credit}</p>
      </section>
      <section className="text-white" style={{ background: surface }}>
        <div className="max-w-ledger mx-auto px-5 md:px-10 py-16 md:py-24">
          <p className="ledger-display text-[26px] md:text-[38px] leading-[1.18] max-w-4xl">{line}</p>
          <div className="mt-12"><Glance items={glance} accent={accent} onDark /></div>
          <div className="mt-14"><WhyFrames why={why} onDark /></div>
          {note && <div className="mt-12 max-w-3xl text-white/85">{note}</div>}
        </div>
      </section>
      <section className="relative h-[72svh] overflow-hidden bg-ink text-white" aria-label={close.photo.alt}>
        <div className="absolute inset-0 ef-drift-pan">
          <Image src={close.photo.src} alt={close.photo.alt} fill sizes="100vw" quality={85} className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20" aria-hidden="true" />
        <div className="relative h-full max-w-ledger mx-auto px-5 md:px-10 flex items-end pb-12">
          <p className="ledger-display italic text-[24px] md:text-[34px] leading-snug max-w-3xl">{close.line}</p>
        </div>
        <p className="absolute bottom-2 right-5 md:right-8 text-[10.5px] tracking-[0.08em] text-white/65">{close.photo.caption ? `${close.photo.caption} · ` : ""}{close.photo.credit}</p>
      </section>
    </>
  );
}
