"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { Play } from "lucide-react";

// FilmHero — the top of the home page: the Wild Earth Stays film loops
// full-screen, muted and inline. The poster is rendered first as a priority
// next/image (the LCP element), and the video fades in over it once it can
// play, so the film never delays first paint. The H1, calls to action and a
// rotating quote sit over it; the quote has no card (25 Oct 2026), just a
// hairline and white type, so the film shows through.
// Reduced motion → poster only, quotes don't rotate.

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  eyebrow: string;
  h1: string;
  sub: string;
  loop: { mp4: string; webm: string; poster: string; label: string };
  quotes: { text: string; by: string }[];
  filmHref?: string;
  /** A YouTube Short to loop as the hero instead of the house film (muted, no controls, privacy mode). */
  short?: { id: string; title: string; poster: string; alt: string; credit: string };
};

// The Short is filmed tall (9:16). On a tall screen (phones, portrait tablets)
// it fills the hero edge to edge. On a wide screen, cropping it to 16:9 would
// throw away two-thirds of the frame and blow up the pixels, so it plays at
// full hero height in a framed panel, over a blurred, darkened still of itself.
function ShortLoop({ short, reduce }: { short: NonNullable<Props["short"]>; reduce: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [tall, setTall] = useState<boolean | null>(null);
  // Only one player ever loads: the one for the screen's current shape.
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const on = () => setTall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    if (reduce) return;
    // After first paint, so the poster stays the LCP element and the page is interactive first.
    const go = () => setSrc(`https://www.youtube-nocookie.com/embed/${short.id}?autoplay=1&mute=1&loop=1&playlist=${short.id}&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0`);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1500 }); else setTimeout(go, 600);
  }, [reduce, short.id]);
  // YouTube flashes its title and play button while it buffers; hold the poster over it a moment longer.
  const frame = (cls: string, forTall: boolean) =>
    src && tall === forTall && (
      <iframe
        src={src}
        title={short.title}
        aria-hidden="true"
        tabIndex={-1}
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setTimeout(() => setShown(true), 1800)}
        className={`absolute pointer-events-none border-0 transition-opacity duration-1000 ${shown ? "opacity-100" : "opacity-0"} ${cls}`}
      />
    );
  return (
    <>
      {/* Tall screens: the film fills the hero */}
      <div className="absolute inset-0 overflow-hidden landscape:hidden" aria-hidden="true">
        <Image src={short.poster} alt="" fill priority quality={85} sizes="100vw" className="object-cover" />
        {frame("top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.08] w-[max(100vw,56.25svh)] h-[max(100svh,177.78vw)]", true)}
      </div>
      {/* Wide screens: a blurred still behind, the film full height in a frame */}
      <div className="absolute inset-0 overflow-hidden portrait:hidden" aria-hidden="true">
        <Image src={short.poster} alt="" fill priority quality={60} sizes="100vw" className="object-cover scale-110 blur-2xl brightness-[0.55] saturate-[1.15]" />
        <div className="absolute right-[5vw] xl:right-[9vw] top-[116px] bottom-[52px] aspect-[9/16] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/25">
          <Image src={short.poster} alt="" fill priority quality={85} sizes="(orientation: landscape) 48svh, 100vw" className="object-cover" />
          {frame("inset-0 w-full h-full scale-[1.08]", false)}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="ledger-display text-[15px] leading-tight">James Wild &amp; Co.</p>
            <p className="ledger-eyebrow !text-[9px] !text-white/75 mt-1">{short.credit}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function FilmHero({ eyebrow, h1, sub, loop, quotes, filmHref = "#film", short }: Props) {
  const reduce = useReducedMotionSafe();
  const [q, setQ] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduce || quotes.length < 2) return;
    const id = setInterval(() => setQ((n) => (n + 1) % quotes.length), 6500);
    return () => clearInterval(id);
  }, [reduce, quotes.length]);

  const quote = quotes[q];

  return (
    <section className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink text-white" aria-label="Welcome">
      {short ? <ShortLoop short={short} reduce={reduce} /> : <Image src={loop.poster} alt={loop.label} fill priority quality={85} sizes="100vw" className="object-cover" />}
      {!short && !reduce && (
        <video
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onCanPlay={() => setReady(true)}
        >
          <source src={loop.webm} type="video/webm" />
          <source src={loop.mp4} type="video/mp4" />
        </video>
      )}
      <div className={`absolute inset-0 bg-gradient-to-b ${short ? "from-black/55 via-black/5 to-black/75 landscape:from-black/25 landscape:via-transparent landscape:to-black/35" : "from-black/60 via-black/15 to-black/80"}`} />

      {/* Ledger frame: a hairline inset from the edges */}
      <div className="pointer-events-none absolute inset-3 md:inset-5 border border-white/25" aria-hidden="true" />

      <div className="relative h-full max-w-ledger mx-auto px-5 md:px-10 flex flex-col justify-end pt-28 pb-24 md:pb-20">
        <div className={short ? "max-w-xl landscape:lg:max-w-[46vw]" : "grid lg:grid-cols-[1.4fr_1fr] gap-6 md:gap-10 lg:gap-16 items-end"}>
          <motion.div initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE }}>
            <p className="ledger-eyebrow !text-[11px] !tracking-[0.28em] !text-white/85">{eyebrow}</p>
            <h1 className="ledger-display text-[2.1rem] leading-[1.08] md:text-6xl lg:text-7xl mt-3 md:mt-4 drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]">{h1}</h1>
            <p className="text-[16px] md:text-xl text-white/85 mt-4 md:mt-5 max-w-xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">{sub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a href="#volumes" className="inline-flex items-center h-11 px-7 bg-paper ledger-eyebrow !text-[11px] !text-ink hover:bg-white transition-colors shadow-[0_4px_18px_rgba(0,0,0,0.35)]">
                Enter the Ledger
              </a>
              <a href={filmHref} className="inline-flex items-center gap-3 ledger-eyebrow !text-[11px] !text-white">
                <span className="relative w-11 h-11 rounded-full border border-white/80 flex items-center justify-center">
                  {!reduce && <span className="absolute inset-0 rounded-full border border-white/50 animate-ping [animation-duration:2.4s]" />}
                  <Play className="w-4 h-4 translate-x-px" strokeWidth={1.5} fill="currentColor" aria-hidden="true" />
                </span>
                Watch the film
              </a>
            </div>
          </motion.div>

          {/* Rotating quotes, filed like Ledger entries (the Short's frame takes this place when it plays) */}
          {!short && <motion.figure
            className="relative hidden sm:block text-white pl-6 md:pl-8 border-l border-white/40 max-w-[480px] lg:ml-auto"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
          >
            <div className="flex items-center justify-between gap-6">
              <span className="ledger-eyebrow !text-white/80">From the Ledger</span>
              <span className="ledger-eyebrow !text-white/60">No. {String(q + 1).padStart(2, "0")} / {String(quotes.length).padStart(2, "0")}</span>
            </div>
            <div className="relative min-h-[120px] md:min-h-[140px] mt-3 md:mt-4" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={q} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6, ease: EASE }}>
                  <blockquote className="ledger-display italic text-xl md:text-[1.7rem] leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">&ldquo;{quote.text}&rdquo;</blockquote>
                  <figcaption className="mt-2 md:mt-3 ledger-eyebrow !text-white/75">{quote.by}</figcaption>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-3 md:mt-4 flex items-center gap-2">
              {quotes.map((x, i) => (
                <button
                  key={x.text}
                  type="button"
                  aria-label={`Show quote ${i + 1}`}
                  aria-pressed={i === q}
                  onClick={() => setQ(i)}
                  className={`h-[3px] transition-all duration-500 ${i === q ? "w-8 bg-white" : "w-4 bg-white/35 hover:bg-white/60"}`}
                />
              ))}
            </div>
            <Image src="/brand/jwco-hare-cream-240.png" alt="" aria-hidden="true" width={80} height={80} className="absolute -top-24 right-0 w-20 h-20 object-contain rotate-[-10deg] opacity-80" />
          </motion.figure>}
        </div>
      </div>

      {short && <p className="absolute bottom-5 right-6 landscape:hidden ledger-eyebrow !text-[9px] !text-white/70">{short.credit}</p>}
      {/* The header turns solid once this passes under it */}
      <div id="hero-end" className="absolute bottom-0" />
    </section>
  );
}
