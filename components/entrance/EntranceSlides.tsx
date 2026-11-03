"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAmbientPlay } from "@/lib/useAmbientPlay";
import { ControlRail, PauseButton } from "./Controls";
import type { EntranceSlide } from "@/lib/content/entrances";

// A slow crossfading "scroll" of a volume's best photographs behind its entrance.
// Each photograph holds for 14 seconds under a Ken Burns zoom (CSS, .jw-kenburns)
// and hands over in a 1.5 second crossfade. Only the first is a priority image
// (the LCP element); the next one is mounted a slide ahead so it is ready, and
// the show waits on a photograph that has not arrived. A Plex Mono counter reads
// "03 / 05" and a Pause control sits beside it (WCAG 2.2.2). Reduced motion or
// Save-Data: the first photograph, still. Holds still under the menu, off
// screen and in a hidden tab.
const HOLD = 14000;
const ORIGINS = ["50% 50%", "30% 40%", "70% 55%", "45% 70%", "60% 30%", "35% 60%"];

export default function EntranceSlides({ slides, label }: { slides: EntranceSlide[]; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { allowed, run, userPaused, toggle } = useAmbientPlay(box);
  const n = slides.length;
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]));

  // Mount the current and the next photograph once motion is allowed.
  useEffect(() => {
    if (!allowed || n < 2) return;
    setMounted((m) => (m.has(i) && m.has((i + 1) % n) ? m : new Set([...m, i, (i + 1) % n])));
  }, [allowed, i, n]);

  useEffect(() => {
    if (!run || n < 2 || !loaded.has((i + 1) % n)) return;
    const t = setTimeout(() => { setPrev(i); setI((x) => (x + 1) % n); }, HOLD);
    return () => clearTimeout(t);
  }, [run, i, n, loaded]);

  if (!n) return null;
  const moving = allowed && n > 1;

  return (
    <div ref={box} className="absolute inset-0" aria-roledescription="slideshow" aria-label={label}>
      {slides.map((s, k) => {
        if (!mounted.has(k)) return null;
        const on = k === i;
        const zoom = moving && (on || k === prev);
        return (
          <div
            key={s.url}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-out ${on ? "opacity-100 z-[1]" : "opacity-0 z-0"}`}
            aria-hidden={!on}
          >
            <Image
              src={s.url}
              alt={on ? s.alt : ""}
              fill
              priority={k === 0}
              loading={k === 0 ? undefined : "eager"}
              quality={85}
              sizes="100vw"
              onLoad={() => setLoaded((l) => (l.has(k) ? l : new Set([...l, k])))}
              className={`object-cover ${zoom ? "jw-kenburns" : ""} ${zoom && !run ? "jw-kenburns--paused" : ""}`}
              style={{ transformOrigin: ORIGINS[k % ORIGINS.length] }}
            />
          </div>
        );
      })}
      {moving && (
        <ControlRail>
          <span className="font-mono text-[11px] tracking-[0.24em] text-white/85 tabular-nums" aria-hidden="true">
            {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <span className="sr-only" aria-live="off">Photograph {i + 1} of {n}</span>
          <PauseButton paused={userPaused} onToggle={toggle} label={userPaused ? "Play slides" : "Pause slides"} />
        </ControlRail>
      )}
    </div>
  );
}
