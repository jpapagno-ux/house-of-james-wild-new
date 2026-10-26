"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Swipeable photo strip for a room or suite card: scroll-snap on touch,
// arrows on hover for a mouse, and a counter.
export default function Carousel({ photos, name, ratio = "aspect-[4/3]" }: { photos: string[]; name: string; ratio?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [i, setI] = useState(0);
  const go = (d: number) => { const el = ref.current; if (!el) return; const n = Math.max(0, Math.min(photos.length - 1, i + d)); el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" }); };
  return (
    <div className="relative group/c">
      <ul ref={ref} onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))} className={`flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] ${ratio} bg-paper-card`} aria-label={`${name} photographs`}>
        {photos.map((src, k) => (
          <li key={src} className="relative shrink-0 w-full h-full snap-start">
            <Image src={src} alt={`${name}, photograph ${k + 1} of ${photos.length}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
          </li>
        ))}
      </ul>
      {photos.length > 1 && <>
        <button type="button" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous photograph" className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-paper/90 flex items-center justify-center disabled:opacity-0 md:opacity-0 md:group-hover/c:opacity-100 transition-opacity"><ChevronLeft className="w-4 h-4" strokeWidth={1.5} /></button>
        <button type="button" onClick={() => go(1)} disabled={i === photos.length - 1} aria-label="Next photograph" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-paper/90 flex items-center justify-center disabled:opacity-0 md:opacity-0 md:group-hover/c:opacity-100 transition-opacity"><ChevronRight className="w-4 h-4" strokeWidth={1.5} /></button>
        <span className="absolute right-2 bottom-2 px-2 py-0.5 bg-black/55 text-white text-[12px] tabular-nums">{i + 1} / {photos.length}</span>
      </>}
    </div>
  );
}

