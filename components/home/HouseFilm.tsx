"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Play } from "lucide-react";

// HouseFilm — the house film, click to play. Only a poster and a play button
// load with the page. With a YouTube ID it becomes a lite embed (the player
// script loads on click, from youtube-nocookie.com); until then the button
// plays the Wild Earth Stays film inline with controls.
type Props = {
  title: string;
  caption: string;
  youtubeId: string | null;
  poster: string;
  posterAlt: string;
  mp4: string;
  webm: string;
};

export default function HouseFilm({ title, caption, youtubeId, poster, posterAlt, mp4, webm }: Props) {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative aspect-video w-full border ledger-border bg-ink overflow-hidden">
      {playing && youtubeId ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : playing ? (
        <video ref={video} className="absolute inset-0 w-full h-full object-cover" controls autoPlay playsInline poster={poster} aria-label={title}>
          <source src={webm} type="video/webm" />
          <source src={mp4} type="video/mp4" />
        </video>
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 w-full h-full text-left" aria-label={`Play the film: ${title}`}>
          <Image src={poster} alt={posterAlt} fill sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-700" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/80 bg-black/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              <Play className="w-8 h-8 md:w-9 md:h-9 text-white translate-x-0.5" strokeWidth={1.25} fill="currentColor" aria-hidden="true" />
            </span>
          </span>
          <span className="absolute left-4 bottom-4 md:left-6 md:bottom-5 right-4 text-white">
            <span className="block text-[10px] uppercase tracking-[0.2em] opacity-80">The house film</span>
            <span className="block ledger-display text-xl md:text-2xl mt-1">{caption}</span>
          </span>
        </button>
      )}
    </div>
  );
}
