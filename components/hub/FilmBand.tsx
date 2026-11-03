import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

// FilmBand — a full-width film under a hub's title (house chrome, 30 Oct 2026).
// A poster, a hairline ledger frame inset from the edges, the
// eyebrow and title low left, and one way in. The loop is the house's own
// footage (Felix Studios); the link opens the full film.
// No autoplay (bug, 2 Nov 2026): the homepage film was looping here on every hub a
// volume card or the menu opened, so it seemed to follow the visitor round the site.
// The band is now a still and a way in; the film moves only on the homepage hero
// and, by design, in the Stays and Voyages entrances (components/entrance).
export type FilmBandProps = {
  poster: string;
  alt: string;
  eyebrow: string;
  title: string;
  credit?: string;
  href?: string;
  cta?: string;
};

export default function FilmBand({ poster, alt, eyebrow, title, credit, href, cta = "Watch the film" }: FilmBandProps) {
  return (
    <figure className="relative mt-10 md:mt-14 aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-ink text-white">
      <Image src={poster} alt={alt} fill sizes="(min-width: 1152px) 1152px, 100vw" quality={85} className="object-cover" />
      <span className="absolute inset-0 bg-gradient-to-t from-[rgba(38,20,22,0.88)] via-[rgba(38,20,22,0.10)] to-[rgba(26,24,22,0.20)]" aria-hidden="true" />
      <span className="pointer-events-none absolute inset-3 md:inset-5 border border-white/25" aria-hidden="true" />
      <figcaption className="absolute left-6 right-6 bottom-6 md:left-10 md:right-10 md:bottom-9 flex flex-wrap items-end justify-between gap-4">
        <span>
          <span className="block ledger-eyebrow !text-[11px] !tracking-[0.28em] !text-white/85">{eyebrow}</span>
          <span className="block ledger-h2 !text-[1.7rem] sm:!text-[2.2rem] md:!text-[3rem] mt-2 max-w-2xl drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)]">{title}</span>
          {credit && <span className="block ledger-eyebrow !text-white/65 mt-3">{credit}</span>}
        </span>
        {href && (
          <Link href={href} className="inline-flex items-center gap-3 ledger-eyebrow !text-[11px] !text-white">
            <span className="w-11 h-11 rounded-full border border-white/80 flex items-center justify-center"><Play className="w-4 h-4 translate-x-px" strokeWidth={1.5} fill="currentColor" aria-hidden="true" /></span>
            {cta}
          </Link>
        )}
      </figcaption>
    </figure>
  );
}
