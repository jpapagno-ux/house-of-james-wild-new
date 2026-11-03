import Link from "next/link";
import { volumeLeather } from "@/lib/volumes";
import { IS_PREVIEW, type Entrance } from "@/lib/content/entrances";
import EntranceFilm from "./EntranceFilm";
import EntranceShort from "./EntranceShort";
import EntranceSlides from "./EntranceSlides";

// VolumeEntrance: the grand entrance of a volume landing page (preview, 2 Nov 2026).
// A full-viewport header (100svh, 100vh fallback, iPhone safe areas) with the
// volume's film or its slow photographs, the bottom Ink to Garnet fade, the Plex
// Mono eyebrow with the 5px Heritage tab, the volume name huge in Cormorant
// light (the page's h1, real text), two sentences on what the volume is and why
// it is in the house, James's line as a pull quote, the Ledger column "Plan with
// James", the editorial line "Open the volume" and a slim scroll cue. The
// volume's own content follows at #volume; nothing repeats the hero.
// The header floats over it (SiteHeader overlay) and settles at #hero-end.
export default function VolumeEntrance({ e }: { e: Entrance }) {
  const quoteLeft = e.media.kind === "short"; // the framed film takes the right on wide screens
  const quote = (
    <figure className={`relative max-w-[30rem] ${quoteLeft ? "mt-8" : "mt-8 lg:mt-0 lg:ml-auto"} border-l border-white/45 pl-5 md:pl-7`}>
      {IS_PREVIEW && e.quote.status === "draft" && (
        <span className="absolute -top-7 left-5 md:left-7 font-mono text-[9px] uppercase tracking-[0.22em] text-white border border-white/60 bg-black/30 px-2 py-[3px]">Draft for James</span>
      )}
      <blockquote className="font-display italic font-normal text-[1.3rem] sm:text-[1.6rem] md:text-[2.05rem] leading-[1.2] text-white text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
        &ldquo;{e.quote.text}&rdquo;
      </blockquote>
      <figcaption className="mt-3 flex items-center gap-3">
        <span className="font-display italic font-semibold text-[1.35rem] leading-none text-white">JW</span>
        <span className="h-px w-8 bg-white/50" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/75">James Wild, Founder</span>
      </figcaption>
    </figure>
  );

  return (
    <section className="jw-entrance jw-onphoto relative overflow-hidden bg-ink text-white" aria-labelledby={`entrance-${e.key}`}>
      {e.media.kind === "film" && <EntranceFilm {...e.media} />}
      {e.media.kind === "short" && <EntranceShort film={e.media.film} text={e.media.text} />}
      {e.media.kind === "slides" && <EntranceSlides slides={e.media.slides} label={`${e.title}: photographs from the volume`} />}

      {/* a scrim under the header, and the one gradient (Ink to Garnet) rising from the foot */}
      <div className="jw-entrance__fade pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-3 md:inset-5 z-[1] border border-white/20" aria-hidden="true" />

      <div className="jw-entrance__body relative z-[2] mx-auto max-w-[1400px] px-5 md:px-10 flex flex-col justify-end">
        <div data-hero-copy className={`grid gap-x-12 items-end ${quoteLeft ? "" : "lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"}`}>
          <div className={quoteLeft ? "max-w-[46rem] landscape:lg:max-w-[min(46rem,52vw)]" : ""}>
            <p className="font-mono text-[10.5px] md:text-[11px] uppercase tracking-[0.28em] text-white/90 border-l-[5px] pl-3 leading-[1.4]" style={{ borderColor: volumeLeather(e.key) }}>
              {e.eyebrow}
            </p>
            <h1 id={`entrance-${e.key}`} className="jw-entrance__title font-display font-light text-white mt-4 md:mt-5 drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
              {e.title}
            </h1>
            <p className="mt-4 md:mt-6 max-w-[40rem] text-[15px] md:text-[18px] leading-[1.6] text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
              {e.summary[0]} {e.summary[1]}
            </p>
            {quoteLeft && quote}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-10">
              <Link href={e.plan} className="ledger-btn ledger-btn--house ledger-btn--light w-full sm:w-auto">Plan with James</Link>
              <a href="#volume" className="ledger-btn ledger-btn--light self-start sm:self-auto">Open the volume</a>
            </div>
          </div>
          {!quoteLeft && quote}
        </div>
      </div>

      {/* the slim scroll cue (tablet and up; on phones the counter and "Open the volume" do the job) */}
      <span className="jw-entrance__cue pointer-events-none absolute z-[2] left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2" aria-hidden="true">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/70">Scroll</span>
        <span className="jw-entrance__cue-line block w-px h-10 bg-white/25 overflow-hidden" />
      </span>

      {/* The header turns solid once this passes under it */}
      <div id="hero-end" className="absolute bottom-0" />
    </section>
  );
}
