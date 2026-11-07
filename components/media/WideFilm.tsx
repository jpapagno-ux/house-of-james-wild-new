"use client";

import { useEffect, useState } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useSaveData } from "@/lib/useAmbientPlay";
import type { WideFilm } from "@/lib/content/stay-films";

// A wide (16:9) brand film as a full-screen hero layer, laid over the hero photograph. The photograph is the
// first paint (and the LCP); the film loads once the page is idle, then fades in when it is actually playing, so
// there is never a black flash. Phones get a lighter file (MP4) or Vimeo's adaptive stream. Reduced motion and
// Save-Data keep the photograph (the house rule, lib/useAmbientPlay).
export default function WideFilmLayer({ film }: { film: WideFilm }) {
  const reduce = useReducedMotionSafe();
  const save = useSaveData();
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (reduce || save) return;
    const go = () => setReady(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1200 }); else setTimeout(go, 500);
  }, [reduce, save]);
  if (!ready) return null;
  const fade = `transition-opacity duration-[1400ms] ${shown ? "opacity-100" : "opacity-0"}`;
  if (film.kind === "mp4") {
    return (
      <video className={`absolute inset-0 h-full w-full object-cover ${fade}`} autoPlay muted loop playsInline preload="auto" aria-hidden="true" tabIndex={-1} onPlaying={() => setShown(true)}>
        <source src={film.srcMobile} media="(max-width: 767px)" type="video/mp4" />
        <source src={film.src} type="video/mp4" />
      </video>
    );
  }
  const src = `https://player.vimeo.com/video/${film.id}?background=1&autoplay=1&loop=1&muted=1&autopause=0&dnt=1&quality=auto`;
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${fade}`} aria-hidden="true">
      <iframe
        src={src}
        title={film.title}
        tabIndex={-1}
        allow="autoplay; fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setTimeout(() => setShown(true), 1600)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0 w-[max(100vw,177.78svh)] h-[max(56.25vw,100svh)]"
      />
    </div>
  );
}
