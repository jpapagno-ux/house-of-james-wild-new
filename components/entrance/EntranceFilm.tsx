"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAmbientPlay } from "@/lib/useAmbientPlay";
import { PauseControl } from "./Controls";

// A full-bleed film behind a volume entrance (Stays: the house film). The poster
// is a priority next/image (the LCP element) and always shows first; the video
// has no autoPlay attribute: it plays only while on screen, never with reduced
// motion or Save-Data, never under the menu, and the visitor can pause it.
// preload="metadata" keeps the first paint light; the film fades in over the
// poster once it can play.
export default function EntranceFilm({ mp4, webm, poster, alt, text }: { mp4: string; webm?: string; poster: string; alt: string; text: string }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const { allowed, run, userPaused, toggle } = useAmbientPlay(box);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (run) v.play().catch(() => {}); else v.pause();
  }, [run, allowed]);

  return (
    <div ref={box} className="absolute inset-0">
      <Image src={poster} alt={alt} fill priority quality={85} sizes="100vw" className="object-cover" />
      {allowed && (
        <video
          ref={video}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={() => setReady(true)}
        >
          {webm && <source src={webm} type="video/webm" />}
          <source src={mp4} type="video/mp4" />
        </video>
      )}
      <p className="sr-only">{text}</p>
      {allowed && <PauseControl paused={userPaused} onToggle={toggle} what="film" />}
    </div>
  );
}
