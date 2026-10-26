"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

// The stay film: a poster until the guest presses play (no YouTube load, no
// cookies, no layout shift), then the privacy-enhanced player. When the film
// ends, the house closes it with its own card (hare seal, a way to plan), so
// YouTube's end-screen suggestions never show.

type YTPlayer = { destroy: () => void; playVideo: () => void; seekTo: (s: number) => void };
type YTNs = { Player: new (el: HTMLElement, o: object) => YTPlayer; PlayerState: { ENDED: number } };
declare global { interface Window { YT?: YTNs; onYouTubeIframeAPIReady?: () => void } }

function loadApi(): Promise<YTNs> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT as YTNs); };
    if (!document.getElementById("yt-api")) { const s = document.createElement("script"); s.id = "yt-api"; s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s); }
  });
}

export default function StayFilm({ id, title, name, planHref, bare = false }: { id: string; title: string; name: string; planHref: string; bare?: boolean }) {
  const [state, setState] = useState<"poster" | "playing" | "ended">("poster");
  const [thumb, setThumb] = useState("maxresdefault");
  const host = useRef<HTMLDivElement>(null);
  const yt = useRef<YTPlayer | null>(null);

  useEffect(() => {
    if (state !== "playing" || yt.current || !host.current) return;
    let live = true;
    loadApi().then((YT) => {
      if (!live || !host.current) return;
      const el = document.createElement("div");
      host.current.appendChild(el);
      yt.current = new YT.Player(el, {
        videoId: id, host: "https://www.youtube-nocookie.com",
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3 },
        events: { onStateChange: (e: { data: number }) => { if (e.data === YT.PlayerState.ENDED) setState("ended"); } },
      });
    });
    return () => { live = false; };
  }, [state, id]);

  useEffect(() => () => yt.current?.destroy(), []);

  const replay = () => { yt.current?.seekTo(0); yt.current?.playVideo(); setState("playing"); };

  const player = (
      <div className={`${bare ? "" : "mt-6 "}relative aspect-video bg-ink overflow-hidden border ledger-border`}>
        <div ref={host} className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full" />
        {state === "poster" && (
          <button type="button" onClick={() => setState("playing")} className="group absolute inset-0 w-full h-full text-white" aria-label={`Play the film: ${title}`}>
            <Image src={`https://i.ytimg.com/vi/${id}/${thumb}.jpg`} alt="" onError={() => setThumb("hqdefault")} fill sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
            <span className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" aria-hidden="true" />
            <span className="absolute inset-0 flex items-center justify-center"><span className="w-20 h-20 rounded-full border border-white/80 bg-black/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-105 transition-transform"><Play className="w-7 h-7 ml-1" strokeWidth={1.5} aria-hidden="true" /></span></span>
            <span className="absolute left-5 bottom-5 text-left"><span className="ledger-eyebrow !text-white/75 block">Watch · James Wild &amp; Co</span><span className="ledger-display italic text-2xl md:text-3xl">{title}</span></span>
          </button>
        )}
        {state === "ended" && (
          <div className="absolute inset-0 bg-ink/95 text-white flex flex-col items-center justify-center text-center px-6" role="status">
            <Image src="/brand/jwco-hare-cream-240.png" alt="James Wild & Co" width={96} height={96} className="w-20 h-20 md:w-24 md:h-24 object-contain" />
            <p className="ledger-eyebrow !text-white/70 mt-4">James Wild &amp; Co · Exploring since 1982</p>
            <p className="ledger-display text-2xl md:text-4xl mt-2">Make {name} yours.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href="#rates" className="ledger-btn !bg-paper !text-ink">See live rates</a>
              <a href={planHref} className="ledger-btn-ghost !text-white !border-white/60">Plan it with James</a>
              <button type="button" onClick={replay} className="inline-flex items-center gap-2 ledger-eyebrow !text-white/80 hover:!text-white px-3"><RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Watch again</button>
            </div>
          </div>
        )}
      </div>
  );
  if (bare) return player;
  return (
    <section id="film" className="mt-16 md:mt-24 scroll-mt-32" aria-labelledby="film-heading">
      <p className="ledger-eyebrow ledger-crimson">The film</p>
      <h2 id="film-heading" className="ledger-display text-[1.6rem] md:text-3xl mt-2">{name}, in Motion</h2>
      {player}
    </section>
  );
}
