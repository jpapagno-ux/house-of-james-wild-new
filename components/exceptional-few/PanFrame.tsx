"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

// Geography as the transition: one wide frame that pans sideways as the reader
// scrolls down, with the place's coordinates and name drawn over it. 200vh
// container, sticky viewport. Reduced motion: a still, centred.
export default function PanFrame({ src, alt, name, coords, line, credit }: { src: string; alt: string; name: string; coords: { lat: number; lng: number }; line?: string; credit?: string }) {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current; if (!el) return;
    let raf = 0;
    const tick = () => { const r = el.getBoundingClientRect(); const total = el.offsetHeight - window.innerHeight; setP(Math.min(1, Math.max(0, -r.top / Math.max(1, total)))); raf = 0; };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [reduced]);
  const dms = (v: number, pos: string, neg: string) => { const a = Math.abs(v); const d = Math.floor(a); const m = Math.round((a - d) * 60); return `${d}° ${String(m).padStart(2, "0")}′ ${v >= 0 ? pos : neg}`; };
  const x = reduced ? 0 : (p - 0.5) * 18; // the frame travels 18% of its width across the scroll
  return (
    <div ref={ref} className={reduced ? "mx-[calc(50%-50vw)]" : "h-[200svh] mx-[calc(50%-50vw)]"}>
      <section className={`${reduced ? "relative" : "sticky top-0"} h-[72svh] min-h-[480px] overflow-hidden bg-ink text-white`} aria-label={`${name}: the geography`}>
        <div className="absolute inset-y-0 -left-[10%] w-[120%]" style={{ transform: `translateX(${x}%)`, transition: "transform 120ms linear" }}>
          <Image src={src} alt={alt} fill sizes="120vw" quality={85} className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="relative h-full max-w-ledger mx-auto px-5 md:px-10 flex flex-col justify-end pb-10">
          <p className="ledger-eyebrow !text-white/80">Geography</p>
          <p className="ledger-display text-[2rem] md:text-[3.2rem] leading-none mt-2">{dms(coords.lat, "N", "S")} · {dms(coords.lng, "E", "W")}</p>
          {line && <p className="mt-3 max-w-2xl text-[15.5px] md:text-[17px] text-white/90">{line}</p>}
        </div>
        {credit && <p className="absolute bottom-2 right-6 md:right-8 text-[10.5px] tracking-[0.08em] text-white/70">{credit}</p>}
      </section>
    </div>
  );
}
