import type { AmbientFilm as Film } from "@/lib/content/stay-films";

// A silent, looping brand film as a full-bleed band. No controls to hunt for: it plays muted inline,
// pauses for people who ask for reduced motion (poster only), and carries the brand's credit.
export default function AmbientFilm({ film, eyebrow, line }: { film: Film; eyebrow?: string; line?: string }) {
  return (
    <section aria-label={film.title} className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden bg-ink">
      <div className="relative aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] max-h-[92svh] w-full">
        <video className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden" src={film.src} poster={film.poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="absolute inset-0 h-full w-full object-cover hidden motion-reduce:block" src={film.poster} alt="" />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 max-w-ledger mx-auto px-5 md:px-10 pb-8 md:pb-12 text-white">
          {eyebrow && <p className="ledger-eyebrow !text-white/80">{eyebrow}</p>}
          {line && <p className="mt-3 ledger-display text-[1.6rem] md:text-[2.6rem] leading-[1.15] max-w-3xl">{line}</p>}
          <p className="mt-4 text-[11px] tracking-[0.14em] uppercase text-white/70">{film.credit}</p>
        </div>
      </div>
    </section>
  );
}
