"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";

// FilmHero — the top of the home page: the Wild Earth Stays film loops
// full-screen, muted and inline. The poster is rendered first as a priority
// next/image (the LCP element), and the video fades in over it once it can
// play, so the film never delays first paint. The H1, calls to action and a
// rotating quote card filed like a Ledger entry sit over it.
// Reduced motion → poster only, quotes don't rotate.

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  eyebrow: string;
  h1: string;
  sub: string;
  loop: { mp4: string; webm: string; poster: string; label: string };
  quotes: { text: string; by: string }[];
  filmHref?: string;
};

export default function FilmHero({ eyebrow, h1, sub, loop, quotes, filmHref = "#film" }: Props) {
  const reduce = useReducedMotion();
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
      <Image src={loop.poster} alt={loop.label} fill priority sizes="100vw" className="object-cover" />
      {!reduce && (
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-black/80" />

      {/* Ledger frame: a hairline inset from the edges */}
      <div className="pointer-events-none absolute inset-3 md:inset-5 border border-white/25" aria-hidden="true" />

      <div className="relative h-full max-w-ledger mx-auto px-5 md:px-10 flex flex-col justify-end pt-28 pb-24 md:pb-20">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 md:gap-10 lg:gap-16 items-end">
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

          {/* Rotating quotes, filed like Ledger entries */}
          <motion.figure
            className="relative hidden sm:block bg-paper/95 text-ink p-5 md:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.25)] rotate-[0.6deg]"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
          >
            <div className="flex items-center justify-between border-b ledger-rule pb-2">
              <span className="ledger-eyebrow ledger-crimson">From the Ledger</span>
              <span className="ledger-eyebrow">No. {String(q + 1).padStart(2, "0")} / {String(quotes.length).padStart(2, "0")}</span>
            </div>
            <div className="relative min-h-[120px] md:min-h-[140px] mt-3 md:mt-4" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={q} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6, ease: EASE }}>
                  <blockquote className="ledger-display italic text-xl md:text-2xl leading-snug">&ldquo;{quote.text}&rdquo;</blockquote>
                  <figcaption className="mt-2 md:mt-3 ledger-eyebrow">{quote.by}</figcaption>
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
                  className={`h-[3px] transition-all duration-500 ${i === q ? "w-8 bg-crimson" : "w-4 bg-ink/25 hover:bg-ink/50"}`}
                />
              ))}
            </div>
            <Image src="/brand/jwco-hare-240.png" alt="" aria-hidden="true" width={96} height={96} className="absolute -top-10 -right-6 w-24 h-24 object-contain rotate-[-10deg] opacity-90" />
          </motion.figure>
        </div>
      </div>

      {/* The header turns solid once this passes under it */}
      <div id="hero-end" className="absolute bottom-0" />
    </section>
  );
}
