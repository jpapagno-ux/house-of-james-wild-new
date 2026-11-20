import Image from "next/image";
import type { ReactNode } from "react";

// JWC-STYLE-01 primitive. A room or a cabin as a ticket: a taped photograph, what it is, who it sleeps, then a
// perforated stub that carries the rate and one action. The rate and the action are slots: the page passes in the
// figure from the site's live rate data and the existing booking button, unchanged. With no rate passed, the stub
// prints nothing about price (never a placeholder figure).
type Props = {
  /** Small capitals above the name, e.g. "6 suites". */
  eyebrow?: string;
  title: string;
  /** Short lines under the name: who it sleeps, the bed, the size. */
  lines?: string[];
  photo?: { src: string; alt: string };
  /** A small label over the photograph's corner, e.g. "Plunge pool". */
  flag?: string;
  /** The stub, left: the rate from live data (a node so a struck rate and the offer rate can sit together). */
  rate?: ReactNode;
  /** The stub, right: the existing booking action. */
  action?: ReactNode;
  tape?: boolean;
  className?: string;
};

export default function Ticket({ eyebrow, title, lines = [], photo, flag, rate, action, tape = true, className = "" }: Props) {
  return (
    <article className={`relative flex flex-col bg-white border border-[color:var(--jw-hairline)] ${className}`}>
      {tape && <span aria-hidden className="absolute left-1/2 -top-2.5 z-10 h-5 w-20 -translate-x-1/2 rotate-1 border border-[color:var(--jw-hairline)] bg-[rgb(207_200_191_/_0.6)]" />}
      {photo && (
        <div className="relative m-2.5 mb-0 overflow-hidden" style={{ aspectRatio: "3 / 2" }}>
          <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 340px, (min-width: 640px) 46vw, 92vw" className="object-cover" />
          {flag && <span className="absolute left-0 top-0 bg-white px-2.5 py-1 font-mono text-[9.5px] tracking-[0.2em] uppercase text-graphite">{flag}</span>}
        </div>
      )}
      <div className="px-5 pt-4 pb-5 flex-1">
        {eyebrow && <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-stone-text">{eyebrow}</p>}
        <h3 className="font-display font-medium text-[24px] leading-tight text-graphite mt-1.5">{title}</h3>
        {lines.map((l) => <p key={l} className="text-[13.5px] leading-relaxed text-stone-text mt-1 first-of-type:mt-2">{l}</p>)}
      </div>
      {(rate || action) && (
        <div className="relative flex flex-wrap items-end justify-between gap-4 border-t border-dashed border-[color:var(--jw-keyline)] px-5 py-4">
          <span aria-hidden className="absolute -left-[7px] -top-[7px] h-3.5 w-3.5 rounded-full bg-white border border-[color:var(--jw-hairline)] [clip-path:inset(0_0_0_50%)]" />
          <span aria-hidden className="absolute -right-[7px] -top-[7px] h-3.5 w-3.5 rounded-full bg-white border border-[color:var(--jw-hairline)] [clip-path:inset(0_50%_0_0)]" />
          <div className="min-w-0">{rate}</div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
    </article>
  );
}
