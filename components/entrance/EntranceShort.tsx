"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAmbientPlay } from "@/lib/useAmbientPlay";
import { PauseControl } from "./Controls";
import type { ShortFilm } from "@/lib/content/films";

// A vessel's own YouTube Short behind a volume entrance (Voyages: Aliikai in
// Komodo, the film on her ship page). The still shows first as a priority
// image (LCP). The player (privacy mode, muted, looped, no controls) loads only
// once the entrance is on screen and motion is allowed, and the Pause control
// talks to it through the IFrame API. Tall screens: the film edge to edge. Wide
// screens: a framed 9:16 panel on the right over a blurred still, because
// cropping a vertical film to 16:9 would lose two thirds of it.
const src = (id: string, origin: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0&enablejsapi=1&origin=${encodeURIComponent(origin)}`;

function Player({ film, run, className }: { film: ShortFilm; run: boolean; className: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [shown, setShown] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => {
    const w = ref.current?.contentWindow;
    if (!w || !shown) return;
    w.postMessage(JSON.stringify({ event: "command", func: run ? "playVideo" : "pauseVideo", args: [] }), "*");
  }, [run, shown]);
  if (!origin) return null;
  return (
    <iframe
      ref={ref}
      src={src(film.id, origin)}
      title={film.title}
      aria-hidden="true"
      tabIndex={-1}
      allow="autoplay; encrypted-media; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() => setTimeout(() => setShown(true), 1800)}
      className={`absolute pointer-events-none border-0 transition-opacity duration-1000 ${shown ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}

export default function EntranceShort({ film, text }: { film: ShortFilm; text: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { allowed, run, userPaused, toggle } = useAmbientPlay(box);
  const [started, setStarted] = useState(false);
  const [tall, setTall] = useState<boolean | null>(null);
  useEffect(() => { if (run) setStarted(true); }, [run]);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const f = () => setTall(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  const on = allowed && started;

  return (
    <div ref={box} className="absolute inset-0">
      {/* tall screens: edge to edge */}
      <div className="absolute inset-0 overflow-hidden landscape:hidden">
        <Image src={film.poster} alt={film.alt} fill priority quality={85} sizes="100vw" className="object-cover" />
        {on && tall === true && <Player film={film} run={run} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.08] w-[max(100vw,56.25svh)] h-[max(100svh,177.78vw)]" />}
      </div>
      {/* wide screens: the framed film on the right over a blurred still */}
      <div className="absolute inset-0 overflow-hidden portrait:hidden" aria-hidden="true">
        <Image src={film.poster} alt="" fill priority quality={60} sizes="100vw" className="object-cover scale-110 blur-2xl brightness-[0.6] saturate-[1.1]" />
        <div className="absolute right-[5vw] xl:right-[8vw] top-[132px] lg:top-[190px] bottom-[96px] aspect-[9/16] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/25">
          <Image src={film.poster} alt="" fill quality={85} sizes="30vw" className="object-cover" />
          {on && tall === false && <Player film={film} run={run} className="inset-0 w-full h-full scale-[1.08]" />}
          <p className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[rgba(38,20,22,0.88)] to-transparent font-mono text-[9px] uppercase tracking-[0.2em] text-white/80">{film.credit}</p>
        </div>
      </div>
      <p className="sr-only">{text}</p>
      {allowed && <PauseControl paused={userPaused} onToggle={toggle} what="film" />}
    </div>
  );
}
