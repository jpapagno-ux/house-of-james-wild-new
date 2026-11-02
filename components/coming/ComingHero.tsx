import Image from "next/image";
import Link from "next/link";
import { DEEP_SEA } from "@/lib/palette";
import s from "./coming.module.css";

export type HeroSlide = { slug: string; src: string; alt: string; credit: string | null; name: string; country: string | null; line: string; href: string };

// The What's Coming hero (James, 2 Nov 2026: "large full screen images and hi res wow factor"): full
// viewport, the entries that have a brand photograph crossfading slowly, each drifting in a slow zoom.
// Pure CSS: the keyframes are cut here for the number of slides, so it plays without JavaScript, and it
// stands on the first photograph for reduced motion. Only the first image is priority (the LCP).
const HOLD = 7, FADE = 1.6; // seconds each slide holds, and the crossfade

function keyframes(n: number): string {
  if (n < 2) return `@keyframes jwcKb{from{transform:scale(1.02)}to{transform:scale(1.12)}}`;
  const T = n * HOLD, p = (x: number) => ((x / T) * 100).toFixed(3) + "%";
  return `@keyframes jwcFade{0%{opacity:1}${p(HOLD)}{opacity:1}${p(HOLD + FADE)}{opacity:0}${p(T - FADE)}{opacity:0}100%{opacity:1}}
@keyframes jwcKb{0%{transform:scale(1.04)}${p(HOLD + FADE)}{transform:scale(1.14)}${p(T - FADE)}{transform:scale(1)}100%{transform:scale(1.04)}}
@keyframes jwcCap{0%{opacity:1;visibility:visible;transform:none}${p(HOLD - 0.4)}{opacity:1;visibility:visible;transform:none}${p(HOLD + 0.4)}{opacity:0;visibility:hidden;transform:translateY(8px)}${p(T - 0.6)}{opacity:0;visibility:hidden;transform:translateY(8px)}100%{opacity:1;visibility:visible;transform:none}}`;
}

export default function ComingHero({ slides, title, line, children }: { slides: HeroSlide[]; title: string; line: string; children?: React.ReactNode }) {
  const n = slides.length, T = n * HOLD;
  const delay = (i: number) => (i === 0 ? "0s" : `-${T - i * HOLD}s`);
  const anim = (name: string, i: number) => (n < 2 ? (name === "jwcKb" ? `jwcKb 24s ease-in-out infinite alternate` : "none") : `${name} ${T}s ${name === "jwcKb" ? "linear" : "ease-in-out"} ${delay(i)} infinite`);
  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden text-white" style={{ background: DEEP_SEA.navy.fill }} aria-labelledby="coming-title">
      <style dangerouslySetInnerHTML={{ __html: keyframes(n) }} />
      <div className="absolute inset-0" aria-hidden={n ? undefined : true}>
        {slides.map((sl, i) => (
          <div key={sl.slug} className={s.slide} style={{ animation: anim("jwcFade", i), opacity: n > 1 && i > 0 ? 0 : 1 }}>
            <div className={s.kb} style={{ animation: anim("jwcKb", i) }}>
              <Image src={sl.src} alt={sl.alt} fill priority={i === 0} fetchPriority={i === 0 ? "high" : "auto"} loading={i === 0 ? undefined : "eager"} quality={85} sizes="100vw" className="object-cover" />
            </div>
          </div>
        ))}
      </div>
      <div className={`absolute inset-0 ${s.heroShade}`} aria-hidden="true" />
      <div className="relative h-full max-w-[1400px] mx-auto px-5 md:px-10 flex flex-col justify-end pb-24 md:pb-20">
        <p className="font-mono text-[11px] md:text-[12px] tracking-[0.2em] md:tracking-[0.3em] uppercase text-white/85">James Wild &amp; Co &middot; Filed before they open</p>
        <h1 id="coming-title" className="ledger-display mt-4 text-[4.1rem] leading-[0.88] sm:text-[6rem] md:text-[8.5rem] lg:text-[11rem] tracking-[-0.03em]">{title}</h1>
        <p className="mt-5 md:mt-6 font-mono text-[12.5px] md:text-[14px] tracking-[0.12em] md:tracking-[0.18em] uppercase text-white/90">{line}</p>
        <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-white/25 pt-5">
          <div className="relative min-h-[3.6rem] md:min-h-[3.4rem] flex-1">
            {slides.map((sl, i) => (
              <Link key={sl.slug} href={sl.href} data-first={i === 0 ? "true" : undefined} className={`${s.caption} absolute inset-0 block group`} style={{ animation: anim("jwcCap", i) }} tabIndex={i === 0 ? undefined : -1} aria-hidden={i === 0 ? undefined : true}>
                <span className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-white/75">{[sl.country, sl.line].filter(Boolean).join(" · ")}</span>
                <span className="block ledger-display italic text-[1.5rem] md:text-[1.9rem] leading-tight group-hover:underline underline-offset-4">{sl.name}</span>
                {sl.credit && <span className="sr-only">Photograph: {sl.credit}</span>}
              </Link>
            ))}
          </div>
          {children}
        </div>
      </div>
      <a href="#the-board" className={`${s.cue} absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 font-mono text-[10px] tracking-[0.3em] uppercase text-white/75`}>
        Scroll<span aria-hidden="true">&#8595;</span>
      </a>
      <div id="hero-end" className="absolute bottom-0 h-px w-full" aria-hidden="true" />
    </section>
  );
}
